import { Redis } from '@upstash/redis';
import { log } from './logger';

// Initialize Upstash Redis
const redis = new Redis({
  url: import.meta.env.VITE_UPSTASH_REDIS_URL || '',
  token: import.meta.env.VITE_UPSTASH_REDIS_TOKEN || '',
});

// Cache configuration
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
};

// Cache key prefixes
export const CACHE_PREFIX = {
  NOTE: 'note:',
  NOTES_LIST: 'notes:list:',
  ANNOTATION: 'annotation:',
  USER: 'user:',
  ORG: 'org:',
  ORG_STATS: 'org:stats:',
  SEARCH: 'search:',
};

export class CacheManager {
  private static instance: CacheManager;
  private enabled: boolean;

  private constructor() {
    this.enabled = Boolean(
      import.meta.env.VITE_UPSTASH_REDIS_URL &&
      import.meta.env.VITE_UPSTASH_REDIS_TOKEN
    );

    if (!this.enabled) {
      log.warn('Redis cache disabled - missing credentials');
    }
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Get from cache
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;

    try {
      const value = await redis.get<T>(key);
      if (value) {
        log.debug('Cache hit', { key });
      } else {
        log.debug('Cache miss', { key });
      }
      return value;
    } catch (error) {
      log.error('Cache get failed', error, { key });
      return null;
    }
  }

  // Set in cache
  async set<T>(key: string, value: T, ttl: number = CACHE_TTL.MEDIUM): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      log.debug('Cache set', { key, ttl });
      return true;
    } catch (error) {
      log.error('Cache set failed', error, { key });
      return false;
    }
  }

  // Delete from cache
  async delete(key: string): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      await redis.del(key);
      log.debug('Cache deleted', { key });
      return true;
    } catch (error) {
      log.error('Cache delete failed', error, { key });
      return false;
    }
  }

  // Delete multiple keys by pattern
  async deletePattern(pattern: string): Promise<number> {
    if (!this.enabled) return 0;

    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;

      await redis.del(...keys);
      log.info('Cache pattern deleted', { pattern, count: keys.length });
      return keys.length;
    } catch (error) {
      log.error('Cache pattern delete failed', error, { pattern });
      return 0;
    }
  }

  // Increment counter
  async increment(key: string, amount: number = 1): Promise<number> {
    if (!this.enabled) return 0;

    try {
      const value = await redis.incrby(key, amount);
      return value;
    } catch (error) {
      log.error('Cache increment failed', error, { key });
      return 0;
    }
  }

  // Get or set (cache-aside pattern)
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();

    // Store in cache
    await this.set(key, fresh, ttl);

    return fresh;
  }

  // Cache with tags for easier invalidation
  async setWithTags<T>(
    key: string,
    value: T,
    tags: string[],
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      // Store the value
      await this.set(key, value, ttl);

      // Store tag associations
      for (const tag of tags) {
        await redis.sadd(`tag:${tag}`, key);
        await redis.expire(`tag:${tag}`, ttl);
      }

      return true;
    } catch (error) {
      log.error('Cache set with tags failed', error, { key, tags });
      return false;
    }
  }

  // Invalidate by tag
  async invalidateTag(tag: string): Promise<number> {
    if (!this.enabled) return 0;

    try {
      const keys = await redis.smembers(`tag:${tag}`);
      if (keys.length === 0) return 0;

      await redis.del(...keys);
      await redis.del(`tag:${tag}`);

      log.info('Cache tag invalidated', { tag, count: keys.length });
      return keys.length;
    } catch (error) {
      log.error('Cache tag invalidation failed', error, { tag });
      return 0;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      const testKey = 'health:check';
      await redis.set(testKey, 'ok', { ex: 10 });
      const value = await redis.get(testKey);
      await redis.del(testKey);

      return value === 'ok';
    } catch (error) {
      log.error('Cache health check failed', error);
      return false;
    }
  }

  // Get cache statistics
  async getStats(): Promise<Record<string, any>> {
    if (!this.enabled) return {};

    try {
      const info = await redis.info();
      return { enabled: true, info };
    } catch (error) {
      log.error('Cache stats failed', error);
      return { enabled: false, error: error.message };
    }
  }
}

