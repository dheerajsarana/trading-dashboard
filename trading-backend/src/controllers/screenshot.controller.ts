import { Request, Response } from 'express';
import { screenshotService } from '../services/screenshot.service';

/**
 * Extended Request interface with authenticated user
 */
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Screenshot Controller
 * Handles HTTP requests for screenshot management
 */
export class ScreenshotController {
  /**
   * Upload screenshots for a trade
   * POST /api/screenshots/upload/:tradeId?mt5TradeId=xxx
   */
  static async uploadScreenshots(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const tradeId = req.params.tradeId;
      const mt5TradeId = req.query.mt5TradeId as string | undefined;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Validate that at least one trade ID is provided
      if (!tradeId && !mt5TradeId) {
        res.status(400).json({
          error: 'Either tradeId parameter or mt5TradeId query parameter is required',
        });
        return;
      }

      // Check if files were uploaded
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      // Process and upload each screenshot
      const uploadPromises = files.map((file) =>
        screenshotService.createScreenshot({
          userId,
          tradeId: tradeId !== 'undefined' ? tradeId : undefined,
          mt5TradeId,
          file: {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          },
        })
      );

      const screenshots = await Promise.all(uploadPromises);

      res.status(201).json({
        message: `${screenshots.length} screenshot(s) uploaded successfully`,
        screenshots,
      });
    } catch (error) {
      console.error('Upload screenshots error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to upload screenshots',
      });
    }
  }

  /**
   * Get all screenshots for a trade
   * GET /api/screenshots/trade/:tradeId?mt5TradeId=xxx
   */
  static async getTradeScreenshots(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const tradeId = req.params.tradeId;
      const mt5TradeId = req.query.mt5TradeId as string | undefined;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Validate that at least one trade ID is provided
      if (!tradeId && !mt5TradeId) {
        res.status(400).json({
          error: 'Either tradeId parameter or mt5TradeId query parameter is required',
        });
        return;
      }

      const screenshots = await screenshotService.getScreenshotsByTrade(
        tradeId !== 'undefined' ? tradeId : undefined,
        mt5TradeId
      );

      // Verify user owns these screenshots (authorization check)
      const unauthorizedScreenshot = screenshots.find((s) => s.userId !== userId);
      if (unauthorizedScreenshot) {
        res.status(403).json({ error: 'Unauthorized to access these screenshots' });
        return;
      }

      res.json({
        count: screenshots.length,
        screenshots,
      });
    } catch (error) {
      console.error('Get trade screenshots error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get screenshots',
      });
    }
  }

  /**
   * Delete a screenshot
   * DELETE /api/screenshots/:id
   */
  static async deleteScreenshot(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const screenshotId = req.params.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!screenshotId) {
        res.status(400).json({ error: 'Screenshot ID is required' });
        return;
      }

      const deletedScreenshot = await screenshotService.deleteScreenshot(
        screenshotId,
        userId
      );

      res.json({
        message: 'Screenshot deleted successfully',
        screenshot: deletedScreenshot,
      });
    } catch (error) {
      console.error('Delete screenshot error:', error);

      if (error instanceof Error) {
        if (error.message === 'Screenshot not found') {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === 'Unauthorized to delete this screenshot') {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete screenshot',
      });
    }
  }
}
