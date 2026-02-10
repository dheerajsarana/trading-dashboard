-- CreateTable
CREATE TABLE "trade_journals" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preTradeAnalysis" TEXT,
    "postTradeReview" TEXT,
    "emotions" TEXT,
    "lessonsLearned" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rating" INTEGER DEFAULT 5,
    "executionChecklist" JSONB DEFAULT '{"items":[]}',
    "screenshots" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_journals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trade_journals_tradeId_key" ON "trade_journals"("tradeId");

-- CreateIndex
CREATE INDEX "trade_journals_userId_idx" ON "trade_journals"("userId");

-- CreateIndex
CREATE INDEX "trade_journals_userId_status_idx" ON "trade_journals"("userId", "status");

-- CreateIndex
CREATE INDEX "trade_journals_tradeId_idx" ON "trade_journals"("tradeId");

-- AddForeignKey
ALTER TABLE "trade_journals" ADD CONSTRAINT "trade_journals_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "trades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
