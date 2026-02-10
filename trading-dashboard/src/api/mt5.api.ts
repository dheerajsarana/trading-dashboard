import { apiClient } from './client';
import {
  MT5Account,
  MT5ConnectFormData,
  MT5DashboardData,
  MT5Position,
  MT5Trade,
  EquityPoint,
} from '../types';

const MT5_BASE_PATH = '/api/mt5';

/**
 * Connect a new MT5 account
 */
export const connectMT5Account = async (data: MT5ConnectFormData) => {
  const response = await apiClient.post(`${MT5_BASE_PATH}/accounts`, data);
  return response;
};

/**
 * Get all MT5 accounts
 */
export const getMT5Accounts = async (): Promise<{ success: boolean; accounts: MT5Account[] }> => {
  const response = await apiClient.get(`${MT5_BASE_PATH}/accounts`);
  return response;
};

/**
 * Get single MT5 account
 */
export const getMT5Account = async (accountId: string): Promise<{ success: boolean; account: MT5Account }> => {
  const response = await apiClient.get(`${MT5_BASE_PATH}/accounts/${accountId}`);
  return response;
};

/**
 * Update MT5 account
 */
export const updateMT5Account = async (
  accountId: string,
  data: { investorPassword?: string; isPrimary?: boolean }
): Promise<{ success: boolean; account: MT5Account }> => {
  const response = await apiClient.put(`${MT5_BASE_PATH}/accounts/${accountId}`, data);
  return response;
};

/**
 * Delete (disconnect) MT5 account
 */
export const deleteMT5Account = async (accountId: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`${MT5_BASE_PATH}/accounts/${accountId}`);
  return response;
};

/**
 * Sync MT5 account data (manual refresh)
 */
export const syncMT5Account = async (
  accountId: string
): Promise<{
  success: boolean;
  data: {
    account: MT5Account;
    tradesImported: number;
    positionsUpdated: number;
    lastSyncAt: string;
  };
}> => {
  const response = await apiClient.post(`${MT5_BASE_PATH}/accounts/${accountId}/sync`);
  return response;
};

/**
 * Get MT5 dashboard data
 */
export const getMT5Dashboard = async (
  accountId: string,
  timePeriod: string = '30days'
): Promise<{ success: boolean; data: MT5DashboardData }> => {
  const response = await apiClient.get(`${MT5_BASE_PATH}/accounts/${accountId}/dashboard`, {
    params: { timePeriod },
  });
  return response;
};

/**
 * Get equity curve
 */
export const getMT5EquityCurve = async (
  accountId: string,
  timePeriod: string = '30days'
): Promise<{ success: boolean; data: EquityPoint[] }> => {
  const response = await apiClient.get(`${MT5_BASE_PATH}/accounts/${accountId}/equity`, {
    params: { timePeriod },
  });
  return response;
};

/**
 * Get open positions
 */
export const getMT5Positions = async (
  accountId: string
): Promise<{ success: boolean; positions: MT5Position[] }> => {
  const response = await apiClient.get(`${MT5_BASE_PATH}/accounts/${accountId}/positions`);
  return response;
};

/**
 * Get trade history
 */
export const getMT5History = async (
  accountId: string,
  timePeriod: string = '30days',
  limit: number = 50
): Promise<{ success: boolean; trades: MT5Trade[]; total: number }> => {
  const response = await apiClient.get(`${MT5_BASE_PATH}/accounts/${accountId}/history`, {
    params: { timePeriod, limit },
  });
  return response;
};
