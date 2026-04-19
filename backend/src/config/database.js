// src/config/database.js
// PostgreSQL connection pool configuration using the 'pg' library
const { Pool } = require('pg');

// Create a connection pool - more efficient than individual connections
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'cinematch',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  // Pool settings for production
  max: 20,           // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,  // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Fail fast if can't connect
});

// Helper to run queries safely
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log(`⚠️  Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

// Get a client from the pool (for transactions)
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };
