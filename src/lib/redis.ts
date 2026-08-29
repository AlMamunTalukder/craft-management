// Redis client configuration for server-side usage
import { createClient, RedisClientType } from 'redis';

// Global variable to hold the Redis client
declare global {
  var redisClient: RedisClientType | undefined;
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: RedisClientType;

if (process.env.NODE_ENV === 'production') {
  redisClient = createClient({ url: redisUrl });
  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  await redisClient.connect();
} else {
  // In development, use a global variable to preserve the client across hot reloads
  if (!global.redisClient) {
    global.redisClient = createClient({ url: redisUrl });
    global.redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    await global.redisClient.connect();
  }
  redisClient = global.redisClient;
}

export const getRedisClient = () => redisClient;

// Cache helper functions
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Redis DEL PATTERN error:', error);
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      return (await redisClient.exists(key)) === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },
};

// Session helper (for NextAuth or custom sessions)
export const sessionCache = {
  async get(sessionId: string) {
    return cache.get(`session:${sessionId}`);
  },

  async set(sessionId: string, data: unknown, ttlSeconds = 86400) {
    return cache.set(`session:${sessionId}`, data, ttlSeconds);
  },

  async destroy(sessionId: string) {
    return cache.del(`session:${sessionId}`);
  },
};

// Rate limiting helper
export const rateLimit = {
  async check(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `ratelimit:${key}:${Math.floor(now / windowSeconds)}`;

    try {
      const current = await redisClient.incr(windowKey);
      if (current === 1) {
        await redisClient.expire(windowKey, windowSeconds);
      }

      const ttl = await redisClient.ttl(windowKey);
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime: now + ttl,
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      return { allowed: true, remaining: limit, resetTime: now + windowSeconds };
    }
  },
};

export default redisClient;