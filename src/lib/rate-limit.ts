import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitType = "general" | "auth";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const generalLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      prefix: "ratelimit:general",
    })
  : null;

const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "ratelimit:auth",
    })
  : null;

export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = "general"
): Promise<{ success: boolean; remaining: number }> {
  const limiter = type === "auth" ? authLimiter : generalLimiter;

  if (!limiter) {
    // Graceful fallback when Redis is not configured
    return { success: true, remaining: -1 };
  }

  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
