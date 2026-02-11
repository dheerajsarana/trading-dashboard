import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { uploadScreenshots, handleUploadErrors } from '../middleware/upload.middleware';
import { ScreenshotController } from '../controllers/screenshot.controller';

const router = Router();

/**
 * Screenshot Routes
 * All routes require authentication
 */

/**
 * @route   POST /api/screenshots/upload/:tradeId
 * @desc    Upload screenshots for a trade (supports ?mt5TradeId=xxx query param)
 * @access  Private
 * @body    files[] - Array of image files (max 5)
 * @params  tradeId - Regular trade ID (optional if mt5TradeId is provided)
 * @query   mt5TradeId - MT5 trade ID (optional if tradeId is provided)
 */
router.post(
  '/upload/:tradeId',
  authenticateToken,
  uploadScreenshots.array('files', 5),
  handleUploadErrors,
  ScreenshotController.uploadScreenshots
);

/**
 * @route   GET /api/screenshots/trade/:tradeId
 * @desc    Get all screenshots for a trade (supports ?mt5TradeId=xxx query param)
 * @access  Private
 * @params  tradeId - Regular trade ID (optional if mt5TradeId is provided)
 * @query   mt5TradeId - MT5 trade ID (optional if tradeId is provided)
 */
router.get(
  '/trade/:tradeId',
  authenticateToken,
  ScreenshotController.getTradeScreenshots
);

/**
 * @route   DELETE /api/screenshots/:id
 * @desc    Delete a screenshot
 * @access  Private (only owner can delete)
 * @params  id - Screenshot ID
 */
router.delete(
  '/:id',
  authenticateToken,
  ScreenshotController.deleteScreenshot
);

export default router;