// Export singleton instance
export const cache = CacheManager.getInstance();

// High-level caching utilities for specific entities
export const noteCache = {
  get: (noteId: string) => cache.get(`${CACHE_PREFIX.NOTE}${noteId}`),
  set: (noteId: string, note: any, ttl = CACHE_TTL.MEDIUM) =>
    cache.set(`${CACHE_PREFIX.NOTE}${noteId}`, note, ttl),
  delete: (noteId: string) => cache.delete(`${CACHE_PREFIX.NOTE}${noteId}`),
  invalidateOrg: (orgId: string) => cache.deletePattern(`${CACHE_PREFIX.NOTE}*:org:${orgId}`),
};

export const notesListCache = {
  get: (orgId: string, filters?: string) =>
    cache.get(`${CACHE_PREFIX.NOTES_LIST}${orgId}:${filters || 'default'}`),
  set: (orgId: string, notes: any[], filters?: string, ttl = CACHE_TTL.SHORT) =>
    cache.set(`${CACHE_PREFIX.NOTES_LIST}${orgId}:${filters || 'default'}`, notes, ttl),
  invalidate: (orgId: string) => cache.deletePattern(`${CACHE_PREFIX.NOTES_LIST}${orgId}:*`),
};

export const userCache = {
  get: (userId: string) => cache.get(`${CACHE_PREFIX.USER}${userId}`),
  set: (userId: string, user: any, ttl = CACHE_TTL.HOUR) =>
    cache.set(`${CACHE_PREFIX.USER}${userId}`, user, ttl),
  delete: (userId: string) => cache.delete(`${CACHE_PREFIX.USER}${userId}`),
};

export const orgStatsCache = {
  get: (orgId: string) => cache.get(`${CACHE_PREFIX.ORG_STATS}${orgId}`),
  set: (orgId: string, stats: any, ttl = CACHE_TTL.LONG) =>
    cache.set(`${CACHE_PREFIX.ORG_STATS}${orgId}`, stats, ttl),
  invalidate: (orgId: string) => cache.delete(`${CACHE_PREFIX.ORG_STATS}${orgId}`),
};

export const searchCache = {
  get: (query: string, orgId: string) =>
    cache.get(`${CACHE_PREFIX.SEARCH}${orgId}:${query}`),
  set: (query: string, orgId: string, results: any[], ttl = CACHE_TTL.MEDIUM) =>
    cache.set(`${CACHE_PREFIX.SEARCH}${orgId}:${query}`, results, ttl),
  invalidate: (orgId: string) => cache.deletePattern(`${CACHE_PREFIX.SEARCH}${orgId}:*`),
};

// Cache warming utilities
export async function warmCache(orgId: string) {
  try {
    log.info('Warming cache for org', { orgId });

    // Warm frequently accessed data
    // This would be called after deployment or during low-traffic periods

    // Example: Pre-cache recent notes
    // const recentNotes = await fetchRecentNotes(orgId);
    // await notesListCache.set(orgId, recentNotes, 'recent');

    log.info('Cache warmed successfully', { orgId });
  } catch (error) {
    log.error('Cache warming failed', error, { orgId });
  }
}

// Cache invalidation hooks
export function createCacheInvalidationHook(entityType: string) {
  return {
    onCreate: (id: string, orgId: string) => {
      notesListCache.invalidate(orgId);
      orgStatsCache.invalidate(orgId);
    },
    onUpdate: (id: string, orgId: string) => {
      if (entityType === 'note') {
        noteCache.delete(id);
      } else if (entityType === 'user') {
        userCache.delete(id);
      }
      notesListCache.invalidate(orgId);
    },
    onDelete: (id: string, orgId: string) => {
      if (entityType === 'note') {
        noteCache.delete(id);
      } else if (entityType === 'user') {
        userCache.delete(id);
      }
      notesListCache.invalidate(orgId);
      orgStatsCache.invalidate(orgId);
    },
  };
}
