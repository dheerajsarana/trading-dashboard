import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * S3 Service for managing file uploads to S3-compatible storage (AWS S3, MinIO, Cloudflare R2)
 *
 * Environment Variables:
 * - S3_ENDPOINT: S3 endpoint URL (required for MinIO/R2, optional for AWS S3)
 * - S3_REGION: AWS region (default: 'us-east-1')
 * - S3_ACCESS_KEY_ID: Access key ID
 * - S3_SECRET_ACCESS_KEY: Secret access key
 * - S3_BUCKET_NAME: Bucket name for storing files
 * - S3_PUBLIC_URL: Public URL base for accessing files (optional)
 * - S3_FORCE_PATH_STYLE: Use path-style URLs (required for MinIO) (default: 'true')
 */
export class S3Service {
  private client: S3Client;
  private bucketName: string;
  private publicUrlBase: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || 'us-east-1';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE !== 'false'; // Default true for MinIO compatibility

    this.bucketName = process.env.S3_BUCKET_NAME || 'trading-screenshots';
    this.publicUrlBase = process.env.S3_PUBLIC_URL || '';

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('S3 credentials not configured. Set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY environment variables.');
    }

    // Configure S3 client with MinIO/R2 compatibility
    this.client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle, // Required for MinIO, works with S3 too
    });
  }

  /**
   * Upload a file to S3
   * @param buffer File buffer
   * @param key S3 object key (path)
   * @param mimeType File MIME type
   * @returns Promise<void>
   */
  async uploadFile(buffer: Buffer, key: string, mimeType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // Make files publicly readable (adjust ACL based on your setup)
      // ACL: 'public-read', // Uncomment if your bucket supports ACLs
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a file from S3
   * @param key S3 object key (path)
   * @returns Promise<void>
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get public URL for a file
   * @param key S3 object key (path)
   * @returns Public URL
   */
  getPublicUrl(key: string): string {
    // If custom public URL is configured, use it
    if (this.publicUrlBase) {
      return `${this.publicUrlBase}/${key}`;
    }

    // Otherwise construct URL from endpoint
    const endpoint = process.env.S3_ENDPOINT;
    if (endpoint) {
      // Path-style URL for MinIO/custom endpoints
      return `${endpoint}/${this.bucketName}/${key}`;
    }

    // AWS S3 standard URL format
    const region = process.env.S3_REGION || 'us-east-1';
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }

  /**
   * Get the bucket name
   * @returns Bucket name
   */
  getBucketName(): string {
    return this.bucketName;
  }
}

// Export singleton instance
export const s3Service = new S3Service();
