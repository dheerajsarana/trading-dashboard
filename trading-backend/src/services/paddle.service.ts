import { Paddle, Environment, EventName } from '@paddle/paddle-node-sdk';
import type { EventEntity } from '@paddle/paddle-node-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: process.env.PADDLE_ENVIRONMENT === 'production'
    ? Environment.production
    : Environment.sandbox,
});

export class PaddleService {
  /**
   * Verify and unmarshal a Paddle webhook event
   */
  static async verifyWebhook(rawBody: string, signature: string): Promise<EventEntity> {
    return paddle.webhooks.unmarshal(rawBody, process.env.PADDLE_WEBHOOK_SECRET!, signature);
  }

  /**
   * Handle Paddle webhook events
   */
  static async handleWebhookEvent(event: EventEntity): Promise<void> {
    switch (event.eventType) {
      case EventName.SubscriptionActivated: {
        await this.handleSubscriptionActivated(event.data);
        break;
      }
      case EventName.SubscriptionUpdated: {
        await this.handleSubscriptionUpdated(event.data);
        break;
      }
      case EventName.SubscriptionCanceled: {
        await this.handleSubscriptionCanceled(event.data);
        break;
      }
      case EventName.SubscriptionPastDue: {
        await this.handleSubscriptionPastDue(event.data);
        break;
      }
    }
  }

  /**
   * Handle subscription activated — user just subscribed
   */
  private static async handleSubscriptionActivated(data: any): Promise<void> {
    const userId = data.customData?.userId as string | undefined;
    if (!userId) {
      console.error('Paddle webhook: no userId in customData');
      return;
    }

    const existing = await prisma.subscription.findFirst({ where: { userId } });

    const subData = {
      paddleSubscriptionId: data.id,
      paddleCustomerId: data.customerId,
      paddlePriceId: data.items?.[0]?.price?.id || null,
      plan: 'pro',
      status: 'active',
      currentPeriodStart: data.currentBillingPeriod?.startsAt
        ? new Date(data.currentBillingPeriod.startsAt)
        : null,
      currentPeriodEnd: data.currentBillingPeriod?.endsAt
        ? new Date(data.currentBillingPeriod.endsAt)
        : null,
    };

    if (existing) {
      await prisma.subscription.update({ where: { id: existing.id }, data: subData });
    } else {
      await prisma.subscription.create({ data: { userId, ...subData } });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'pro' },
    });
  }

  /**
   * Handle subscription updated (renewal, plan change)
   */
  private static async handleSubscriptionUpdated(data: any): Promise<void> {
    const sub = await prisma.subscription.findFirst({
      where: { paddleSubscriptionId: data.id },
    });

    if (!sub) return;

    const status = data.status === 'active' ? 'active' :
                   data.status === 'past_due' ? 'past_due' :
                   data.status === 'canceled' ? 'cancelled' : sub.status;

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status,
        currentPeriodStart: data.currentBillingPeriod?.startsAt
          ? new Date(data.currentBillingPeriod.startsAt)
          : sub.currentPeriodStart,
        currentPeriodEnd: data.currentBillingPeriod?.endsAt
          ? new Date(data.currentBillingPeriod.endsAt)
          : sub.currentPeriodEnd,
      },
    });

    const userStatus = status === 'active' ? 'pro' : 'free';
    await prisma.user.update({
      where: { id: sub.userId },
      data: { subscriptionStatus: userStatus },
    });
  }

  /**
   * Handle subscription canceled
   */
  private static async handleSubscriptionCanceled(data: any): Promise<void> {
    const sub = await prisma.subscription.findFirst({
      where: { paddleSubscriptionId: data.id },
    });

    if (!sub) return;

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'cancelled' },
    });

    await prisma.user.update({
      where: { id: sub.userId },
      data: { subscriptionStatus: 'free' },
    });
  }

  /**
   * Handle subscription past due
   */
  private static async handleSubscriptionPastDue(data: any): Promise<void> {
    const sub = await prisma.subscription.findFirst({
      where: { paddleSubscriptionId: data.id },
    });

    if (!sub) return;

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'past_due' },
    });
  }

  /**
   * Cancel a subscription via Paddle API
   */
  static async cancelSubscription(paddleSubscriptionId: string): Promise<void> {
    await paddle.subscriptions.cancel(paddleSubscriptionId, { effectiveFrom: 'next_billing_period' });
  }
}
