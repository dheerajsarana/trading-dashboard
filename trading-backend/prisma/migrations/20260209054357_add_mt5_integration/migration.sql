-- CreateTable
CREATE TABLE "mt5_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountNumber" INTEGER NOT NULL,
    "investorPassword" TEXT NOT NULL,
    "server" TEXT NOT NULL,
    "accountName" TEXT,
    "balance" DOUBLE PRECISION,
    "equity" DOUBLE PRECISION,
    "profit" DOUBLE PRECISION,
    "margin" DOUBLE PRECISION,
    "marginFree" DOUBLE PRECISION,
    "marginLevel" DOUBLE PRECISION,
    "currency" TEXT,
    "leverage" INTEGER,
    "company" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mt5_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mt5_trades" (
    "id" TEXT NOT NULL,
    "mt5AccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticket" BIGINT NOT NULL,
    "order" BIGINT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "entry" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "swap" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mt5_trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mt5_positions" (
    "id" TEXT NOT NULL,
    "mt5AccountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticket" BIGINT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "openPrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION,
    "stopLoss" DOUBLE PRECISION,
    "takeProfit" DOUBLE PRECISION,
    "profit" DOUBLE PRECISION NOT NULL,
    "swap" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "openTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mt5_positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mt5_accounts_userId_idx" ON "mt5_accounts"("userId");

-- CreateIndex
CREATE INDEX "mt5_accounts_userId_isPrimary_idx" ON "mt5_accounts"("userId", "isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "mt5_accounts_userId_accountNumber_server_key" ON "mt5_accounts"("userId", "accountNumber", "server");

-- CreateIndex
CREATE UNIQUE INDEX "mt5_trades_ticket_key" ON "mt5_trades"("ticket");

-- CreateIndex
CREATE INDEX "mt5_trades_mt5AccountId_idx" ON "mt5_trades"("mt5AccountId");

-- CreateIndex
CREATE INDEX "mt5_trades_userId_idx" ON "mt5_trades"("userId");

-- CreateIndex
CREATE INDEX "mt5_trades_userId_time_idx" ON "mt5_trades"("userId", "time");

-- CreateIndex
CREATE INDEX "mt5_trades_symbol_idx" ON "mt5_trades"("symbol");

-- CreateIndex
CREATE INDEX "mt5_positions_mt5AccountId_idx" ON "mt5_positions"("mt5AccountId");

-- CreateIndex
CREATE INDEX "mt5_positions_userId_idx" ON "mt5_positions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mt5_positions_mt5AccountId_ticket_key" ON "mt5_positions"("mt5AccountId", "ticket");

-- AddForeignKey
ALTER TABLE "mt5_accounts" ADD CONSTRAINT "mt5_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mt5_trades" ADD CONSTRAINT "mt5_trades_mt5AccountId_fkey" FOREIGN KEY ("mt5AccountId") REFERENCES "mt5_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mt5_positions" ADD CONSTRAINT "mt5_positions_mt5AccountId_fkey" FOREIGN KEY ("mt5AccountId") REFERENCES "mt5_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
