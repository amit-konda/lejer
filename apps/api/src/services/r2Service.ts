import AWS from 'aws-sdk';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// Configure AWS SDK for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export class R2Service {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME!;
  }

  /**
   * Upload encrypted file to R2
   */
  async uploadFile(
    objectKey: string,
    fileBuffer: Buffer,
    contentType: string = 'application/octet-stream'
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: contentType,
    });

    try {
      await s3Client.send(command);
      return objectKey;
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw new Error('Failed to upload file to R2');
    }
  }

  /**
   * Generate pre-signed URL for downloading encrypted file
   */
  async generatePresignedUrl(objectKey: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: objectKey,
    });

    try {
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return presignedUrl;
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  /**
   * Generate unique object key for book files
   */
  generateObjectKey(bookId: string, originalFilename: string): string {
    const timestamp = Date.now();
    const extension = originalFilename.split('.').pop() || 'epub';
    return `books/${bookId}/${timestamp}.${extension}`;
  }
}

export const r2Service = new R2Service(); 