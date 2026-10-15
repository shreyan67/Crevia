import Redis from "ioredis";

// Cache Keys
export const CACHE_KEYS = {
  ADMIN_DASHBOARD_SUMMARY: "admin:dashboard:summary",
  PRODUCT_LIST_PREFIX: "catalog:products:",
};

// In-memory fallback if Redis is unavailable
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (process.env.NODE_ENV === "test") {
    return null; // Keep tests isolated
  }

  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 1000,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on("error", (err) => {
      // Graceful warning without crashing the app if Redis is not running locally
      console.warn("[Redis] Connection notice: Falling back to in-memory/direct cache layer.", err.message);
    });

    redisClient.connect().catch(() => {
      // Silence uncaught rejection if redis isn't running on localhost
    });

    return redisClient;
  } catch (e) {
    return null;
  }
}

/**
 * Get value from Redis or in-memory fallback
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();

  if (redis && redis.status === "ready") {
    try {
      const data = await redis.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch {
      // fallback to memory
    }
  }

  // Memory fallback
  const cached = memoryCache.get(key);
  if (cached) {
    if (Date.now() < cached.expiresAt) {
      return cached.value as T;
    }
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Set value in Redis with TTL (default 10 minutes)
 */
export async function setCache<T>(key: string, value: T, ttlSeconds = 600): Promise<void> {
  const redis = getRedisClient();

  if (redis && redis.status === "ready") {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return;
    } catch {
      // fallback to memory
    }
  }

  // Memory fallback
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Explicit Cache Invalidation
 */
export async function invalidateCache(key: string): Promise<void> {
  const redis = getRedisClient();

  if (redis && redis.status === "ready") {
    try {
      await redis.del(key);
    } catch (e) {
      console.error("[Redis] Failed to invalidate key:", key, e);
    }
  }

  memoryCache.delete(key);
}

/**
 * Invalidate all dashboard metrics explicitly on order state changes
 */
export async function invalidateDashboardCache(): Promise<void> {
  await invalidateCache(CACHE_KEYS.ADMIN_DASHBOARD_SUMMARY);
}
