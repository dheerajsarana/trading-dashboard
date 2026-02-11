# Screenshots Feature - Backend Implementation

## Overview

The screenshots feature allows users to upload, view, and manage screenshots for both regular trades and MT5 trades. Images are processed, compressed, stored in S3-compatible storage (AWS S3, MinIO, Cloudflare R2), and tracked in the database.

## Architecture

### Database Schema

**Screenshot Model** (`screenshots` table):
- `id` (String, UUID) - Unique screenshot identifier
- `userId` (String) - Owner of the screenshot
- `tradeId` (String, optional) - Link to regular trade
- `mt5TradeId` (String, optional) - Link to MT5 trade
- `originalUrl` (String) - Full-size image URL
- `thumbnailUrl` (String) - 150x150 thumbnail URL
- `fileName` (String) - Original filename
- `fileSize` (Int) - Compressed file size in bytes
- `mimeType` (String) - Image MIME type
- `createdAt`, `updatedAt` - Timestamps

**Relations**:
- Cascade delete: When a user, trade, or MT5 trade is deleted, associated screenshots are automatically deleted
- Indexed on `tradeId`, `mt5TradeId`, `userId`, and `(userId, createdAt)` for performance

### Components

#### 1. S3 Service (`src/services/s3.service.ts`)
Manages S3-compatible storage operations:
- `uploadFile(buffer, key, mimeType)` - Upload file to S3
- `deleteFile(key)` - Delete file from S3
- `getPublicUrl(key)` - Generate public URL for file
- Supports AWS S3, MinIO, and Cloudflare R2
- Path-style URLs for MinIO compatibility

#### 2. Screenshot Service (`src/services/screenshot.service.ts`)
Handles image processing and database operations:
- `compressImage(buffer)` - Compress to max 1920px width, 85% quality JPEG
- `generateThumbnail(buffer)` - Create 150x150 WebP thumbnail
- `createScreenshot(params)` - Process, upload, and save screenshot
- `getScreenshotsByTrade(tradeId, mt5TradeId)` - Fetch screenshots for a trade
- `deleteScreenshot(id, userId)` - Delete from S3 and database with authorization

#### 3. Upload Middleware (`src/middleware/upload.middleware.ts`)
Multer configuration for file uploads:
- Memory storage (buffer-based)
- Image-only filter (jpeg, png, webp, gif)
- 5MB file size limit (configurable)
- Max 5 files per request
- Error handling for Multer errors

#### 4. Screenshot Controller (`src/controllers/screenshot.controller.ts`)
HTTP request handlers:
- `uploadScreenshots` - Upload multiple screenshots
- `getTradeScreenshots` - Get all screenshots for a trade
- `deleteScreenshot` - Delete a screenshot with authorization

#### 5. Routes (`src/routes/screenshot.routes.ts`)
API endpoints (all require authentication):
- `POST /api/screenshots/upload/:tradeId?mt5TradeId=xxx` - Upload screenshots
- `GET /api/screenshots/trade/:tradeId?mt5TradeId=xxx` - Get trade screenshots
- `DELETE /api/screenshots/:id` - Delete screenshot

## Environment Variables

Add to `.env`:

```env
# S3/MinIO Configuration for Screenshots
S3_ENDPOINT="http://localhost:9000"              # S3 endpoint (optional for AWS S3)
S3_REGION="us-east-1"                            # AWS region
S3_ACCESS_KEY_ID="minioadmin"                    # Access key
S3_SECRET_ACCESS_KEY="minioadmin"                # Secret key
S3_BUCKET_NAME="trading-screenshots"             # Bucket name
S3_PUBLIC_URL="http://localhost:9000/trading-screenshots"  # Public URL base
S3_FORCE_PATH_STYLE="true"                       # Path-style URLs (true for MinIO)

# Upload Configuration
UPLOAD_FILE_SIZE_LIMIT="5242880"                 # 5MB in bytes
```

## Setup Instructions

### 1. Install Dependencies

Already completed:
```bash
npm install @aws-sdk/client-s3 sharp uuid
```

### 2. Run Database Migration

```bash
npm run prisma:migrate
```

When prompted for migration name, use: `add_screenshots`

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Setup Storage Backend

#### Option A: MinIO (Local Development)

1. Add to `docker-compose.yml`:

```yaml
services:
  minio:
    image: minio/minio:latest
    container_name: trading_minio
    ports:
      - "9000:9000"      # API
      - "9001:9001"      # Console
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    networks:
      - trading-network

volumes:
  minio_data:
```

2. Start MinIO:
```bash
docker compose up -d minio
```

3. Create bucket:
- Open http://localhost:9001
- Login: minioadmin / minioadmin
- Create bucket named "trading-screenshots"
- Set bucket policy to public read (or adjust S3 service to use signed URLs)

#### Option B: AWS S3

1. Create S3 bucket in AWS Console
2. Update `.env`:
```env
S3_ENDPOINT=""  # Leave empty for AWS S3
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-aws-access-key"
S3_SECRET_ACCESS_KEY="your-aws-secret-key"
S3_BUCKET_NAME="your-bucket-name"
S3_PUBLIC_URL=""  # Leave empty for auto-generated URLs
S3_FORCE_PATH_STYLE="false"
```

#### Option C: Cloudflare R2

1. Create R2 bucket in Cloudflare dashboard
2. Create API token
3. Update `.env`:
```env
S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_ACCESS_KEY_ID="your-r2-access-key"
S3_SECRET_ACCESS_KEY="your-r2-secret-key"
S3_BUCKET_NAME="your-bucket-name"
S3_PUBLIC_URL="https://your-custom-domain.com"  # If using custom domain
S3_FORCE_PATH_STYLE="false"
```

## API Usage

### Upload Screenshots

