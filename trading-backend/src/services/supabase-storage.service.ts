import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Storage Service for managing file uploads
 *
 * Uses Supabase Storage for both local development and production
 * Free tier: 1GB storage, no credit card required
 *
 * Environment Variables:
 * - SUPABASE_URL: Supabase project URL (e.g., https://xxxxx.supabase.co)
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (secret)
 * - S3_BUCKET_NAME: Bucket name for storing files (default: 'screenshots')
 */
export class SupabaseStorageService {
  private supabase: SupabaseClient | null = null;
  private bucketName: string;
  private isSupabaseConfigured: boolean = false;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucketName = process.env.S3_BUCKET_NAME || 'screenshots';

    // Check if Supabase is configured
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      this.isSupabaseConfigured = true;
      console.log('✓ Supabase Storage configured for bucket:', this.bucketName);
    } else {
      throw new Error(
        'Supabase Storage not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
      );
    }
  }

  /**
   * Upload a file to Supabase Storage
   * @param buffer File buffer
   * @param key Storage path (e.g., "screenshots/user-id/file.jpg")
   * @param mimeType File MIME type
   * @returns Promise<void>
   */
  async uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(key, buffer, {
          contentType: mimeType,
          upsert: false, // Prevent overwriting existing files
          cacheControl: '3600', // Cache for 1 hour
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Failed to upload file to Supabase: ${error.message}`);
      }

      console.log(`✓ File uploaded: ${key}`);
    } catch (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file to Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a file from Supabase Storage
   * @param key Storage path (e.g., "screenshots/user-id/file.jpg")
   * @returns Promise<void>
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase storage not configured.');
    }

    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([key]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Failed to delete file from Supabase: ${error.message}`);
      }

      console.log(`✓ File deleted: ${key}`);
    } catch (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete file from Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get public URL for a file
   * @param key Storage path (e.g., "screenshots/user-id/file.jpg")
   * @returns Public URL
   */
  getPublicUrl(key: string): string {
    if (!this.supabase) {
      throw new Error('Supabase storage not configured.');
    }

    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(key);

    return data.publicUrl;
  }

  /**
   * Get the bucket name
   * @returns Bucket name
   */
  getBucketName(): string {
    return this.bucketName;
  }

  /**
   * Check if Supabase is configured
   * @returns True if Supabase credentials are set
   */
  isConfigured(): boolean {
    return this.isSupabaseConfigured;
  }
}

// Export singleton instance
export const supabaseStorageService = new SupabaseStorageService();
