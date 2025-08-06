import { Pool, PoolClient } from 'pg';

let pool: Pool;

export async function initializeDatabase(): Promise<void> {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Test the connection
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log('Database connection successful');
    
    // Create tables if they don't exist
    await createTables();
  } finally {
    client.release();
  }
}

async function createTables(): Promise<void> {
  const client = await pool.connect();
  try {
    // Books table
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image VARCHAR(500),
        price DECIMAL(10, 2) NOT NULL,
        max_supply INTEGER NOT NULL,
        current_supply INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        contract_address VARCHAR(42),
        token_id INTEGER,
        r2_object_key VARCHAR(500) NOT NULL,
        encryption_key VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Key requests table for audit trail
    await client.query(`
      CREATE TABLE IF NOT EXISTS key_requests (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES books(id),
        requester_address VARCHAR(42) NOT NULL,
        token_id INTEGER NOT NULL,
        contract_address VARCHAR(42) NOT NULL,
        request_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN DEFAULT false,
        error_message TEXT
      )
    `);

    console.log('Database tables created/verified');
  } finally {
    client.release();
  }
}

export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

export async function query(text: string, params?: any[]): Promise<any> {
  const client = await getClient();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
  }
} 