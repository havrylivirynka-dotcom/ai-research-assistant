import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const limiters = new Map<string, Ratelimit>();

function getLimiter(key: string, requests: number, window: `${number} ${"s" | "m" | "h"}`) {
  const cached = limiters.get(key);
  if (cached) return cached;

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:${key}`,
  });
  limiters.set(key, limiter);
  return limiter;
}

/**
 * Sliding-window rate limit backed by Upstash Redis. When Upstash isn't
 * configured (e.g. local development), this is a no-op so the app still
 * works without an Upstash account — production must set the env vars.
 */
export async function rateLimit(
  key: string,
  identifier: string,
  requests: number,
  window: `${number} ${"s" | "m" | "h"}`,
): Promise<{ success: boolean; remaining: number }> {
  if (!isConfigured) {
    return { success: true, remaining: requests };
  }

  const limiter = getLimiter(key, requests, window);
  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
