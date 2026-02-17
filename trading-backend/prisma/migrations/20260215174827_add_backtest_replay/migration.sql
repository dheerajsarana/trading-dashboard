-- CreateTable
CREATE TABLE "cached_candles" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cached_candles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backtest_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "totalPnL" DOUBLE PRECISION,
    "totalTrades" INTEGER,
    "wins" INTEGER,
    "losses" INTEGER,
    "winRate" DOUBLE PRECISION,
    "profitFactor" DOUBLE PRECISION,
    "maxDrawdown" DOUBLE PRECISION,
    "finalCandle" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backtest_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backtest_trades" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitPrice" DOUBLE PRECISION,
    "exitTime" TIMESTAMP(3),
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "pnl" DOUBLE PRECISION,
    "pnlPips" DOUBLE PRECISION,
    "closeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backtest_trades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cached_candles_symbol_timeframe_idx" ON "cached_candles"("symbol", "timeframe");

-- CreateIndex
CREATE INDEX "cached_candles_symbol_timeframe_timestamp_idx" ON "cached_candles"("symbol", "timeframe", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "cached_candles_symbol_timeframe_timestamp_key" ON "cached_candles"("symbol", "timeframe", "timestamp");

-- CreateIndex
CREATE INDEX "backtest_sessions_userId_idx" ON "backtest_sessions"("userId");

-- CreateIndex
CREATE INDEX "backtest_sessions_userId_status_idx" ON "backtest_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "backtest_trades_sessionId_idx" ON "backtest_trades"("sessionId");

-- AddForeignKey
ALTER TABLE "backtest_sessions" ADD CONSTRAINT "backtest_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backtest_trades" ADD CONSTRAINT "backtest_trades_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "backtest_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
