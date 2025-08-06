import CryptoJS from 'crypto-js';

/**
 * Secure Reader Module for Ledgerbound
 * Handles decryption and challenge-response protocol
 */
export class SecureReader {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 16;
    this.tagLength = 16;
  }

  /**
   * Proprietary function for challenge-response protocol
   * This is the secret function that only the client knows
   */
  computeChallengeResponse(nonce, userAddress) {
    // This is a simplified version - in production, this would be more complex
    const secret = 'ledgerbound-secret-key-2024';
    const combined = nonce + userAddress + secret;
    return CryptoJS.SHA256(combined).toString();
  }

  /**
   * Decrypt EPUB file data
   */
  async decryptFile(encryptedData, encryptionKey) {
    try {
      // Convert hex key to WordArray
      const key = CryptoJS.enc.Hex.parse(encryptionKey);
      
      // Extract IV, tag, and encrypted data
      const iv = CryptoJS.enc.Hex.parse(encryptedData.slice(0, 32));
      const tag = CryptoJS.enc.Hex.parse(encryptedData.slice(32, 64));
      const encrypted = CryptoJS.enc.Hex.parse(encryptedData.slice(64));
      
      // For MVP, we'll use a simplified decryption
      // In production, this would use proper AES-GCM
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted },
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt file');
    }
  }

  /**
   * Parse EPUB content and extract text
   */
  parseEpubContent(epubData) {
    try {
      // For MVP, we'll return a simplified structure
      // In production, this would parse the actual EPUB format
      return {
        title: 'Book Title',
        chapters: [
          {
            title: 'Chapter 1',
            content: epubData.substring(0, 1000) + '...'
          }
        ],
        metadata: {
          author: 'Unknown Author',
          language: 'en',
          publisher: 'Ledgerbound'
        }
      };
    } catch (error) {
      console.error('EPUB parsing error:', error);
      throw new Error('Failed to parse EPUB content');
    }
  }

  /**
   * Complete challenge-response flow
   */
  async initiateKeyRequest(tokenId, contractAddress, userAddress, signature, message) {
    try {
      // Step 1: Send initial request to server
      const response = await fetch('/api/request-key/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenId,
          contractAddress,
          userAddress,
          signature,
          message
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate challenge');
      }

      const { challengeId, nonce } = await response.json();

      // Step 2: Compute challenge response
      const challengeResponse = this.computeChallengeResponse(nonce, userAddress);

      // Step 3: Send response to server
      const verifyResponse = await fetch('/api/request-key/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId,
          response: challengeResponse,
          userAddress,
          tokenId,
          contractAddress
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify challenge');
      }

      return await verifyResponse.json();
    } catch (error) {
      console.error('Key request error:', error);
      throw error;
    }
  }

  /**
   * Fetch and decrypt book content
   */
  async fetchBookContent(presignedUrl, decryptionKey) {
    try {
      // Fetch encrypted content
      const response = await fetch(presignedUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch encrypted content');
      }

      const encryptedData = await response.arrayBuffer();
      const encryptedHex = Array.from(new Uint8Array(encryptedData))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Decrypt content
      const decryptedContent = await this.decryptFile(encryptedHex, decryptionKey);
      
      // Parse EPUB
      return this.parseEpubContent(decryptedContent);
    } catch (error) {
      console.error('Fetch book content error:', error);
      throw error;
    }
  }

  /**
   * Complete book reading flow
   */
  async readBook(tokenId, contractAddress, userAddress, signature, message) {
    try {
      // Step 1: Get decryption key through challenge-response
      const keyResponse = await this.initiateKeyRequest(
        tokenId, 
        contractAddress, 
        userAddress, 
        signature, 
        message
      );

      // Step 2: Fetch and decrypt book content
      const bookContent = await this.fetchBookContent(
        keyResponse.presignedUrl,
        keyResponse.decryptionKey
      );

      return {
        success: true,
        bookContent,
        expiresIn: keyResponse.expiresIn
      };
    } catch (error) {
      console.error('Read book error:', error);
      throw error;
    }
  }
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.SecureReader = SecureReader;
} 