/**
 * @fileoverview Service for handling API interactions with Walmart's GraphQL API
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
import type { SellerInfo } from '../types/seller';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// API endpoint for Walmart's GraphQL service
const WALMART_GRAPHQL_URL = 'https://www.walmart.com/orchestra/home/graphql/getMultipleSellerOffersMetaData';

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
 * Determines the seller type based on seller information
 * @param seller The seller information from the API
 * @returns The formatted seller type (WFS-Pro, WFS, SF-Pro, or SF)
 */
function determineSellerType(seller: any): string {
  if (seller.fulfillmentType === 'WFS') {
    return seller.sellerType === 'PRO' ? 'WFS-Pro' : 'WFS';
  } else {
    return seller.sellerType === 'PRO' ? 'SF-Pro' : 'SF';
  }
}

/**
 * Formats a delivery date string into a readable format
 * @param dateString The delivery date string from the API
 * @returns A formatted date string (e.g., "Mar 20") or "N/A" if invalid
 */
function formatDeliveryDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (error) {
    return dateString;
  }
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const randomUserAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
];
function getRandomUserAgent() {
  return randomUserAgents[Math.floor(Math.random() * randomUserAgents.length)];
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
/**
 * Fetches seller data from the Walmart GraphQL API
 * @param itemId The product ID to fetch seller data for
 * @returns An array of seller information
 */
export const fetchSellerDataFromAPI = withErrorHandling(
  async (itemId: string): Promise<SellerInfo[]> => {
    // Prepare the GraphQL query payload
    const payload = {
      query: `
        query getMultipleSellerOffersMetaData($itemId: String!) {
          product(itemId: $itemId) {
            sellerInfo {
              sellerName
              sellerId
              sellerType
              priceInfo {
                currentPrice {
                  price
                  priceString
                }
              }
              fulfillmentType
              shippingInfo {
                deliveryDate
              }
            }
          }
        }
      `,
      variables: { itemId }
    };
    
    // Anti-bot rate limiting: Walmart triggers CAPTCHA (412) without delays
    await delay(Math.random() * 4000 + 3000); // 3 to 7 second random delay
    
    // Make the API request
    const response = await fetch(WALMART_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': getRandomUserAgent(),
      },
      body: JSON.stringify(payload)
    });
    
    // Handle API errors
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse the response with defensive checks
    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      logError({
        message: 'Invalid response format from GraphQL API',
        severity: ErrorSeverity.ERROR,
        component: 'api',
        context: { method: 'fetchSellerDataFromAPI', itemId }
      });
      return [];
    }

    // Check for GraphQL errors
    if (data.errors) {
      logError({
        message: 'GraphQL errors in response',
        severity: ErrorSeverity.ERROR,
        component: 'api',
        error: new Error(JSON.stringify(data.errors)),
        context: { method: 'fetchSellerDataFromAPI', itemId }
      });
      return [];
    }

    // Safely access nested data with optional chaining
    const sellerInfo = data?.data?.product?.sellerInfo;
    if (!sellerInfo || !Array.isArray(sellerInfo)) {
      logError({
        message: 'No seller information found in response',
        severity: ErrorSeverity.WARNING,
        component: 'api',
        context: { method: 'fetchSellerDataFromAPI', itemId }
      });
      return [];
    }
    
    // Transform API response into our SellerInfo format with defensive checks
    return sellerInfo.map((seller: any) => {
      // Safely access nested properties with optional chaining and default values
      const priceInfo = seller?.priceInfo?.currentPrice;
      const shippingInfo = seller?.shippingInfo;
      
      return {
        sellerName: seller?.sellerName || 'Unknown Seller',
        price: priceInfo?.priceString || 'N/A',
        type: determineSellerType(seller),
        arrives: shippingInfo?.deliveryDate ? formatDeliveryDate(new Date(shippingInfo.deliveryDate)) : 'N/A',
        isProSeller: seller?.sellerType === 'PRO',
        isWFS: seller?.fulfillmentType === 'WFS',
        priceInfo: priceInfo || null
      };
    });
  },
  (error) => {
    // Log error and return empty array on failure
    logError({
      message: 'Error fetching seller data from API',
      severity: ErrorSeverity.ERROR,
      component: 'api',
      error: error as Error,
      context: { method: 'fetchSellerDataFromAPI' }
    });
    return [];
  }
);

/**
 * Fetches product variant data from Walmart's product page
 * @param variantId The variant ID to fetch data for
 * @returns The variant data including image, title, ratings, etc.
 */
export const fetchVariantData = withErrorHandling(
  async (variantId: string) => {
    // Construct the product page URL
    const url = `https://www.walmart.com/ip/${variantId}`;
    
    // Fetch the page content
    const response = await fetch(url);
    const text = await response.text();
    
    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const dataScript = doc.querySelector('script[id="__NEXT_DATA__"]');
    
    // Return default values if no data found
    if (!dataScript?.textContent) {
      return {
        image: '-',
        title: '-',
        ratings: '-',
        sellers: '-',
        upc: '-'
      };
    }
    
    // Parse the JSON data from the script tag
    const jsonData = JSON.parse(dataScript.textContent);
    const product = jsonData.props.pageProps?.initialData?.data?.product;
    
    // Return default values if no product data found
    if (!product) {
      return {
        image: '-',
        title: '-',
        ratings: '-',
        sellers: '-',
        upc: '-'
      };
    }
    
    // Return formatted product data
    return {
      image: product.imageInfo?.thumbnailUrl || '-',
      title: product.name || '-',
      ratings: product.numberOfReviews || 0,
      sellers: product.additionalOfferCount != null ? product.additionalOfferCount + 1 : 1,
      upc: product.upc || '-'
    };
  },
  (error) => {
    // Log error and return default values on failure
    logError({
      message: 'Error fetching variant data',
      severity: ErrorSeverity.ERROR,
      component: 'api',
      error: error as Error,
      context: { method: 'fetchVariantData' }
    });
    return {
      image: '-',
      title: '-',
      ratings: '-',
      sellers: '-',
      upc: '-'
    };
  }
); 