# Render Deployment Guide - Screenshot Feature

## 🎯 What Was Updated

Your `render.yaml` now includes all necessary environment variables for the screenshot feature.

---

## 📋 Environment Variables to Set in Render

After deploying, you need to manually set these values in Render Dashboard:

### Required (Must Set):

1. **SUPABASE_URL**
   ```
   https://onsqoretosoqxjtlkanj.supabase.co
   ```

2. **SUPABASE_SERVICE_ROLE_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uc3FvcmV0b3NvcXhqdGxrYW5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc4MzAzMiwiZXhwIjoyMDg2MzU5MDMyfQ.qmfwcRHHgniUDCIg6n-0oR5AKx32n4N9RX2K8mLsIfY
   ```

3. **MT5_ENCRYPTION_KEY** (32 characters exactly)
   ```
   12345678901234567890123456789012
   ```

4. **FRONTEND_URL**
   ```
   https://your-frontend-domain.vercel.app
   ```
   (Replace with your actual frontend URL)

### Auto-Configured:

These are already set in render.yaml:
- ✅ `S3_BUCKET_NAME` = "screenshots"
- ✅ `MAX_FILE_SIZE` = "5242880" (5MB)
- ✅ `CACHE_TTL` = "3600" (1 hour)
- ✅ `REDIS_ENABLED` = "false"
- ✅ `NODE_ENV` = "production"
- ✅ `DATABASE_URL` = (auto from database)
- ✅ `JWT_SECRET` = (auto-generated)

---

## 🚀 Deployment Steps

### Step 1: Commit & Push

```bash
# Stage all changes
git add .

# Commit
git commit -m "Add Supabase screenshot storage and update Render config

- Remove MinIO dependency
- Add Supabase Storage service
- Update render.yaml with Supabase env vars
- Configure screenshot upload/view/delete endpoints

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to trigger deployment
git push origin main
```

### Step 2: Set Environment Variables in Render

1. Go to https://dashboard.render.com
2. Click your service: **trading-api**
3. Go to **Environment** tab
4. Add/Update these variables:

```env
SUPABASE_URL
https://onsqoretosoqxjtlkanj.supabase.co

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uc3FvcmV0b3NvcXhqdGxrYW5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc4MzAzMiwiZXhwIjoyMDg2MzU5MDMyfQ.qmfwcRHHgniUDCIg6n-0oR5AKx32n4N9RX2K8mLsIfY

MT5_ENCRYPTION_KEY
12345678901234567890123456789012

FRONTEND_URL
https://your-frontend.vercel.app
```

5. Click **Save Changes**
6. Service will auto-redeploy

### Step 3: Verify Deployment

1. Watch the deployment logs:
   ```
   ✓ Installing dependencies
   ✓ Generating Prisma client
   ✓ Building TypeScript
   ✓ Running migrations
   ✓ Starting server
   ```

2. Check for success message:
   ```
   ✓ Supabase Storage configured for bucket: screenshots
   Server running on port 10000
   ```

### Step 4: Test Screenshot Upload

```bash
# Get auth token
curl -X POST https://trading-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' \
  | jq -r '.token'

# Save token
export TOKEN="your-token-here"

# Upload screenshot
curl -X POST https://trading-api.onrender.com/api/screenshots/upload/trade-123 \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@test-image.png"
```

**Expected Response:**
```json
{
  "message": "1 screenshot(s) uploaded successfully",
  "screenshots": [
    {
      "id": "uuid",
      "originalUrl": "https://onsqoretosoqxjtlkanj.supabase.co/storage/v1/object/public/screenshots/...",
      "thumbnailUrl": "https://onsqoretosoqxjtlkanj.supabase.co/storage/v1/object/public/screenshots/..."
    }
  ]
}
```

---

## 🔧 Troubleshooting

### Deployment Fails: "Supabase Storage not configured"

**Fix**: Environment variables not set
1. Render Dashboard → Environment tab
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Click "Save Changes" (triggers redeploy)

### Build Fails: "Cannot find module '@supabase/supabase-js'"

**Fix**: Dependencies not installed
1. Check `package.json` includes `@supabase/supabase-js`
2. Commit and push again
3. Render will reinstall dependencies

### Migration Fails

**Fix**: Database connection issue
1. Check `DATABASE_URL` is set correctly
2. Verify database is running
3. Try manual migration:
   - Render Dashboard → Shell
   - Run: `npx prisma migrate deploy`

### Screenshot Upload Works but Images Don't Display

**Fix**: Supabase bucket not public
1. Supabase Dashboard → Storage → `screenshots`
2. Click ⋮ → Edit bucket
3. Enable "Public bucket"
4. Save

---

## 📊 Monitor Your Deployment

### Check Logs

Render Dashboard → Logs tab
- Look for: `✓ Supabase Storage configured`
- Check for errors during startup

### Check Database

Render Dashboard → trading-db → Connect
```sql
-- Verify screenshot table exists
SELECT COUNT(*) FROM "Screenshot";

-- Check uploaded screenshots
SELECT id, "fileName", "createdAt"
FROM "Screenshot"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### Check Supabase Storage

Supabase Dashboard → Storage → screenshots
- Should see folders: `user-id/`
- Inside: uploaded image files

---

## 🎉 Success Checklist

- [ ] Committed and pushed code
- [ ] Render deployment succeeded
- [ ] Added 4 environment variables in Render
- [ ] Logs show "✓ Supabase Storage configured"
- [ ] Test upload works via API
- [ ] Images display in browser
- [ ] Images visible in Supabase Storage dashboard
- [ ] Frontend can upload/view/delete screenshots

---

## 📚 Next Steps

1. **Test with Frontend**
   - Deploy your frontend with updated `VITE_API_BASE_URL`
   - Test screenshot upload from UI
   - Verify images display correctly

2. **Set Up Monitoring**
   - Supabase Dashboard → Settings → Usage
   - Monitor storage and bandwidth usage
   - Set up alerts at 80% usage

3. **Configure CORS** (if needed)
   - Supabase Dashboard → Storage → screenshots → Settings
   - Add your frontend domain to CORS settings

---

## 🔗 Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/onsqoretosoqxjtlkanj
- **Your API**: https://trading-api.onrender.com (replace with actual URL)

---

## 💡 Pro Tips

1. **Keep Credentials Safe**
   - Never commit `.env` to git
   - Use Render's environment variables
   - Keep `SUPABASE_SERVICE_ROLE_KEY` secret

2. **Monitor Free Tier Limits**
   - Supabase: 1GB storage, 2GB bandwidth/month
   - Render: 750 hours/month (enough for 1 service)

3. **Optimize Storage**
   - Images are compressed to 1920px max
   - Thumbnails are 150x150 WebP
   - Delete old screenshots to stay in free tier

---

Need help? Check the logs and error messages, or refer to:
- [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md)
- [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
