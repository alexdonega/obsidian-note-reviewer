/**
 * Rate Limiter Module for Supabase Edge Functions (Deno)
 *
 * Provides rate limiting protection using Upstash Redis in production
 * with an in-memory sliding window fallback for development.
 */

// Deno-compatible imports from esm.sh
import { Ratelimit } from 'https://esm.sh/@upstash/ratelimit@2';
import { Redis } from 'https://esm.sh/@upstash/redis@1';

/**
 * Rate limit result returned by checkRateLimit
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Unix timestamp (seconds) when the rate limit resets */
  reset: number;
  /** Maximum requests allowed in the window */
  limit: number;
}

/**
 * Rate limit type determines the throttling configuration
 */
export type RateLimitType = 'batch' | 'process';

/**
 * Rate limit configurations per operation type
 * - batch: 5 requests per minute (high-impact bulk operations)
 * - process: 20 requests per minute (single-note operations)
 */
const RATE_LIMIT_CONFIG: Record<RateLimitType, { requests: number; windowMs: number }> = {
  batch: { requests: 5, windowMs: 60_000 },    // 5 req/min
  process: { requests: 20, windowMs: 60_000 }, // 20 req/min
};

/**
 * In-memory sliding window storage for development fallback
 * Key: `${identifier}:${type}`
 * Value: Array of request timestamps
 */
const inMemoryStore = new Map<string, number[]>();

/**
 * Cached Upstash rate limiters by type
 */
const rateLimiters = new Map<RateLimitType, Ratelimit>();

/**
 * Create or retrieve an Upstash rate limiter for the given type
 */
function getUpstashRateLimiter(type: RateLimitType): Ratelimit | null {
  const upstashUrl = Deno.env.get('UPSTASH_REDIS_URL');
  const upstashToken = Deno.env.get('UPSTASH_REDIS_TOKEN');

  if (!upstashUrl || !upstashToken) {
    return null;
  }

  if (rateLimiters.has(type)) {
    return rateLimiters.get(type)!;
  }

  const redis = new Redis({
    url: upstashUrl,
    token: upstashToken,
  });

  const config = RATE_LIMIT_CONFIG[type];
  const windowSizeSeconds = Math.floor(config.windowMs / 1000);

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, `${windowSizeSeconds} s`),
    analytics: true,
    prefix: `@edge-functions/ratelimit:${type}`,
  });

  rateLimiters.set(type, limiter);
  return limiter;
}

/**
 * In-memory sliding window rate limiter for development
 * Implements a true sliding window algorithm
 */
function checkInMemoryRateLimit(identifier: string, type: RateLimitType): RateLimitResult {
  const config = RATE_LIMIT_CONFIG[type];
  const key = `${identifier}:${type}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Get existing timestamps and filter out expired ones
  let timestamps = inMemoryStore.get(key) || [];
  timestamps = timestamps.filter((ts) => ts > windowStart);

  const remaining = Math.max(0, config.requests - timestamps.length);
  const reset = Math.ceil((now + config.windowMs) / 1000);

  if (timestamps.length >= config.requests) {
    // Rate limit exceeded
    inMemoryStore.set(key, timestamps);
    return {
      success: false,
      remaining: 0,
      reset,
      limit: config.requests,
    };
  }

  // Add current request timestamp
  timestamps.push(now);
  inMemoryStore.set(key, timestamps);

  return {
    success: true,
    remaining: remaining - 1,
    reset,
    limit: config.requests,
  };
}

/**
 * Check rate limit for a given identifier and operation type
 *
 * @param identifier - Unique identifier (typically user ID)
 * @param type - Rate limit type ('batch' or 'process')
 * @returns Rate limit result with success status and metadata
 *
 * @example
 * ```ts
 * const result = await checkRateLimit(user.id, 'batch');
 * if (!result.success) {
 *   return createRateLimitResponse(result);
 * }
 * ```
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType
): Promise<RateLimitResult> {
  const upstashLimiter = getUpstashRateLimiter(type);
  const config = RATE_LIMIT_CONFIG[type];

  // Production: Use Upstash Redis
  if (upstashLimiter) {
    const result = await upstashLimiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: Math.ceil(result.reset / 1000), // Convert to seconds
      limit: config.requests,
    };
  }

  // Development fallback: In-memory sliding window
  return checkInMemoryRateLimit(identifier, type);
}

/**
 * Get rate limit configuration for a given type
 */
export function getRateLimitConfig(type: RateLimitType): { requests: number; windowMs: number } {
  return RATE_LIMIT_CONFIG[type];
}

/**
 * CORS headers matching the existing edge functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Create a standardized 429 Rate Limit Exceeded response
 *
 * Includes proper CORS headers and rate limit information headers:
 * - Retry-After: Seconds until the rate limit resets
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Requests remaining in current window
 * - X-RateLimit-Reset: Unix timestamp when the limit resets
 *
 * @param result - Rate limit result from checkRateLimit
 * @returns Response with 429 status and appropriate headers
 *
 * @example
 * ```ts
 * const result = await checkRateLimit(user.id, 'batch');
 * if (!result.success) {
 *   return createRateLimitResponse(result);
 * }
 * ```
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const now = Math.ceil(Date.now() / 1000);
  const retryAfter = Math.max(1, result.reset - now);

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.reset),
      },
    }
  );
}
