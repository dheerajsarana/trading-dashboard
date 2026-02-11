# Deploy Screenshots with Supabase Storage (Free, No Credit Card)

## Why Supabase?
✅ **1GB free storage** (enough for 1000+ screenshots)
✅ **No credit card required**
✅ **S3-compatible API** (works with your code)
✅ **Built-in CDN** (fast image delivery)
✅ **Public URLs** (direct image links)

---

## Step-by-Step Setup

### 1. Create Supabase Account

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with **GitHub** or **Google** (no credit card needed)
4. Confirm your email

### 2. Create New Project

1. Click **"New project"**
2. Fill in:
   - **Name**: `trading-dashboard`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Select closest to you (e.g., US East, Europe West)
   - **Pricing Plan**: **Free** (1GB storage, 2GB bandwidth/month)
3. Click **"Create new project"**
4. Wait 2-3 minutes for project to initialize

### 3. Create Storage Bucket

1. In Supabase Dashboard → **Storage** (left sidebar)
2. Click **"New bucket"**
3. Settings:
   - **Name**: `screenshots`
   - **Public bucket**: ✅ **Enabled** (allows public image access)
   - **File size limit**: 5 MB (or your preference)
4. Click **"Create bucket"**

### 4. Get API Credentials

1. Supabase Dashboard → **Settings** (gear icon) → **API**
2. Copy these values:

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   Service Role Key (secret): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   ⚠️ **Important**: Use **service_role** key (not anon key) for backend

### 5. Configure Supabase for S3 Compatibility

Supabase Storage uses S3-compatible API, but needs special configuration:

**Your code already supports it!** Just use these settings:

---

## Render Configuration

### Add Environment Variables in Render

1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Click **"Add Environment Variable"**
5. Add these:

```env
# Supabase Storage Configuration
S3_BUCKET_NAME=screenshots
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=<your-supabase-project-id>
S3_SECRET_ACCESS_KEY=<your-supabase-service-role-key>
S3_ENDPOINT=https://<your-project-ref>.supabase.co/storage/v1/s3
S3_PUBLIC_URL=https://<your-project-ref>.supabase.co/storage/v1/object/public/screenshots
S3_FORCE_PATH_STYLE=true
MAX_FILE_SIZE=5242880
```

### How to Get the Values:

**S3_ACCESS_KEY_ID**: Your Supabase project reference ID
- Format: `abcdefghijklmno` (from project URL)
- Example: If URL is `https://abcdefg.supabase.co`, use `abcdefg`

**S3_SECRET_ACCESS_KEY**: Your service_role key
- Dashboard → Settings → API → **service_role key (secret)**
- Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**S3_ENDPOINT**:
- Format: `https://<project-ref>.supabase.co/storage/v1/s3`
- Example: `https://abcdefg.supabase.co/storage/v1/s3`

**S3_PUBLIC_URL**:
- Format: `https://<project-ref>.supabase.co/storage/v1/object/public/screenshots`
- Example: `https://abcdefg.supabase.co/storage/v1/object/public/screenshots`

---

## ⚠️ Update S3 Service for Supabase

Supabase requires a small modification to work with S3 SDK. Update your service:

### Option A: Use Supabase Client (Recommended)

Install Supabase client:
```bash
cd trading-backend
npm install @supabase/supabase-js
```

Create new service: `src/services/supabase-storage.service.ts`

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucketName = process.env.S3_BUCKET_NAME || 'screenshots';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(key, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([key]);

    if (error) {
      throw new Error(`Failed to delete: ${error.message}`);
    }
  }

  getPublicUrl(key: string): string {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(key);

    return data.publicUrl;
  }

  getBucketName(): string {
    return this.bucketName;
  }
}

// Export singleton
export const storageService = new SupabaseStorageService();
```

Then update `screenshot.service.ts` to use Supabase client:

```typescript
// Change import
import { storageService } from './supabase-storage.service';
// Instead of: import { s3Service } from './s3.service';

// Replace all s3Service with storageService
```

### Option B: Use Existing S3 Service (Requires Supabase S3 Gateway)

Keep your existing code, but Supabase's S3 compatibility is limited. **Option A is recommended.**

---

## Environment Variables Summary

### Local Development (.env)
```env
# MinIO (local)
S3_BUCKET_NAME=screenshots
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
MAX_FILE_SIZE=5242880
```

### Production - Render (Environment Variables)

**If using Supabase Client (Option A)**:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
S3_BUCKET_NAME=screenshots
MAX_FILE_SIZE=5242880
```

