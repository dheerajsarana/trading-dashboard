-- AlterTable
ALTER TABLE "users" ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'free';

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paddleSubscriptionId" TEXT,
    "paddleCustomerId" TEXT,
    "paddlePriceId" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'pro',
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_paddleCustomerId_idx" ON "subscriptions"("paddleCustomerId");

-- CreateIndex
CREATE INDEX "subscriptions_paddleSubscriptionId_idx" ON "subscriptions"("paddleSubscriptionId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
