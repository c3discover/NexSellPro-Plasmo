import { logError, ErrorSeverity, withErrorHandling } from '../utils/errorHandling';
import type { SellerInfo } from '../types/seller';

/**
 * Fetches seller data from the Walmart GraphQL API
 * @param itemId The product ID to fetch seller data for
 * @returns An array of seller information
 */
export const fetchSellerDataFromAPI = withErrorHandling(
  async (itemId: string): Promise<SellerInfo[]> => {
    const url = `https://www.walmart.com/orchestra/home/graphql/getMultipleSellerOffersMetaData`;
    
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
      variables: {
        itemId
      }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !data.data.product || !data.data.product.sellerInfo) {
      return [];
    }
    
    // Transform the API response to match our SellerInfo interface
    return data.data.product.sellerInfo.map((seller: any) => ({
      sellerName: seller.sellerName || 'Unknown Seller',
      price: seller.priceInfo?.currentPrice?.priceString || 'N/A',
      type: determineSellerType(seller),
      arrives: formatDeliveryDate(seller.shippingInfo?.deliveryDate),
      isProSeller: seller.sellerType === 'PRO',
      isWFS: seller.fulfillmentType === 'WFS',
      priceInfo: seller.priceInfo
    }));
  },
  (error) => {
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
 * Fetches product variant data
 * @param variantId The variant ID to fetch data for
 * @returns The variant data
 */
export const fetchVariantData = withErrorHandling(
  async (variantId: string) => {
    const url = `https://www.walmart.com/ip/${variantId}`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const dataScript = doc.querySelector('script[id="__NEXT_DATA__"]');
    
    if (!dataScript || !dataScript.textContent) {
      return {
        image: '-',
        title: '-',
        ratings: '-',
        sellers: '-',
        upc: '-'
      };
    }
    
    const jsonData = JSON.parse(dataScript.textContent);
    const product = jsonData.props.pageProps?.initialData?.data?.product;
    
    if (!product) {
      return {
        image: '-',
        title: '-',
        ratings: '-',
        sellers: '-',
        upc: '-'
      };
    }
    
    return {
      image: product.imageInfo?.thumbnailUrl || '-',
      title: product.name || '-',
      ratings: product.numberOfReviews || 0,
      sellers: product.additionalOfferCount != null ? product.additionalOfferCount + 1 : 1,
      upc: product.upc || '-'
    };
  },
  (error) => {
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

/**
 * Determines the seller type based on seller information
 * @param seller The seller information
 * @returns The seller type
 */
function determineSellerType(seller: any): string {
  if (seller.fulfillmentType === 'WFS') {
    return seller.sellerType === 'PRO' ? 'WFS-Pro' : 'WFS';
  } else {
    return seller.sellerType === 'PRO' ? 'SF-Pro' : 'SF';
  }
}

/**
 * Formats a delivery date string
 * @param dateString The delivery date string
 * @returns A formatted delivery date string
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