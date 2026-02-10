import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { StatisticsService } from '../services/statistics.service';
import { TradeFilterService, TimePeriod } from '../services/filter.service';
import { TradeNormalizerService } from '../services/tradeNormalizer.service';

const prisma = new PrismaClient();

export class StatsController {
  // Get all statistics (comprehensive endpoint)
  static async getAllStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const {
        timePeriod = '30days',
        assetFilter = 'all',
        tradeFilter = 'all',
      } = req.query;

      // Check cache first
      const cached = await prisma.userStats.findUnique({
        where: {
          userId_timePeriod_assetFilter_tradeFilter: {
            userId,
            timePeriod: timePeriod as string,
            assetFilter: assetFilter as string,
            tradeFilter: tradeFilter as string,
          },
        },
      });

      // Return cached if valid
      if (cached && cached.expiresAt > new Date()) {
        const sessionStats = await prisma.sessionStats.findMany({
          where: {
            userId,
            timePeriod: timePeriod as string,
            assetFilter: assetFilter as string,
            tradeFilter: tradeFilter as string,
          },
        });

        return res.json({
          basic: cached,
          sessions: sessionStats,
          cached: true,
        });
      }

      // Calculate from scratch
      const regularTrades = await prisma.trade.findMany({
        where: { userId },
        orderBy: { closeTime: 'asc' },
      });

      // Fetch normalized MT5 trades
      const normalizedMT5Trades = await TradeNormalizerService.fetchNormalizedMT5Trades(userId);

      // Merge and sort by closeTime
      const allTrades = [...regularTrades, ...normalizedMT5Trades]
        .sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());

      // Apply filters
      let filtered = TradeFilterService.filterByPeriod(
        allTrades,
        timePeriod as TimePeriod
      );
      filtered = TradeFilterService.filterByAsset(filtered, assetFilter as string);
      filtered = TradeFilterService.filterByType(filtered, tradeFilter as string);

      // Calculate all stats
      const basicStats = StatisticsService.calculateBasicStats(filtered);
      const drawdownStats = StatisticsService.calculateDrawdown(filtered);
      const durationStats = StatisticsService.calculateDuration(filtered);
      const sessionStats = StatisticsService.calculateSessionStats(filtered);

      // Cache results
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(process.env.CACHE_TTL || '3600'));

      await prisma.userStats.upsert({
        where: {
          userId_timePeriod_assetFilter_tradeFilter: {
            userId,
            timePeriod: timePeriod as string,
            assetFilter: assetFilter as string,
            tradeFilter: tradeFilter as string,
          },
        },
        update: {
          ...basicStats,
          ...drawdownStats,
          ...durationStats,
          calculatedAt: new Date(),
          expiresAt,
        },
        create: {
          userId,
          timePeriod: timePeriod as string,
          assetFilter: assetFilter as string,
          tradeFilter: tradeFilter as string,
          ...basicStats,
          ...drawdownStats,
          ...durationStats,
          expiresAt,
        },
      });

      // Cache session stats
      await prisma.sessionStats.deleteMany({
        where: {
          userId,
          timePeriod: timePeriod as string,
          assetFilter: assetFilter as string,
          tradeFilter: tradeFilter as string,
        },
      });

      await prisma.sessionStats.createMany({
        data: sessionStats.map((stat) => ({
          userId,
          timePeriod: timePeriod as string,
          assetFilter: assetFilter as string,
          tradeFilter: tradeFilter as string,
          ...stat,
          calculatedAt: new Date(),
          expiresAt,
        })),
      });

      res.json({
        basic: { ...basicStats, ...drawdownStats, ...durationStats },
        sessions: sessionStats,
        cached: false,
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to calculate statistics' });
    }
  }

  // Get equity curve
  static async getEquityCurve(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { timePeriod = '30days', assetFilter = 'all' } = req.query;

      const regularTrades = await prisma.trade.findMany({
        where: { userId },
        orderBy: { closeTime: 'asc' },
      });
      const normalizedMT5Trades = await TradeNormalizerService.fetchNormalizedMT5Trades(userId);
      const allTrades = [...regularTrades, ...normalizedMT5Trades]
        .sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());

      let filtered = TradeFilterService.filterByPeriod(
        allTrades,
        timePeriod as TimePeriod
      );
      filtered = TradeFilterService.filterByAsset(filtered, assetFilter as string);

      // Calculate equity curve
      let runningTotal = 0;
      const equityCurve = filtered.map((trade) => {
        runningTotal += trade.profit;
        return {
          date: trade.closeTime.toISOString().split('T')[0],
          equity: runningTotal,
        };
      });

      res.json({ equityCurve });
    } catch (error) {
      console.error('Get equity curve error:', error);
      res.status(500).json({ error: 'Failed to calculate equity curve' });
    }
  }

  // Get calendar data
  static async getCalendarData(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { timePeriod = '30days', assetFilter = 'all' } = req.query;

      const regularTrades = await prisma.trade.findMany({
        where: { userId },
      });
      const normalizedMT5Trades = await TradeNormalizerService.fetchNormalizedMT5Trades(userId);
      const allTrades = [...regularTrades, ...normalizedMT5Trades]
        .sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());

      let filtered = TradeFilterService.filterByPeriod(
        allTrades,
        timePeriod as TimePeriod
      );
      filtered = TradeFilterService.filterByAsset(filtered, assetFilter as string);

      // Group by date
      const calendar: { [key: string]: { trades: number; pnl: number } } = {};

      filtered.forEach((trade) => {
        const dateStr = trade.closeTime.toISOString().split('T')[0];
        if (!calendar[dateStr]) {
          calendar[dateStr] = { trades: 0, pnl: 0 };
        }
        calendar[dateStr].trades++;
        calendar[dateStr].pnl += trade.profit;
      });

      res.json({ calendar });
    } catch (error) {
      console.error('Get calendar error:', error);
      res.status(500).json({ error: 'Failed to calculate calendar data' });
    }
  }

  // Invalidate cache (useful for testing)
  static async invalidateCache(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;

      await prisma.userStats.deleteMany({ where: { userId } });
      await prisma.sessionStats.deleteMany({ where: { userId } });

      res.json({ message: 'Cache invalidated successfully' });
    } catch (error) {
      console.error('Invalidate cache error:', error);
      res.status(500).json({ error: 'Failed to invalidate cache' });
    }
  }
}