```bash
POST /api/screenshots/upload/:tradeId
Content-Type: multipart/form-data
Authorization: Bearer <token>

# For regular trades
curl -X POST http://localhost:5000/api/screenshots/upload/trade123 \
  -H "Authorization: Bearer <token>" \
  -F "files=@screenshot1.png" \
  -F "files=@screenshot2.jpg"

# For MT5 trades
curl -X POST http://localhost:5000/api/screenshots/upload/undefined?mt5TradeId=mt5-123 \
  -H "Authorization: Bearer <token>" \
  -F "files=@screenshot1.png"
```

**Response:**
```json
{
  "message": "2 screenshot(s) uploaded successfully",
  "screenshots": [
    {
      "id": "uuid-1",
      "userId": "user-123",
      "tradeId": "trade-123",
      "mt5TradeId": null,
      "originalUrl": "http://localhost:9000/trading-screenshots/screenshots/user-123/uuid-1-1234567890.jpg",
      "thumbnailUrl": "http://localhost:9000/trading-screenshots/screenshots/user-123/uuid-1-1234567890-thumb.webp",
      "fileName": "screenshot1.png",
      "fileSize": 245632,
      "mimeType": "image/jpeg",
      "createdAt": "2026-02-11T10:30:00.000Z",
      "updatedAt": "2026-02-11T10:30:00.000Z"
    }
  ]
}
```

### Get Trade Screenshots

```bash
GET /api/screenshots/trade/:tradeId
Authorization: Bearer <token>

# For regular trades
curl http://localhost:5000/api/screenshots/trade/trade123 \
  -H "Authorization: Bearer <token>"

# For MT5 trades
curl http://localhost:5000/api/screenshots/trade/undefined?mt5TradeId=mt5-123 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "count": 2,
  "screenshots": [...]
}
```

### Delete Screenshot

```bash
DELETE /api/screenshots/:id
Authorization: Bearer <token>

curl -X DELETE http://localhost:5000/api/screenshots/uuid-1 \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "message": "Screenshot deleted successfully",
  "screenshot": {...}
}
```

## Image Processing

### Compression
- Original images are compressed to maximum 1920px width
- JPEG format with 85% quality
- Progressive encoding for faster loading
- Maintains aspect ratio

### Thumbnails
- 150x150 pixels
- Cover fit (centered crop)
- WebP format for optimal size
- 80% quality

### Supported Formats
- JPEG/JPG
- PNG
- WebP
- GIF

## Security Features

1. **Authentication**: All routes require valid JWT token
2. **Authorization**: Users can only delete their own screenshots
3. **File Validation**: Only image files allowed
4. **Size Limits**: 5MB per file, max 5 files per request
5. **Cascade Delete**: Orphaned screenshots auto-deleted with trades/users

## Storage Structure

Files are organized in S3 as:
```
screenshots/
  {userId}/
    {screenshotId}-{timestamp}.jpg       # Original (compressed)
    {screenshotId}-{timestamp}-thumb.webp # Thumbnail
```

Example:
```
screenshots/
  clx123abc/
    550e8400-e29b-41d4-a716-446655440000-1707648600000.jpg
    550e8400-e29b-41d4-a716-446655440000-1707648600000-thumb.webp
```

## Error Handling

The implementation handles various error scenarios:
- Missing files: 400 Bad Request
- Invalid file type: 400 Bad Request
- File too large: 400 Bad Request
- Too many files: 400 Bad Request
- S3 upload failure: 500 Internal Server Error
- Screenshot not found: 404 Not Found
- Unauthorized access: 403 Forbidden
- Image processing failure: 500 Internal Server Error

## Performance Considerations

1. **Parallel Processing**: Images are compressed and thumbnails generated in parallel
2. **Indexed Queries**: Database queries use indexes on userId, tradeId, mt5TradeId
3. **Efficient Storage**: WebP thumbnails reduce storage and bandwidth
4. **Progressive JPEGs**: Compressed images load progressively for better UX

## Testing

### Manual Testing with MinIO

1. Start MinIO: `docker compose up -d minio`
2. Create bucket and set public policy
3. Start backend: `npm run dev`
4. Test upload:
```bash
curl -X POST http://localhost:5000/api/screenshots/upload/trade123 \
  -H "Authorization: Bearer <your-token>" \
  -F "files=@test-image.png"
```
5. Verify in MinIO Console: http://localhost:9001

### Production Checklist

- [ ] Configure production S3/R2 credentials
- [ ] Set appropriate bucket policies
- [ ] Enable CDN for public URLs (CloudFront, Cloudflare)
- [ ] Configure CORS for your storage bucket
- [ ] Set up backup/retention policies
- [ ] Monitor storage usage and costs
- [ ] Consider signed URLs for private screenshots (modify S3 service)

## Future Enhancements

Potential improvements:
1. Image metadata extraction (EXIF data)
2. Automatic annotation/markup tools
3. OCR for text extraction
4. Duplicate detection
5. Batch operations
6. Screenshot comparison views
7. Signed URLs for private access
8. Image optimization based on device
9. Multiple thumbnail sizes
10. Screenshot categorization/tagging

## Troubleshooting

### S3 Connection Issues
- Verify endpoint URL and credentials
- Check bucket exists and is accessible
- For MinIO, ensure `S3_FORCE_PATH_STYLE="true"`
- Check network/firewall rules

### Upload Failures
- Verify file size is under limit
- Check supported file format
- Ensure sharp can process the image
- Review backend logs for details

### Missing Images
- Verify S3 bucket public access policy
- Check CORS configuration
- Verify public URL configuration
- Test direct S3 URL access

### Database Errors
- Run migrations: `npm run prisma:migrate`
- Regenerate client: `npm run prisma:generate`
- Check foreign key constraints (user, trade exist)
