-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "openPrice" DOUBLE PRECISION NOT NULL,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "openTime" TIMESTAMP(3) NOT NULL,
    "closeTime" TIMESTAMP(3) NOT NULL,
    "closePrice" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "swap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profit" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'upload',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timePeriod" TEXT NOT NULL,
    "assetFilter" TEXT NOT NULL DEFAULT 'all',
    "tradeFilter" TEXT NOT NULL DEFAULT 'all',
    "totalPnL" DOUBLE PRECISION NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "profitFactor" DOUBLE PRECISION NOT NULL,
    "expectancy" DOUBLE PRECISION NOT NULL,
    "totalTrades" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "avgWinner" DOUBLE PRECISION NOT NULL,
    "avgLoser" DOUBLE PRECISION NOT NULL,
    "bestTrade" DOUBLE PRECISION NOT NULL,
    "worstTrade" DOUBLE PRECISION NOT NULL,
    "winStreak" INTEGER NOT NULL,
    "lossStreak" INTEGER NOT NULL,
    "longTrades" INTEGER NOT NULL,
    "longPnL" DOUBLE PRECISION NOT NULL,
    "longWinRate" DOUBLE PRECISION NOT NULL,
    "shortTrades" INTEGER NOT NULL,
    "shortPnL" DOUBLE PRECISION NOT NULL,
    "shortWinRate" DOUBLE PRECISION NOT NULL,
    "grossProfit" DOUBLE PRECISION NOT NULL,
    "grossLoss" DOUBLE PRECISION NOT NULL,
    "maxDrawdown" DOUBLE PRECISION NOT NULL,
    "maxDrawdownPercent" DOUBLE PRECISION NOT NULL,
    "avgDrawdown" DOUBLE PRECISION NOT NULL,
    "avgDrawdownDuration" DOUBLE PRECISION NOT NULL,
    "maxDrawdownDuration" DOUBLE PRECISION NOT NULL,
    "recoveryFactor" DOUBLE PRECISION NOT NULL,
    "currentDrawdown" DOUBLE PRECISION NOT NULL,
    "avgHoldTimeWinners" DOUBLE PRECISION NOT NULL,
    "avgHoldTimeLosers" DOUBLE PRECISION NOT NULL,
    "avgHoldTimeAll" DOUBLE PRECISION NOT NULL,
    "optimalHoldingWindow" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timePeriod" TEXT NOT NULL,
    "assetFilter" TEXT NOT NULL DEFAULT 'all',
    "tradeFilter" TEXT NOT NULL DEFAULT 'all',
    "session" TEXT NOT NULL,
    "trades" INTEGER NOT NULL,
    "pnl" DOUBLE PRECISION NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "expectancy" DOUBLE PRECISION NOT NULL,
    "avgProfit" DOUBLE PRECISION NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "trades_userId_idx" ON "trades"("userId");

-- CreateIndex
CREATE INDEX "trades_userId_symbol_idx" ON "trades"("userId", "symbol");

-- CreateIndex
CREATE INDEX "trades_userId_closeTime_idx" ON "trades"("userId", "closeTime");

-- CreateIndex
CREATE INDEX "user_stats_userId_idx" ON "user_stats"("userId");

-- CreateIndex
CREATE INDEX "user_stats_expiresAt_idx" ON "user_stats"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_userId_timePeriod_assetFilter_tradeFilter_key" ON "user_stats"("userId", "timePeriod", "assetFilter", "tradeFilter");

-- CreateIndex
CREATE INDEX "session_stats_userId_idx" ON "session_stats"("userId");

-- CreateIndex
CREATE INDEX "session_stats_expiresAt_idx" ON "session_stats"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "session_stats_userId_timePeriod_assetFilter_tradeFilter_ses_key" ON "session_stats"("userId", "timePeriod", "assetFilter", "tradeFilter", "session");

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
