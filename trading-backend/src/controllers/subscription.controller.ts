import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { PaddleService } from '../services/paddle.service';

const prisma = new PrismaClient();

export class SubscriptionController {
  /**
   * GET /api/subscription/status — Get current subscription status
   */
  static async getStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionStatus: true },
      });

      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: 'active' },
        orderBy: { createdAt: 'desc' },
      });

      res.json({
        plan: user?.subscriptionStatus || 'free',
        isActive: user?.subscriptionStatus === 'pro',
        subscription: subscription
          ? {
              status: subscription.status,
              currentPeriodEnd: subscription.currentPeriodEnd,
              plan: subscription.plan,
            }
          : null,
      });
    } catch (error) {
      console.error('Get status error:', error);
      res.status(500).json({ error: 'Failed to get subscription status' });
    }
  }

  /**
   * POST /api/subscription/cancel — Cancel subscription
   */
  static async cancel(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId!;

      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: 'active' },
      });

      if (!subscription?.paddleSubscriptionId) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      await PaddleService.cancelSubscription(subscription.paddleSubscriptionId);

      res.json({ message: 'Subscription will be cancelled at end of billing period' });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }

  /**
   * POST /api/subscription/webhook — Paddle webhook handler (no auth)
   */
  static async webhook(req: any, res: Response) {
    const signature = req.headers['paddle-signature'] as string;

    if (!signature) {
      return res.status(400).json({ error: 'Missing Paddle-Signature header' });
    }

    try {
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const event = await PaddleService.verifyWebhook(rawBody, signature);
      await PaddleService.handleWebhookEvent(event);
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: `Webhook Error: ${error.message}` });
    }
  }
}
