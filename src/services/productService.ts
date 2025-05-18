/**
 * @fileoverview Service for handling product data extraction and processing
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// Import error handling utilities
import { logError, ErrorSeverity, withErrorHandling } from '../utils/errorHandling';
// Import type definitions
import type { ProductDetails } from '../types/product';
// Import performance optimization utilities
import { throttle, memoize } from '../utils/memoization';
// Import product type definition
import { Product } from '../types';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;
// Cache for the last data and timestamp
let lastData: ProductDetails | null = null;
let lastDataTimestamp = 0;

// Cache for product data
const productCache = new Map<string, any>();

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// No additional types needed as we're using imported types

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// No additional configuration needed

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
/**
 * Gets the data div from the page
 * @returns The data div element or null if not found
 */
function getDataDiv(): Element | null {
  return document.querySelector('[data-testid="product-data"]');
}

/**
 * Extracts product specifications by name
 * @param idml The IDML data
 * @param name The specification name
 * @returns The specification value or null if not found
 */
function getProductSpecification(idml: any, name: string): string | null {
  if (!idml || !idml.specifications) return null;
  return idml.specifications.find((spec: any) => spec.name === name)?.value || null;
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
/**
 * Extracts and processes product details from raw data
 * @param product The product data
 * @param idml The IDML data
 * @param reviews The reviews data
 * @returns The processed product details
 */
export function processProductDetails(product: any, idml: any, reviews: any): ProductDetails {
  // Validate input data
  if (!product || typeof product !== 'object') {
    logError({
      message: 'Invalid product data received',
      severity: ErrorSeverity.ERROR,
      component: 'productService',
      context: { method: 'processProductDetails' }
    });
    return createEmptyProductDetails();
  }

  // Extract basic product information with defensive checks
  const productDetails: ProductDetails = {
    id: product?.usItemId || '',
    name: product?.name || '',
    upc: product?.upc || '',
    brand: product?.brand || '',
    brandUrl: product?.brandUrl || '',
    imageUrl: product?.imageInfo?.thumbnailUrl || '',
    mainCategory: product?.category?.path?.[0]?.name || '',
    currentPrice: product?.priceInfo?.currentPrice?.price || 0,
    variantCriteria: Array.isArray(product?.variantCriteria) ? product.variantCriteria : [],
    variantsMap: product?.variantsMap || {},
    shippingLength: getProductSpecification(idml, "Shipping Length") || "0",
    shippingWidth: getProductSpecification(idml, "Shipping Width") || "0",
    shippingHeight: getProductSpecification(idml, "Shipping Height") || "0",
    weight: getProductSpecification(idml, "Shipping Weight") || "0",
    stock: 0,
    fulfillmentOptions: [],
    modelNumber: product?.model || '',
    reviewDates: [],
    badges: [],
    totalSellers: 0,
    price: product?.priceInfo?.currentPrice?.price || 0,
    category: product?.category?.path?.[0]?.name || '',
    rating: 0,
    reviewCount: 0,
    inStock: true,
    specifications: {}
  };

  // Extract fulfillment options with defensive checks
  if (Array.isArray(product?.fulfillmentOptions)) {
    productDetails.fulfillmentOptions = product.fulfillmentOptions
      .filter((option: any) => option && typeof option === 'object')
      .map((option: any) => ({
        type: option?.fulfillmentType || 'UNKNOWN',
        availableQuantity: typeof option?.availableQuantity === 'number' ? option.availableQuantity : 0
      }));
  }

  // Extract review dates with defensive checks
  if (reviews?.reviewStatistics?.reviewDateDistribution && Array.isArray(reviews.reviewStatistics.reviewDateDistribution)) {
    productDetails.reviewDates = reviews.reviewStatistics.reviewDateDistribution
      .filter((dateObj: any) => dateObj && dateObj.date)
      .map((dateObj: any) => dateObj.date);
  }

  // Extract badges with defensive checks
  if (Array.isArray(product?.badges)) {
    productDetails.badges = product.badges
      .filter((badge: any) => badge && badge.key)
      .map((badge: any) => badge.key);
  }

  // Extract total sellers with defensive checks
  if (typeof product?.sellerInfo?.sellerCount === 'number') {
    productDetails.totalSellers = product.sellerInfo.sellerCount;
  }

  return productDetails;
}

/**
 * Creates an empty product details object with default values
 */
function createEmptyProductDetails(): ProductDetails {
  return {
    id: '',
    name: '',
    upc: '',
    brand: '',
    brandUrl: '',
    imageUrl: '',
    mainCategory: '',
    currentPrice: 0,
    variantCriteria: [],
    variantsMap: {},
    shippingLength: "0",
    shippingWidth: "0",
    shippingHeight: "0",
    weight: "0",
    stock: 0,
    fulfillmentOptions: [],
    modelNumber: '',
    reviewDates: [],
    badges: [],
    totalSellers: 0,
    price: 0,
    category: '',
    rating: 0,
    reviewCount: 0,
    inStock: false,
    specifications: {}
  };
}

/**
 * Get product details from the page and cache them
 */
export const getProductDetailsFromPage = async (url: string): Promise<any> => {
  // Check cache first
  if (productCache.has(url)) {
    return productCache.get(url);
  }

  try {
    // Get product data from page
    const data = await getProductData(url);
    
    // Cache the data
    productCache.set(url, data);
    
    return data;
  } catch (error) {
    console.error('Error getting product details:', error);
    throw error;
  }
};

/**
 * Clear cache for a specific URL or all cache if no URL provided
 */
export const clearProductCache = (url?: string) => {
  if (url) {
    productCache.delete(url);
  } else {
    productCache.clear();
  }
};

/**
 * Check if current page is a product page
 */
export const isProductPage = (url: string): boolean => {
  return url.includes('/ip/') || url.includes('/product/');
};

/**
 * Get product specifications with memoization
 */
const getProductSpecifications = memoize(async (productId: string): Promise<Record<string, string>> => {
  const specDiv = document.querySelector(`[data-product-id="${productId}"] .specifications`);
  if (!specDiv) return {};

  const specs: Record<string, string> = {};
  specDiv.querySelectorAll('tr').forEach(row => {
    const key = row.querySelector('th')?.textContent?.trim();
    const value = row.querySelector('td')?.textContent?.trim();
    if (key && value) {
      specs[key] = value;
    }
  });

  return specs;
}, {
  maxSize: 50,
  keyFn: (args: any[]) => args[0]
});

/**
 * Get product data from the page
 * @param productId The product ID
 * @returns The product data
 */
export const getProductData = async (productId: string): Promise<Product> => {
  const productDiv = document.querySelector(`[data-product-id="${productId}"]`);
  if (!productDiv) {
    logError({
      message: 'Product element not found in DOM',
      severity: ErrorSeverity.ERROR,
      component: 'productService',
      context: { method: 'getProductData', productId }
    });
    return createEmptyProduct();
  }

  try {
    return {
      weight: parseFloat(productDiv.getAttribute('data-weight') || '0') || 0,
      length: parseFloat(productDiv.getAttribute('data-length') || '0') || 0,
      width: parseFloat(productDiv.getAttribute('data-width') || '0') || 0,
      height: parseFloat(productDiv.getAttribute('data-height') || '0') || 0,
      isWalmartFulfilled: productDiv.getAttribute('data-fulfillment') === 'WFS',
      isApparel: productDiv.getAttribute('data-category') === 'Apparel',
      isHazardousMaterial: productDiv.getAttribute('data-hazmat') === 'true',
      retailPrice: parseFloat(productDiv.getAttribute('data-price') || '0') || 0
    };
  } catch (error) {
    logError({
      message: 'Error parsing product data from DOM',
      severity: ErrorSeverity.ERROR,
      component: 'productService',
      error: error as Error,
      context: { method: 'getProductData', productId }
    });
    return createEmptyProduct();
  }
};

/**
 * Creates an empty product object with default values
 */
function createEmptyProduct(): Product {
  return {
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    isWalmartFulfilled: false,
    isApparel: false,
    isHazardousMaterial: false,
    retailPrice: 0
  };
}

// Throttle the getProductDetailsFromPage function to prevent excessive calls
const throttledGetProductDetails = throttle(getProductDetailsFromPage, 500);

/**
 * Gets product data with caching
 */
export const getProductDataWithCache = memoize(getProductData, {
  maxSize: 50,
  keyFn: (args: any[]) => args[0],
  expiry: 5 * 60 * 1000 // 5 minutes
}); 