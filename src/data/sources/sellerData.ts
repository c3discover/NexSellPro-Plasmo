/**
 * @fileoverview Seller data extraction and processing
 * @author NexSellPro
 * @created 2025-04-18
 * @lastModified 2025-04-18
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import { logGroup, logTable, logGroupEnd, LogModule } from '../utils/logger';
import { type SellerInfo } from '~/types/seller';
import { getProductDetails } from './getData';

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
// GraphQL endpoint for fetching seller data
const GRAPHQL_ENDPOINT = 'https://www.walmart.com/orchestra/home/graphql/GetAllSellerOffers/ceb1a19937155516286824bfb2b9cc9331cc89e6d4bea5756776737724d5b3cf';

// Cache and timing constants
const GRAPHQL_CACHE_DURATION = 30000; // 30 seconds cache
const OBSERVER_DEBOUNCE_DELAY = 1000; // 1 second debounce
const COMPARE_BUTTON_COOLDOWN = 5000; // 5 seconds cooldown between clicks



// DOM Selectors for finding seller information
const SELLER_SELECTORS = {
  // Main selectors for more sellers panel
  MORE_SELLERS_WRAPPER: [
    // Multiple sellers view
    "div[data-testid='ip-more-sellers-panel-offers-div-wrapper']",
    "div[data-testid='seller-panel-wrapper']",
    "div[data-testid='seller-panel']",
    "div[data-testid='more-sellers-panel']",
    // Fallback selectors
    "[data-testid*='seller-panel']",
    "[data-testid*='offers-panel']"
  ],

  SELLER_ROW: [
    // Multiple seller elements
    "div[data-testid='allSellersOfferLine']",
    "div[data-testid='seller-offer-row']",
    "div[data-testid='seller-panel-row']",
    // Fallback selectors
    "[data-testid*='seller-row']",
    "[data-testid*='offer-line']"
  ],

  // Price selectors
  PRICE_ELEMENT: [
    "span[itemprop='price']",
    "[data-testid='price-wrap'] span",
    "div.b.f4.w-50",
    "span[data-testid='price-string']",
    "div[data-testid='seller-price']",
    "[data-automation-id='product-price']"
  ],

  // Seller information
  SELLER_INFO: [
    "span[data-testid='product-seller-info']",
    "div[data-testid='seller-info']",
    "a[data-testid='seller-name-link']",
    "div[data-testid='seller-name']",
    "span[data-testid='seller-display-name']",
    "[data-testid*='seller-name']",
    "[data-testid*='seller-info']"
  ],

  // Delivery information
  DELIVERY_OPTIONS: [
    "div[data-testid='shipping-delivery-date']",
    "div[data-testid='fulfillment-options']",
    "div[data-testid='more-seller-options-fulfillment-option']",
    "div[data-testid='seller-delivery-options']",
    "div[data-testid='delivery-option']",
    "[data-testid*='delivery']",
    "[data-testid*='shipping']"
  ],

  // Badges and status
  WFS_INDICATOR: [
    "span[aria-label*='Walmart Fulfillment Services']",
    "span[data-testid='wfs-badge']",
    "span[data-testid='fulfillment-badge']",
    "span[data-testid='fulfillment-type']",
    "div[data-testid='fulfillment-info']",
    "[data-testid*='fulfillment']"
  ],

  PRO_SELLER_BADGE: [
    "span[data-testid='pro-seller-badge']",
    "span[data-testid='seller-badge-pro']",
    "span[data-testid='seller-type-pro']",
    "div[data-testid='pro-badge']",
    "[data-testid*='pro-seller']"
  ],

  // Compare sellers button
  COMPARE_SELLERS_BUTTON: [
    "button[aria-label='Compare all sellers']",
    "button[data-testid='compare-sellers-button']",
    "[data-testid*='compare-sellers']",
    "button[data-automation-id='compare-sellers']",
    "a[href*='seller-all']"
  ]
};


////////////////////////////////////////////////
// Types:
////////////////////////////////////////////////
interface SellerCache {
  data: SellerInfo[];
  timestamp: number;
  productId: string;
}

interface RawSellerData {
  name: string | null;
  price: string | null;
  deliveryInfo: string;
  isWFS: boolean;
  isProSeller: boolean;
}

interface SellerResponse {
  data: {
    product: {
      sellers: {
        name: string;
        sellerId: string;
        sellerType: string;
        sellerRating: number;
        fulfillmentType: string;
        shippingMethods: {
          shipPrice: number;
          shipMethod: string;
          estimatedDeliveryDate: string;
        }[];
        inventoryCount: number;
        bestMarketplacePrice: {
          price: number;
          availabilityStatus: string;
        };
      }[];
    };
  };
}

declare global {
  interface Window {
    __nsp_logged_sellerData?: boolean;
  }
}

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// Wait for element to appear in DOM
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

  console.warn(`Elements not found after ${maxAttempts} attempts. Tried selectors:`, selectorArray);
  return null;
};

// Query element using multiple selectors
const queryElement = (container: Element, selectors: string | string[]): Element | null => {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

  for (const selector of selectorArray) {
    const element = container.querySelector(selector);
    if (element) return element;
  }

  return null;
};

// Format price string
const formatPrice = (price: string | null): string => {
  if (!price) return 'N/A';
  const cleanPrice = price.replace(/[^\d.]/g, '');
  return cleanPrice ? `$${cleanPrice}` : 'N/A';
};

// Extract delivery information
const extractDeliveryInfo = (container: Element): string => {
  const deliveryOptions = container.querySelectorAll(SELLER_SELECTORS.DELIVERY_OPTIONS.join(','));
  if (!deliveryOptions.length) return 'N/A';

  // Get the first delivery option with arrival info
  for (const option of Array.from(deliveryOptions)) {
    const text = option.textContent;
    if (text?.includes('arrives')) {
      const arrivalMatch = text.match(/arrives\s+(\w+)/i);
      return arrivalMatch ? arrivalMatch[1] : text.trim();
    }
  }

  // Fallback to first delivery option
  return deliveryOptions[0].textContent?.trim() || 'N/A';
};

// State variables for button handling
let isCompareButtonDebouncing = false;
let lastCompareButtonClick = 0;
let graphQLCache: SellerCache | null = null;

// --- Bot protection & safe fetch logic ---
let consecutive412s = 0;
let lastBackoff = 0;

function randomDelay(min = 250, max = 1250) {
  return new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

function randomBackoff(min = 60000, max = 90000) {
  return new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
}

async function safeGraphQLFetch(url, options) {
  await randomDelay();
  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    // Network error, treat as soft fail
    return { blocked: false, response: null };
  }

  let blocked = false;
  let shouldBackoff = false;
  let status = response.status;
  let text = await response.clone().text();

  if (status === 412 || (text && text.includes('redirectUrl') && text.includes('/blocked'))) {
    blocked = true;
    shouldBackoff = true;
    consecutive412s++;
  } else {
    consecutive412s = 0;
  }

  if (shouldBackoff) {
    if (!window.__nsp_logged_sellerData) {
      logGroup(LogModule.SELLER_DATA, 'Seller Data');
      logTable(LogModule.SELLER_DATA, '⚠️ Walmart bot protection triggered. Pausing data fetch.');
      logGroupEnd();
      window.__nsp_logged_sellerData = true;
    } else {
      // Also log to console for devs
      console.warn('⚠️ Walmart bot protection triggered. Pausing data fetch.');
    }
    // Exponential backoff: 60-90s * 2^n for n consecutive 412s
    let base = Math.pow(2, Math.min(consecutive412s, 4));
    let backoffMs = (Math.floor(Math.random() * 30000) + 60000) * base;
    lastBackoff = Date.now();
    await new Promise((resolve) => setTimeout(resolve, backoffMs));
    return { blocked: true, response: null };
  }

  return { blocked: false, response };
}

// Extract seller elements from container
const extractSellerElements = (container: Element): RawSellerData => {

  // Extract seller info with enhanced detection
  const sellerInfoEl = queryElement(container, SELLER_SELECTORS.SELLER_INFO);

  let sellerName = null;
  if (sellerInfoEl) {
    // Enhanced seller name extraction
    const possibleSellerSources = [
      // Try aria-label first
      () => sellerInfoEl.getAttribute('aria-label')?.replace(/^Sold and shipped by\s+/i, ''),
      // Try seller name link
      () => sellerInfoEl.querySelector('a[data-testid="seller-name-link"]')?.textContent,
      // Try direct text content
      () => sellerInfoEl.textContent?.trim(),
      // Try nested elements
      () => sellerInfoEl.querySelector('[data-testid="seller-name"]')?.textContent,
      () => sellerInfoEl.querySelector('[data-testid="seller-display-name"]')?.textContent,
      // Try parent element
      () => sellerInfoEl.closest('[data-testid*="seller"]')?.textContent?.replace(/^Sold and shipped by\s+/i, '')
    ];

    // Try each source until we find a valid seller name
    for (const getSellerName of possibleSellerSources) {
      const name = getSellerName()?.trim();
      if (name && name.length > 0 && !name.toLowerCase().includes('sold') && !name.toLowerCase().includes('shipped')) {
        sellerName = name;
        break;
      }
    }
  }

  // Enhanced price extraction
  const priceEl = queryElement(container, SELLER_SELECTORS.PRICE_ELEMENT);
  let price = null;
  if (priceEl) {
    // Try to find the most specific price element
    const priceText = priceEl.getAttribute('content') || // Try structured data first
                     priceEl.textContent?.trim() ||      // Then try text content
                     priceEl.getAttribute('value');      // Finally try value attribute
    price = priceText;
  }

  // Enhanced delivery info extraction
  const deliveryInfo = extractDeliveryInfo(container);

  // Enhanced WFS detection
  const isWFS = !!sellerInfoEl?.textContent?.toLowerCase().includes('fulfilled by walmart') ||
                !!container.querySelector(SELLER_SELECTORS.WFS_INDICATOR.join(',')) ||
                !!document.querySelector(SELLER_SELECTORS.WFS_INDICATOR.join(',')) ||
                !!container.querySelector('[data-testid*="fulfillment"][data-testid*="walmart" i]');

  // Enhanced Pro Seller detection
  const isProSeller = !!container.querySelector(SELLER_SELECTORS.PRO_SELLER_BADGE.join(',')) ||
                     !!document.querySelector(SELLER_SELECTORS.PRO_SELLER_BADGE.join(',')) ||
                     !!container.querySelector('[data-testid*="pro-seller" i]');


  return {
    name: sellerName,
    price,
    deliveryInfo,
    isWFS,
    isProSeller
  };
};

// Validate and transform seller data
const validateAndTransformSellerData = (raw: RawSellerData): SellerInfo | null => {
  try {
    if (!raw.name) {
      console.warn('Missing seller name:', raw);
      return null;
    }

    return {
      sellerName: raw.name,
      price: formatPrice(raw.price),
      type: determineSellerType(raw.name, raw.isWFS, raw.isProSeller),
      arrives: raw.deliveryInfo || 'N/A',
      isProSeller: raw.isProSeller,
      isWFS: raw.isWFS
    };
  } catch (error) {
    console.error('Error validating seller data:', error);
    return null;
  }
};

// Determine seller type
const determineSellerType = (sellerName: string, isWFS: boolean, isProSeller: boolean): string => {
  if (sellerName.toLowerCase().includes('walmart.com')) return 'WMT';
  if (isWFS) return isProSeller ? 'WFS-Pro' : 'WFS';
  return isProSeller ? 'SF-Pro' : 'SF';
};

// Extract all sellers from page
const extractAllSellers = async (): Promise<SellerInfo[]> => {
  try {

    // First, try to click the "Compare all sellers" button if it exists
    const compareButton = await waitForElement(SELLER_SELECTORS.COMPARE_SELLERS_BUTTON);
    if (compareButton instanceof HTMLElement) {
      const now = Date.now();
      if (now - lastCompareButtonClick < COMPARE_BUTTON_COOLDOWN || isCompareButtonDebouncing) {
      } else {
        isCompareButtonDebouncing = true;
        compareButton.click();
        lastCompareButtonClick = now;
        // Wait for the modal to appear
        await new Promise(resolve => setTimeout(resolve, 1000));
        isCompareButtonDebouncing = false;
      }
    }

    // Try to find seller wrapper
    const sellersWrapper = await waitForElement(SELLER_SELECTORS.MORE_SELLERS_WRAPPER);

    if (!sellersWrapper) {
      console.warn('No sellers wrapper found, trying alternative methods...');

      // Try to find all seller elements directly
      const allSellerElements = document.querySelectorAll(SELLER_SELECTORS.SELLER_INFO.join(','));
      if (allSellerElements.length > 0) {
        const sellers = Array.from(allSellerElements)
          .map(element => {
            const raw = extractSellerElements(element);
            return validateAndTransformSellerData(raw);
          })
          .filter((seller): seller is SellerInfo => seller !== null);

        if (sellers.length > 0) {
        return sellers;
        }
      }

      // Try to find seller info in the page source
      const pageSource = document.documentElement.innerHTML;
      const sellerMatches = pageSource.match(/(?:"sellerName"|"seller")\s*:\s*"([^"]+)"/g);
      if (sellerMatches) {
        const uniqueSellers = new Set(
          sellerMatches
            .map(match => match.match(/"([^"]+)"$/)?.[1])
            .filter((name): name is string => name !== undefined)
        );

        if (uniqueSellers.size > 0) {
          return Array.from(uniqueSellers).map(name => ({
            sellerName: name,
            price: 'N/A',
            type: determineSellerType(name, false, false),
            arrives: 'N/A',
            isProSeller: false,
            isWFS: false
          }));
        }
      }

      console.warn('No seller data found through any method');
      return [];
    }

    // Get all seller rows
    const sellerRows = sellersWrapper.querySelectorAll(SELLER_SELECTORS.SELLER_ROW.join(','));

    if (sellerRows.length === 0) {
      // If no seller rows found, try to extract from the wrapper itself
      const wrapperData = extractSellerElements(sellersWrapper);
      const processed = validateAndTransformSellerData(wrapperData);
      if (processed) return [processed];

      // Try to find seller elements within the wrapper
      const sellerElements = sellersWrapper.querySelectorAll(SELLER_SELECTORS.SELLER_INFO.join(','));
      if (sellerElements.length > 0) {
        return Array.from(sellerElements)
          .map(element => {
            const raw = extractSellerElements(element);
            return validateAndTransformSellerData(raw);
          })
          .filter((seller): seller is SellerInfo => seller !== null);
      }

      return [];
    }

    // Extract data from each row
    const sellers = Array.from(sellerRows)
      .map((row, index) => {
        const raw = extractSellerElements(row);
        const processed = validateAndTransformSellerData(raw);
        return processed;
      })
      .filter((seller): seller is SellerInfo => seller !== null);

    return sellers;
  } catch (error) {
    console.error('Error extracting sellers:', error);
    return [];
  }
};

// Extract single seller data
const extractSingleSellerData = async (): Promise<SellerInfo | null> => {
  try {
    // Try to find seller info in the main product page
    const sellerElement = document.querySelector(SELLER_SELECTORS.SELLER_INFO.join(','));
    if (!sellerElement) return null;

    const raw = extractSellerElements(sellerElement);
    return validateAndTransformSellerData(raw);
  } catch (error) {
    console.error('Error extracting single seller data:', error);
    return null;
  }
};

// Fetch seller data from GraphQL API
const fetchSellerDataGraphQL = async (itemId: string): Promise<SellerInfo[]> => {
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
    // Get current page cookies
    const cookies = document.cookie;
    const url = `${GRAPHQL_ENDPOINT}?variables=${encodeURIComponent(JSON.stringify(variables))}`;
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'accept-language': 'en-US',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'pragma': 'no-cache',
        'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-apollo-operation-name': 'GetAllSellerOffers',
        'x-enable-server-timing': '1',
        'x-latency-trace': '1',
        'x-o-bu': 'WALMART-US',
        'x-o-ccm': 'server',
        'x-o-correlation-id': correlationId,
        'x-o-gql-query': 'query GetAllSellerOffers',
        'x-o-mart': 'B2C',
        'x-o-platform': 'rweb',
        'x-o-platform-version': 'us-web-1.173.0',
        'x-o-segment': 'oaoh',
        'wm_mp': 'true',
        'wm_qos.correlation_id': correlationId,
        'referer': window.location.href,
        'user-agent': navigator.userAgent,
        'cookie': cookies
      },
      credentials: 'include',
      mode: 'cors'
    };

    const { blocked, response } = await safeGraphQLFetch(url, options);
    if (blocked || !response) {
      // Return empty array to avoid crashing UI
      return [];
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
    }

    const data = await response.json();

    if (data?.data?.product?.allOffers) {
      const sellers = data.data.product.allOffers
        .filter((offer: any) => offer.availabilityStatus === 'IN_STOCK')
        .map((offer: any) => ({
          sellerName: offer.sellerDisplayName || offer.sellerName || 'Unknown Seller',
          price: offer.priceInfo?.currentPrice?.priceString || 'N/A',
          type: determineSellerTypeFromOffer(offer),
          arrives: formatDeliveryDate(offer.shippingOption?.deliveryDate) || 'N/A',
          isProSeller: offer.hasSellerBadge || false,
          isWFS: offer.wfsEnabled || offer.fulfillmentType === 'FC',
          availableQuantity: offer.fulfillmentOptions?.[0]?.availableQuantity || 0
        }));

      // Cache the results
      graphQLCache = {
        data: sellers,
        timestamp: Date.now(),
        productId: itemId
      };

      return sellers;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching seller data from GraphQL:', error);
    // If GraphQL fails, try DOM extraction as fallback
    return [];
  }
};

// Determine seller type from GraphQL offer
const determineSellerTypeFromOffer = (offer: any): string => {
  if (offer.sellerName === 'Walmart.com' || offer.sellerType === 'INTERNAL') {
    return 'WMT';
  }
  
  if (offer.wfsEnabled || offer.fulfillmentType === 'FC') {
    return offer.hasSellerBadge ? 'WFS-Pro' : 'WFS';
  }
  
  return offer.hasSellerBadge ? 'SF-Pro' : 'SF';
};

// Format delivery date
const formatDeliveryDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'N/A';
  }
};

// Main seller data extraction function
const extractSellerData = async (): Promise<SellerInfo[]> => {
  try {
    const dataDiv = document.getElementById("__NEXT_DATA__");
    if (!dataDiv) {
      throw new Error('No product data available');
    }
    
    const rawData = dataDiv.innerText;
    const { product, idml, reviews } = JSON.parse(rawData).props.pageProps.initialData.data;
    const productDetails = getProductDetails(product, idml, reviews);
    
    if (!productDetails?.productID) {
      throw new Error('No product ID available');
    }

    // Try GraphQL endpoint first
    const graphQLData = await fetchSellerDataGraphQL(productDetails.productID);
    if (graphQLData && graphQLData.length > 0) {
      return graphQLData;
    }

    // Only try DOM extraction with button click if GraphQL failed
    const domData = await extractAllSellers();
    if (domData && domData.length > 0) {
      return domData;
    }

    // If both methods fail, try single seller data
    const singleSellerData = await extractSingleSellerData();
    if (singleSellerData) {
      return [singleSellerData];
    }

    // Last resort: construct basic seller info from product details
    return [{
      sellerName: productDetails.sellerName || productDetails.sellerDisplayName || 'Unknown Seller',
      price: productDetails.currentPrice ? `$${productDetails.currentPrice}` : 'N/A',
      type: determineSellerType(productDetails.sellerName || '', false, false),
      arrives: 'N/A',
      isProSeller: false,
      isWFS: false
    }];
  } catch (error) {
    console.error('Error in seller extraction:', error);
    return [];
  }
};

// Observe DOM for seller data changes
const observeSellerData = (callback: (sellers: SellerInfo[]) => void): () => void => {
  let debounceTimeout: NodeJS.Timeout | null = null;
  let lastProcessedData: string | null = null;

  const observer = new MutationObserver(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(async () => {
      const dataDiv = document.getElementById("__NEXT_DATA__");
      if (!dataDiv) return;

      const currentData = dataDiv.innerText;
      // Skip if we've already processed this exact data
      if (currentData === lastProcessedData) {
        return;
      }
      lastProcessedData = currentData;

      const sellers = await extractSellerData();
      if (sellers.length > 0) {
        callback(sellers);
      }
    }, OBSERVER_DEBOUNCE_DELAY);
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
  });

  // Return cleanup function
  return () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    observer.disconnect();
  };
};

////////////////////////////////////////////////
// Logging:
////////////////////////////////////////////////
function logSellerData(data: SellerInfo[]): void {
  if (!window.__nsp_logged_sellerData) {
    logGroup(LogModule.SELLER_DATA, "Seller Data");
    logTable(LogModule.SELLER_DATA2, "Sellers", data);
    logGroupEnd();
    window.__nsp_logged_sellerData = true;
  }
}

////////////////////////////////////////////////
// Main Function:
////////////////////////////////////////////////
/**
 * Get seller data for a product
 * @param productId - The product ID to get seller data for
 * @returns Array of seller information
 */
const getSellerData = async (productId: string): Promise<SellerInfo[]> => {
  try {
    const sellers = await extractSellerData();
    logSellerData(sellers);
    return sellers;
  } catch (error) {
    console.error('Error getting seller data:', error);
    return [];
  }
};

////////////////////////////////////////////////
// Export:
////////////////////////////////////////////////
export { getSellerData };
