import { logError, ErrorSeverity, withErrorHandling } from '../utils/errorHandling';
import type { SellerInfo } from '../types/seller';
import { fetchSellerDataFromAPI } from './api';
import { getProductDataWithCache } from './productService';
import { memoize } from '../utils/memoization';
import type { ProductDetails } from '../types/product';

/**
 * Extracts seller information from the page source safely
 * @returns An array of seller names
 */
function extractSellerNamesFromScripts(): string[] {
  const sellerNames: string[] = [];
  
  // Get all script elements
  const scripts = document.querySelectorAll('script[type="application/json"]');
  
  // Iterate through scripts and look for seller information
  scripts.forEach(script => {
    try {
      if (script.textContent) {
        const data = JSON.parse(script.textContent);
        
        // Extract seller names from various possible locations in the data
        if (data.props?.pageProps?.initialData?.data?.product?.sellerInfo?.sellerName) {
          sellerNames.push(data.props.pageProps.initialData.data.product.sellerInfo.sellerName);
        }
        
        if (data.props?.pageProps?.initialData?.data?.product?.sellers?.otherSellers) {
          data.props.pageProps.initialData.data.product.sellers.otherSellers.forEach((seller: any) => {
            if (seller.sellerName) {
              sellerNames.push(seller.sellerName);
            }
          });
        }
        
        // Look for seller names in offers
        if (data.props?.pageProps?.initialData?.data?.product?.offers) {
          data.props.pageProps.initialData.data.product.offers.forEach((offer: any) => {
            if (offer.sellerName) {
              sellerNames.push(offer.sellerName);
            }
          });
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  });
  
  // Remove duplicates
  return [...new Set(sellerNames)];
}

/**
 * Extracts seller data from the DOM
 * @returns An array of seller information
 */
export const extractSellersFromDOM = withErrorHandling(
  async (): Promise<SellerInfo[]> => {
    // Try to find the seller table in the DOM
    const sellerTable = document.querySelector('[data-testid="seller-table"]');
    if (sellerTable) {
      const sellerRows = sellerTable.querySelectorAll('tr');
      if (sellerRows && sellerRows.length > 1) { // Skip header row
        const sellers: SellerInfo[] = [];
        
        // Skip the header row (index 0)
        for (let i = 1; i < sellerRows.length; i++) {
          const row = sellerRows[i];
          const cells = row.querySelectorAll('td');
          
          if (cells.length >= 4) {
            const sellerName = cells[0].textContent?.trim() || 'Unknown Seller';
            const price = cells[1].textContent?.trim() || 'N/A';
            const arrives = cells[2].textContent?.trim() || 'N/A';
            
            // Check if it's a WFS seller
            const isWFS = cells[3].querySelector('[data-testid="wfs-badge"]') !== null;
            
            // Check if it's a Pro seller
            const isProSeller = cells[0].querySelector('[data-testid="pro-badge"]') !== null;
            
            // Determine seller type
            let type = 'SF'; // Default to seller-fulfilled
            if (isWFS) {
              type = isProSeller ? 'WFS-Pro' : 'WFS';
            } else if (isProSeller) {
              type = 'SF-Pro';
            }
            
            sellers.push({
              sellerName,
              price,
              type,
              arrives,
              isWFS,
              isProSeller
            });
          }
        }
        
        return sellers;
      }
    }
    
    // If we couldn't find the seller table, try to extract seller names from scripts
    const sellerNames = extractSellerNamesFromScripts();
    if (sellerNames.length > 0) {
      // Create basic seller info for each seller name
      return sellerNames.map(sellerName => ({
        sellerName,
        price: 'N/A',
        type: 'Unknown',
        arrives: 'N/A',
        isWFS: false,
        isProSeller: false
      }));
    }
    
    // If all else fails, try to get the product data and extract the main seller
    const productData = await getProductDataWithCache('current');
    if (productData) {
      return [{
        sellerName: 'Walmart',
        price: productData.retailPrice ? `$${productData.retailPrice}` : 'N/A',
        type: 'WMT',
        arrives: 'N/A',
        isWFS: false,
        isProSeller: false
      }];
    }
    
    return [];
  },
  (error) => {
    logError({
      message: 'Error extracting sellers from DOM',
      severity: ErrorSeverity.ERROR,
      component: 'sellerService',
      error: error as Error
    });
    return [];
  }
);

/**
 * Gets seller data from the API or DOM
 * @returns An array of seller information
 */
export const getSellerData = withErrorHandling(
  async (): Promise<SellerInfo[]> => {
    // Try to get the product ID from the URL
    const productId = window.location.pathname.split('/').pop() || '';
    if (!productId) {
      return [];
    }
    
    // Try to get seller data from the API first
    try {
      const apiSellers = await fetchSellerDataFromAPI(productId);
      if (apiSellers && apiSellers.length > 0) {
        return apiSellers;
      }
    } catch (error) {
      logError({
        message: 'Error fetching seller data from API',
        severity: ErrorSeverity.WARNING,
        component: 'sellerService',
        error: error as Error
      });
      // Continue to DOM extraction
    }
    
    // If API fails, try to extract from DOM
    return extractSellersFromDOM();
  },
  (error) => {
    logError({
      message: 'Error getting seller data',
      severity: ErrorSeverity.ERROR,
      component: 'sellerService',
      error: error as Error
    });
    return [];
  }
);

/**
 * Determine seller type based on seller data
 */
export const determineSellerType = (seller: { isWFSEnabled?: boolean; isFBMEnabled?: boolean }): string => {
  if (seller.isWFSEnabled) return 'WFS';
  if (seller.isFBMEnabled) return 'FBM';
  return 'Unknown';
};

/**
 * Format delivery date for display
 */
export const formatDeliveryDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Observe seller data changes and update UI accordingly
 */
export const observeSellerData = memoize((sellerId: string, callback: (data: any) => void) => {
  // Implementation
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const sellerData = extractSellerData(mutation.target as Element);
        if (sellerData) {
          callback(sellerData);
        }
      }
    });
  });

  return observer;
}, {
  maxCacheSize: 10,
  cacheKeyFn: (sellerId) => sellerId
});

/**
 * Extract seller data from DOM element
 */
const extractSellerData = (element: Element): any => {
  // Implementation
  const data = {
    name: element.getAttribute('data-seller-name'),
    rating: element.getAttribute('data-seller-rating'),
    fulfillmentType: element.getAttribute('data-fulfillment-type')
  };

  return data;
}; 