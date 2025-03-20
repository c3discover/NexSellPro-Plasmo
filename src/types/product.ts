/**
 * @fileoverview Type definitions for product-related data
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No imports needed as this is a type definition file

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants needed

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Represents physical dimensions and weight of a product
 * Used for shipping and storage calculations
 */
export interface ProductDimensions {
  length: number;  // Length in inches
  width: number;   // Width in inches
  height: number;  // Height in inches
  weight: number;  // Weight in pounds
}

/**
 * Represents pricing information for a product
 * Includes current price, list price, and price history
 */
export interface ProductPricing {
  currentPrice: number;  // Current selling price
  listPrice?: number;    // Original list price
  priceHistory?: {       // Historical price data
    date: string;        // Date of price change
    price: number;       // Price at that date
  }[];
  salePrice?: number;    // Sale price if on discount
  savingsAmount?: number;  // Amount saved from list price
  savingsPercent?: number; // Percentage saved from list price
}

/**
 * Represents review information for a product
 * Includes average rating and detailed review data
 */
export interface ProductReviews {
  averageRating: number;  // Average review rating (1-5)
  numberOfReviews: number;  // Total number of reviews
  reviewsData?: {          // Detailed review information
    text: string;          // Review text
    rating: number;        // Individual rating
    date: string;          // Review date
    reviewer: string;      // Reviewer name
    title?: string;        // Optional review title
  }[];
}

/**
 * Represents category and classification information
 * Used for product organization and filtering
 */
export interface ProductCategory {
  primaryCategory: string;   // Main product category
  subCategory?: string;      // Sub-category
  contractCategory?: string; // Contract category for fees
  department?: string;       // Department classification
}

/**
 * Represents a single product variation
 * Used for products with multiple options (size, color, etc.)
 */
export interface ProductVariation {
  id: string;        // Unique variation ID
  name: string;      // Variation name
  value: string;     // Variation value
  selected: boolean; // Whether this variation is selected
  url?: string;      // URL for this variation
  image?: string;    // Image URL for this variation
  price?: number;    // Price for this variation
  inStock?: boolean; // Stock status
}

/**
 * Represents a map of product variations
 * Organizes variations by their type (size, color, etc.)
 */
export interface ProductVariationsMap {
  [key: string]: {           // Key is the variation type
    name: string;            // Name of the variation type
    values: ProductVariation[]; // Available values for this type
  };
}

/**
 * Represents special handling flags for a product
 * Used for shipping and storage requirements
 */
export interface ProductFlags {
  isApparel: boolean;           // Whether the product is clothing
  isHazardousMaterial: boolean; // Whether it's hazardous material
  isFragile: boolean;          // Whether it needs special handling
  isOversized: boolean;        // Whether it's oversized
  isWalmartFulfilled: boolean; // Whether fulfilled by Walmart
  isInStock: boolean;          // Current stock status
  isBestSeller?: boolean;      // Whether it's a best seller
}

/**
 * Represents product specifications
 * Key-value pairs of product details
 */
export interface ProductSpecifications {
  [key: string]: string | number | boolean;  // Flexible specification values
}

/**
 * Complete product details interface
 * Combines all product-related information
 */
export interface ProductDetails {
  // Basic information
  id: string;           // Unique product ID
  name: string;         // Product name
  brand: string;        // Brand name
  upc?: string;         // Universal Product Code
  brandUrl?: string;    // Brand website URL
  modelNumber?: string; // Product model number

  // Pricing information
  price: number;        // Current price
  currentPrice?: number; // Alternative price field
  listPrice?: number;   // Original list price
  salePrice?: number;   // Sale price
  savingsAmount?: number; // Amount saved
  savingsPercent?: number; // Percentage saved
  priceHistory?: {      // Price history
    date: string;
    price: number;
  }[];

  // Category information
  category: string;     // Primary category
  mainCategory?: string; // Main category
  categories?: {        // Category hierarchy
    name: string;
    url: string;
  }[];
  contractCategory?: string; // Contract category
  department?: string;      // Department

  // Review information
  rating: number;       // Average rating
  reviewCount: number;  // Number of reviews
  reviewDates?: string[]; // Dates of reviews
  reviewsData?: {       // Detailed review data
    text: string;
    rating: number;
    date: string;
    reviewer: string;
    title?: string;
  }[];

  // Physical attributes
  specifications: Record<string, string>; // Product specifications
  shippingLength?: string;  // Shipping length
  shippingWidth?: string;   // Shipping width
  shippingHeight?: string;  // Shipping height
  weight?: string;         // Product weight

  // Inventory information
  inStock: boolean;     // Stock status
  stock?: number;       // Current stock level
  fulfillmentOptions?: { // Fulfillment options
    type: string;
    availableQuantity: number;
  }[];

  // Media
  imageUrl?: string;    // Product image URL

  // Variation information
  variantCriteria?: ProductVariation[]; // Available variations
  variantsMap?: ProductVariationsMap;   // Organized variations

  // Additional information
  badges?: string[];    // Product badges
  totalSellers?: number; // Number of sellers
  isBestSeller?: boolean; // Best seller status
}

/**
 * Represents raw product data from API response
 * Used for data transformation
 */
export interface RawProductData {
  product: {
    usItemId: string;    // Walmart item ID
    name: string;        // Product name
    brand?: string;      // Brand name
    upc?: string;        // Universal Product Code
    brandUrl?: string;   // Brand URL
    imageInfo?: {        // Image information
      thumbnailUrl?: string;
    };
    category?: {         // Category information
      path?: { name: string }[];
    };
    priceInfo?: {        // Price information
      currentPrice?: {
        price: number;
      };
    };
    variantCriteria?: any[];  // Raw variation data
    variantsMap?: any;        // Raw variation map
    model?: string;           // Model number
    badges?: { key: string }[]; // Product badges
    sellerInfo?: {            // Seller information
      sellerCount?: number;
    };
    fulfillmentOptions?: {    // Fulfillment options
      fulfillmentType: string;
      availableQuantity: number;
    }[];
  };
  idml?: {              // IDML data
    specifications?: {   // Product specifications
      name: string;
      value: string;
    }[];
  };
  reviews?: {           // Review data
    reviewStatistics?: {
      reviewDateDistribution?: {
        date: string;
      }[];
    };
  };
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