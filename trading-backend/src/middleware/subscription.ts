import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth';

const prisma = new PrismaClient();

/**
 * Middleware that requires an active Pro subscription.
 * Returns 403 if user is on the free plan.
 */
export const requirePro = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true },
    });

    if (!user || user.subscriptionStatus !== 'pro') {
      return res.status(403).json({
        error: 'Pro subscription required',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Failed to verify subscription' });
  }
};
