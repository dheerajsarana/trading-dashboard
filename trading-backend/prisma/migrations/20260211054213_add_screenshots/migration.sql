-- CreateTable
CREATE TABLE "screenshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tradeId" TEXT,
    "mt5TradeId" TEXT,
    "originalUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screenshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "screenshots_tradeId_idx" ON "screenshots"("tradeId");

-- CreateIndex
CREATE INDEX "screenshots_mt5TradeId_idx" ON "screenshots"("mt5TradeId");

-- CreateIndex
CREATE INDEX "screenshots_userId_idx" ON "screenshots"("userId");

-- CreateIndex
CREATE INDEX "screenshots_userId_createdAt_idx" ON "screenshots"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenshots" ADD CONSTRAINT "screenshots_mt5TradeId_fkey" FOREIGN KEY ("mt5TradeId") REFERENCES "mt5_trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
