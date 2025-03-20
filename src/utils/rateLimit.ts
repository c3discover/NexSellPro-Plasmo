/**
 * @fileoverview Rate limiting utility for API calls
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No external imports needed

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Configuration for rate limiting
 */
interface RateLimitConfig {
  maxRequests: number;  // Maximum number of requests allowed
  timeWindow: number;   // Time window in milliseconds
}

/**
 * Log entry for tracking requests
 */
interface RequestLog {
  timestamp: number;    // When the request was made
}

////////////////////////////////////////////////
// Main Class:
////////////////////////////////////////////////

/**
 * Rate limiter class for managing API request limits
 */
class RateLimiter {
  private requests: RequestLog[] = [];  // Array to store request timestamps
  private config: RateLimitConfig;      // Rate limit configuration

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if a new request can be made
   * @returns boolean indicating if request is allowed
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the time window
    this.requests = this.requests.filter(
      req => now - req.timestamp < this.config.timeWindow
    );
    
    return this.requests.length < this.config.maxRequests;
  }

  /**
   * Log a new request
   */
  logRequest(): void {
    this.requests.push({ timestamp: Date.now() });
  }

  /**
   * Wrap an API call with rate limiting
   * @param apiCall - The API call function to wrap
   * @returns Promise that resolves with the API call result or rejects if rate limited
   */
  async executeWithRateLimit<T>(apiCall: () => Promise<T>): Promise<T> {
    if (!this.canMakeRequest()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      const result = await apiCall();
      this.logRequest();
      return result;
    } catch (error) {
      // Don't log failed requests against the rate limit
      throw error;
    }
  }
}

// Create rate limiters with different configurations
export const emailRateLimiter = new RateLimiter({
  maxRequests: 5,     // 5 requests
  timeWindow: 60000   // per minute
});

export const walmartRateLimiter = new RateLimiter({
  maxRequests: 30,    // 30 requests
  timeWindow: 60000   // per minute
});

export default RateLimiter; 