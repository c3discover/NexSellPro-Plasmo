/**
 * @fileoverview Utility for collecting and organizing product data from various sources
 * @author NexSellPro
 * @created 2024-03-07
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import getData from "./getData";
import { getSellerData } from "./sellerData";
import type { SellerInfo } from "~/types/seller";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Cache settings for data fetching
const FETCH_COOLDOWN = 1000; // 1 second cooldown between fetches

// Cache state
let dataFetchPromise: Promise<UsedProductData | null> | null = null;
let lastFetchTimestamp = 0;

// Add logging constants
const LOG_STYLES = {
  EXTENSION_DATA: 'color: #0ea5e9; font-weight: bold; font-size: 12px',  // Sky blue
};

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Basic product information
export interface ProductBasicInfo {
  productID: string | null;      // Unique product identifier
  name: string | null;           // Product name
  upc: string | null;            // Universal Product Code
  brand: string | null;          // Brand name
  brandUrl: string | null;       // Brand page URL
  modelNumber: string | null;    // Product model number
}

// Product pricing information
export interface ProductPricing {
  currentPrice: number | null;
  sellerName: string | null;
  sellerDisplayName: string | null;
  sellerType: string | null;
}

// Product physical characteristics
export interface ProductDimensions {
  shippingLength: string | null;
  shippingWidth: string | null;
  shippingHeight: string | null;
  weight: string | null;
}

// Product media assets
export interface ProductMedia {
  imageUrl: string | null;
  images: any[];
  videos: any[];
}

// Product category information
export interface ProductCategories {
  mainCategory: string | null;
  categories: { name: string; url: string }[];
}

// Product stock information
export interface ProductInventory {
  stock: number;
  totalSellers: number;
  fulfillmentOptions: { type: string; availableQuantity: number }[];
}

// Product review information
export interface ProductReviews {
  overallRating: string | number;
  numberOfRatings: string | number;
  numberOfReviews: string | number;
  customerReviews: any[];
  reviewDates: string[];
}

// Product variant information
export interface ProductVariants {
  variantCriteria: any[];
  variantsMap: Record<string, any>;
}

// Seller information
export interface ProductSellers {
  mainSeller: {
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
  otherSellers: SellerInfo[];
  totalSellers: number;
}

// Combined product data interface
export interface UsedProductData {
  basic: ProductBasicInfo;
  pricing: ProductPricing;
  dimensions: ProductDimensions;
  media: ProductMedia;
  categories: ProductCategories;
  inventory: ProductInventory;
  reviews: ProductReviews;
  variants: ProductVariants;
  badges: string[];
  sellers: ProductSellers;
  flags: {
    isApparel: boolean;
    isHazardousMaterial: boolean;
  };
}

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed for this utility

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// Configuration is handled through constants above

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// Main function to get and organize product data
export async function getUsedData(): Promise<UsedProductData | null> {
  try {
    // Return existing promise if there's an ongoing fetch
    if (dataFetchPromise) {
      return dataFetchPromise;
    }

    // Check cooldown period
    const now = Date.now();
    if (now - lastFetchTimestamp < FETCH_COOLDOWN) {
      return null;
    }

    lastFetchTimestamp = now;
    dataFetchPromise = (async () => {
      try {
        // Get raw product data with forceRefresh=true to prevent duplicate logging
        const rawProductData = getData(true);
        if (!rawProductData) {
          return null;
        }

        // Get seller data
        const sellerData = await getSellerData();
        const mainSeller = sellerData[0] || null;

        // Ensure weight is properly formatted
        const processedWeight = rawProductData.weight || "0";

        // Organize data into structured format
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

        // Log the used data in a collapsible group
        console.groupCollapsed('%c[Used Extension Data]', LOG_STYLES.EXTENSION_DATA);
        console.log('Timestamp:', new Date().toISOString());
        console.log('Basic Info:', usedData.basic);
        console.log('Pricing:', usedData.pricing);
        console.log('Dimensions:', usedData.dimensions);
        console.log('Categories:', usedData.categories);
        console.log('Inventory:', usedData.inventory);
        console.log('Reviews:', usedData.reviews);
        console.log('Sellers:', usedData.sellers);
        console.log('Flags:', usedData.flags);
        console.groupEnd();

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

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default getUsedData; 