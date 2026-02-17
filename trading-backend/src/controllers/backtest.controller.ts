import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CandleService } from '../services/candle.service';
import { BacktestService } from '../services/backtest.service';

export class BacktestController {
  // Get candle data
  static async getCandles(req: AuthRequest, res: Response) {
    try {
      const { symbol, timeframe, startDate, endDate } = req.query;

      if (!symbol || !timeframe || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters: symbol, timeframe, startDate, endDate' });
      }

      const candles = await CandleService.getCandles({
        symbol: symbol as string,
        timeframe: timeframe as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({ candles, count: candles.length });
    } catch (error) {
      console.error('Get candles error:', error);
      res.status(500).json({ error: 'Failed to fetch candle data' });
    }
  }

  // Get available symbols and timeframes
  static async getSymbols(req: AuthRequest, res: Response) {
    try {
      const symbols = CandleService.getAvailableSymbols();
      const timeframes = CandleService.getAvailableTimeframes();

      res.json({ symbols, timeframes });
    } catch (error) {
      console.error('Get symbols error:', error);
      res.status(500).json({ error: 'Failed to fetch symbols' });
    }
  }

  // Create a new backtest session
  static async createSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { symbol, timeframe, startDate, endDate } = req.body;

      const session = await BacktestService.createSession({
        userId,
        symbol,
        timeframe,
        startDate,
        endDate,
      });

      res.status(201).json({ session });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create backtest session' });
    }
  }

  // Get all sessions for the current user
  static async getSessions(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;

      const sessions = await BacktestService.getUserSessions(userId);

      res.json({ sessions });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to fetch backtest sessions' });
    }
  }

  // Get a specific session by ID
  static async getSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const session = await BacktestService.getSession(id, userId);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json({ session });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ error: 'Failed to fetch backtest session' });
    }
  }

  // Complete a session with summary stats
  static async completeSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const { totalPnL, totalTrades, wins, losses, winRate, profitFactor, maxDrawdown } = req.body;

      const session = await BacktestService.completeSession(id, userId, {
        totalPnL,
        totalTrades,
        wins,
        losses,
        winRate,
        profitFactor,
        maxDrawdown,
      });

      res.json({ session });
    } catch (error) {
      console.error('Complete session error:', error);
      res.status(500).json({ error: 'Failed to complete backtest session' });
    }
  }

  // Delete a session
  static async deleteSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      await BacktestService.deleteSession(id, userId);

      res.json({ message: 'Session deleted successfully' });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({ error: 'Failed to delete backtest session' });
    }
  }

  // Add a trade to a session
  static async addTrade(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { type, entryPrice, entryTime, volume, stopLoss, takeProfit } = req.body;

      const trade = await BacktestService.addTrade(id, {
        type,
        entryPrice,
        entryTime,
        volume,
        stopLoss,
        takeProfit,
      });

      res.status(201).json({ trade });
    } catch (error) {
      console.error('Add trade error:', error);
      res.status(500).json({ error: 'Failed to add backtest trade' });
    }
  }

  // Close a trade
  static async closeTrade(req: AuthRequest, res: Response) {
    try {
      const { tradeId } = req.params;
      const { exitPrice, exitTime, pnl, pnlPips, closeReason } = req.body;

      const trade = await BacktestService.closeTrade(tradeId, {
        exitPrice,
        exitTime,
        pnl,
        pnlPips,
        closeReason,
      });

      res.json({ trade });
    } catch (error) {
      console.error('Close trade error:', error);
      res.status(500).json({ error: 'Failed to close backtest trade' });
    }
  }
}
