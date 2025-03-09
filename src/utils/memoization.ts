////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No external imports needed

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Default cache size
const DEFAULT_CACHE_SIZE = 100;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
type AnyFunction = (...args: any[]) => any;

interface MemoizeOptions {
  // Maximum number of results to cache
  maxCacheSize?: number;
  // Function to generate cache key from arguments
  cacheKeyFn?: (...args: any[]) => string;
  // Time-to-live in milliseconds (0 means no expiration)
  ttl?: number;
}

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

/**
 * Creates a memoized version of a function
 * @param fn The function to memoize
 * @param options Memoization options
 * @returns A memoized version of the function
 */
export function memoize<T extends AnyFunction>(
  fn: T,
  options: MemoizeOptions = {}
): T {
  const {
    maxCacheSize = DEFAULT_CACHE_SIZE,
    cacheKeyFn = JSON.stringify,
    ttl = 0
  } = options;
  
  // Cache to store results
  const cache = new Map<string, CacheEntry<ReturnType<T>>>();
  // Array to track order of keys (first = oldest)
  const keyOrder: string[] = [];
  
  // The memoized function
  const memoized = function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = cacheKeyFn(...args);
    const now = Date.now();
    
    // Check cache and handle expiration
    if (cache.has(key)) {
      const entry = cache.get(key)!;
      if (ttl > 0 && now - entry.timestamp > ttl) {
        // Entry expired, remove it
        cache.delete(key);
        const index = keyOrder.indexOf(key);
        if (index !== -1) {
          keyOrder.splice(index, 1);
        }
      } else {
        // Cache hit - return value without updating order
        return entry.value;
      }
    }
    
    // Cache miss - compute new value
    const result = fn.apply(this, args);
    
    // Handle cache eviction if needed
    if (!cache.has(key) && cache.size >= maxCacheSize) {
      // Find the oldest key that's not the one we're about to add
      const oldestKey = keyOrder[0];
      if (oldestKey) {
        cache.delete(oldestKey);
        keyOrder.shift();
      }
    }
    
    // Add new entry
    cache.set(key, { value: result, timestamp: now });
    keyOrder.push(key);
    
    return result;
  };
  
  // Add a method to clear the cache
  (memoized as any).clearCache = () => {
    cache.clear();
    keyOrder.length = 0;
  };
  
  return memoized as T;
}

/**
 * Creates a debounced version of a function
 * @param fn The function to debounce
 * @param wait The number of milliseconds to delay
 * @param immediate Whether to call the function immediately
 * @returns A debounced version of the function
 */
export function debounce<T extends AnyFunction>(
  fn: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      if (!immediate) {
        fn.apply(this, args);
      }
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      fn.apply(this, args);
    }
  };
}

/**
 * Creates a throttled version of a function
 * @param fn The function to throttle
 * @param wait The number of milliseconds to throttle invocations to
 * @returns A throttled version of the function
 */
export function throttle<T extends AnyFunction>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let lastCall = 0;
  let lastResult: ReturnType<T> | undefined;
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    
    if (now - lastCall >= wait) {
      lastCall = now;
      lastResult = fn.apply(this, args);
    }
    
    return lastResult;
  };
} 