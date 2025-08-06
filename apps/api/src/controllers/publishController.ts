import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../services/database';
import { r2Service } from '../services/r2Service';
import { encryptionService } from '../services/encryptionService';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/epub+zip' || file.originalname.endsWith('.epub')) {
      cb(null, true);
    } else {
      cb(new Error('Only EPUB files are allowed'));
    }
  },
});

/**
 * POST /api/publish
 * Upload and encrypt EPUB file
 */
router.post('/', upload.single('epub'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No EPUB file provided' });
    }

    const { title, author, description, coverImage, price, maxSupply } = req.body;

    // Validate required fields
    if (!title || !author || !price || !maxSupply) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, author, price, maxSupply' 
      });
    }

    // Generate unique book ID
    const bookId = uuidv4();
    
    // Generate encryption key
    const encryptionKey = encryptionService.generateEncryptionKey();
    
    // Encrypt the EPUB file
    const encryptedFile = encryptionService.encryptFile(req.file.buffer, encryptionKey);
    
    // Generate R2 object key
    const objectKey = r2Service.generateObjectKey(bookId, req.file.originalname);
    
    // Upload encrypted file to R2
    await r2Service.uploadFile(objectKey, encryptedFile, 'application/octet-stream');
    
    // Store book metadata in database
    const result = await query(`
      INSERT INTO books (
        title, author, description, cover_image, price, max_supply,
        r2_object_key, encryption_key
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      title,
      author,
      description || '',
      coverImage || '',
      parseFloat(price),
      parseInt(maxSupply),
      objectKey,
      encryptionKey
    ]);

    const bookId_db = result.rows[0].id;

    res.status(201).json({
      success: true,
      bookId: bookId_db,
      message: 'Book uploaded and encrypted successfully',
      nextSteps: {
        deployContract: true,
        contractData: {
          title,
          author,
          description: description || '',
          coverImage: coverImage || '',
          price: parseFloat(price),
          maxSupply: parseInt(maxSupply),
          currentSupply: 0,
          isActive: true
        }
      }
    });

  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ 
      error: 'Failed to publish book',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/publish/books
 * Get all published books
 */
router.get('/books', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT id, title, author, description, cover_image, price, 
             max_supply, current_supply, is_active, contract_address, token_id,
             created_at
      FROM books
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      books: result.rows
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

/**
 * PUT /api/publish/books/:id/contract
 * Update book with contract information after deployment
 */
router.put('/books/:id/contract', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { contractAddress, tokenId } = req.body;

    if (!contractAddress || !tokenId) {
      return res.status(400).json({ 
        error: 'Missing contract address or token ID' 
      });
    }

    await query(`
      UPDATE books 
      SET contract_address = $1, token_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [contractAddress, tokenId, id]);

    res.json({
      success: true,
      message: 'Contract information updated successfully'
    });

  } catch (error) {
    console.error('Error updating contract info:', error);
    res.status(500).json({ error: 'Failed to update contract information' });
  }
});

export { router as publishRouter }; 