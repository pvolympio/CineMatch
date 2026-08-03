// src/config/redis.js
// Redis client configuration for caching and rate limiting
const Redis = require('ioredis');

let redisClient = null;
const memoryCache = new Map();

const getRedisClient = () => {
  if (redisClient) return redisClient;

  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB) || 0,
    // Try to connect once, then give up quickly so we don't block the API
    retryStrategy: (times) => {
      if (times > 1) return null; // stop retrying
      return 100; // wait 100ms before first retry
    },
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false, // Fail fast if disconnected
  };

  redisClient = new Redis(redisConfig);

  redisClient.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redisClient.on('error', (err) => {
    if (redisClient.status !== 'ready') {
      // Suppress spammy errors, just log once
      if (!redisClient._loggedError) {
        console.warn('⚠️  Redis unavailable, falling back to Memory Cache.');
        redisClient._loggedError = true;
      }
    }
  });

  return redisClient;
};

// Cache helper functions
const cache = {
  async get(key) {
    try {
      const client = getRedisClient();
      if (client.status === 'ready') {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
      }
      // Memory fallback
      const item = memoryCache.get(key);
      if (item && item.expires > Date.now()) return item.value;
      if (item && item.expires <= Date.now()) memoryCache.delete(key);
      return null;
    } catch (error) {
      return null;
    }
  },

  async set(key, value, ttlSeconds = 3600) {
    try {
      const client = getRedisClient();
      if (client.status === 'ready') {
        await client.setex(key, ttlSeconds, JSON.stringify(value));
        return true;
      }
      // Memory fallback
      memoryCache.set(key, { value, expires: Date.now() + (ttlSeconds * 1000) });
      return true;
    } catch (error) {
      return false;
    }
  },

  async del(key) {
    try {
      const client = getRedisClient();
      if (client.status === 'ready') {
        await client.del(key);
        return true;
      }
      // Memory fallback
      memoryCache.delete(key);
      return true;
    } catch (error) {
      return false;
    }
  },

  async exists(key) {
    try {
      const client = getRedisClient();
      if (client.status === 'ready') {
        const result = await client.exists(key);
        return result === 1;
      }
      // Memory fallback
      const item = memoryCache.get(key);
      if (item && item.expires > Date.now()) return true;
      return false;
    } catch (error) {
      return false;
    }
  },
};

module.exports = { getRedisClient, cache };
