import { apiClient } from './client';
import type { Candle, BacktestSession, BacktestTrade, BacktestSessionConfig, BacktestSummary } from '../types';

export const backtestApi = {
  getSymbols: async (): Promise<{ symbols: string[]; timeframes: string[] }> => {
    return apiClient.get('/api/backtest/symbols');
  },

  getCandles: async (params: {
    symbol: string;
    timeframe: string;
    startDate: string;
    endDate: string;
  }): Promise<{ candles: Candle[]; count: number }> => {
    return apiClient.get('/api/backtest/candles', { params: params as any });
  },

  createSession: async (config: BacktestSessionConfig): Promise<{ session: BacktestSession }> => {
    return apiClient.post('/api/backtest/sessions', config);
  },

  getSessions: async (): Promise<{ sessions: BacktestSession[] }> => {
    return apiClient.get('/api/backtest/sessions');
  },

  getSession: async (id: string): Promise<{ session: BacktestSession }> => {
    return apiClient.get(`/api/backtest/sessions/${id}`);
  },

  completeSession: async (id: string, summary: BacktestSummary): Promise<{ session: BacktestSession }> => {
    return apiClient.put(`/api/backtest/sessions/${id}/complete`, summary);
  },

  deleteSession: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete(`/api/backtest/sessions/${id}`);
  },

  addTrade: async (sessionId: string, trade: {
    type: string;
    entryPrice: number;
    entryTime: string;
    volume?: number;
    stopLoss?: number;
    takeProfit?: number;
  }): Promise<{ trade: BacktestTrade }> => {
    return apiClient.post(`/api/backtest/sessions/${sessionId}/trades`, trade);
  },

  closeTrade: async (tradeId: string, data: {
    exitPrice: number;
    exitTime: string;
    pnl: number;
    pnlPips: number;
    closeReason: string;
  }): Promise<{ trade: BacktestTrade }> => {
    return apiClient.put(`/api/backtest/trades/${tradeId}/close`, data);
  },
};
