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

// Cache for used data
let dataCache: {
  data: UsedProductData | null;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Update logging constants
const LOG_STYLES = {
  EXTENSION_DATA: 'color: #0ea5e9; font-weight: bold; font-size: 12px',  // Sky blue
  LOCAL_STORAGE: 'color: #10b981; font-weight: bold; font-size: 12px',   // Emerald green
  SECTION: 'color: #3b82f6; font-weight: bold; font-size: 11px',         // Blue
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
  totalSellers: number;
  fulfillmentOptions: { type: string; availableQuantity: number }[];
  totalStock: number;  // Total available quantity across all sellers
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
    availableQuantity?: number;
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
    // Check cache first
    if (dataCache && Date.now() - dataCache.timestamp < CACHE_DURATION) {
      console.log('Using cached data');
      return dataCache.data;
    }

    // If no cache or expired, fetch new data
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
            totalSellers: rawProductData.totalSellers,
            fulfillmentOptions: rawProductData.fulfillmentOptions,
            totalStock: 0  // Initialize to 0, will be updated with actual value later
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

        // Calculate total stock from all sellers
        const totalStock = sellerData.reduce((sum, seller) => {
          return sum + (seller.availableQuantity || 0);
        }, 0);

        // Add total stock to inventory data
        usedData.inventory.totalStock = totalStock;

        // Log the used data in a collapsible group
        console.groupCollapsed('%c[Used Extension Data]', LOG_STYLES.EXTENSION_DATA);
        console.log('Timestamp:', new Date().toISOString());
        console.log('Basic Info:', usedData.basic);
        console.log('Pricing:', usedData.pricing);
        console.log('Dimensions:', usedData.dimensions);
        console.log('Categories:', usedData.categories);
        console.log('Inventory:', usedData.inventory);
        console.log('Reviews:', usedData.reviews);
        console.log('Variants:', usedData.variants);
        console.log('Badges:', usedData.badges);
        console.log('Sellers:', usedData.sellers);
        console.log('Flags:', usedData.flags);
        console.groupEnd();

        // Add localStorage logging
        console.groupCollapsed('%c[Local Storage Data]', LOG_STYLES.LOCAL_STORAGE);
        
        // Log settings data
        console.group('%cSettings', LOG_STYLES.SECTION);
        console.log('Desired Metrics:', JSON.parse(localStorage.getItem('desiredMetrics') || '{}'));
        console.log('Default Fulfillment:', localStorage.getItem('defaultFulfillment'));
        console.log('Prep Cost Type:', localStorage.getItem('prepCostType'));
        console.log('Additional Cost Type:', localStorage.getItem('additionalCostType'));
        console.log('Export Settings:', JSON.parse(localStorage.getItem('exportSettings') || '{}'));
        console.groupEnd();

        // Log cost data
        console.group('%cCosts', LOG_STYLES.SECTION);
        console.log('Prep Cost Per Lb:', localStorage.getItem('prepCostPerLb'));
        console.log('Prep Cost Each:', localStorage.getItem('prepCostEach'));
        console.log('Additional Cost Per Lb:', localStorage.getItem('additionalCostPerLb'));
        console.log('Additional Cost Each:', localStorage.getItem('additionalCostEach'));
        console.groupEnd();

        // Log pricing calculation data
        console.group('%cPricing Calculations', LOG_STYLES.SECTION);
        console.log('Product Cost:', localStorage.getItem('productCost'));
        console.log('Sale Price:', localStorage.getItem('salePrice'));
        console.log('Shipping Weight:', localStorage.getItem('shippingWeight'));
        console.log('Shipping Length:', localStorage.getItem('shippingLength'));
        console.log('Shipping Width:', localStorage.getItem('shippingWidth'));
        console.log('Shipping Height:', localStorage.getItem('shippingHeight'));
        console.log('Fulfillment Type:', localStorage.getItem('fulfillmentType'));
        console.log('Contract Category:', localStorage.getItem('contractCategory'));
        console.log('Referral Fee:', localStorage.getItem('referralFee'));
        console.log('WFS Fee:', localStorage.getItem('wfsFee'));
        console.log('Storage Fee:', localStorage.getItem('storageFee'));
        console.log('Total Fees:', localStorage.getItem('totalFees'));
        console.log('Total Profit:', localStorage.getItem('totalProfit'));
        console.log('Margin:', localStorage.getItem('margin'));
        console.log('ROI:', localStorage.getItem('roi'));
        console.groupEnd();

        console.groupEnd();

        // Cache the result before returning
        dataCache = {
          data: usedData,
          timestamp: Date.now()
        };

        return usedData;
      } catch (error) {
        console.error('Error in getUsedData:', error);
        return null;
      }
    })();

    return await dataFetchPromise;
  } catch (error) {
    console.error('Error in getUsedData:', error);
    return null;
  }
}

// Add a function to clear the cache if needed
export function clearUsedDataCache() {
  dataCache = null;
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default getUsedData; 