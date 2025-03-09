import { memoize, debounce, throttle } from '../../utils/memoization';

describe('memoization utility', () => {
  describe('memoize', () => {
    it('should cache function results', () => {
      // Create a mock function that counts calls
      const mockFn = jest.fn((a: number, b: number) => a + b);
      const memoizedFn = memoize(mockFn);
      
      // Call with the same arguments multiple times
      const result1 = memoizedFn(1, 2);
      const result2 = memoizedFn(1, 2);
      const result3 = memoizedFn(1, 2);
      
      // Should return the same result
      expect(result1).toBe(3);
      expect(result2).toBe(3);
      expect(result3).toBe(3);
      
      // But the original function should only be called once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should cache different results for different arguments', () => {
      const mockFn = jest.fn((a: number, b: number) => a + b);
      const memoizedFn = memoize(mockFn);
      
      // Call with different arguments
      const result1 = memoizedFn(1, 2);
      const result2 = memoizedFn(2, 3);
      const result3 = memoizedFn(3, 4);
      
      // Should return different results
      expect(result1).toBe(3);
      expect(result2).toBe(5);
      expect(result3).toBe(7);
      
      // And the original function should be called for each unique set of arguments
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
    
    it('should respect the maxCacheSize option with LRU eviction', () => {
      const mockFn = jest.fn((a: number) => a * 2);
      const memoizedFn = memoize(mockFn, { maxCacheSize: 2 });
      
      // Fill the cache
      expect(memoizedFn(1)).toBe(2); // Cache: [1]
      expect(memoizedFn(2)).toBe(4); // Cache: [1, 2]
      expect(mockFn).toHaveBeenCalledTimes(2);
      
      // Add 3, should evict oldest (1)
      expect(memoizedFn(3)).toBe(6); // Cache: [2, 3]
      expect(mockFn).toHaveBeenCalledTimes(3);
      
      // Verify 1 was evicted (should be a cache miss)
      expect(memoizedFn(1)).toBe(2); // Cache: [3, 1]
      expect(mockFn).toHaveBeenCalledTimes(4);
      
      // Verify 2 was evicted (should be a cache miss)
      expect(memoizedFn(2)).toBe(4); // Cache: [1, 2]
      expect(mockFn).toHaveBeenCalledTimes(5);
      
      // Verify 3 was evicted (should be a cache miss)
      expect(memoizedFn(3)).toBe(6); // Cache: [2, 3]
      expect(mockFn).toHaveBeenCalledTimes(6);
    });
    
    it('should use the custom cacheKeyFn if provided', () => {
      const mockFn = jest.fn((obj: { id: number }) => obj.id * 2);
      const memoizedFn = memoize(mockFn, {
        cacheKeyFn: (obj) => `id-${obj.id}`
      });
      
      // These objects are different but have the same id
      const result1 = memoizedFn({ id: 1 });
      const result2 = memoizedFn({ id: 1 });
      
      // Should return the same result
      expect(result1).toBe(2);
      expect(result2).toBe(2);
      
      // And the original function should only be called once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should respect the ttl option', () => {
      jest.useFakeTimers();
      
      const mockFn = jest.fn((a: number) => a * 2);
      const memoizedFn = memoize(mockFn, { ttl: 1000 }); // 1 second TTL
      
      // Call once to cache the result
      memoizedFn(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Call again immediately (should be cached)
      memoizedFn(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Advance time past the TTL
      jest.advanceTimersByTime(1500);
      
      // Call again (should be a cache miss)
      memoizedFn(1);
      expect(mockFn).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });
    
    it('should provide a clearCache method', () => {
      const mockFn = jest.fn((a: number) => a * 2);
      const memoizedFn = memoize(mockFn);
      
      // Call once to cache the result
      memoizedFn(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Clear the cache
      (memoizedFn as any).clearCache();
      
      // Call again (should be a cache miss)
      memoizedFn(1);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      // Call multiple times
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      // Function should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();
      
      // Advance time
      jest.advanceTimersByTime(1000);
      
      // Function should have been called once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should reset the timer on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000);
      
      // Call once
      debouncedFn();
      
      // Advance time partially
      jest.advanceTimersByTime(500);
      
      // Call again
      debouncedFn();
      
      // Advance time to what would have been the first timeout
      jest.advanceTimersByTime(500);
      
      // Function should not have been called yet
      expect(mockFn).not.toHaveBeenCalled();
      
      // Advance time to the new timeout
      jest.advanceTimersByTime(500);
      
      // Function should have been called once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should call the function immediately if immediate is true', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 1000, true);
      
      // Call once
      debouncedFn();
      
      // Function should have been called immediately
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Call again
      debouncedFn();
      
      // Function should not have been called again
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Advance time
      jest.advanceTimersByTime(1000);
      
      // Call again
      debouncedFn();
      
      // Function should have been called again
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should limit function calls', () => {
      const mockFn = jest.fn().mockReturnValue('result');
      const throttledFn = throttle(mockFn, 1000);
      
      // Call multiple times in quick succession
      const result1 = throttledFn();
      const result2 = throttledFn();
      const result3 = throttledFn();
      
      // Function should have been called once
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // All calls should return the same result
      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(result3).toBe('result');
      
      // Advance time
      jest.advanceTimersByTime(1000);
      
      // Call again
      const result4 = throttledFn();
      
      // Function should have been called again
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result4).toBe('result');
    });
    
    it('should pass arguments to the original function', () => {
      const mockFn = jest.fn((a, b) => a + b);
      const throttledFn = throttle(mockFn, 1000);
      
      // Call with arguments
      const result1 = throttledFn(1, 2);
      
      // Function should have been called with the arguments
      expect(mockFn).toHaveBeenCalledWith(1, 2);
      expect(result1).toBe(3);
      
      // Call with different arguments
      const result2 = throttledFn(3, 4);
      
      // Function should not have been called again
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // Result should be from the first call
      expect(result2).toBe(3);
      
      // Advance time
      jest.advanceTimersByTime(1000);
      
      // Call again
      const result3 = throttledFn(5, 6);
      
      // Function should have been called again with new arguments
      expect(mockFn).toHaveBeenCalledWith(5, 6);
      expect(result3).toBe(11);
    });
  });
}); 