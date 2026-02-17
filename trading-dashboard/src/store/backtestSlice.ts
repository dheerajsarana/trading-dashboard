import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { backtestApi } from '../api/backtest.api';
import type {
  Candle, BacktestSession, BacktestTrade,
  BacktestSessionConfig, ReplaySpeed, ReplayStatus, BacktestSummary,
} from '../types';

// --- State Interface ---

interface BacktestState {
  availableSymbols: string[];
  availableTimeframes: string[];
  sessions: BacktestSession[];
  activeSession: BacktestSession | null;
  allCandles: Candle[];
  visibleCandleCount: number;
  currentPrice: number;
  replayStatus: ReplayStatus;
  replaySpeed: ReplaySpeed;
  openPositions: BacktestTrade[];
  closedTrades: BacktestTrade[];
  accountBalance: number;
  summary: BacktestSummary | null;
  isLoading: boolean;
  isFetchingCandles: boolean;
  error: string | null;
}

const initialState: BacktestState = {
  availableSymbols: [],
  availableTimeframes: [],
  sessions: [],
  activeSession: null,
  allCandles: [],
  visibleCandleCount: 0,
  currentPrice: 0,
  replayStatus: 'idle',
  replaySpeed: 1,
  openPositions: [],
  closedTrades: [],
  accountBalance: 10000,
  summary: null,
  isLoading: false,
  isFetchingCandles: false,
  error: null,
};

// --- Async Thunks ---

export const fetchBacktestSymbols = createAsyncThunk(
  'backtest/fetchSymbols',
  async (_, { rejectWithValue }) => {
    try {
      return await backtestApi.getSymbols();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch symbols');
    }
  }
);

export const fetchCandles = createAsyncThunk(
  'backtest/fetchCandles',
  async (params: { symbol: string; timeframe: string; startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const response = await backtestApi.getCandles(params);
      return response.candles;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch candles');
    }
  }
);

export const createBacktestSession = createAsyncThunk(
  'backtest/createSession',
  async (config: BacktestSessionConfig, { rejectWithValue }) => {
    try {
      const response = await backtestApi.createSession(config);
      return response.session;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create session');
    }
  }
);

export const fetchBacktestSessions = createAsyncThunk(
  'backtest/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await backtestApi.getSessions();
      return response.sessions;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch sessions');
    }
  }
);

export const saveSessionResults = createAsyncThunk(
  'backtest/saveResults',
  async ({ sessionId, summary }: { sessionId: string; summary: BacktestSummary }, { rejectWithValue }) => {
    try {
      const response = await backtestApi.completeSession(sessionId, summary);
      return response.session;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save results');
    }
  }
);

export const deleteBacktestSession = createAsyncThunk(
  'backtest/deleteSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await backtestApi.deleteSession(sessionId);
      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete session');
    }
  }
);

// --- Slice ---

