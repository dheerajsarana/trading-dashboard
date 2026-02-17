import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateSessionParams {
  userId: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

interface SessionSummary {
  totalPnL: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
}

interface TradeData {
  type: string;
  entryPrice: number;
  entryTime: string;
  volume?: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface ExitData {
  exitPrice: number;
  exitTime: string;
  pnl: number;
  pnlPips: number;
  closeReason: string;
}

export class BacktestService {
  static async createSession(params: CreateSessionParams) {
    const { userId, symbol, timeframe, startDate, endDate } = params;

    const session = await prisma.backtestSession.create({
      data: {
        userId,
        symbol,
        timeframe,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'active',
      },
    });

    return session;
  }

  static async getSession(sessionId: string, userId: string) {
    const session = await prisma.backtestSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        trades: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return session;
  }

  static async getUserSessions(userId: string) {
    const sessions = await prisma.backtestSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { trades: true },
        },
      },
    });

    return sessions;
  }

  static async completeSession(sessionId: string, userId: string, summary: SessionSummary) {
    const session = await prisma.backtestSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const updated = await prisma.backtestSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        totalPnL: summary.totalPnL,
        totalTrades: summary.totalTrades,
        wins: summary.wins,
        losses: summary.losses,
        winRate: summary.winRate,
        profitFactor: summary.profitFactor,
        maxDrawdown: summary.maxDrawdown,
      },
    });

    return updated;
  }

  static async abandonSession(sessionId: string, userId: string) {
    const session = await prisma.backtestSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const updated = await prisma.backtestSession.update({
      where: { id: sessionId },
      data: { status: 'abandoned' },
    });

    return updated;
  }

  static async deleteSession(sessionId: string, userId: string) {
    const session = await prisma.backtestSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    await prisma.backtestSession.delete({
      where: { id: sessionId },
    });

    return { message: 'Session deleted successfully' };
  }

  static async addTrade(sessionId: string, tradeData: TradeData) {
    const trade = await prisma.backtestTrade.create({
      data: {
        sessionId,
        type: tradeData.type,
        entryPrice: tradeData.entryPrice,
        entryTime: new Date(tradeData.entryTime),
        volume: tradeData.volume ?? 1.0,
        stopLoss: tradeData.stopLoss ?? null,
        takeProfit: tradeData.takeProfit ?? null,
      },
    });

    return trade;
  }

  static async closeTrade(tradeId: string, exitData: ExitData) {
    const trade = await prisma.backtestTrade.update({
      where: { id: tradeId },
      data: {
        exitPrice: exitData.exitPrice,
        exitTime: new Date(exitData.exitTime),
        pnl: exitData.pnl,
        pnlPips: exitData.pnlPips,
        closeReason: exitData.closeReason,
      },
    });

    return trade;
  }

  static async getSessionTrades(sessionId: string) {
    const trades = await prisma.backtestTrade.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    return trades;
  }
}
