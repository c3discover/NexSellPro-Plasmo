/**
 * @fileoverview Utility for processing and organizing product data used in the extension
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import getData from "./getData";
import { getSellerData } from "./sellerData";
import type { SellerInfo } from "~/types/seller";

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Basic product information
 */
export interface ProductBasicInfo {
  productID: string | null;      // Unique product identifier
  name: string | null;           // Product name
  upc: string | null;           // Universal Product Code
  brand: string | null;         // Product brand name
  brandUrl: string | null;      // URL to brand page
  modelNumber: string | null;   // Product model number
}

/**
 * Product pricing information
 */
export interface ProductPricing {
  currentPrice: number | null;           // Current selling price
  sellerName: string | null;             // Name of the seller
  sellerDisplayName: string | null;      // Display name of the seller
  sellerType: string | null;             // Type of seller (e.g., "Pro Seller")
}

/**
 * Product physical dimensions
 */
export interface ProductDimensions {
  shippingLength: string | null;  // Product length for shipping
  shippingWidth: string | null;   // Product width for shipping
  shippingHeight: string | null;  // Product height for shipping
  weight: string | null;          // Product weight
}

/**
 * Product media content
 */
export interface ProductMedia {
  imageUrl: string | null;  // Main product image URL
  images: any[];           // Array of additional product images
  videos: any[];           // Array of product videos
}

/**
 * Product categorization
 */
export interface ProductCategories {
  mainCategory: string | null;                    // Primary category
  categories: { name: string; url: string }[];    // List of all categories
}

/**
 * Product inventory information
 */
export interface ProductInventory {
  stock: number;                                  // Current stock level
  totalSellers: number;                          // Total number of sellers
  fulfillmentOptions: {                          // Available fulfillment options
    type: string;
    availableQuantity: number;
  }[];
}

/**
 * Product review information
 */
export interface ProductReviews {
  overallRating: string | number;     // Overall product rating
  numberOfRatings: string | number;   // Total number of ratings
  numberOfReviews: string | number;   // Total number of reviews
  customerReviews: any[];            // Array of customer reviews
  reviewDates: string[];            // Dates of reviews
}

/**
 * Product variant information
 */
export interface ProductVariants {
  variantCriteria: any[];           // Criteria for variants
  variantsMap: Record<string, any>; // Map of variant options
}

/**
 * Product seller information
 */
export interface ProductSellers {
  mainSeller: {                      // Primary seller information
    sellerName: string;
    price: string | number;
    type: string;
    arrives: string;
    isProSeller: boolean;
    isWFS: boolean;
    priceInfo?: any;
    fulfillmentStatus?: string;
    arrivalDate?: string;
  } | null;
  otherSellers: SellerInfo[];       // List of other sellers
  totalSellers: number;             // Total number of sellers
}

/**
 * Complete product data structure used in the extension
 */
export interface UsedProductData {
  basic: ProductBasicInfo;          // Basic product information
  pricing: ProductPricing;          // Pricing information
  dimensions: ProductDimensions;     // Physical dimensions
  media: ProductMedia;              // Media content
  categories: ProductCategories;     // Category information
  inventory: ProductInventory;      // Inventory information
  reviews: ProductReviews;          // Review information
  variants: ProductVariants;        // Variant information
  badges: string[];                // Product badges
  sellers: ProductSellers;         // Seller information
  flags: {                         // Product flags
    isApparel: boolean;
    isHazardousMaterial: boolean;
  };
}

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
const FETCH_COOLDOWN = 1000;  // 1 second cooldown between fetches

////////////////////////////////////////////////
// Variables:
////////////////////////////////////////////////
let dataFetchPromise: Promise<UsedProductData | null> | null = null;
let lastFetchTimestamp = 0;

////////////////////////////////////////////////
// Main Function:
////////////////////////////////////////////////

/**
 * Fetches and processes product data used in the extension
 * Implements caching and rate limiting to prevent excessive API calls
 * @returns Promise resolving to processed product data or null if unavailable
 */
export async function getUsedData(): Promise<UsedProductData | null> {
  try {
    // If there's an ongoing fetch, return its promise
    if (dataFetchPromise) {
      return dataFetchPromise;
    }

    // Check cooldown
    const now = Date.now();
    if (now - lastFetchTimestamp < FETCH_COOLDOWN) {
      return null;
    }

    lastFetchTimestamp = now;
    dataFetchPromise = (async () => {
      try {
        // Get raw product data
        const rawProductData = getData();
        if (!rawProductData) {
          return null;
        }

        // Get seller data
        const sellerData = await getSellerData();
        const mainSeller = sellerData[0] || null;

        // Ensure weight is properly formatted
        const processedWeight = rawProductData.weight || "0";

        // Organize data into our new structure
        const usedData: UsedProductData = {
          basic: {
            productID: rawProductData.productID,
            name: rawProductData.name,
            upc: rawProductData.upc,
            brand: rawProductData.brand,
            brandUrl: rawProductData.brandUrl,
            modelNumber: rawProductData.modelNumber
          },
          pricing: {
            currentPrice: rawProductData.currentPrice,
            sellerName: rawProductData.sellerName,
            sellerDisplayName: rawProductData.sellerDisplayName,
            sellerType: rawProductData.sellerType
          },
          dimensions: {
            shippingLength: rawProductData.shippingLength || "0",
            shippingWidth: rawProductData.shippingWidth || "0",
            shippingHeight: rawProductData.shippingHeight || "0",
            weight: processedWeight
          },
          media: {
            imageUrl: rawProductData.imageUrl,
            images: rawProductData.images,
            videos: rawProductData.videos
          },
          categories: {
            mainCategory: rawProductData.mainCategory,
            categories: rawProductData.categories
          },
          inventory: {
            stock: rawProductData.stock,
            totalSellers: rawProductData.totalSellers,
            fulfillmentOptions: rawProductData.fulfillmentOptions
          },
          reviews: {
            overallRating: rawProductData.overallRating,
            numberOfRatings: rawProductData.numberOfRatings,
            numberOfReviews: rawProductData.numberOfReviews,
            customerReviews: rawProductData.customerReviews,
            reviewDates: rawProductData.reviewDates
          },
          variants: {
            variantCriteria: rawProductData.variantCriteria,
            variantsMap: rawProductData.variantsMap
          },
          badges: rawProductData.badges,
          sellers: {
            mainSeller,
            otherSellers: sellerData.slice(1),
            totalSellers: sellerData.length
          },
          flags: {
            isApparel: false,
            isHazardousMaterial: false
          }
        };

        // Always log the used data
        console.log('%c[Data Used in Extension]', 'color: #0ea5e9; font-weight: bold', {
          timestamp: new Date().toISOString(),
          data: usedData
        });

        return usedData;
      } catch (error) {
        return null;
      } finally {
        dataFetchPromise = null;
      }
    })();

    return dataFetchPromise;
  } catch (error) {
    console.error('Error in getUsedData:', error);
    return null;
  }
} 