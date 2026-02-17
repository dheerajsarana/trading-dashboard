export interface Trade {
  id?: string;
  openTime: Date;
  position: string;
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  stopLoss: number;
  takeProfit: number;
  closeTime: Date;
  closePrice: number;
  commission: number;
  swap: number;
  profit: number;
  source?: 'manual' | 'upload' | 'mt5';
}

export interface TradeStats {
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
}

export interface DrawdownStats {
  maxDrawdown: number;
  maxDrawdownPercent: number;
  avgDrawdown: number;
  avgDrawdownDuration: number; // in days
  maxDrawdownDuration: number; // in days
  recoveryFactor: number;
  currentDrawdown: number;
}

export interface DurationStats {
  avgHoldTimeWinners: number; // in hours
  avgHoldTimeLosers: number; // in hours
  avgHoldTimeAll: number; // in hours
  optimalHoldingWindow: string;
}

export interface SessionStats {
  session: string;
  trades: number;
  pnl: number;
  winRate: number;
  expectancy: number;
  avgProfit: number;
}

export type TradingSession = 'Asia' | 'London' | 'New York' | 'London-NY Overlap';

export interface TradeFormData {
  symbol: string;
  type: 'buy' | 'sell';
  position?: string;
  volume: number;
  openPrice: number;
  closePrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: Date | string;
  closeTime?: Date | string;
  commission?: number;
  swap?: number;
  profit?: number;
}

export interface TradeFiltersState {
  symbol: string;
  type: 'all' | 'buy' | 'sell';
  source: 'all' | 'manual' | 'upload' | 'mt5';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  page: number;
  limit: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TimePeriod = 'today' | '7days' | '30days' | '3months' | '1year' | 'all';
export type TradeFilter = 'all' | 'winners' | 'losers';
export type AssetFilter = string; // 'all' or specific symbol

export interface DayPerformance {
  day: string;
  trades: number;
  pnl: number;
}

export interface EquityPoint {
  date: string;
  equity: number;
}

export interface ExecutionChecklistItem {
  label: string;
  checked: boolean;
}

export interface TradeJournal {
  id: string;
  tradeId: string;
  userId: string;
  trade?: Trade;

  // Journal Content
  preTradeAnalysis?: string;
  postTradeReview?: string;
  emotions?: string;
  lessonsLearned?: string;

  // Metadata
  tags: string[];
  rating?: number; // 1-10

  // Execution Checklist
  executionChecklist?: {
    items: ExecutionChecklistItem[];
  };

  // Screenshots
  screenshots: string[];

  // Status
  status: 'new' | 'journaled' | 'pending';

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface JournalFormData {
  tradeId: string;
  preTradeAnalysis?: string;
  postTradeReview?: string;
  emotions?: string;
  lessonsLearned?: string;
  tags?: string[];
  rating?: number;
  executionChecklist?: {
    items: ExecutionChecklistItem[];
  };
  screenshots?: string[];
  status?: 'new' | 'journaled' | 'pending';
}

export interface JournalFiltersState {
  status: 'all' | 'new' | 'journaled' | 'pending';
  symbol: string;
  page: number;
  limit: number;
}

export interface JournalStats {
  total: number;
  statusCounts: {
    new?: number;
    journaled?: number;
    pending?: number;
  };
  averageRating: number;
}

// ============================================
// MT5 Integration Types
// ============================================

export interface MT5Account {
  id: string;
  userId: string;
  accountNumber: number;
  server: string;

  // Account Info
  accountName?: string;
  balance?: number;
  equity?: number;
  profit?: number;
  margin?: number;
  marginFree?: number;
  marginLevel?: number;
  currency?: string;
  leverage?: number;
  company?: string;

  // Status
  isActive: boolean;
  isPrimary: boolean;
  lastSyncAt?: string | Date;
  lastError?: string;

  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MT5Trade {
  id: string;
  mt5AccountId: string;
  userId: string;

  // Trade Details
  ticket: number;
  order: number;
  time: string | Date;
  type: string; // BUY, SELL, BALANCE, CREDIT
  entry: number;
  symbol: string;
  volume: number;
  price: number;
  profit: number;
  commission: number;
  swap: number;
  comment?: string;

  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MT5Position {
  id: string;
  mt5AccountId: string;
  userId: string;

  // Position Details
  ticket: number;
  symbol: string;
  type: string; // BUY or SELL
  volume: number;
  openPrice: number;
  currentPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  profit: number;
  swap: number;
  commission: number;
  openTime: string | Date;

  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface MT5ConnectFormData {
  accountNumber: number | string;
  investorPassword: string;
  server: string;
}

export interface MT5ApiResponse {
  success: boolean;
  account?: {
    account: number;
    balance: number;
    equity: number;
    profit: number;
    margin: number;
    margin_free: number;
    margin_level: number;
    currency: string;
    leverage: number;
    name: string;
    server: string;
    company: string;
  };
  history?: Array<{
    ticket: number;
    order: number;
    time: string;
    type: string;
    entry: number;
    symbol: string;
    volume: number;
    price: number;
    profit: number;
    commission: number;
    swap: number;
    comment: string;
  }>;
  positions?: Array<{
    ticket: number;
    symbol: string;
    type: string;
    volume: number;
    openPrice: number;
    currentPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
    profit: number;
    swap: number;
    commission: number;
    openTime: string;
  }>;
  total_trades?: number;
  open_positions?: number;
  error?: string;
}

export interface MT5DashboardMetrics {
  totalPnL: number;
  unrealizedPnL: number;
  realizedPnL: number;
  winRate: number;
}

export interface MT5DashboardStats {
  totalTrades: number;
  wins: number;
  losses: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
}

export interface MT5TopPerformer {
  rank: number;
  symbol: string;
  trades: number;
  pnl: number;
}

export interface MT5MonthlyPnL {
  [date: string]: number; // e.g., "2026-02-03": 97.05
}

export interface MT5DashboardData {
  account: MT5Account;
  metrics: MT5DashboardMetrics;
  stats: MT5DashboardStats;
  equityCurve: EquityPoint[];
  positions: MT5Position[];
  recentTrades: MT5Trade[];
  topPerformers: MT5TopPerformer[];
  monthlyPnL: MT5MonthlyPnL;
}

// ============================================
// Screenshot Types
// ============================================

export interface Screenshot {
  id: string;
  tradeId?: string;
  mt5TradeId?: string;
  userId: string;
  fileName: string;
  originalUrl: string;
  thumbnailUrl: string;
  mimeType: string;
  fileSize: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// ============================================
// Backtest / FX Replay Types
// ============================================

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestSession {
  id: string;
  userId: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'abandoned';
  totalPnL?: number;
  totalTrades?: number;
  wins?: number;
  losses?: number;
  winRate?: number;
  profitFactor?: number;
  maxDrawdown?: number;
  finalCandle?: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  trades?: BacktestTrade[];
  _count?: { trades: number };
}

export interface BacktestTrade {
  id: string;
  sessionId: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  entryTime: string;
  exitPrice?: number;
  exitTime?: string;
  volume: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  pnlPips?: number;
  closeReason?: 'manual' | 'stop_loss' | 'take_profit';
  createdAt: string;
  updatedAt: string;
}

export type ReplaySpeed = 1 | 2 | 5 | 10;

export type ReplayStatus = 'idle' | 'playing' | 'paused' | 'finished';

export interface BacktestSessionConfig {
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

export interface BacktestSummary {
  totalPnL: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
}
