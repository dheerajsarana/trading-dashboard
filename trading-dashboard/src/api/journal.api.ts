import { apiClient } from './client';
import { API_CONFIG } from '../config/api.config';
import { TradeJournal, JournalFormData, PaginationInfo } from '../types';

export interface GetJournalsParams {
  status?: 'all' | 'new' | 'journaled' | 'pending';
  symbol?: string;
  page?: number;
  limit?: number;
}

export interface JournalsResponse {
  journals: TradeJournal[];
  pagination: PaginationInfo;
}

export interface JournalResponse {
  journal: TradeJournal;
}

export interface JournalStatsResponse {
  total: number;
  statusCounts: {
    new?: number;
    journaled?: number;
    pending?: number;
  };
  averageRating: number;
}

export const journalApi = {
  // Get all journals with optional filters
  getJournals: async (params?: GetJournalsParams): Promise<JournalsResponse> => {
    return apiClient.get<JournalsResponse>(API_CONFIG.endpoints.journals.list, {
      params: params as any,
    });
  },

  // Get single journal by ID
  getJournalById: async (id: string): Promise<JournalResponse> => {
    return apiClient.get<JournalResponse>(API_CONFIG.endpoints.journals.byId(id));
  },

  // Get journal by trade ID (or create if doesn't exist)
  getJournalByTradeId: async (tradeId: string): Promise<JournalResponse> => {
    return apiClient.get<JournalResponse>(API_CONFIG.endpoints.journals.byTradeId(tradeId));
  },

  // Create new journal
  createJournal: async (data: JournalFormData): Promise<JournalResponse> => {
    return apiClient.post<JournalResponse>(API_CONFIG.endpoints.journals.create, data);
  },

  // Update existing journal
  updateJournal: async (id: string, data: Partial<JournalFormData>): Promise<JournalResponse> => {
    return apiClient.put<JournalResponse>(API_CONFIG.endpoints.journals.update(id), data);
  },

  // Delete journal
  deleteJournal: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(API_CONFIG.endpoints.journals.delete(id));
  },

  // Get journal statistics
  getJournalStats: async (): Promise<JournalStatsResponse> => {
    return apiClient.get<JournalStatsResponse>(API_CONFIG.endpoints.journals.stats);
  },
};
