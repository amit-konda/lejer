import { Router, Request, Response } from 'express';
import { query } from '../services/database';
import { blockchainService } from '../services/blockchainService';
import { r2Service } from '../services/r2Service';
import { encryptionService } from '../services/encryptionService';

const router = Router();

// Store pending challenges (in production, use Redis)
const pendingChallenges = new Map<string, { nonce: string; timestamp: number }>();

/**
 * POST /api/request-key/initiate
 * Step 1: Verify NFT ownership and send challenge
 */
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const { tokenId, contractAddress, userAddress, signature, message } = req.body;

    // Validate required fields
    if (!tokenId || !contractAddress || !userAddress || !signature || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: tokenId, contractAddress, userAddress, signature, message' 
      });
    }

    // Verify wallet signature
    if (!blockchainService.verifySignature(message, signature, userAddress)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Verify NFT ownership
    const isOwner = await blockchainService.verifyOwnership(tokenId, userAddress);
    if (!isOwner) {
      return res.status(403).json({ error: 'User does not own this NFT' });
    }

    // Get book from database
    const bookResult = await query(`
      SELECT id, r2_object_key, encryption_key
      FROM books 
      WHERE token_id = $1 AND contract_address = $2
    `, [tokenId, contractAddress]);

    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = bookResult.rows[0];

    // Generate challenge nonce
    const nonce = encryptionService.generateNonce();
    const challengeId = `${userAddress}-${tokenId}-${Date.now()}`;
    
    // Store challenge (expires in 5 minutes)
    pendingChallenges.set(challengeId, {
      nonce,
      timestamp: Date.now()
    });

    // Clean up expired challenges
    const now = Date.now();
    for (const [key, value] of pendingChallenges.entries()) {
      if (now - value.timestamp > 5 * 60 * 1000) {
        pendingChallenges.delete(key);
      }
    }

    res.json({
      success: true,
      challengeId,
      nonce,
      message: 'Challenge generated successfully'
    });

  } catch (error) {
    console.error('Initiate challenge error:', error);
    res.status(500).json({ error: 'Failed to initiate challenge' });
  }
});

/**
 * POST /api/request-key/verify
 * Step 2: Verify challenge response and provide decryption key
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { challengeId, response, userAddress, tokenId, contractAddress } = req.body;

    // Validate required fields
    if (!challengeId || !response || !userAddress || !tokenId || !contractAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: challengeId, response, userAddress, tokenId, contractAddress' 
      });
    }

    // Get stored challenge
    const challenge = pendingChallenges.get(challengeId);
    if (!challenge) {
      return res.status(400).json({ error: 'Invalid or expired challenge' });
    }

    // Verify challenge hasn't expired (5 minutes)
    if (Date.now() - challenge.timestamp > 5 * 60 * 1000) {
      pendingChallenges.delete(challengeId);
      return res.status(400).json({ error: 'Challenge expired' });
    }

    // Verify the response (this would be a proprietary function in the client)
    // For MVP, we'll use a simple hash verification
    const expectedResponse = encryptionService.hashData(challenge.nonce + userAddress);
    if (response !== expectedResponse) {
      return res.status(401).json({ error: 'Invalid challenge response' });
    }

    // Get book from database
    const bookResult = await query(`
      SELECT id, r2_object_key, encryption_key
      FROM books 
      WHERE token_id = $1 AND contract_address = $2
    `, [tokenId, contractAddress]);

    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const book = bookResult.rows[0];

    // Generate pre-signed URL for encrypted file
    const presignedUrl = await r2Service.generatePresignedUrl(book.r2_object_key, 3600); // 1 hour

    // Log the successful key request
    await query(`
      INSERT INTO key_requests (
        book_id, requester_address, token_id, contract_address, success
      ) VALUES ($1, $2, $3, $4, $5)
    `, [book.id, userAddress, tokenId, contractAddress, true]);

    // Clean up the challenge
    pendingChallenges.delete(challengeId);

    res.json({
      success: true,
      decryptionKey: book.encryption_key,
      presignedUrl,
      expiresIn: 3600,
      message: 'Access granted successfully'
    });

  } catch (error) {
    console.error('Verify challenge error:', error);
    res.status(500).json({ error: 'Failed to verify challenge' });
  }
});

/**
 * GET /api/request-key/books/:tokenId
 * Get book metadata for a specific token
 */
router.get('/books/:tokenId', async (req: Request, res: Response) => {
  try {
    const { tokenId } = req.params;
    const { contractAddress } = req.query;

    if (!contractAddress) {
      return res.status(400).json({ error: 'Contract address required' });
    }

    // Get book metadata from blockchain
    const blockchainMetadata = await blockchainService.getBookMetadata(parseInt(tokenId));

    // Get additional data from database
    const dbResult = await query(`
      SELECT id, current_supply, created_at
      FROM books 
      WHERE token_id = $1 AND contract_address = $2
    `, [tokenId, contractAddress]);

    if (dbResult.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const dbData = dbResult.rows[0];

    res.json({
      success: true,
      book: {
        ...blockchainMetadata,
        id: dbData.id,
        currentSupply: dbData.current_supply,
        createdAt: dbData.created_at
      }
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

export { router as keyRequestRouter }; 