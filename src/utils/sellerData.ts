////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import type { SellerInfo } from "~/types/seller";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
const GRAPHQL_ENDPOINT = 'https://www.walmart.com/orchestra/home/graphql/GetAllSellerOffers/ceb1a19937155516286824bfb2b9cc9331cc89e6d4bea5756776737724d5b3cf';
const GRAPHQL_CACHE_DURATION = 30000; // 30 seconds cache
const OBSERVER_DEBOUNCE_DELAY = 1000; // 1 second debounce
const COMPARE_BUTTON_COOLDOWN = 5000; // 5 seconds cooldown between clicks

// Cache for GraphQL responses
let graphQLCache: {
  data: SellerInfo[];
  timestamp: number;
  productId: string;
} | null = null;

// Selector constants for DOM operations
const SELLER_SELECTORS = {
  MORE_SELLERS_WRAPPER: [
    "div[data-testid='ip-more-sellers-panel-offers-div-wrapper']",
    "div[data-testid='seller-panel-wrapper']",
    "div[data-testid='seller-panel']",
    "div[data-testid='more-sellers-panel']",
    "[data-testid*='seller-panel']",
    "[data-testid*='offers-panel']"
  ],
  SELLER_ROW: [
    "div[data-testid='allSellersOfferLine']",
    "div[data-testid='seller-offer-row']",
    "div[data-testid='seller-panel-row']",
    "[data-testid*='seller-row']",
    "[data-testid*='offer-line']"
  ],
  PRICE_ELEMENT: [
    "span[itemprop='price']",
    "[data-testid='price-wrap'] span",
    "div.b.f4.w-50",
    "span[data-testid='price-string']",
    "div[data-testid='seller-price']",
    "[data-automation-id='product-price']"
  ],
  SELLER_INFO: [
    "span[data-testid='product-seller-info']",
    "div[data-testid='seller-info']",
    "a[data-testid='seller-name-link']",
    "div[data-testid='seller-name']",
    "span[data-testid='seller-display-name']",
    "[data-testid*='seller-name']"
  ],
  DELIVERY_OPTIONS: [
    "div[data-testid='shipping-delivery-date']",
    "div[data-testid='fulfillment-options']",
    "div[data-testid='seller-delivery-options']",
    "[data-testid*='delivery']",
    "[data-testid*='shipping']"
  ],
  WFS_INDICATOR: [
    "span[aria-label*='Walmart Fulfillment Services']",
    "span[data-testid='wfs-badge']",
    "span[data-testid='fulfillment-badge']",
    "[data-testid*='fulfillment']"
  ],
  PRO_SELLER_BADGE: [
    "span[data-testid='pro-seller-badge']",
    "span[data-testid='seller-badge-pro']",
    "[data-testid*='pro-seller']"
  ],
  COMPARE_SELLERS_BUTTON: [
    "button[aria-label='Compare all sellers']",
    "button[data-testid='compare-sellers-button']",
    "[data-testid*='compare-sellers']"
  ]
} as const;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Using imported SellerInfo type

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
const waitForElement = async (selectors: string | string[], maxAttempts = 5): Promise<Element | null> => {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    for (const selector of selectorArray) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return null;
};

const determineSellerType = (sellerName: string, isWFS: boolean, isProSeller: boolean): string => {
  if (sellerName.toLowerCase().includes('walmart.com')) return 'WMT';
  if (isWFS) return isProSeller ? 'WFS-Pro' : 'WFS';
  return isProSeller ? 'SF-Pro' : 'SF';
};

////////////////////////////////////////////////
// Main Functions:
////////////////////////////////////////////////
export const fetchSellerDataGraphQL = async (itemId: string): Promise<SellerInfo[]> => {
  // Check cache first
  if (graphQLCache && 
      graphQLCache.productId === itemId && 
      Date.now() - graphQLCache.timestamp < GRAPHQL_CACHE_DURATION) {
    return graphQLCache.data;
  }

  try {
    const variables = {
      itemId,
      isSubscriptionEligible: true
    };

    const correlationId = Math.random().toString(36).substring(2, 15);
    
    const response = await fetch(`${GRAPHQL_ENDPOINT}?variables=${encodeURIComponent(JSON.stringify(variables))}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'x-apollo-operation-name': 'GetAllSellerOffers',
        'x-o-platform': 'rweb',
        'wm_mp': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data?.data?.product?.allOffers) {
      const sellers = data.data.product.allOffers
        .filter((offer: any) => offer.availabilityStatus === 'IN_STOCK')
        .map((offer: any) => ({
          sellerName: offer.sellerDisplayName || offer.sellerName || 'Unknown Seller',
          price: offer.priceInfo?.currentPrice?.priceString || 'N/A',
          type: determineSellerType(
            offer.sellerName || '',
            offer.wfsEnabled || offer.fulfillmentType === 'FC',
            offer.hasSellerBadge || false
          ),
          arrives: offer.shippingOption?.deliveryDate || 'N/A',
          isProSeller: offer.hasSellerBadge || false,
          isWFS: offer.wfsEnabled || offer.fulfillmentType === 'FC',
          priceInfo: offer.priceInfo,
          fulfillmentStatus: offer.fulfillmentType,
          arrivalDate: offer.shippingOption?.deliveryDate || 'N/A'
        }));

      // Cache the results
      graphQLCache = {
        data: sellers,
        timestamp: Date.now(),
        productId: itemId
      };

      // Log the raw GraphQL response and processed sellers
      console.log('%c[All Seller Data]', 'color: #6366f1; font-weight: bold', {
        timestamp: new Date().toISOString(),
        rawData: data.data.product.allOffers,
        processedData: sellers
      });

      return sellers;
    }
    
    return [];
  } catch (error) {
    return [];
  }
};

export const getSellerData = async (): Promise<SellerInfo[]> => {
  try {
    const dataDiv = document.getElementById("__NEXT_DATA__");
    if (!dataDiv) {
      return [];
    }
    
    const rawData = dataDiv.innerText;
    const { product } = JSON.parse(rawData).props.pageProps.initialData.data;
    
    if (!product?.usItemId) {
      return [];
    }

    const graphQLData = await fetchSellerDataGraphQL(product.usItemId);
    
    return graphQLData;
  } catch (error) {
    return [];
  }
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default getSellerData; 