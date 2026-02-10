import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export class JournalController {
  // Get all journals with optional filters
  static async getAllJournals(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { status, symbol, page = '1', limit = '50' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build filter conditions
      const where: any = {
        userId,
      };

      if (status && status !== 'all') {
        where.status = status;
      }

      // Fetch journals with trade data
      const [journals, total] = await Promise.all([
        prisma.tradeJournal.findMany({
          where,
          include: {
            trade: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limitNum,
        }),
        prisma.tradeJournal.count({ where }),
      ]);

      // Filter by symbol if provided (since symbol is in trade, not journal)
      let filteredJournals = journals;
      if (symbol && symbol !== 'all') {
        filteredJournals = journals.filter(j => j.trade.symbol === symbol);
      }

      res.json({
        journals: filteredJournals,
        pagination: {
          total: symbol && symbol !== 'all' ? filteredJournals.length : total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Get journals error:', error);
      res.status(500).json({ error: 'Failed to fetch journals' });
    }
  }

  // Get single journal by ID
  static async getJournalById(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const journal = await prisma.tradeJournal.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          trade: true,
        },
      });

      if (!journal) {
        return res.status(404).json({ error: 'Journal not found' });
      }

      res.json({ journal });
    } catch (error) {
      console.error('Get journal error:', error);
      res.status(500).json({ error: 'Failed to fetch journal' });
    }
  }

  // Get journal by trade ID
  static async getJournalByTradeId(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { tradeId } = req.params;

      // First verify the trade belongs to the user
      const trade = await prisma.trade.findFirst({
        where: {
          id: tradeId,
          userId,
        },
      });

      if (!trade) {
        return res.status(404).json({ error: 'Trade not found' });
      }

      // Get or create journal
      let journal = await prisma.tradeJournal.findUnique({
        where: {
          tradeId,
        },
        include: {
          trade: true,
        },
      });

      if (!journal) {
        // Create a default journal entry if it doesn't exist
        journal = await prisma.tradeJournal.create({
          data: {
            tradeId,
            userId,
            status: 'new',
          },
          include: {
            trade: true,
          },
        });
      }

      res.json({ journal });
    } catch (error) {
      console.error('Get journal by trade error:', error);
      res.status(500).json({ error: 'Failed to fetch journal' });
    }
  }

  // Create journal
  static async createJournal(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const {
        tradeId,
        preTradeAnalysis,
        postTradeReview,
        emotions,
        lessonsLearned,
        tags,
        rating,
        executionChecklist,
        screenshots,
        status,
      } = req.body;

      // Verify trade belongs to user
      const trade = await prisma.trade.findFirst({
        where: {
          id: tradeId,
          userId,
        },
      });

      if (!trade) {
        return res.status(404).json({ error: 'Trade not found' });
      }

      // Check if journal already exists
      const existingJournal = await prisma.tradeJournal.findUnique({
        where: { tradeId },
      });

      if (existingJournal) {
        return res.status(400).json({ error: 'Journal already exists for this trade' });
      }

      // Create journal
      const journal = await prisma.tradeJournal.create({
        data: {
          tradeId,
          userId,
          preTradeAnalysis,
          postTradeReview,
          emotions,
          lessonsLearned,
          tags: tags || [],
          rating: rating || 5,
          executionChecklist: executionChecklist || { items: [] },
          screenshots: screenshots || [],
          status: status || 'new',
        },
        include: {
          trade: true,
        },
      });

      res.status(201).json({ journal });
    } catch (error) {
      console.error('Create journal error:', error);
      res.status(500).json({ error: 'Failed to create journal' });
    }
  }

  // Update journal
  static async updateJournal(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const {
        preTradeAnalysis,
        postTradeReview,
        emotions,
        lessonsLearned,
        tags,
        rating,
        executionChecklist,
        screenshots,
        status,
      } = req.body;

      // Verify journal belongs to user
      const existingJournal = await prisma.tradeJournal.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!existingJournal) {
        return res.status(404).json({ error: 'Journal not found' });
      }

      // Update journal
      const journal = await prisma.tradeJournal.update({
        where: { id },
        data: {
          preTradeAnalysis,
          postTradeReview,
          emotions,
          lessonsLearned,
          tags,
          rating,
          executionChecklist,
          screenshots,
          status,
        },
        include: {
          trade: true,
        },
      });

      res.json({ journal });
    } catch (error) {
      console.error('Update journal error:', error);
      res.status(500).json({ error: 'Failed to update journal' });
    }
  }

  // Delete journal
  static async deleteJournal(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      // Verify journal belongs to user
      const journal = await prisma.tradeJournal.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!journal) {
        return res.status(404).json({ error: 'Journal not found' });
      }

      await prisma.tradeJournal.delete({
        where: { id },
      });

      res.json({ message: 'Journal deleted successfully' });
    } catch (error) {
      console.error('Delete journal error:', error);
      res.status(500).json({ error: 'Failed to delete journal' });
    }
  }

  // Get journal statistics
  static async getJournalStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;

      const [total, byStatus, avgRating] = await Promise.all([
        prisma.tradeJournal.count({ where: { userId } }),
        prisma.tradeJournal.groupBy({
          by: ['status'],
          where: { userId },
          _count: true,
        }),
        prisma.tradeJournal.aggregate({
          where: { userId },
          _avg: { rating: true },
        }),
      ]);

      const statusCounts = byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        total,
        statusCounts,
        averageRating: avgRating._avg.rating || 0,
      });
    } catch (error) {
      console.error('Get journal stats error:', error);
      res.status(500).json({ error: 'Failed to fetch journal statistics' });
    }
  }
}
