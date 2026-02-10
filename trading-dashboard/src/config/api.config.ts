export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  endpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      me: '/api/auth/me',
    },
    trades: {
      list: '/api/trades',
      create: '/api/trades',
      update: (id: string) => `/api/trades/${id}`,
      delete: (id: string) => `/api/trades/${id}`,
      deleteAll: '/api/trades',
      upload: '/api/trades/upload',
      symbols: '/api/trades/symbols',
    },
    stats: {
      overview: '/api/stats',
      equity: '/api/stats/equity',
      calendar: '/api/stats/calendar',
      invalidate: '/api/stats/invalidate',
    },
    journals: {
      list: '/api/journals',
      stats: '/api/journals/stats',
      byId: (id: string) => `/api/journals/${id}`,
      byTradeId: (tradeId: string) => `/api/journals/trade/${tradeId}`,
      create: '/api/journals',
      update: (id: string) => `/api/journals/${id}`,
      delete: (id: string) => `/api/journals/${id}`,
    },
  },
};
