import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Trade, TimePeriod, TradeFilter, AssetFilter, TradeFormData, PaginationInfo } from '../types';
import { tradesApi, GetTradesParams } from '../api/trades.api';
import { statsApi, StatsResponse } from '../api/stats.api';

interface TradingState {
  allTrades: Trade[];
  stats: StatsResponse | null;
  equityCurve: Array<{ date: string; equity: number }> | null;
  pagination: PaginationInfo | null;
  timePeriod: TimePeriod;
  tradeFilter: TradeFilter;
  assetFilter: AssetFilter;
  selectedDate: Date | null;
  timezone: string;
  isLoading: boolean;
  isSidebarOpen: boolean;
  error: string | null;
}

const initialState: TradingState = {
  allTrades: [],
  stats: null,
  equityCurve: null,
  pagination: null,
  timePeriod: 'all',
  tradeFilter: 'all',
  assetFilter: 'all',
  selectedDate: null,
  timezone: 'Asia/Kolkata',
  isLoading: false,
  isSidebarOpen: true,
  error: null,
};

/**
 * Parse dates from API response
 */
const parseTradeDates = (trades: Trade[]): Trade[] => {
  return trades.map(trade => ({
    ...trade,
    openTime: new Date(trade.openTime),
    closeTime: new Date(trade.closeTime),
  }));
};

/**
 * Fetch all trades from API
 */
export const fetchTrades = createAsyncThunk(
  'trading/fetchTrades',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tradesApi.getTrades();
      // Parse date strings to Date objects
      return parseTradeDates(response.trades);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch trades');
    }
  }
);

/**
 * Upload Excel file with trades
 */
export const uploadTradesFile = createAsyncThunk(
  'trading/uploadFile',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await tradesApi.uploadFile(file);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload file');
    }
  }
);

/**
 * Fetch statistics from API
 */
export const fetchStats = createAsyncThunk(
  'trading/fetchStats',
  async (
    params: { timePeriod: TimePeriod; assetFilter: string; tradeFilter: TradeFilter },
    { rejectWithValue }
  ) => {
    try {
      const response = await statsApi.getStats(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch statistics');
    }
  }
);

/**
 * Fetch equity curve data
 */
export const fetchEquityCurve = createAsyncThunk(
  'trading/fetchEquityCurve',
  async (
    params: { timePeriod: TimePeriod; assetFilter: string; tradeFilter: TradeFilter },
    { rejectWithValue }
  ) => {
    try {
      const response = await statsApi.getEquityCurve(params);
      return response.equityCurve;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch equity curve');
    }
  }
);

/**
 * Fetch trades with filters
 */
export const fetchTradesWithFilters = createAsyncThunk(
  'trading/fetchTradesWithFilters',
  async (params: GetTradesParams, { rejectWithValue }) => {
    try {
      const response = await tradesApi.getTrades(params);
      return {
        trades: parseTradeDates(response.trades),
        pagination: response.pagination,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch trades');
    }
  }
);

/**
 * Create a new manual trade
 */
export const createManualTrade = createAsyncThunk(
  'trading/createManualTrade',
  async (tradeData: TradeFormData, { rejectWithValue }) => {
    try {
      const response = await tradesApi.createTrade(tradeData);
      return {
        ...response.trade,
        openTime: new Date(response.trade.openTime),
        closeTime: new Date(response.trade.closeTime),
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create trade');
    }
  }
);

/**
 * Delete a single trade
 */
export const deleteTrade = createAsyncThunk(
  'trading/deleteTrade',
  async (tradeId: string, { rejectWithValue }) => {
    try {
      await tradesApi.deleteTrade(tradeId);
      return tradeId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete trade');
    }
  }
);

/**
 * Delete all trades
 */
export const deleteAllTrades = createAsyncThunk(
  'trading/deleteAllTrades',
  async (_, { rejectWithValue }) => {
    try {
      await tradesApi.deleteAllTrades();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete all trades');
    }
  }
);

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setTrades: (state, action: PayloadAction<Trade[]>) => {
      state.allTrades = action.payload;
      state.selectedDate = null;
      state.assetFilter = 'all';
    },
    setTimePeriod: (state, action: PayloadAction<TimePeriod>) => {
      state.timePeriod = action.payload;
    },
    setTradeFilter: (state, action: PayloadAction<TradeFilter>) => {
      state.tradeFilter = action.payload;
    },
    setAssetFilter: (state, action: PayloadAction<AssetFilter>) => {
      state.assetFilter = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<Date | null>) => {
      state.selectedDate = action.payload;
    },
    setTimezone: (state, action: PayloadAction<string>) => {
      state.timezone = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Trades
    builder
      .addCase(fetchTrades.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrades.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allTrades = action.payload;
        state.error = null;
      })
      .addCase(fetchTrades.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upload File
    builder
      .addCase(uploadTradesFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadTradesFile.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(uploadTradesFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Stats
    builder
      .addCase(fetchStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Equity Curve
    builder
      .addCase(fetchEquityCurve.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchEquityCurve.fulfilled, (state, action) => {
        state.equityCurve = action.payload;
        state.error = null;
      })
      .addCase(fetchEquityCurve.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Fetch Trades with Filters
    builder
      .addCase(fetchTradesWithFilters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTradesWithFilters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allTrades = action.payload.trades;
        state.pagination = action.payload.pagination || null;
        state.error = null;
      })
      .addCase(fetchTradesWithFilters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Manual Trade
    builder
      .addCase(createManualTrade.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createManualTrade.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allTrades = [action.payload, ...state.allTrades];
        state.error = null;
      })
      .addCase(createManualTrade.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Trade
    builder
      .addCase(deleteTrade.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTrade.fulfilled, (state, action) => {
        state.allTrades = state.allTrades.filter((t: any) => t.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTrade.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete All Trades
    builder
      .addCase(deleteAllTrades.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAllTrades.fulfilled, (state) => {
        state.isLoading = false;
        state.allTrades = [];
        state.error = null;
      })
      .addCase(deleteAllTrades.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setTrades,
  setTimePeriod,
  setTradeFilter,
  setAssetFilter,
  setSelectedDate,
  setTimezone,
  setIsLoading,
  toggleSidebar,
  clearError,
} = tradingSlice.actions;

export default tradingSlice.reducer;
