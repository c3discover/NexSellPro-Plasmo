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
  // Extract basic product information
  const productDetails: ProductDetails = {
    id: product?.usItemId || '',
    name: product?.name || '',
    upc: product?.upc || '',
    brand: product?.brand || '',
    brandUrl: product?.brandUrl || '',
    imageUrl: product?.imageInfo?.thumbnailUrl || '',
    mainCategory: product?.category?.path?.[0]?.name || '',
    currentPrice: product?.priceInfo?.currentPrice?.price || 0,
    variantCriteria: product?.variantCriteria || [],
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

  // Extract fulfillment options
  if (product?.fulfillmentOptions) {
    productDetails.fulfillmentOptions = product.fulfillmentOptions.map((option: any) => ({
      type: option.fulfillmentType,
      availableQuantity: option.availableQuantity || 0
    }));
  }

  // Extract review dates
  if (reviews?.reviewStatistics?.reviewDateDistribution) {
    productDetails.reviewDates = reviews.reviewStatistics.reviewDateDistribution.map(
      (dateObj: any) => dateObj.date
    );
  }

  // Extract badges
  if (product?.badges) {
    productDetails.badges = product.badges.map((badge: any) => badge.key);
  }

  // Extract total sellers
  if (product?.sellerInfo?.sellerCount) {
    productDetails.totalSellers = product.sellerInfo.sellerCount;
  }

  return productDetails;
}

/**
 * Gets product details from the page
 * @returns The product details or null if not found
 */
export const getProductDetailsFromPage = withErrorHandling(
  async (): Promise<ProductDetails | null> => {
    const dataDiv = getDataDiv();
    if (!dataDiv) return null;

    const productDetails: ProductDetails = {
      id: dataDiv.getAttribute('data-product-id') || '',
      name: dataDiv.getAttribute('data-product-name') || '',
      price: parseFloat(dataDiv.getAttribute('data-product-price') || '0'),
      category: dataDiv.getAttribute('data-product-category') || '',
      brand: dataDiv.getAttribute('data-product-brand') || '',
      rating: parseFloat(dataDiv.getAttribute('data-product-rating') || '0'),
      reviewCount: parseInt(dataDiv.getAttribute('data-review-count') || '0', 10),
      inStock: dataDiv.getAttribute('data-in-stock') === 'true',
      specifications: {}
    };

    // Get specifications asynchronously
    const specs = await getProductSpecifications(productDetails.id);
    productDetails.specifications = specs;

    // Update the cache
    lastData = productDetails;
    lastDataTimestamp = Date.now();

    return productDetails;
  },
  (error) => {
    logError({
      message: 'Error getting product details',
      severity: ErrorSeverity.WARNING,
      component: 'productService',
      error: error as Error
    });
    return null;
  }
);

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
  if (!productDiv) throw new Error('Product not found');

  return {
    weight: parseFloat(productDiv.getAttribute('data-weight') || '0'),
    length: parseFloat(productDiv.getAttribute('data-length') || '0'),
    width: parseFloat(productDiv.getAttribute('data-width') || '0'),
    height: parseFloat(productDiv.getAttribute('data-height') || '0'),
    isWalmartFulfilled: productDiv.getAttribute('data-fulfillment') === 'WFS',
    isApparel: productDiv.getAttribute('data-category') === 'Apparel',
    isHazardousMaterial: productDiv.getAttribute('data-hazmat') === 'true',
    retailPrice: parseFloat(productDiv.getAttribute('data-price') || '0')
  };
};

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

/**
 * Checks if the current page is a product page
 * @returns True if the current page is a product page
 */
export function isProductPage(): boolean {
  return window.location.href.includes("/ip/");
} 