**If using S3 compatibility (Option B)**:
```env
S3_BUCKET_NAME=screenshots
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=<project-ref>
S3_SECRET_ACCESS_KEY=<service-role-key>
S3_ENDPOINT=https://xxxxx.supabase.co/storage/v1/s3
S3_PUBLIC_URL=https://xxxxx.supabase.co/storage/v1/object/public/screenshots
S3_FORCE_PATH_STYLE=true
MAX_FILE_SIZE=5242880
```

---

## Deployment Steps

### 1. Choose Your Approach

**Recommended**: Use Option A (Supabase Client) - more reliable

### 2. Update Code (If using Option A)

```bash
cd trading-backend

# Install Supabase client
npm install @supabase/supabase-js

# Create new service file (copy code from above)
# Update screenshot.service.ts to use new service
```

### 3. Commit & Push

```bash
git add .
git commit -m "Add Supabase storage for screenshots"
git push origin main
```

### 4. Configure Render

1. Add environment variables (see above)
2. Render will auto-deploy

### 5. Run Migration

In Render Shell or update build command:
```bash
npx prisma migrate deploy
```

### 6. Test Upload

```bash
# Get token
TOKEN=$(curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}' | jq -r '.token')

# Upload screenshot
curl -X POST https://your-app.onrender.com/api/screenshots/upload/trade-123 \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@test.png"
```

---

## Verify in Supabase

1. Supabase Dashboard → **Storage** → `screenshots` bucket
2. You should see folder structure:
   ```
   screenshots/
     user-id/
       uuid-timestamp.jpg
       uuid-timestamp-thumb.webp
   ```
3. Click on file → Copy URL → Test in browser

---

## Cost & Limits

### Free Tier (No Credit Card)
- **Storage**: 1GB (~1000-2000 screenshots)
- **Bandwidth**: 2GB/month
- **Requests**: Unlimited

### When You Hit Limits
- **1GB exceeded**: Upgrade to Pro ($25/month) or delete old screenshots
- **2GB bandwidth exceeded**: Images stop loading (resets monthly)

### Monitor Usage
- Supabase Dashboard → **Settings** → **Usage**
- Set up email alerts when approaching limits

---

## Troubleshooting

### Issue: "Invalid JWT" or "Unauthorized"

**Solution**: Make sure you're using **service_role** key (not anon key):
- Dashboard → Settings → API → **service_role** (secret)

### Issue: "Bucket not found"

**Solution**:
1. Verify bucket name is `screenshots` (case-sensitive)
2. Check bucket is public: Storage → Bucket settings → Public = ✅

### Issue: Images not loading (404)

**Solution**:
1. Check file was uploaded: Supabase Storage → Browse files
2. Verify public URL format: `https://xxx.supabase.co/storage/v1/object/public/screenshots/...`
3. Ensure bucket is public

### Issue: "Row level security policy violation"

**Solution**:
1. Storage → Policies
2. Add policy:
   ```sql
   -- Allow public read
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'screenshots');
   ```

---

## Alternative: Store in PostgreSQL (No New Account)

If Supabase seems complex, you can store images in your existing Render PostgreSQL database:

### Pros:
- ✅ No new account needed
- ✅ Works immediately
- ✅ Simple setup

### Cons:
- ⚠️ Database gets large quickly
- ⚠️ Slower performance
- ⚠️ Not ideal for production

### Implementation:

Update Prisma schema:
```prisma
model Screenshot {
  id        String   @id @default(uuid())
  userId    String
  tradeId   String?
  imageData Bytes    // Store image as binary
  fileName  String
  mimeType  String
  fileSize  Int
  createdAt DateTime @default(now())

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  trade Trade? @relation(fields: [tradeId], references: [id], onDelete: Cascade)
}
```

Update screenshot service to store in DB instead of S3.

**Note**: Only use this for prototyping. For production, use Supabase or another storage service.

---

## Recommendation

**Best Choice**: Use **Supabase with Supabase Client (Option A)**
- Free, reliable, no credit card
- Built for this use case
- 15-minute setup

**Quick Start**:
1. Sign up at supabase.com (2 min)
2. Create project + bucket (3 min)
3. Install `@supabase/supabase-js` (1 min)
4. Add credentials to Render (2 min)
5. Deploy & test (5 min)

Total time: ~15 minutes

Need help with any step? Let me know!
