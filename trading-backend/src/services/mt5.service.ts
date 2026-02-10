import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Encryption configuration
const ENCRYPTION_KEY_STRING = process.env.MT5_ENCRYPTION_KEY || '12345678901234567890123456789012'; // Must be exactly 32 characters
// Ensure key is exactly 32 bytes for AES-256
const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_STRING.substring(0, 32).padEnd(32, '0'));
const ENCRYPTION_IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

/**
 * Helper function to convert BigInt to string in objects
 */
const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        serialized[key] = serializeBigInt(obj[key]);
      }
    }
    return serialized;
  }
  return obj;
};

/**
 * MT5 Service
 * Handles MT5 API communication, credential encryption, and data synchronization
 */
export class MT5Service {
  /**
   * Encrypt investor password before storing in database
   */
  private static encryptPassword(password: string): string {
    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt investor password for API calls
   */
  private static decryptPassword(encryptedPassword: string): string {
    const parts = encryptedPassword.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Fetch data from MT5 API
   */
  static async fetchMT5Data(accountNumber: number, investorPassword: string, server: string) {
    try {
      const response = await fetch('http://localhost:8000/api/mt5/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_number: accountNumber,
          investor_password: investorPassword,
          server: server,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch MT5 data');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('MT5 API Error:', error);
      throw new Error(error.message || 'Failed to connect to MT5 API');
    }
  }

  /**
   * Connect and save MT5 account
   */
  static async connectAccount(
    userId: string,
    accountNumber: number,
    investorPassword: string,
    server: string
  ) {
    // First, test the connection by fetching data from MT5 API
    const mt5Data = await this.fetchMT5Data(accountNumber, investorPassword, server);

    if (!mt5Data.success) {
      throw new Error(mt5Data.error || 'Failed to connect to MT5 account');
    }

    // Encrypt the password
    const encryptedPassword = this.encryptPassword(investorPassword);

    // Check if this is the first account for this user
    const existingAccounts = await prisma.mT5Account.count({
      where: { userId },
    });
    const isPrimary = existingAccounts === 0;

    // Save to database
    const account = await prisma.mT5Account.create({
      data: {
        userId,
        accountNumber,
        investorPassword: encryptedPassword,
        server,
        accountName: mt5Data.account?.name || null,
        balance: mt5Data.account?.balance || null,
        equity: mt5Data.account?.equity || null,
        profit: mt5Data.account?.profit || null,
        margin: mt5Data.account?.margin || null,
        marginFree: mt5Data.account?.margin_free || null,
        marginLevel: mt5Data.account?.margin_level || null,
        currency: mt5Data.account?.currency || null,
        leverage: mt5Data.account?.leverage || null,
        company: mt5Data.account?.company || null,
        isPrimary,
        lastSyncAt: new Date(),
      },
    });

    // Import trades and positions
    await this.syncAccountData(account.id, mt5Data);

    return account;
  }

  /**
   * Get all MT5 accounts for a user
   */
  static async getAccounts(userId: string) {
    return await prisma.mT5Account.findMany({
      where: { userId, isActive: true },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * Get single MT5 account
   */
  static async getAccount(accountId: string, userId: string) {
    const account = await prisma.mT5Account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new Error('MT5 account not found');
    }

    return account;
  }

  /**
   * Update MT5 account (password or primary status)
   */
  static async updateAccount(
    accountId: string,
    userId: string,
    data: { investorPassword?: string; isPrimary?: boolean }
  ) {
    const account = await this.getAccount(accountId, userId);

    const updateData: any = {};

    if (data.investorPassword) {
      updateData.investorPassword = this.encryptPassword(data.investorPassword);
    }

    if (data.isPrimary !== undefined) {
      // If setting as primary, unset other primary accounts
      if (data.isPrimary) {
        await prisma.mT5Account.updateMany({
          where: { userId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      updateData.isPrimary = data.isPrimary;
    }

    return await prisma.mT5Account.update({
      where: { id: accountId },
      data: updateData,
    });
  }

  /**
   * Delete MT5 account and all associated trades/positions (cascaded)
   */
  static async deleteAccount(accountId: string, userId: string) {
    await this.getAccount(accountId, userId); // Check if exists and belongs to user

    // Invalidate stats cache since MT5 data is being removed
    await prisma.userStats.deleteMany({ where: { userId } });
    await prisma.sessionStats.deleteMany({ where: { userId } });

    // MT5Trade and MT5Position are cascade-deleted via schema
    return await prisma.mT5Account.delete({
      where: { id: accountId },
    });
  }

  /**
   * Sync MT5 account data (fetch fresh data from API)
   */
  static async syncAccount(accountId: string, userId: string) {
    const account = await this.getAccount(accountId, userId);

    // Decrypt password to make API call
    const decryptedPassword = this.decryptPassword(account.investorPassword);

    try {
      const mt5Data = await this.fetchMT5Data(account.accountNumber, decryptedPassword, account.server);

      if (!mt5Data.success) {
        // Update error status
        await prisma.mT5Account.update({
          where: { id: accountId },
          data: { lastError: mt5Data.error || 'Sync failed' },
        });
        throw new Error(mt5Data.error || 'Failed to sync MT5 account');
      }

      // Update account info
      await prisma.mT5Account.update({
        where: { id: accountId },
        data: {
          accountName: mt5Data.account?.name || account.accountName,
          balance: mt5Data.account?.balance || account.balance,
          equity: mt5Data.account?.equity || account.equity,
          profit: mt5Data.account?.profit || account.profit,
          margin: mt5Data.account?.margin || account.margin,
          marginFree: mt5Data.account?.margin_free || account.marginFree,
          marginLevel: mt5Data.account?.margin_level || account.marginLevel,
          currency: mt5Data.account?.currency || account.currency,
          leverage: mt5Data.account?.leverage || account.leverage,
          company: mt5Data.account?.company || account.company,
          lastSyncAt: new Date(),
          lastError: null,
        },
      });

      // Sync trades and positions
      const syncResult = await this.syncAccountData(accountId, mt5Data);

      return {
        success: true,
        data: {
          account: await this.getAccount(accountId, userId),
          tradesImported: syncResult.tradesImported,
          positionsUpdated: syncResult.positionsUpdated,
        },
      };
    } catch (error: any) {
      console.error('Sync error:', error);
      await prisma.mT5Account.update({
        where: { id: accountId },
        data: { lastError: error.message },
      });
      throw error;
    }
  }

  /**
   * Sync trades and positions data
   */
  private static async syncAccountData(accountId: string, mt5Data: any) {
    const account = await prisma.mT5Account.findUnique({ where: { id: accountId } });
    if (!account) throw new Error('Account not found');

    let tradesImported = 0;
    let positionsUpdated = 0;

    // Import trades (skip duplicates)
    if (mt5Data.history && Array.isArray(mt5Data.history)) {
      for (const trade of mt5Data.history) {
        try {
          await prisma.mT5Trade.upsert({
            where: { ticket: BigInt(trade.ticket) },
            create: {
              mt5AccountId: accountId,
              userId: account.userId,
              ticket: BigInt(trade.ticket),
              order: BigInt(trade.order || 0),
              time: new Date(trade.time),
              type: trade.type,
              entry: trade.entry || 0,
              symbol: trade.symbol || '',
              volume: trade.volume || 0,
              price: trade.price || 0,
              profit: trade.profit || 0,
              commission: trade.commission || 0,
              swap: trade.swap || 0,
              comment: trade.comment || null,
            },
            update: {
              profit: trade.profit || 0,
              commission: trade.commission || 0,
              swap: trade.swap || 0,
            },
          });
          tradesImported++;
        } catch (error) {
          console.error(`Failed to import trade ${trade.ticket}:`, error);
        }
      }
    }

    // Clear old positions and insert new ones
    await prisma.mT5Position.deleteMany({ where: { mt5AccountId: accountId } });

    if (mt5Data.positions && Array.isArray(mt5Data.positions)) {
      for (const position of mt5Data.positions) {
        try {
          await prisma.mT5Position.create({
            data: {
              mt5AccountId: accountId,
              userId: account.userId,
              ticket: BigInt(position.ticket),
              symbol: position.symbol,
              type: position.type,
              volume: position.volume,
              openPrice: position.openPrice,
              currentPrice: position.currentPrice || null,
              stopLoss: position.stopLoss || null,
              takeProfit: position.takeProfit || null,
              profit: position.profit,
              swap: position.swap || 0,
              commission: position.commission || 0,
              openTime: new Date(position.openTime),
            },
          });
          positionsUpdated++;
        } catch (error) {
          console.error(`Failed to import position ${position.ticket}:`, error);
        }
      }
    }

    return { tradesImported, positionsUpdated };
  }

  /**
   * Get dashboard data for MT5 account
   */
  static async getDashboardData(accountId: string, userId: string, timePeriod: string = '30days') {
    const account = await this.getAccount(accountId, userId);

    // Calculate date range based on time period
    const now = new Date();
    let startDate = new Date();
    switch (timePeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Get trades in period (exclude BALANCE and CREDIT entries)
    const trades = await prisma.mT5Trade.findMany({
      where: {
        mt5AccountId: accountId,
        time: { gte: startDate },
        type: { in: ['BUY', 'SELL'] },
      },
      orderBy: { time: 'desc' },
    });

    // Get positions
    const positions = await prisma.mT5Position.findMany({
      where: { mt5AccountId: accountId },
      orderBy: { openTime: 'desc' },
    });

    // Calculate metrics
    const realizedPnL = trades.reduce((sum, t) => sum + t.profit, 0);
    const unrealizedPnL = positions.reduce((sum, p) => sum + p.profit, 0);
    const totalPnL = realizedPnL;

    const wins = trades.filter((t) => t.profit > 0).length;
    const losses = trades.filter((t) => t.profit < 0).length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

    const avgWin = wins > 0 ? trades.filter((t) => t.profit > 0).reduce((sum, t) => sum + t.profit, 0) / wins : 0;
    const avgLoss =
      losses > 0 ? Math.abs(trades.filter((t) => t.profit < 0).reduce((sum, t) => sum + t.profit, 0) / losses) : 0;

    const bestTrade = trades.length > 0 ? Math.max(...trades.map((t) => t.profit)) : 0;
    const worstTrade = trades.length > 0 ? Math.min(...trades.map((t) => t.profit)) : 0;

    const grossProfit = trades.filter((t) => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(trades.filter((t) => t.profit < 0).reduce((sum, t) => sum + t.profit, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

    // Equity curve
    const equityCurve = this.calculateEquityCurve(trades, account.balance || 0);

    // Top performers
    const topPerformers = this.calculateTopPerformers(trades);

    // Monthly P&L
    const monthlyPnL = this.calculateMonthlyPnL(trades);

    return {
      account: serializeBigInt(account),
      metrics: {
        totalPnL,
        unrealizedPnL,
        realizedPnL,
        winRate: Math.round(winRate * 10) / 10,
      },
      stats: {
        totalTrades: trades.length,
        wins,
        losses,
        avgWin: Math.round(avgWin * 100) / 100,
        avgLoss: Math.round(avgLoss * 100) / 100,
        bestTrade: Math.round(bestTrade * 100) / 100,
        worstTrade: Math.round(worstTrade * 100) / 100,
        profitFactor: Math.round(profitFactor * 100) / 100,
      },
      equityCurve,
      positions: serializeBigInt(positions),
      recentTrades: serializeBigInt(trades.slice(0, 10)),
      topPerformers,
      monthlyPnL,
    };
  }

  /**
   * Calculate equity curve
   */
  private static calculateEquityCurve(trades: any[], startingBalance: number) {
    const sortedTrades = trades.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    let equity = startingBalance;
    const curve: any[] = [];

    sortedTrades.forEach((trade) => {
      equity += trade.profit;
      curve.push({
        date: new Date(trade.time).toISOString().split('T')[0],
        equity: Math.round(equity * 100) / 100,
      });
    });

    return curve;
  }

  /**
   * Calculate top performing symbols
   */
  private static calculateTopPerformers(trades: any[]) {
    const symbolStats: any = {};

    trades.forEach((trade) => {
      if (!symbolStats[trade.symbol]) {
        symbolStats[trade.symbol] = { trades: 0, pnl: 0 };
      }
      symbolStats[trade.symbol].trades++;
      symbolStats[trade.symbol].pnl += trade.profit;
    });

    const performers = Object.entries(symbolStats)
      .map(([symbol, stats]: [string, any]) => ({
        symbol,
        trades: stats.trades,
        pnl: Math.round(stats.pnl * 100) / 100,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5);

    return performers.map((p, index) => ({ ...p, rank: index + 1 }));
  }

  /**
   * Calculate monthly P&L
   */
  private static calculateMonthlyPnL(trades: any[]) {
    const monthlyPnL: any = {};

    trades.forEach((trade) => {
      const date = new Date(trade.time).toISOString().split('T')[0];
      if (!monthlyPnL[date]) {
        monthlyPnL[date] = 0;
      }
      monthlyPnL[date] += trade.profit;
    });

    // Round values
    Object.keys(monthlyPnL).forEach((date) => {
      monthlyPnL[date] = Math.round(monthlyPnL[date] * 100) / 100;
    });

    return monthlyPnL;
  }
}
