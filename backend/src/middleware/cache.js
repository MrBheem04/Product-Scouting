const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisClient = null;
let useRedis = false;

// Initialize Redis Client if possible
(async () => {
  try {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 2000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.log('[Cache] Redis reconnect failed. Falling back to local memory cache.');
            useRedis = false;
            return new Error('Redis connection lost');
          }
          return 1000;
        }
      }
    });

    redisClient.on('error', (err) => {
      // Silence continuous connection errors
    });

    await redisClient.connect();
    useRedis = true;
    console.log('[Cache] Redis client connected successfully for API caching.');
  } catch (err) {
    console.log('[Cache] Redis client could not connect. Running API cache in fallback memory-map mode.');
    useRedis = false;
  }
})();

// Simple Local In-Memory Cache Fallback
const memoryCache = new Map();

// Helper to clean expired items from memory cache
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (value.expiresAt < now) {
      memoryCache.delete(key);
    }
  }
}, 30000); // Check every 30 seconds

/**
 * Cache middleware for Express routes.
 * @param {number} durationSeconds - Cache duration in seconds
 */
const cacheMiddleware = (durationSeconds = 60) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    // 1. Try fetching from Redis if active
    if (useRedis && redisClient && redisClient.isOpen) {
      try {
        const cachedResponse = await redisClient.get(key);
        if (cachedResponse) {
          res.setHeader('X-Cache', 'HIT-Redis');
          res.setHeader('Content-Type', 'application/json');
          return res.send(cachedResponse);
        }
      } catch (err) {
        // Fallback to memory cache silently on error
      }
    }

    // 2. Try fetching from Local Memory Cache
    const localCached = memoryCache.get(key);
    if (localCached && localCached.expiresAt > Date.now()) {
      res.setHeader('X-Cache', 'HIT-Local');
      res.setHeader('Content-Type', 'application/json');
      return res.send(localCached.body);
    }

    // 3. Capture the original response json method to save it
    const originalJson = res.json;
    res.json = function (body) {
      res.json = originalJson; // Restore original json function
      
      const bodyStr = JSON.stringify(body);
      const expiresAt = Date.now() + durationSeconds * 1000;

      // Save to Redis if active
      if (useRedis && redisClient && redisClient.isOpen) {
        redisClient.setEx(key, durationSeconds, bodyStr).catch(() => {});
      }

      // Save to Local Memory Cache
      memoryCache.set(key, {
        body: bodyStr,
        expiresAt
      });

      res.setHeader('X-Cache', 'MISS');
      return originalJson.call(this, body);
    };

    next();
  };
};

module.exports = {
  cacheMiddleware
};
