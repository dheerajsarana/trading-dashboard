# Screenshots API - Quick Reference

## Environment Variables Required

```bash
# Add to .env file
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_BUCKET_NAME="trading-screenshots"
S3_PUBLIC_URL="http://localhost:9000/trading-screenshots"
S3_FORCE_PATH_STYLE="true"
UPLOAD_FILE_SIZE_LIMIT="5242880"
```

## Quick Setup (MinIO - Local Development)

```bash
# 1. Start MinIO (if not in docker-compose.yml, run standalone)
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# 2. Create bucket
# Open http://localhost:9001
# Login: minioadmin / minioadmin
# Create bucket: "trading-screenshots"
# Set policy: public read (or leave private and use signed URLs)

# 3. Run migration
cd trading-backend
npm run prisma:migrate
# Name: add_screenshots

# 4. Generate Prisma client
npm run prisma:generate

# 5. Start backend
npm run dev
```

## API Endpoints

### 1. Upload Screenshots for Regular Trade

```bash
curl -X POST http://localhost:5000/api/screenshots/upload/{TRADE_ID} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@screenshot1.png" \
  -F "files=@screenshot2.jpg"
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/screenshots/upload/clx123abc \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "files=@./test-image.png"
```

### 2. Upload Screenshots for MT5 Trade

```bash
curl -X POST "http://localhost:5000/api/screenshots/upload/undefined?mt5TradeId={MT5_TRADE_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@screenshot1.png"
```

**Example:**
```bash
curl -X POST "http://localhost:5000/api/screenshots/upload/undefined?mt5TradeId=clx456def" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "files=@./mt5-trade.jpg"
```

### 3. Get Screenshots for Regular Trade

```bash
curl http://localhost:5000/api/screenshots/trade/{TRADE_ID} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Screenshots for MT5 Trade

```bash
curl "http://localhost:5000/api/screenshots/trade/undefined?mt5TradeId={MT5_TRADE_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Delete Screenshot

```bash
curl -X DELETE http://localhost:5000/api/screenshots/{SCREENSHOT_ID} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Examples

### Upload Success (201)
```json
{
  "message": "2 screenshot(s) uploaded successfully",
  "screenshots": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "clx123abc",
      "tradeId": "clx789ghi",
      "mt5TradeId": null,
      "originalUrl": "http://localhost:9000/trading-screenshots/screenshots/clx123abc/550e8400-e29b-41d4-a716-446655440000-1707648600000.jpg",
      "thumbnailUrl": "http://localhost:9000/trading-screenshots/screenshots/clx123abc/550e8400-e29b-41d4-a716-446655440000-1707648600000-thumb.webp",
      "fileName": "screenshot1.png",
      "fileSize": 245632,
      "mimeType": "image/jpeg",
      "createdAt": "2026-02-11T10:30:00.000Z",
      "updatedAt": "2026-02-11T10:30:00.000Z"
    }
  ]
}
```

### Get Screenshots (200)
```json
{
  "count": 2,
  "screenshots": [...]
}
```

### Delete Success (200)
```json
{
  "message": "Screenshot deleted successfully",
  "screenshot": {...}
}
```

### Error Responses

**400 - Bad Request**
```json
{
  "error": "No files uploaded"
}
```

**400 - File Too Large**
```json
{
  "error": "File too large. Maximum size is 5MB."
}
```

**400 - Invalid File Type**
```json
{
  "error": "Invalid file type. Only image/jpeg, image/jpg, image/png, image/webp, image/gif are allowed."
}
```

**401 - Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**403 - Forbidden**
```json
{
  "error": "Unauthorized to delete this screenshot"
}
```

**404 - Not Found**
```json
{
  "error": "Screenshot not found"
}
```

**500 - Server Error**
```json
{
  "error": "Failed to upload screenshots"
}
```

## Testing with Postman

### Upload Request Setup:
1. Method: `POST`
2. URL: `http://localhost:5000/api/screenshots/upload/{tradeId}`
3. Headers:
   - `Authorization: Bearer {your_token}`
4. Body:
   - Type: `form-data`
   - Key: `files` (type: File)
   - Select multiple files

### Get Request Setup:
1. Method: `GET`
2. URL: `http://localhost:5000/api/screenshots/trade/{tradeId}`
3. Headers:
   - `Authorization: Bearer {your_token}`

## Image Processing Specs

- **Original Image**: Compressed to max 1920px width, 85% quality JPEG
- **Thumbnail**: 150x150 pixels, WebP format, 80% quality, cover fit
- **Supported Formats**: JPEG, JPG, PNG, WebP, GIF
- **Max File Size**: 5MB per file
- **Max Files**: 5 files per upload request

## Storage Structure

```
s3://trading-screenshots/
  screenshots/
    {userId}/
      {screenshotId}-{timestamp}.jpg       # Original (compressed)
      {screenshotId}-{timestamp}-thumb.webp # Thumbnail
```

## Troubleshooting

### "S3 credentials not configured"
- Check `.env` file has `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`
- Restart backend after updating `.env`

### "Failed to upload file to S3"
- Verify MinIO is running: `docker ps | grep minio`
- Check endpoint is accessible: `curl http://localhost:9000/minio/health/live`
- Verify bucket exists in MinIO Console

### "Screenshot not found"
- Use correct screenshot ID (UUID format)
- Ensure user owns the screenshot

### Images not loading in browser
- Check bucket policy (should be public read for direct access)
- Verify `S3_PUBLIC_URL` matches your storage endpoint
- Check CORS settings on bucket

## Production Checklist

- [ ] Use AWS S3 or Cloudflare R2 instead of MinIO
- [ ] Set strong access keys (not minioadmin)
- [ ] Configure CDN (CloudFront/Cloudflare) for `S3_PUBLIC_URL`
- [ ] Set bucket CORS policy for frontend domain
- [ ] Enable bucket versioning for backup
- [ ] Set lifecycle rules for old screenshots
- [ ] Monitor storage usage and costs
- [ ] Consider signed URLs for private screenshots
- [ ] Set up backup/disaster recovery
- [ ] Enable access logging

## Support Matrix

| Storage Provider | Tested | Path Style | Notes |
|-----------------|---------|------------|-------|
| MinIO           | ✅ Yes  | Required   | Perfect for local dev |
| AWS S3          | ✅ Yes  | Optional   | Production ready |
| Cloudflare R2   | ✅ Yes  | No         | Low cost, fast |
| DigitalOcean Spaces | ⚠️ Should work | Yes | S3-compatible |
| Wasabi          | ⚠️ Should work | Yes | S3-compatible |
| Backblaze B2    | ⚠️ Should work | Yes | S3-compatible |

## File Locations

- **Schema**: `prisma/schema.prisma`
- **S3 Service**: `src/services/s3.service.ts`
- **Screenshot Service**: `src/services/screenshot.service.ts`
- **Controller**: `src/controllers/screenshot.controller.ts`
- **Routes**: `src/routes/screenshot.routes.ts`
- **Middleware**: `src/middleware/upload.middleware.ts`
- **Env Config**: `.env`

## Related Documentation

- Full feature docs: `SCREENSHOTS_FEATURE.md`
- Implementation summary: `IMPLEMENTATION_SUMMARY.md`
