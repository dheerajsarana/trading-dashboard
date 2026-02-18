import { configureStore } from '@reduxjs/toolkit';
import tradingReducer from './tradingSlice';
import authReducer from './authSlice';
import journalReducer from './journalSlice';
import mt5Reducer from './mt5Slice';
import screenshotReducer from './screenshotSlice';
import backtestReducer from './backtestSlice';
import subscriptionReducer from './subscriptionSlice';

export const store = configureStore({
  reducer: {
    trading: tradingReducer,
    auth: authReducer,
    journal: journalReducer,
    mt5: mt5Reducer,
    screenshots: screenshotReducer,
    backtest: backtestReducer,
    subscription: subscriptionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'trading/setSelectedDate',
          'trading/setTrades',
          'trading/fetchTrades/fulfilled',
          'trading/fetchTradesWithFilters/fulfilled',
          'trading/createManualTrade/fulfilled',
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'auth/checkAuth/fulfilled',
          'journal/fetchJournals/fulfilled',
          'journal/fetchJournalById/fulfilled',
          'journal/fetchJournalByTradeId/fulfilled',
          'journal/createJournal/fulfilled',
          'journal/updateJournal/fulfilled',
          'screenshots/upload/pending',
          'screenshots/upload/fulfilled',
          'screenshots/upload/rejected',
          'backtest/fetchCandles/fulfilled',
          'backtest/createSession/fulfilled',
          'backtest/fetchSessions/fulfilled',
          'backtest/saveResults/fulfilled',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.selectedDate',
          'payload.closeTime',
          'payload.openTime',
          'payload.user.createdAt',
          'payload.trade.openTime',
          'payload.trade.closeTime',
          'payload.createdAt',
          'payload.updatedAt',
          'meta.arg.files',
        ],
        // Ignore these paths in the state
        ignoredPaths: ['trading.selectedDate', 'trading.allTrades', 'auth.user', 'journal.journals', 'journal.selectedJournal', 'mt5.accounts', 'mt5.dashboardData', 'screenshots.screenshots', 'backtest.allCandles', 'backtest.openPositions', 'backtest.closedTrades', 'backtest.sessions', 'backtest.activeSession'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
