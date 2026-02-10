import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { MT5Service } from '../services/mt5.service';

const prisma = new PrismaClient();

export class MT5Controller {
  /**
   * POST /api/mt5/accounts
   * Connect a new MT5 account
   */
  static async connectAccount(req: Request, res: Response) {
    try {
      const { accountNumber, investorPassword, server } = req.body;
      const userId = (req as any).userId;

      if (!accountNumber || !investorPassword || !server) {
        return res.status(400).json({
          success: false,
          error: 'Account number, investor password, and server are required',
        });
      }

      const account = await MT5Service.connectAccount(
        userId,
        parseInt(accountNumber),
        investorPassword,
        server
      );

      // Remove sensitive data from response
      const { investorPassword: _, ...accountData } = account;

      res.status(201).json({
        success: true,
        account: accountData,
      });
    } catch (error: any) {
      console.error('Connect account error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to connect MT5 account',
      });
    }
  }

  /**
   * GET /api/mt5/accounts
   * Get all MT5 accounts for the authenticated user
   */
  static async getAccounts(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const accounts = await MT5Service.getAccounts(userId);

      // Remove sensitive data from all accounts
      const accountsData = accounts.map(({ investorPassword, ...account }) => account);

      res.json({
        success: true,
        accounts: accountsData,
      });
    } catch (error: any) {
      console.error('Get accounts error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch MT5 accounts',
      });
    }
  }

  /**
   * GET /api/mt5/accounts/:id
   * Get a single MT5 account
   */
  static async getAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const account = await MT5Service.getAccount(id, userId);

      // Remove sensitive data
      const { investorPassword, ...accountData } = account;

      res.json({
        success: true,
        account: accountData,
      });
    } catch (error: any) {
      console.error('Get account error:', error);
      res.status(404).json({
        success: false,
        error: error.message || 'MT5 account not found',
      });
    }
  }

  /**
   * PUT /api/mt5/accounts/:id
   * Update MT5 account (password or primary status)
   */
  static async updateAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const { investorPassword, isPrimary } = req.body;

      const account = await MT5Service.updateAccount(id, userId, {
        investorPassword,
        isPrimary,
      });

      // Remove sensitive data
      const { investorPassword: _, ...accountData } = account;

      res.json({
        success: true,
        account: accountData,
      });
    } catch (error: any) {
      console.error('Update account error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update MT5 account',
      });
    }
  }

  /**
   * DELETE /api/mt5/accounts/:id
   * Disconnect (deactivate) MT5 account
   */
  static async deleteAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      await MT5Service.deleteAccount(id, userId);

      res.json({
        success: true,
        message: 'MT5 account disconnected successfully',
      });
    } catch (error: any) {
      console.error('Delete account error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to disconnect MT5 account',
      });
    }
  }

  /**
   * POST /api/mt5/accounts/:id/sync
   * Manually sync MT5 account data
   */
  static async syncAccount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const result = await MT5Service.syncAccount(id, userId);

      // Invalidate stats cache since MT5 data changed
      await prisma.userStats.deleteMany({ where: { userId } });
      await prisma.sessionStats.deleteMany({ where: { userId } });

      // Remove sensitive data
      const { investorPassword, ...accountData } = result.data.account;

      res.json({
        success: true,
        data: {
          account: accountData,
          tradesImported: result.data.tradesImported,
          positionsUpdated: result.data.positionsUpdated,
          lastSyncAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error('Sync account error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to sync MT5 account',
      });
    }
  }

  /**
   * GET /api/mt5/accounts/:id/dashboard
   * Get dashboard data for MT5 account
   */
  static async getDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const { timePeriod = '30days' } = req.query;

      const dashboardData = await MT5Service.getDashboardData(id, userId, timePeriod as string);

      // Remove sensitive data from account
      const { investorPassword, ...accountData } = dashboardData.account;

      res.json({
        success: true,
        data: {
          ...dashboardData,
          account: accountData,
        },
      });
    } catch (error: any) {
      console.error('Get dashboard error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to fetch dashboard data',
      });
    }
  }

  /**
   * GET /api/mt5/accounts/:id/equity
   * Get equity curve data
   */
  static async getEquityCurve(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const { timePeriod = '30days' } = req.query;

      const dashboardData = await MT5Service.getDashboardData(id, userId, timePeriod as string);

      res.json({
        success: true,
        data: dashboardData.equityCurve,
      });
    } catch (error: any) {
      console.error('Get equity curve error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to fetch equity curve',
      });
    }
  }

  /**
   * GET /api/mt5/accounts/:id/positions
   * Get open positions
   */
  static async getPositions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;

      const dashboardData = await MT5Service.getDashboardData(id, userId, 'all');

      res.json({
        success: true,
        positions: dashboardData.positions,
      });
    } catch (error: any) {
      console.error('Get positions error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to fetch positions',
      });
    }
  }

  /**
   * GET /api/mt5/accounts/:id/history
   * Get trade history
   */
  static async getHistory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const { timePeriod = '30days', limit = '50' } = req.query;

      const dashboardData = await MT5Service.getDashboardData(id, userId, timePeriod as string);

      const trades = dashboardData.recentTrades.slice(0, parseInt(limit as string));

      res.json({
        success: true,
        trades,
        total: dashboardData.stats.totalTrades,
      });
    } catch (error: any) {
      console.error('Get history error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to fetch trade history',
      });
    }
  }
}
