/**
 * @fileoverview Memoization utilities for caching function results
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No external imports needed

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////

/**
 * Default cache expiration time in milliseconds (1 hour)
 */
const DEFAULT_CACHE_EXPIRY = 60 * 60 * 1000;

/**
 * Maximum number of items to store in cache
 */
const MAX_CACHE_SIZE = 1000;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Interface for cache entry
 */
interface CacheEntry<T> {
  value: T;           // Cached value
  timestamp: number;  // When the value was cached
  expiry: number;     // When the cache entry expires
}

/**
 * Interface for cache options
 */
interface CacheOptions {
  expiry?: number;    // Cache expiration time in milliseconds
  maxSize?: number;   // Maximum number of items to store
  keyFn?: (args: any[]) => string;  // Custom function to generate cache keys
}

/**
 * Type for cache storage
 */
type CacheStorage = Map<string, CacheEntry<any>>;

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

/**
 * Generate a cache key from arguments
 * @param args - Arguments to generate key from
 * @param keyFn - Optional custom key generation function
 * @returns Cache key string
 */
const generateCacheKey = (args: any[], keyFn?: (args: any[]) => string): string => {
  return keyFn ? keyFn(args) : JSON.stringify(args);
};

/**
 * Check if a cache entry is expired
 * @param entry - Cache entry to check
 * @returns Whether the entry is expired
 */
const isExpired = (entry: CacheEntry<any>): boolean => {
  return Date.now() > entry.expiry;
};

/**
 * Clean expired entries from cache
 * @param cache - Cache to clean
 */
const cleanExpiredEntries = (cache: CacheStorage): void => {
  for (const [key, entry] of cache.entries()) {
    if (isExpired(entry)) {
      cache.delete(key);
    }
  }
};

/**
 * Clean oldest entries if cache is too large
 * @param cache - Cache to clean
 * @param maxSize - Maximum cache size
 */
const cleanOldestEntries = (cache: CacheStorage, maxSize: number): void => {
  if (cache.size <= maxSize) return;

  // Convert entries to array and sort by timestamp
  const entries = Array.from(cache.entries())
    .sort(([, a], [, b]) => a.timestamp - b.timestamp);

  // Remove oldest entries until we're under the limit
  while (entries.length > maxSize) {
    const [key] = entries.shift()!;
    cache.delete(key);
  }
};

////////////////////////////////////////////////
// Main Functions:
////////////////////////////////////////////////

/**
 * Create a memoized version of a function
 * @param fn - Function to memoize
 * @param options - Cache options
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: CacheOptions = {}
): T {
  const {
    expiry = DEFAULT_CACHE_EXPIRY,
    maxSize = MAX_CACHE_SIZE,
    keyFn
  } = options;

  const cache: CacheStorage = new Map();

  return ((...args: Parameters<T>): ReturnType<T> => {
    // Generate cache key from arguments
    const key = generateCacheKey(args, keyFn);

    // Check if we have a valid cached value
    const cached = cache.get(key);
    if (cached && !isExpired(cached)) {
      return cached.value;
    }

    // Clean expired entries
    cleanExpiredEntries(cache);

    // Execute function and cache result
    const result = fn(...args);
    const entry: CacheEntry<ReturnType<T>> = {
      value: result,
      timestamp: Date.now(),
      expiry: Date.now() + expiry
    };

    // Clean oldest entries if needed
    cleanOldestEntries(cache, maxSize);

    // Store new entry
    cache.set(key, entry);

    return result;
  }) as T;
}

/**
 * Create a memoized version of an async function
 * @param fn - Async function to memoize
 * @param options - Cache options
 * @returns Memoized async function
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions = {}
): T {
  const {
    expiry = DEFAULT_CACHE_EXPIRY,
    maxSize = MAX_CACHE_SIZE
  } = options;

  const cache: CacheStorage = new Map();

  return ((...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Generate cache key from arguments
    const key = generateCacheKey(args);

    // Check if we have a valid cached value
    const cached = cache.get(key);
    if (cached && !isExpired(cached)) {
      return Promise.resolve(cached.value);
    }

    // Clean expired entries
    cleanExpiredEntries(cache);

    // Execute function and cache result
    return fn(...args).then(result => {
      const entry: CacheEntry<ReturnType<T>> = {
        value: result,
        timestamp: Date.now(),
        expiry: Date.now() + expiry
      };

      // Clean oldest entries if needed
      cleanOldestEntries(cache, maxSize);

      // Store new entry
      cache.set(key, entry);

      return result;
    });
  }) as T;
}

/**
 * Create a debounced version of a function
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @param immediate - Whether to call immediately
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    if (immediate) {
      fn(...args);
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (!immediate) {
        fn(...args);
      }
    }, delay);
  };
}

/**
 * Create a throttled version of a function
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return (...args: Parameters<T>): ReturnType<T> => {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
    return lastResult;
  };
}

/**
 * Clear all cached values
 * @param cache - Cache to clear
 */
export function clearCache(cache: CacheStorage): void {
  cache.clear();
}

/**
 * Remove specific cached value
 * @param cache - Cache to remove from
 * @param key - Key to remove
 */
export function removeFromCache(cache: CacheStorage, key: string): void {
  cache.delete(key);
}

/**
 * Get cache statistics
 * @param cache - Cache to get stats for
 * @returns Cache statistics
 */
export function getCacheStats(cache: CacheStorage): {
  size: number;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  const entries = Array.from(cache.values());
  const timestamps = entries.map(entry => entry.timestamp);

  return {
    size: cache.size,
    oldestEntry: timestamps.length ? Math.min(...timestamps) : null,
    newestEntry: timestamps.length ? Math.max(...timestamps) : null
  };
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// All functions and types are exported above 