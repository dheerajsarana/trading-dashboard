# Supabase Setup Guide (5 Minutes)

## 🎯 What You Just Got

Your backend now uses **Supabase Storage** for both local and production:
- **Free 1GB storage** (enough for 1000-2000 screenshots)
- **No credit card required**
- **Same setup** for local development and production
- **No Docker/MinIO needed**

---

## 📝 Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with **GitHub** or **Google**
4. Verify your email

⏱️ Time: 2 minutes

---

## 📦 Step 2: Create Project & Bucket

### Create Project

1. Click **"New project"**
2. Fill in:
   - **Name**: `trading-dashboard`
   - **Database Password**: `your-password-123` (save it!)
   - **Region**: Choose closest to you
   - **Plan**: **Free** (1GB storage)
3. Click **"Create new project"**
4. ⏱️ Wait 2-3 minutes for initialization

### Create Storage Bucket

1. Left sidebar → **Storage**
2. Click **"New bucket"**
3. Settings:
   - **Name**: `screenshots` (must match exactly)
   - **Public bucket**: ✅ **Yes** (enable)
   - **File size limit**: 5 MB
4. Click **"Create bucket"**

⏱️ Time: 2 minutes

---

## 🔑 Step 3: Get Your Credentials

1. Supabase Dashboard → **Settings** (gear icon ⚙️)
2. Click **API** in left menu
3. Find and copy:

   ```
   Project URL: https://abcdefghijk.supabase.co
   ```

   Scroll down to **Project API keys** section:

   ```
   service_role (secret): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ⚠️ **Important**: Copy the **service_role** key (not the **anon** key)

⏱️ Time: 1 minute

---

## ☁️ Step 4: Configure Render

### Add Environment Variables

1. Go to https://dashboard.render.com
2. Click your backend service
3. Go to **Environment** tab
4. Click **"Add Environment Variable"** for each:

```env
SUPABASE_URL
https://abcdefghijk.supabase.co

SUPABASE_SERVICE_ROLE_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

S3_BUCKET_NAME
screenshots
```

5. Click **"Save Changes"**

⏱️ Render will auto-deploy with new settings

---

## 🚀 Step 5: Deploy Your Code

### Commit Changes

```bash
cd trading-backend

# Stage all files
git add .

# Commit
git commit -m "Add Supabase storage support for screenshots

- Install @supabase/supabase-js
- Create Supabase storage service
- Add unified storage service (auto-selects Supabase or MinIO)
- Update screenshot service to use unified storage
- Update environment configuration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to trigger Render deployment
git push origin main
```

⏱️ Time: 2 minutes

---

## 🧪 Step 6: Test It Works

### Wait for Render Deployment

1. Watch deployment in Render Dashboard (2-3 minutes)
2. Check logs for: `✓ Supabase Storage configured`

### Test Upload

```bash
# Login to get token
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}' \
  > token.json

# Extract token
TOKEN=$(cat token.json | jq -r '.token')

# Upload test screenshot
curl -X POST https://your-app.onrender.com/api/screenshots/upload/test-trade-123 \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@test-image.png"
```

**Expected response:**
```json
{
  "message": "1 screenshot(s) uploaded successfully",
  "screenshots": [
    {
      "id": "uuid-here",
      "originalUrl": "https://abcdefg.supabase.co/storage/v1/object/public/screenshots/...",
      "thumbnailUrl": "https://abcdefg.supabase.co/storage/v1/object/public/screenshots/..."
    }
  ]
}
```

### Verify in Supabase

1. Go to Supabase Dashboard → **Storage** → `screenshots` bucket
2. You should see folder: `user-id/`
3. Inside: `uuid-timestamp.jpg` and `uuid-timestamp-thumb.webp`
4. Click file → Copy URL → Open in browser (should display image)

---

## ✅ Quick Checklist

- [ ] Supabase account created
- [ ] Project created (waited for initialization)
- [ ] Bucket `screenshots` created and set to **public**
- [ ] Copied `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Added 3 environment variables to Render
- [ ] Committed and pushed code
- [ ] Render deployment succeeded
- [ ] Test upload works
- [ ] Images visible in Supabase Storage

---

## 📱 Local Development Setup

Your local development also uses Supabase (same as production):

1. **Copy your .env.example to .env**:
   ```bash
   cp .env.example .env
   ```

2. **Add your Supabase credentials** (from Step 3):
   ```env
   SUPABASE_URL=https://abcdefghijk.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   S3_BUCKET_NAME=screenshots
   ```

3. **Start backend**:
   ```bash
   npm run dev

   # You should see: "✓ Supabase Storage configured for bucket: screenshots"
   ```

**Benefits**: One storage service for both environments - simpler and free!

---

## 🔧 Troubleshooting

### "Supabase storage not configured"

**Fix**: Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Render environment variables

### "Failed to upload file to Supabase"

**Fixes**:
1. Check you copied **service_role** key (not anon key)
2. Verify bucket name is exactly `screenshots`
3. Make sure bucket is set to **public**

### "Row level security policy violation"

**Fix**: Bucket must be public
1. Storage → `screenshots` bucket → Settings
2. **Public bucket**: ✅ Enable

### Images Upload but Don't Display (404)

**Fix**: Bucket not public
1. Storage → `screenshots` bucket → Settings
2. Set **Public bucket** to ✅

### Local Development Not Working

**Fix**: Make sure your local `.env` has Supabase credentials:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
S3_BUCKET_NAME=screenshots
```

Use the same credentials as production

---

## 📊 Monitor Usage

### Check Storage Usage

1. Supabase Dashboard → **Settings** → **Usage**
2. Monitor:
   - **Storage**: Stay under 1GB
   - **Bandwidth**: Stay under 2GB/month (uploads + downloads)

### Set Up Alerts

1. Settings → **Usage** → Configure email alerts
2. Get notified at 80% usage

---

## 💰 Cost

### Free Tier (Current)
- **Storage**: 1GB (~1000-2000 screenshots)
- **Bandwidth**: 2GB/month
- **Cost**: $0 ✅

### If You Exceed Limits
- **Option 1**: Delete old screenshots to stay in free tier
- **Option 2**: Upgrade to Pro ($25/month for 100GB storage)

---

## 🎉 Done!

Your screenshot feature is now deployed with:
- ✅ Free storage (Supabase)
- ✅ No credit card needed
- ✅ Works locally and production (same Supabase account)
- ✅ Simple configuration

**Next**: Test uploading screenshots through your frontend!

---

## Quick Reference

**Supabase Dashboard**: https://supabase.com/dashboard
**Render Dashboard**: https://dashboard.render.com

**Environment Variables (Render)**:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
S3_BUCKET_NAME=screenshots
```

**Local Development**:
```bash
# Add Supabase credentials to .env
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```
