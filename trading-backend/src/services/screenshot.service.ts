import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, Screenshot } from '@prisma/client';
import { storageService } from './storage.service';

const prisma = new PrismaClient();

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

interface CreateScreenshotParams {
  userId: string;
  tradeId?: string;
  mt5TradeId?: string;
  file: UploadedFile;
}

/**
 * Screenshot Service
 * Handles image processing, storage, and database operations for trade screenshots
 */
export class ScreenshotService {
  /**
   * Compress image to max 1920px width with 85% quality
   * @param buffer Original image buffer
   * @returns Compressed image buffer
   */
  async compressImage(buffer: Buffer): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // If image is already smaller than 1920px, just compress quality
      const maxWidth = 1920;
      const shouldResize = metadata.width && metadata.width > maxWidth;

      return await image
        .resize(shouldResize ? { width: maxWidth, withoutEnlargement: true } : undefined)
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    } catch (error) {
      console.error('Image compression error:', error);
      throw new Error(`Failed to compress image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate 150x150 WebP thumbnail
   * @param buffer Original image buffer
   * @returns Thumbnail buffer
   */
  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(150, 150, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      throw new Error(`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create screenshot: process image, upload to S3, save to database
   * @param params Screenshot creation parameters
   * @returns Created screenshot record
   */
  async createScreenshot(params: CreateScreenshotParams): Promise<Screenshot> {
    const { userId, tradeId, mt5TradeId, file } = params;

    // Validate that at least one trade ID is provided
    if (!tradeId && !mt5TradeId) {
      throw new Error('Either tradeId or mt5TradeId must be provided');
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    try {
      // Generate unique ID for this screenshot
      const screenshotId = uuidv4();
      const timestamp = Date.now();
      const fileExtension = this.getFileExtension(file.mimetype);

      // Process images
      const [compressedBuffer, thumbnailBuffer] = await Promise.all([
        this.compressImage(file.buffer),
        this.generateThumbnail(file.buffer),
      ]);

      // Generate S3 keys (paths) - don't include bucket name in key
      const originalKey = `${userId}/${screenshotId}-${timestamp}.${fileExtension}`;
      const thumbnailKey = `${userId}/${screenshotId}-${timestamp}-thumb.webp`;

      // Upload to storage (Supabase or MinIO)
      await Promise.all([
        storageService.uploadFile(compressedBuffer, originalKey, file.mimetype),
        storageService.uploadFile(thumbnailBuffer, thumbnailKey, 'image/webp'),
      ]);

      // Get public URLs
      const originalUrl = storageService.getPublicUrl(originalKey);
      const thumbnailUrl = storageService.getPublicUrl(thumbnailKey);

      // Save to database
      const screenshot = await prisma.screenshot.create({
        data: {
          id: screenshotId,
          userId,
          tradeId: tradeId || null,
          mt5TradeId: mt5TradeId || null,
          originalUrl,
          thumbnailUrl,
          fileName: file.originalname,
          fileSize: compressedBuffer.length,
          mimeType: file.mimetype,
        },
      });

      return screenshot;
    } catch (error) {
      console.error('Screenshot creation error:', error);
      throw new Error(`Failed to create screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all screenshots for a trade
   * @param tradeId Regular trade ID (optional)
   * @param mt5TradeId MT5 trade ID (optional)
   * @returns Array of screenshots
   */
  async getScreenshotsByTrade(tradeId?: string, mt5TradeId?: string): Promise<Screenshot[]> {
    if (!tradeId && !mt5TradeId) {
      throw new Error('Either tradeId or mt5TradeId must be provided');
    }

    try {
      const screenshots = await prisma.screenshot.findMany({
        where: {
          ...(tradeId && { tradeId }),
          ...(mt5TradeId && { mt5TradeId }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return screenshots;
    } catch (error) {
      console.error('Get screenshots error:', error);
      throw new Error(`Failed to get screenshots: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete screenshot from S3 and database
   * @param id Screenshot ID
   * @param userId User ID (for authorization check)
   * @returns Deleted screenshot record
   */
  async deleteScreenshot(id: string, userId: string): Promise<Screenshot> {
    try {
      // Get screenshot record
      const screenshot = await prisma.screenshot.findUnique({
        where: { id },
      });

      if (!screenshot) {
        throw new Error('Screenshot not found');
      }

      // Check authorization
      if (screenshot.userId !== userId) {
        throw new Error('Unauthorized to delete this screenshot');
      }

      // Extract storage keys from URLs
      const originalKey = this.extractStorageKey(screenshot.originalUrl);
      const thumbnailKey = this.extractStorageKey(screenshot.thumbnailUrl);

      // Delete from storage (don't fail if storage deletion fails)
      try {
        await Promise.all([
          storageService.deleteFile(originalKey),
          storageService.deleteFile(thumbnailKey),
        ]);
      } catch (storageError) {
        console.error('Storage deletion error (continuing with DB deletion):', storageError);
      }

      // Delete from database
      const deletedScreenshot = await prisma.screenshot.delete({
        where: { id },
      });

      return deletedScreenshot;
    } catch (error) {
      console.error('Screenshot deletion error:', error);
      throw new Error(`Failed to delete screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file extension from MIME type
   * @param mimeType MIME type
   * @returns File extension
   */
  private getFileExtension(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };

    return mimeToExt[mimeType] || 'jpg';
  }

  /**
   * Extract storage key from public URL
   * @param url Public URL
   * @returns Storage key (path)
   */
  private extractStorageKey(url: string): string {
    // Remove protocol and domain, get the path
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Remove leading slash and bucket name if present in path
    const bucketName = storageService.getBucketName();
    const pathWithoutBucket = pathname.startsWith(`/${bucketName}/`)
      ? pathname.substring(`/${bucketName}/`.length)
      : pathname.substring(1);

    return pathWithoutBucket;
  }
}

// Export singleton instance
export const screenshotService = new ScreenshotService();
