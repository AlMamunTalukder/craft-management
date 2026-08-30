// Redis client configuration for server-side usage
import { createClient, RedisClientType } from 'redis';

declare global {
  // eslint-disable-next-line no-var
  var redisClient: RedisClientType | undefined;
  // eslint-disable-next-line no-var
  var redisConnectionPromise: Promise<void> | undefined;
}

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

let redisClient: RedisClientType;

const createRedisClient = () => {
  const client = createClient({
    url: redisUrl,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: false,
    },
  });

  client.on('error', (err) => {
    // Redis being unavailable should never crash the application.
    console.error('Redis Client Error:', err.message);
  });

  return client;
};

// Keep one Redis client during development hot reloads.
if (process.env.NODE_ENV === 'production') {
  redisClient = createRedisClient();
} else {
  if (!global.redisClient) {
    global.redisClient = createRedisClient();
  }

  redisClient = global.redisClient;
}

/**
 * Connect to Redis only when actually needed.
 *
 * This is intentionally NOT called when this module is imported.
 * Therefore `next build` does not require Redis to be running.
 */
export const ensureRedisConnection = async (): Promise<boolean> => {
  try {
    if (redisClient.isReady) {
      return true;
    }

    if (global.redisConnectionPromise) {
      await global.redisConnectionPromise;
      return redisClient.isReady;
    }

    global.redisConnectionPromise = redisClient
      .connect()
      .then(() => undefined)
      .catch((error) => {
        console.error(
          'Redis connection unavailable:',
          error instanceof Error ? error.message : error
        );
      })
      .finally(() => {
        global.redisConnectionPromise = undefined;
      });

    await global.redisConnectionPromise;

    return redisClient.isReady;
  } catch (error) {
    console.error(
      'Redis connection error:',
      error instanceof Error ? error.message : error
    );

    return false;
  }
};

export const getRedisClient = () => redisClient;

// --------------------------------------------------
// Cache helpers
// --------------------------------------------------

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const connected = await ensureRedisConnection();

      if (!connected) {
        return null;
      }

      const data = await redisClient.get(key);

      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  async set(
    key: string,
    value: unknown,
    ttlSeconds = 3600
  ): Promise<void> {
    try {
      const connected = await ensureRedisConnection();

      if (!connected) {
        return;
      }

      await redisClient.setEx(
        key,
        ttlSeconds,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      const connected = await ensureRedisConnection();

      if (!connected) {
        return;
      }

      await redisClient.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  },

  async delPattern(pattern: string): Promise<void> {
    try {
      const connected = await ensureRedisConnection();

      if (!connected) {
        return;
      }

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
      const connected = await ensureRedisConnection();

      if (!connected) {
        return false;
      }

      return (await redisClient.exists(key)) === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },
};

// --------------------------------------------------
// Session helper
// --------------------------------------------------

export const sessionCache = {
  async get(sessionId: string) {
    return cache.get(`session:${sessionId}`);
  },

  async set(
    sessionId: string,
    data: unknown,
    ttlSeconds = 86400
  ) {
    return cache.set(
      `session:${sessionId}`,
      data,
      ttlSeconds
    );
  },

  async destroy(sessionId: string) {
    return cache.del(`session:${sessionId}`);
  },
};

// --------------------------------------------------
// Rate limiting helper
// --------------------------------------------------

export const rateLimit = {
  async check(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const now = Math.floor(Date.now() / 1000);

    const windowKey = `ratelimit:${key}:${Math.floor(
      now / windowSeconds
    )}`;

    try {
      const connected = await ensureRedisConnection();

      // If Redis is unavailable, fail open.
      // This means the application remains usable.
      if (!connected) {
        return {
          allowed: true,
          remaining: limit,
          resetTime: now + windowSeconds,
        };
      }

      const current = await redisClient.incr(windowKey);

      if (current === 1) {
        await redisClient.expire(
          windowKey,
          windowSeconds
        );
      }

      const ttl = await redisClient.ttl(windowKey);

      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime: now + ttl,
      };
    } catch (error) {
      console.error('Rate limit error:', error);

      // Fail open if Redis is unavailable.
      return {
        allowed: true,
        remaining: limit,
        resetTime: now + windowSeconds,
      };
    }
  },
};

export default redisClient;