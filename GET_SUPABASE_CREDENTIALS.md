# How to Get Correct Supabase Credentials

## ⚠️ Your Current Configuration is Wrong

Your `.env` file has:
```env
SUPABASE_URL="https://onsqoretosoqxjtlkanj.storage.supabase.co/storage/v1/s3"  ❌
SUPABASE_SERVICE_ROLE_KEY="bda36323c81ff1d460b723c6ddd37b69"  ❌
```

**Problems:**
- URL includes `/storage/v1/s3` (should be just the project URL)
- Service key is too short (should be a long JWT token)

---

## ✅ How to Get the Correct Credentials

### Step 1: Go to Your Supabase Project

1. Open https://supabase.com/dashboard
2. Click on your project: **onsqoretosoqxjtlkanj**

### Step 2: Get Project URL

1. Click **Settings** (gear icon ⚙️) in the left sidebar
2. Click **API**
3. Look for **Project URL** section
4. Copy the URL that looks like:
   ```
   https://onsqoretosoqxjtlkanj.supabase.co
   ```

   ⚠️ **Important**:
   - Should end with `.supabase.co` (NOT `.storage.supabase.co`)
   - Should NOT have `/storage/v1/s3` at the end

### Step 3: Get Service Role Key

1. Same page (Settings → API)
2. Scroll down to **Project API keys** section
3. Find the key labeled **`service_role`** (secret)
4. Click **Copy** or reveal the value
5. It should be a LONG token starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

   ⚠️ **Important**:
   - Must be the **service_role** key (NOT the **anon** key)
   - Should be 200+ characters long
   - Starts with `eyJhbGc...`

---

## ✅ Update Your `.env` File

Open `trading-backend/.env` and update these lines:

```env
# Supabase Configuration
SUPABASE_URL="https://onsqoretosoqxjtlkanj.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uc3FvcmV0b3NvcXhqdGxrYW5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0..."
S3_BUCKET_NAME="screenshots"
```

**Replace with your actual values from Step 2 and Step 3!**

---

## 🧪 Verify Bucket Exists

1. Supabase Dashboard → **Storage** (left sidebar)
2. Check if bucket **`screenshots`** exists
3. If not, create it:
   - Click **New bucket**
   - Name: `screenshots`
   - **Public bucket**: ✅ **Yes**
   - Click **Create bucket**

---

## 🚀 Test Again

After updating `.env`:

```bash
# Restart your backend
npm run dev

# Should see: "✓ Supabase Storage configured for bucket: screenshots"

# Test upload again
```

---

## 🔍 Quick Checklist

- [ ] `SUPABASE_URL` ends with `.supabase.co` (NOT `.storage.supabase.co`)
- [ ] `SUPABASE_URL` does NOT include `/storage/v1/s3`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` starts with `eyJhbGciOiJI...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is 200+ characters long
- [ ] Bucket `screenshots` exists in Supabase Storage
- [ ] Bucket is set to **Public**

---

## Still Having Issues?

### Error: "Invalid JWT"
- You copied the wrong key. Get the **service_role** key (not anon)

### Error: "Bucket not found"
- Create bucket named exactly `screenshots` (case-sensitive)

### Error: "Bad Request"
- Check SUPABASE_URL doesn't have extra paths
- Verify bucket is set to public

---

## Example of Correct Configuration

```env
# ✅ CORRECT
SUPABASE_URL="https://abcdefghijklmno.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ubyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDQzMTYxNjYsImV4cCI6MTk1OTg5MjE2Nn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
S3_BUCKET_NAME="screenshots"

# ❌ WRONG
SUPABASE_URL="https://abcdefghijklmno.storage.supabase.co/storage/v1/s3"  # Extra path!
SUPABASE_SERVICE_ROLE_KEY="bda36323c81ff1d460b723c6ddd37b69"  # Too short!
```
