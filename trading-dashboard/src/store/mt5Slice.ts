import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  MT5Account,
  MT5ConnectFormData,
  MT5DashboardData,
} from '../types';
import * as mt5Api from '../api/mt5.api';

interface MT5State {
  accounts: MT5Account[];
  selectedAccountId: string | null;
  dashboardData: MT5DashboardData | null;
  timePeriod: string;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  connectModalOpen: boolean;
}

const initialState: MT5State = {
  accounts: [],
  selectedAccountId: null,
  dashboardData: null,
  timePeriod: '30days',
  isLoading: false,
  isSyncing: false,
  error: null,
  connectModalOpen: false,
};

/**
 * Async thunks
 */

export const connectMT5Account = createAsyncThunk(
  'mt5/connectAccount',
  async (data: MT5ConnectFormData, { rejectWithValue }) => {
    try {
      const response = await mt5Api.connectMT5Account(data);
      return response.account;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to connect account');
    }
  }
);

export const fetchMT5Accounts = createAsyncThunk(
  'mt5/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mt5Api.getMT5Accounts();
      return response.accounts;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch accounts');
    }
  }
);

export const updateMT5Account = createAsyncThunk(
  'mt5/updateAccount',
  async (
    { accountId, data }: { accountId: string; data: { investorPassword?: string; isPrimary?: boolean } },
    { rejectWithValue }
  ) => {
    try {
      const response = await mt5Api.updateMT5Account(accountId, data);
      return response.account;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to update account');
    }
  }
);

export const deleteMT5Account = createAsyncThunk(
  'mt5/deleteAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      await mt5Api.deleteMT5Account(accountId);
      return accountId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to delete account');
    }
  }
);

export const syncMT5Account = createAsyncThunk(
  'mt5/syncAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await mt5Api.syncMT5Account(accountId);
      return response.data.account;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to sync account');
    }
  }
);

export const fetchMT5Dashboard = createAsyncThunk(
  'mt5/fetchDashboard',
  async ({ accountId, timePeriod }: { accountId: string; timePeriod: string }, { rejectWithValue }) => {
    try {
      const response = await mt5Api.getMT5Dashboard(accountId, timePeriod);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to fetch dashboard data');
    }
  }
);

/**
 * Slice
 */
const mt5Slice = createSlice({
  name: 'mt5',
  initialState,
  reducers: {
    setSelectedAccount: (state, action: PayloadAction<string | null>) => {
      state.selectedAccountId = action.payload;
    },
    setTimePeriod: (state, action: PayloadAction<string>) => {
      state.timePeriod = action.payload;
    },
    setConnectModalOpen: (state, action: PayloadAction<boolean>) => {
      state.connectModalOpen = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Connect account
    builder
      .addCase(connectMT5Account.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectMT5Account.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.accounts.push(action.payload);
          // Set as selected if it's the first account
          if (action.payload.isPrimary) {
            state.selectedAccountId = action.payload.id;
          }
        }
        state.connectModalOpen = false;
      })
      .addCase(connectMT5Account.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch accounts
    builder
      .addCase(fetchMT5Accounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMT5Accounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload || [];
        // Auto-select primary account or first account
        if (action.payload && action.payload.length > 0 && !state.selectedAccountId) {
          const primaryAccount = action.payload.find((acc) => acc.isPrimary);
          state.selectedAccountId = primaryAccount ? primaryAccount.id : action.payload[0]?.id || null;
        }
      })
      .addCase(fetchMT5Accounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update account
    builder
      .addCase(updateMT5Account.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMT5Account.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.accounts.findIndex((acc) => acc.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        // If set as primary, unset others
        if (action.payload.isPrimary) {
          state.accounts.forEach((acc) => {
            if (acc.id !== action.payload.id) {
              acc.isPrimary = false;
            }
          });
        }
      })
      .addCase(updateMT5Account.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete account
    builder
      .addCase(deleteMT5Account.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMT5Account.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = state.accounts.filter((acc) => acc.id !== action.payload);
        // If deleted account was selected, select another one
        if (state.selectedAccountId === action.payload) {
          state.selectedAccountId = state.accounts.length > 0 ? state.accounts[0].id : null;
        }
      })
      .addCase(deleteMT5Account.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Sync account
    builder
      .addCase(syncMT5Account.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncMT5Account.fulfilled, (state, action) => {
        state.isSyncing = false;
        const index = state.accounts.findIndex((acc) => acc.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      })
      .addCase(syncMT5Account.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.payload as string;
      });

    // Fetch dashboard
    builder
      .addCase(fetchMT5Dashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMT5Dashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchMT5Dashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedAccount, setTimePeriod, setConnectModalOpen, clearError } = mt5Slice.actions;

export default mt5Slice.reducer;
