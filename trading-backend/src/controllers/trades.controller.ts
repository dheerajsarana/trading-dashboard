import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import * as XLSX from 'xlsx';
import { TradeNormalizerService } from '../services/tradeNormalizer.service';

const prisma = new PrismaClient();

export class TradesController {
  // Upload Excel file
  static async uploadExcel(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Parse Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Transform and validate trades
      const trades = jsonData.map((row: any) => {
        const type = row.Type?.toLowerCase().includes('buy') || row.Type?.toLowerCase().includes('long')
          ? 'buy'
          : 'sell';

        return {
          userId,
          position: String(row.Position) || '',
          symbol: row.Symbol || '',
          type,
          volume: parseFloat(row.Volume) || 0,
          openPrice: parseFloat(row.Price) || 0,
          stopLoss: parseFloat(row['S / L']) || null,
          takeProfit: parseFloat(row['T / P']) || null,
          openTime: row.Time ? new Date(row.Time) : new Date(),
          closeTime: row.Time_1 || row['Time.1'] ? new Date(row.Time_1 || row['Time.1']) : new Date(),
          closePrice: parseFloat(row.Price_1 || row['Price.1']) || 0,
          commission: parseFloat(row.Commission) || 0,
          swap: parseFloat(row.Swap) || 0,
          profit: parseFloat(row.Profit) || 0,
          source: 'upload',
        };
      });

      // Bulk insert trades
      const createdTrades = await prisma.trade.createMany({
        data: trades,
        skipDuplicates: true,
      });

      // Invalidate cache (delete old stats)
      await prisma.userStats.deleteMany({
        where: { userId },
      });

      await prisma.sessionStats.deleteMany({
        where: { userId },
      });

      res.json({
        message: 'Trades uploaded successfully',
        count: createdTrades.count,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload trades' });
    }
  }

  // Get all trades with filtering and pagination
  static async getAllTrades(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const {
        symbol,
        type,
        startDate,
        endDate,
        source,
        page = '1',
        limit = '100'
      } = req.query;

      // Source filter determines which tables to query
      const includeRegular = !source || source === 'all' || source === 'manual' || source === 'upload';
      const includeMT5 = !source || source === 'all' || source === 'mt5';

      let allCombinedTrades: any[] = [];

      if (includeRegular) {
        // Build filter conditions for regular trades
        const where: any = { userId };

        if (symbol && symbol !== 'all') {
          where.symbol = symbol;
        }

        if (type && (type === 'buy' || type === 'sell')) {
          where.type = type;
        }

        if (source && (source === 'manual' || source === 'upload')) {
          where.source = source;
        }

        if (startDate && endDate) {
          where.closeTime = {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          };
        }

        const regularTrades = await prisma.trade.findMany({
          where,
          orderBy: { closeTime: 'desc' },
        });

        allCombinedTrades.push(...regularTrades);
      }

      if (includeMT5) {
        let mt5Trades = await TradeNormalizerService.fetchNormalizedMT5Trades(userId);

        // Apply filters to MT5 trades
        if (symbol && symbol !== 'all') {
          mt5Trades = mt5Trades.filter((t: any) => t.symbol === symbol);
        }
        if (type && (type === 'buy' || type === 'sell')) {
          mt5Trades = mt5Trades.filter((t: any) => t.type === type);
        }
        if (startDate && endDate) {
          const start = new Date(startDate as string);
          const end = new Date(endDate as string);
          mt5Trades = mt5Trades.filter((t: any) => {
            const time = new Date(t.closeTime);
            return time >= start && time <= end;
          });
        }

        allCombinedTrades.push(...mt5Trades);
      }

      // Sort combined trades by closeTime descending
      allCombinedTrades.sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime());

      // Apply pagination on combined results
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;
      const total = allCombinedTrades.length;
      const trades = allCombinedTrades.slice(skip, skip + limitNum);

      res.json({
        trades,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        }
      });
    } catch (error) {
      console.error('Get trades error:', error);
      res.status(500).json({ error: 'Failed to fetch trades' });
    }
  }

  // Create manual trade
  static async createTrade(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const tradeData = req.body;

      const trade = await prisma.trade.create({
        data: {
          ...tradeData,
          userId,
          source: 'manual',
        },
      });

      // Invalidate cache
      await prisma.userStats.deleteMany({ where: { userId } });
      await prisma.sessionStats.deleteMany({ where: { userId } });

      res.status(201).json({ trade });
    } catch (error) {
      console.error('Create trade error:', error);
      res.status(500).json({ error: 'Failed to create trade' });
    }
  }

  // Update trade
  static async updateTrade(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const tradeData = req.body;

      // Verify ownership
      const existingTrade = await prisma.trade.findFirst({
        where: { id, userId },
      });

      if (!existingTrade) {
        return res.status(404).json({ error: 'Trade not found' });
      }

      const trade = await prisma.trade.update({
        where: { id },
        data: tradeData,
      });

      // Invalidate cache
      await prisma.userStats.deleteMany({ where: { userId } });
      await prisma.sessionStats.deleteMany({ where: { userId } });

      res.json({ trade });
    } catch (error) {
      console.error('Update trade error:', error);
      res.status(500).json({ error: 'Failed to update trade' });
    }
  }

  // Delete trade
  static async deleteTrade(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      // Verify ownership
      const existingTrade = await prisma.trade.findFirst({
        where: { id, userId },
      });

      if (!existingTrade) {
        return res.status(404).json({ error: 'Trade not found' });
      }

      await prisma.trade.delete({ where: { id } });

      // Invalidate cache
      await prisma.userStats.deleteMany({ where: { userId } });
      await prisma.sessionStats.deleteMany({ where: { userId } });

      res.json({ message: 'Trade deleted successfully' });
    } catch (error) {
      console.error('Delete trade error:', error);
      res.status(500).json({ error: 'Failed to delete trade' });
    }
  }

  // Delete all trades
  static async deleteAllTrades(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;

      await prisma.trade.deleteMany({ where: { userId } });
      await prisma.userStats.deleteMany({ where: { userId } });
      await prisma.sessionStats.deleteMany({ where: { userId } });

      res.json({ message: 'All trades deleted successfully' });
    } catch (error) {
      console.error('Delete all trades error:', error);
      res.status(500).json({ error: 'Failed to delete trades' });
    }
  }

  // Get unique symbols
  static async getSymbols(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;

      const symbols = await prisma.trade.findMany({
        where: { userId },
        select: { symbol: true },
        distinct: ['symbol'],
        orderBy: { symbol: 'asc' },
      });

      const symbolList = symbols.map((s) => s.symbol);

      // Also get MT5 trade symbols
      const mt5Symbols = await prisma.mT5Trade.findMany({
        where: { userId, type: { in: ['BUY', 'SELL'] } },
        select: { symbol: true },
        distinct: ['symbol'],
        orderBy: { symbol: 'asc' },
      });

      const mt5SymbolList = mt5Symbols.map((s) => s.symbol);

      // Merge and deduplicate
      const allSymbols = [...new Set([...symbolList, ...mt5SymbolList])].sort();

      res.json({ symbols: ['all', ...allSymbols] });
    } catch (error) {
      console.error('Get symbols error:', error);
      res.status(500).json({ error: 'Failed to fetch symbols' });
    }
  }
}
