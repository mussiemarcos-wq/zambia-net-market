import { Redis } from "@upstash/redis";

// In-memory fallback cache for local development
const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "Redis: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set, using in-memory cache fallback"
    );
    return null;
  }

  return new Redis({ url, token });
}

const redis = createRedisClient();

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    if (redis) {
      const data = await redis.get<T>(key);
      return data ?? null;
    }

    // In-memory fallback
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value as T;
  } catch (err) {
    console.error(`Cache GET error for key "${key}":`, err);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = 300
): Promise<void> {
  try {
    if (redis) {
      await redis.set(key, value, { ex: ttlSeconds });
      return;
    }

    // In-memory fallback
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  } catch (err) {
    console.error(`Cache SET error for key "${key}":`, err);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key);
      return;
    }

    // In-memory fallback
    memoryCache.delete(key);
  } catch (err) {
    console.error(`Cache DELETE error for key "${key}":`, err);
  }
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  try {
    if (redis) {
      // Use SCAN to find matching keys and delete them
      let cursor = 0;
      do {
        const result = await redis.scan(cursor, { match: pattern, count: 100 });
        cursor = Number(result[0]);
        const keys = result[1];
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } while (cursor !== 0);
      return;
    }

    // In-memory fallback - match simple glob patterns
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*")
      .replace(/\?/g, ".");
    const regex = new RegExp(`^${regexPattern}$`);

    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  } catch (err) {
    console.error(`Cache DELETE PATTERN error for "${pattern}":`, err);
  }
}
