/**
 * @fileoverview Tests for memoization utilities
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import { memoize, debounce, throttle } from '../../utils/memoization';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
const TEST_DELAY = 1000;
const TEST_CACHE_SIZE = 2;
const TEST_TTL = 1000;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
interface TestObject {
  id: number;
  value: string;
}

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// No configuration needed

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
const createTestObject = (id: number): TestObject => ({
  id,
  value: `test-${id}`
});

const createMockFunction = (result: any) => jest.fn().mockReturnValue(result);

////////////////////////////////////////////////
// Test Cases:
////////////////////////////////////////////////
describe('memoization utility', () => {
  describe('memoize', () => {
    it('should cache function results', () => {
      const mockFn = createMockFunction(3);
      const memoizedFn = memoize(mockFn);
      
      const result1 = memoizedFn(1, 2);
      const result2 = memoizedFn(1, 2);
      const result3 = memoizedFn(1, 2);
      
      expect(result1).toBe(3);
      expect(result2).toBe(3);
      expect(result3).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should cache different results for different arguments', () => {
      const mockFn = createMockFunction(3);
      const memoizedFn = memoize(mockFn);
      
      const result1 = memoizedFn(1, 2);
      const result2 = memoizedFn(2, 3);
      const result3 = memoizedFn(3, 4);
      
      expect(result1).toBe(3);
      expect(result2).toBe(3);
      expect(result3).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
    
    it('should respect the maxCacheSize option with LRU eviction', () => {
      const mockFn = createMockFunction(2);
      const memoizedFn = memoize(mockFn, { maxSize: TEST_CACHE_SIZE });
      
      expect(memoizedFn(1)).toBe(2);
      expect(memoizedFn(2)).toBe(2);
      expect(mockFn).toHaveBeenCalledTimes(2);
      
      expect(memoizedFn(3)).toBe(2);
      expect(mockFn).toHaveBeenCalledTimes(3);
      
      expect(memoizedFn(1)).toBe(2);
      expect(mockFn).toHaveBeenCalledTimes(4);
      
      expect(memoizedFn(2)).toBe(2);
      expect(mockFn).toHaveBeenCalledTimes(5);
      
      expect(memoizedFn(3)).toBe(2);
      expect(mockFn).toHaveBeenCalledTimes(6);
    });
    
    it('should use the custom cacheKeyFn if provided', () => {
      const mockFn = createMockFunction(2);
      const memoizedFn = memoize(mockFn, {
        keyFn: (args: any[]) => `id-${(args[0] as TestObject).id}`
      });
      
      const result1 = memoizedFn(createTestObject(1));
      const result2 = memoizedFn(createTestObject(1));
      
      expect(result1).toBe(2);
      expect(result2).toBe(2);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should respect the ttl option', () => {
      jest.useFakeTimers();
      
      const mockFn = createMockFunction(2);
      const memoizedFn = memoize(mockFn, { expiry: TEST_TTL });
      
      memoizedFn(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      memoizedFn(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(1500);
      
      memoizedFn(1);
      expect(mockFn).toHaveBeenCalledTimes(2);
      
      jest.useRealTimers();
    });
    
    it('should provide a clearCache method', () => {
      const mockFn = createMockFunction(2);
      const memoizedFn = memoize(mockFn);
      
      memoizedFn(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      (memoizedFn as any).clearCache();
      
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
      const debouncedFn = debounce(mockFn, TEST_DELAY);
      
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(TEST_DELAY);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should reset the timer on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, TEST_DELAY);
      
      debouncedFn();
      
      jest.advanceTimersByTime(500);
      
      debouncedFn();
      
      jest.advanceTimersByTime(500);
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(500);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should call the function immediately if immediate is true', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, TEST_DELAY, true);
      
      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      jest.advanceTimersByTime(TEST_DELAY);
      
      debouncedFn();
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
      const throttledFn = throttle(mockFn, TEST_DELAY);
      
      const result1 = throttledFn();
      const result2 = throttledFn();
      const result3 = throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(result3).toBe('result');
      
      jest.advanceTimersByTime(TEST_DELAY);
      
      const result4 = throttledFn();
      
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result4).toBe('result');
    });
    
    it('should pass arguments to the original function', () => {
      const mockFn = jest.fn((a, b) => a + b);
      const throttledFn = throttle(mockFn, TEST_DELAY);
      
      const result1 = throttledFn(1, 2);
      
      expect(mockFn).toHaveBeenCalledWith(1, 2);
      expect(result1).toBe(3);
      
      const result2 = throttledFn(3, 4);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result2).toBe(3);
      
      jest.advanceTimersByTime(TEST_DELAY);
      
      const result3 = throttledFn(5, 6);
      
      expect(mockFn).toHaveBeenCalledWith(5, 6);
      expect(result3).toBe(11);
    });
  });
}); 