import { apiClient } from './client';
import { API_CONFIG } from '../config/api.config';
import { TimePeriod, TradeFilter } from '../types';

export interface StatsParams {
  timePeriod?: TimePeriod;
  assetFilter?: string;
  tradeFilter?: TradeFilter;
}

export interface StatsResponse {
  basic: {
    totalPnL: number;
    winRate: number;
    profitFactor: number;
    expectancy: number;
    totalTrades: number;
    wins: number;
    losses: number;
    avgWinner: number;
    avgLoser: number;
    bestTrade: number;
    worstTrade: number;
    winStreak: number;
    lossStreak: number;
    longTrades: number;
    longPnL: number;
    longWinRate: number;
    shortTrades: number;
    shortPnL: number;
    shortWinRate: number;
    grossProfit: number;
    grossLoss: number;
    maxDrawdown: number;
    maxDrawdownPercent: number;
    avgDrawdown: number;
    avgDrawdownDuration: number;
    maxDrawdownDuration: number;
    recoveryFactor: number;
    currentDrawdown: number;
    avgHoldTimeWinners: number;
    avgHoldTimeLosers: number;
    avgHoldTimeAll: number;
    optimalHoldingWindow: string;
  };
  sessions: Array<{
    session: string;
    trades: number;
    pnl: number;
    winRate: number;
    expectancy: number;
    avgProfit: number;
  }>;
  cached: boolean;
}

export interface EquityCurveResponse {
  equityCurve: Array<{
    date: string;
    equity: number;
  }>;
}

export interface CalendarResponse {
  calendar: Record<string, {
    trades: number;
    pnl: number;
  }>;
}

/**
 * Statistics API endpoints
 */
export const statsApi = {
  /**
   * Get comprehensive statistics
   */
  getStats: async (params: StatsParams): Promise<StatsResponse> => {
    return apiClient.get<StatsResponse>(API_CONFIG.endpoints.stats.overview, {
      params: params as Record<string, string>,
    });
  },

  /**
   * Get equity curve data
   */
  getEquityCurve: async (params: StatsParams): Promise<EquityCurveResponse> => {
    return apiClient.get<EquityCurveResponse>(API_CONFIG.endpoints.stats.equity, {
      params: params as Record<string, string>,
    });
  },

  /**
   * Get calendar heatmap data
   */
  getCalendar: async (params: StatsParams): Promise<CalendarResponse> => {
    return apiClient.get<CalendarResponse>(API_CONFIG.endpoints.stats.calendar, {
      params: params as Record<string, string>,
    });
  },

  /**
   * Invalidate cache (for testing)
   */
  invalidateCache: async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(API_CONFIG.endpoints.stats.invalidate);
  },
};
