import crypto from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32; // 256 bits
  private ivLength = 16; // 128 bits
  private tagLength = 16; // 128 bits

  /**
   * Generate a random AES-256 encryption key
   */
  generateEncryptionKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex');
  }

  /**
   * Encrypt file data using AES-256-GCM
   */
  encryptFile(fileBuffer: Buffer, encryptionKey: string): Buffer {
    try {
      const key = Buffer.from(encryptionKey, 'hex');
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv) as crypto.CipherGCM;
      
      const encrypted = Buffer.concat([
        cipher.update(fileBuffer),
        cipher.final()
      ]);
      
      const tag = cipher.getAuthTag();
      
      // Return IV + Tag + Encrypted Data
      return Buffer.concat([iv, tag, encrypted]);
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt file');
    }
  }

  /**
   * Decrypt file data using AES-256-GCM
   */
  decryptFile(encryptedBuffer: Buffer, encryptionKey: string): Buffer {
    try {
      const key = Buffer.from(encryptionKey, 'hex');
      
      // Extract IV, tag, and encrypted data
      const iv = encryptedBuffer.subarray(0, this.ivLength);
      const tag = encryptedBuffer.subarray(this.ivLength, this.ivLength + this.tagLength);
      const encrypted = encryptedBuffer.subarray(this.ivLength + this.tagLength);
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv) as crypto.DecipherGCM;
      decipher.setAuthTag(tag);
      
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt file');
    }
  }

  /**
   * Generate a random nonce for challenge-response protocol
   */
  generateNonce(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash data for challenge-response verification
   */
  hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export const encryptionService = new EncryptionService(); 