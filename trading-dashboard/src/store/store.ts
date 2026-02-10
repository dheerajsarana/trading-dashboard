import { configureStore } from '@reduxjs/toolkit';
import tradingReducer from './tradingSlice';
import authReducer from './authSlice';
import journalReducer from './journalSlice';
import mt5Reducer from './mt5Slice';

export const store = configureStore({
  reducer: {
    trading: tradingReducer,
    auth: authReducer,
    journal: journalReducer,
    mt5: mt5Reducer,
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
        ],
        // Ignore these paths in the state
        ignoredPaths: ['trading.selectedDate', 'trading.allTrades', 'auth.user', 'journal.journals', 'journal.selectedJournal', 'mt5.accounts', 'mt5.dashboardData'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
