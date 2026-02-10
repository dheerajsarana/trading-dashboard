import { apiClient } from './client';
import { API_CONFIG } from '../config/api.config';
import { Trade, TradeFormData, PaginationInfo } from '../types';

export interface TradesResponse {
  trades: Trade[];
  pagination?: PaginationInfo;
}

export interface UploadResponse {
  message: string;
  count: number;
}

export interface SymbolsResponse {
  symbols: string[];
}

export interface GetTradesParams {
  symbol?: string;
  type?: 'buy' | 'sell';
  source?: 'manual' | 'upload' | 'mt5';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Trades API endpoints
 */
export const tradesApi = {
  /**
   * Get all trades for authenticated user with optional filters
   */
  getTrades: async (params?: GetTradesParams): Promise<TradesResponse> => {
    return apiClient.get<TradesResponse>(API_CONFIG.endpoints.trades.list, {
      params: params as any,
    });
  },

  /**
   * Create a new manual trade
   */
  createTrade: async (trade: TradeFormData): Promise<{ trade: Trade }> => {
    return apiClient.post<{ trade: Trade }>(API_CONFIG.endpoints.trades.create, trade);
  },

  /**
   * Update an existing trade
   */
  updateTrade: async (id: string, trade: Partial<Trade>): Promise<{ trade: Trade }> => {
    return apiClient.put<{ trade: Trade }>(API_CONFIG.endpoints.trades.update(id), trade);
  },

  /**
   * Delete a specific trade
   */
  deleteTrade: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(API_CONFIG.endpoints.trades.delete(id));
  },

  /**
   * Delete all trades for authenticated user
   */
  deleteAllTrades: async (): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(API_CONFIG.endpoints.trades.deleteAll);
  },

  /**
   * Upload Excel file with trades
   */
  uploadFile: async (file: File): Promise<UploadResponse> => {
    return apiClient.uploadFile<UploadResponse>(API_CONFIG.endpoints.trades.upload, file);
  },

  /**
   * Get list of unique trading symbols
   */
  getSymbols: async (): Promise<SymbolsResponse> => {
    return apiClient.get<SymbolsResponse>(API_CONFIG.endpoints.trades.symbols);
  },
};
