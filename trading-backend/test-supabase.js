// Test Supabase Storage Configuration
// Run: node test-supabase.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.S3_BUCKET_NAME || 'screenshots';

console.log('🔍 Testing Supabase Configuration...\n');

console.log('Configuration:');
console.log('  SUPABASE_URL:', supabaseUrl);
console.log('  BUCKET_NAME:', bucketName);
console.log('  KEY LENGTH:', supabaseKey?.length, 'chars\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  try {
    // 1. Check if bucket exists
    console.log('1️⃣  Checking if bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }

    const bucket = buckets.find(b => b.id === bucketName);
    if (!bucket) {
      console.error('❌ Bucket not found:', bucketName);
      console.log('Available buckets:', buckets.map(b => b.id).join(', '));
      return;
    }

    console.log('✅ Bucket exists:', bucketName);
    console.log('   Public:', bucket.public ? '✅ Yes' : '❌ No (This is the problem!)');
    console.log('   File size limit:', bucket.file_size_limit || 'unlimited', '\n');

    // 2. List files in bucket
    console.log('2️⃣  Listing files in bucket...');
    const { data: files, error: filesError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 10 });

    if (filesError) {
      console.error('❌ Error listing files:', filesError.message);
      return;
    }

    console.log('✅ Found', files.length, 'folders/files in bucket\n');

    // 3. Test public URL generation
    if (files.length > 0) {
      console.log('3️⃣  Testing public URL...');
      const firstFolder = files[0].name;
      const { data: folderFiles } = await supabase.storage
        .from(bucketName)
        .list(firstFolder);

      if (folderFiles && folderFiles.length > 0) {
        const testFile = `${firstFolder}/${folderFiles[0].name}`;
        const { data: publicUrl } = supabase.storage
          .from(bucketName)
          .getPublicUrl(testFile);

        console.log('✅ Sample public URL:');
        console.log('  ', publicUrl.publicUrl);
        console.log('\n📝 Test this URL in your browser!\n');
      }
    }

    // 4. Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!bucket.public) {
      console.log('⚠️  ACTION REQUIRED:');
      console.log('   Your bucket is NOT public!');
      console.log('   Go to Supabase Dashboard → Storage → screenshots');
      console.log('   Click ⋮ → Edit bucket → Enable "Public bucket"');
    } else {
      console.log('✅ Configuration looks good!');
      console.log('   If images still don\'t load, check:');
      console.log('   1. Browser console for CORS errors');
      console.log('   2. Supabase Storage policies (should allow public SELECT)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testStorage();
