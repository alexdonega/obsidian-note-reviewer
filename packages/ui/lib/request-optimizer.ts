import { log } from './logger';

// Request deduplication - prevent duplicate concurrent requests
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check if request is already in flight
    if (this.pending.has(key)) {
      log.debug('Request deduplicated', { key });
      return this.pending.get(key)!;
    }

    // Execute request and cache promise
    const promise = fetcher()
      .finally(() => {
        // Clean up after completion
        this.pending.delete(key);
      });

    this.pending.set(key, promise);
    return promise;
  }

  clear(key?: string) {
    if (key) {
      this.pending.delete(key);
    } else {
      this.pending.clear();
    }
  }

  size(): number {
    return this.pending.size;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Request batching - batch multiple requests into one
interface BatchRequest<T> {
  id: string;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class RequestBatcher<T, R> {
  private queue: BatchRequest<R>[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private maxBatchSize: number;
  private maxWaitTime: number;

  constructor(
    private executor: (ids: string[]) => Promise<Map<string, R>>,
    options: {
      maxBatchSize?: number;
      maxWaitTime?: number;
    } = {}
  ) {
    this.maxBatchSize = options.maxBatchSize || 50;
    this.maxWaitTime = options.maxWaitTime || 10; // ms
  }

  async batch(id: string): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.queue.push({ id, resolve, reject });

      // Flush immediately if batch is full
      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
        return;
      }

      // Schedule flush if not already scheduled
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.maxWaitTime);
      }
    });
  }

  private async flush() {
    if (this.queue.length === 0) return;

    // Clear timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Get current batch
    const batch = this.queue.splice(0, this.maxBatchSize);
    const ids = batch.map(req => req.id);

    log.debug('Flushing request batch', { count: batch.length });

    try {
      // Execute batch
      const results = await this.executor(ids);

      // Resolve individual requests
      batch.forEach(req => {
        const result = results.get(req.id);
        if (result !== undefined) {
          req.resolve(result);
        } else {
          req.reject(new Error(`No result for id: ${req.id}`));
        }
      });
    } catch (error) {
      // Reject all requests in batch
      batch.forEach(req => req.reject(error));
      log.error('Batch execution failed', error, { count: batch.length });
    }
  }

  size(): number {
    return this.queue.length;
  }
}

// Connection pooling for database connections
export class ConnectionPool<T> {
  private pool: T[] = [];
  private inUse = new Set<T>();
  private waiting: Array<(conn: T) => void> = [];
  private maxSize: number;
  private minSize: number;

  constructor(
    private factory: () => Promise<T>,
    private destroyer: (conn: T) => Promise<void>,
    options: {
      maxSize?: number;
      minSize?: number;
    } = {}
  ) {
    this.maxSize = options.maxSize || 10;
    this.minSize = options.minSize || 2;
  }

  async initialize() {
    // Create minimum connections
    for (let i = 0; i < this.minSize; i++) {
      const conn = await this.factory();
      this.pool.push(conn);
    }
    log.info('Connection pool initialized', {
      minSize: this.minSize,
      maxSize: this.maxSize,
    });
  }

  async acquire(): Promise<T> {
    // Try to get from pool
    if (this.pool.length > 0) {
      const conn = this.pool.pop()!;
      this.inUse.add(conn);
      return conn;
    }

    // Create new if under max size
    if (this.inUse.size < this.maxSize) {
      const conn = await this.factory();
      this.inUse.add(conn);
      return conn;
    }

    // Wait for connection to be released
    return new Promise((resolve) => {
      this.waiting.push(resolve);
    });
  }

  async release(conn: T) {
    this.inUse.delete(conn);

    // Give to waiting request
    if (this.waiting.length > 0) {
      const waiter = this.waiting.shift()!;
      this.inUse.add(conn);
      waiter(conn);
      return;
    }

    // Return to pool
    this.pool.push(conn);
  }

  async drain() {
    // Wait for all in-use connections
    while (this.inUse.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Destroy all pooled connections
    await Promise.all(this.pool.map(conn => this.destroyer(conn)));
    this.pool = [];

    log.info('Connection pool drained');
  }

  stats() {
    return {
      poolSize: this.pool.length,
      inUse: this.inUse.size,
      waiting: this.waiting.length,
      total: this.pool.length + this.inUse.size,
    };
  }
}

// Retry with exponential backoff
export class RetryManager {
  async retry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
      shouldRetry?: (error: any) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 100,
      maxDelay = 10000,
      backoffFactor = 2,
      shouldRetry = () => true,
    } = options;

    let lastError: any;
    let delay = baseDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry if this is the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Check if we should retry
        if (!shouldRetry(error)) {
          throw error;
        }

        log.warn('Request failed, retrying', {
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: error.message,
        });

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));

        // Increase delay for next attempt
        delay = Math.min(delay * backoffFactor, maxDelay);
      }
    }

    throw lastError;
  }
}

export const retryManager = new RetryManager();

// Circuit breaker pattern
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private resetTimeout: number = 30000 // 30 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        log.info('Circuit breaker half-open');
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();

      if (this.state === 'HALF_OPEN') {
        this.reset();
      }

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
        log.error('Circuit breaker opened', {
          failures: this.failures,
          threshold: this.threshold,
        });
      }

      throw error;
    }
  }

  reset() {
    this.failures = 0;
    this.state = 'CLOSED';
    log.info('Circuit breaker reset');
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Rate limiter (client-side)
export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  async acquire(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Remove old timestamps
    this.timestamps = this.timestamps.filter(ts => ts > windowStart);

    // Check if limit exceeded
    if (this.timestamps.length >= this.maxRequests) {
      const oldestTimestamp = this.timestamps[0];
      const waitTime = oldestTimestamp + this.windowMs - now;

      log.warn('Rate limit exceeded, waiting', { waitTime });

      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquire();
    }

    // Add current timestamp
    this.timestamps.push(now);
  }

  getStats() {
    return {
      currentCount: this.timestamps.length,
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
    };
  }
}
