import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

/**
 * Upload Middleware
 * Configures multer for handling image uploads with validation
 */

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// File size limit from environment or default to 5MB
const FILE_SIZE_LIMIT = parseInt(process.env.UPLOAD_FILE_SIZE_LIMIT || '5242880', 10); // 5MB in bytes

/**
 * File filter to only allow images
 */
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  // Check if file type is allowed
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `Invalid file type. Only ${ALLOWED_MIME_TYPES.join(', ')} are allowed.`
      )
    );
  }
};

/**
 * Multer configuration for screenshot uploads
 * - Uses memory storage (buffer)
 * - Filters for images only
 * - Limits file size to 5MB (configurable via env)
 */
export const uploadScreenshots = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMIT,
    files: 5, // Maximum 5 files per request
  },
});

/**
 * Middleware to handle multer errors
 */
export const handleUploadErrors = (
  err: any,
  req: Request,
  res: any,
  next: any
): void => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `File too large. Maximum size is ${FILE_SIZE_LIMIT / 1024 / 1024}MB.`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Maximum 5 files allowed per upload.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field name for file upload.',
      });
    }
    return res.status(400).json({
      error: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    // Other errors (e.g., file filter errors)
    return res.status(400).json({
      error: err.message || 'File upload error',
    });
  }

  next();
};
