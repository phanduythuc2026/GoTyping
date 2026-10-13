import { NextRequest } from "next/server";

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store
declare global {
  var __gotyping_rate_limit_store: Map<string, RateLimitRecord> | undefined;
}

function getStore(): Map<string, RateLimitRecord> {
  if (!globalThis.__gotyping_rate_limit_store) {
    globalThis.__gotyping_rate_limit_store = new Map();
  }
  return globalThis.__gotyping_rate_limit_store;
}

/**
 * Extracts client IP safely from request headers.
 * Takes the first valid non-private IP from x-forwarded-for if present,
 * or falls back to x-real-ip / remote address.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0] && ips[0].length > 0) {
      return ips[0];
    }
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim().length > 0) {
    return realIp.trim();
  }

  return "127.0.0.1";
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Applies sliding window rate limiting.
 * @param key Unique identifier (e.g. `parse_article:${ip}`)
 * @param limit Max allowed requests within window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const store = getStore();
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = store.get(key);
  if (!record) {
    record = { timestamps: [] };
    store.set(key, record);
  }

  // Filter out expired timestamps
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  const count = record.timestamps.length;
  const oldestTimestamp = record.timestamps[0] || now;
  const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

  if (count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  // Record this request timestamp
  record.timestamps.push(now);

  // Periodic memory hygiene: prune store if size > 10,000 keys
  if (store.size > 10000) {
    for (const [k, rec] of store.entries()) {
      rec.timestamps = rec.timestamps.filter((t) => t > windowStart);
      if (rec.timestamps.length === 0) {
        store.delete(k);
      }
    }
  }

  return {
    allowed: true,
    limit,
    remaining: limit - record.timestamps.length,
    resetSeconds,
  };
}

/**
 * Pre-configured rate limiter checkpoints
 */
export const RateLimiters = {
  // /api/parse-article: 30 req / minute
  parseArticle: (req: NextRequest): RateLimitResult => {
    const ip = getClientIp(req);
    return checkRateLimit(`parse_article:${ip}`, 30, 60 * 1000);
  },

  // /api/ai/paraphrase: 15 req / minute
  aiParaphrase: (req: NextRequest): RateLimitResult => {
    const ip = getClientIp(req);
    return checkRateLimit(`ai_paraphrase:${ip}`, 15, 60 * 1000);
  },

  // /api/auth/login: 5 attempts / 10 minutes
  authAttempt: (req: NextRequest): RateLimitResult => {
    const ip = getClientIp(req);
    return checkRateLimit(`auth:${ip}`, 5, 10 * 60 * 1000);
  },
};