const backtestSlice = createSlice({
  name: 'backtest',
  initialState,
  reducers: {
    advanceCandle: (state) => {
      if (state.visibleCandleCount < state.allCandles.length) {
        state.visibleCandleCount += 1;
        const latestCandle = state.allCandles[state.visibleCandleCount - 1];
        state.currentPrice = latestCandle.close;

        // Check SL/TP for open positions against candle high/low
        const stillOpen: BacktestTrade[] = [];
        for (const pos of state.openPositions) {
          let closed = false;
          let exitPrice = 0;
          let closeReason = '';

          if (pos.type === 'buy') {
            if (pos.stopLoss && latestCandle.low <= pos.stopLoss) {
              exitPrice = pos.stopLoss;
              closeReason = 'stop_loss';
              closed = true;
            } else if (pos.takeProfit && latestCandle.high >= pos.takeProfit) {
              exitPrice = pos.takeProfit;
              closeReason = 'take_profit';
              closed = true;
            }
          } else {
            if (pos.stopLoss && latestCandle.high >= pos.stopLoss) {
              exitPrice = pos.stopLoss;
              closeReason = 'stop_loss';
              closed = true;
            } else if (pos.takeProfit && latestCandle.low <= pos.takeProfit) {
              exitPrice = pos.takeProfit;
              closeReason = 'take_profit';
              closed = true;
            }
          }

          if (closed) {
            const pipMultiplier = pos.entryPrice > 50 ? 100 : (state.activeSession?.symbol.includes('JPY') ? 100 : 10000);
            const priceDiff = pos.type === 'buy'
              ? (exitPrice - pos.entryPrice)
              : (pos.entryPrice - exitPrice);
            const pnlPips = priceDiff * pipMultiplier;
            const pnl = pnlPips * pos.volume * 10;

            state.closedTrades.push({
              ...pos,
              exitPrice,
              exitTime: latestCandle.timestamp,
              pnl,
              pnlPips,
              closeReason: closeReason as any,
            });
          } else {
            stillOpen.push(pos);
          }
        }
        state.openPositions = stillOpen;
      }

      if (state.visibleCandleCount >= state.allCandles.length) {
        state.replayStatus = 'finished';
      }
    },

    setReplayStatus: (state, action: PayloadAction<ReplayStatus>) => {
      state.replayStatus = action.payload;
    },

    setReplaySpeed: (state, action: PayloadAction<ReplaySpeed>) => {
      state.replaySpeed = action.payload;
    },

    openPosition: (state, action: PayloadAction<{
      type: 'buy' | 'sell';
      volume: number;
      stopLoss?: number;
      takeProfit?: number;
    }>) => {
      const latestCandle = state.allCandles[state.visibleCandleCount - 1];
      if (!latestCandle) return;

      const newTrade: BacktestTrade = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sessionId: state.activeSession?.id || '',
        type: action.payload.type,
        entryPrice: latestCandle.close,
        entryTime: latestCandle.timestamp,
        volume: action.payload.volume,
        stopLoss: action.payload.stopLoss,
        takeProfit: action.payload.takeProfit,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.openPositions.push(newTrade);
    },

    closePosition: (state, action: PayloadAction<string>) => {
      const tradeId = action.payload;
      const idx = state.openPositions.findIndex(t => t.id === tradeId);
      if (idx === -1) return;

      const trade = state.openPositions[idx];
      const latestCandle = state.allCandles[state.visibleCandleCount - 1];
      const exitPrice = latestCandle.close;

      const pipMultiplier = trade.entryPrice > 50 ? 100 : (state.activeSession?.symbol.includes('JPY') ? 100 : 10000);
      const priceDiff = trade.type === 'buy'
        ? (exitPrice - trade.entryPrice)
        : (trade.entryPrice - exitPrice);
      const pnlPips = priceDiff * pipMultiplier;
      const pnl = pnlPips * trade.volume * 10;

      state.closedTrades.push({
        ...trade,
        exitPrice,
        exitTime: latestCandle.timestamp,
        pnl,
        pnlPips,
        closeReason: 'manual',
      });

      state.openPositions.splice(idx, 1);
    },

    resetSession: (state) => {
      state.activeSession = null;
      state.allCandles = [];
      state.visibleCandleCount = 0;
      state.currentPrice = 0;
      state.replayStatus = 'idle';
      state.replaySpeed = 1;
      state.openPositions = [];
      state.closedTrades = [];
      state.summary = null;
      state.error = null;
    },

    computeSummary: (state) => {
      const trades = state.closedTrades;
      if (trades.length === 0) {
        state.summary = null;
        return;
      }

      const winners = trades.filter(t => (t.pnl || 0) > 0);
      const losers = trades.filter(t => (t.pnl || 0) < 0);
      const totalPnL = trades.reduce((s, t) => s + (t.pnl || 0), 0);
      const grossProfit = winners.reduce((s, t) => s + (t.pnl || 0), 0);
      const grossLoss = Math.abs(losers.reduce((s, t) => s + (t.pnl || 0), 0));

      let equity = 0;
      let peak = 0;
      let maxDD = 0;
      for (const t of trades) {
        equity += t.pnl || 0;
        if (equity > peak) peak = equity;
        const dd = peak - equity;
        if (dd > maxDD) maxDD = dd;
      }

      state.summary = {
        totalPnL,
        totalTrades: trades.length,
        wins: winners.length,
        losses: losers.length,
        winRate: trades.length > 0 ? (winners.length / trades.length) * 100 : 0,
        profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
        maxDrawdown: maxDD,
        avgWin: winners.length > 0 ? grossProfit / winners.length : 0,
        avgLoss: losers.length > 0 ? grossLoss / losers.length : 0,
        bestTrade: winners.length > 0 ? Math.max(...winners.map(t => t.pnl || 0)) : 0,
        worstTrade: losers.length > 0 ? Math.min(...losers.map(t => t.pnl || 0)) : 0,
      };
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBacktestSymbols.fulfilled, (state, action) => {
        state.availableSymbols = action.payload.symbols;
        state.availableTimeframes = action.payload.timeframes;
      });

    builder
      .addCase(fetchCandles.pending, (state) => {
        state.isFetchingCandles = true;
        state.error = null;
      })
      .addCase(fetchCandles.fulfilled, (state, action) => {
        state.isFetchingCandles = false;
        state.allCandles = action.payload;
        state.visibleCandleCount = Math.min(20, action.payload.length);
        state.currentPrice = action.payload.length > 0
          ? action.payload[Math.min(19, action.payload.length - 1)].close
          : 0;
      })
      .addCase(fetchCandles.rejected, (state, action) => {
        state.isFetchingCandles = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createBacktestSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBacktestSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeSession = action.payload;
      })
      .addCase(createBacktestSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchBacktestSessions.fulfilled, (state, action) => {
        state.sessions = action.payload;
      });

    builder
      .addCase(saveSessionResults.fulfilled, (state, action) => {
        state.activeSession = action.payload;
        const idx = state.sessions.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) {
          state.sessions[idx] = action.payload;
        }
      });

    builder
      .addCase(deleteBacktestSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(s => s.id !== action.payload);
      });
  },
});

export const {
  advanceCandle,
  setReplayStatus,
  setReplaySpeed,
  openPosition,
  closePosition,
  resetSession,
  computeSummary,
  clearError,
} = backtestSlice.actions;

export default backtestSlice.reducer;
