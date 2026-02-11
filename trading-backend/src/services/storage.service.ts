import { supabaseStorageService } from './supabase-storage.service';

/**
 * Storage Service
 *
 * Uses Supabase Storage for both local development and production
 * Free tier: 1GB storage, no credit card required
 *
 * Required environment variables:
 * - SUPABASE_URL: Your Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (secret)
 * - S3_BUCKET_NAME: Bucket name (default: 'screenshots')
 */

// Export Supabase storage service as the default storage
export const storageService = supabaseStorageService;
