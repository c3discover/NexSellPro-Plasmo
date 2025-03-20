/**
 * @fileoverview Core type definitions for the application
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No imports needed as this is a core type definition file

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants needed

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Represents a physical product with its dimensions and fulfillment details
 * Used for shipping and storage calculations
 */
export interface Product {
  // Physical dimensions in inches
  weight: number;  // Weight in pounds
  length: number;  // Length in inches
  width: number;   // Width in inches
  height: number;  // Height in inches

  // Fulfillment and classification flags
  isWalmartFulfilled: boolean;  // Whether the product is fulfilled by Walmart
  isApparel: boolean;          // Whether the product is clothing/apparel
  isHazardousMaterial: boolean; // Whether the product is hazardous material

  // Optional pricing information
  retailPrice?: number;  // The retail price of the product
}

/**
 * Configuration options for pricing calculations and caching
 */
export interface PricingOptions {
  maxCacheSize?: number;  // Maximum number of items to store in cache
  ttl?: number;          // Time-to-live for cached items in milliseconds
  cacheKeyFn?: (...args: any[]) => string;  // Function to generate cache keys
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
// No helper functions needed

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// All types are exported above 