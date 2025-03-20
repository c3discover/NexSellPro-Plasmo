/**
 * @fileoverview Utility for extracting and processing seller data from Walmart product pages
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import type { SellerInfo } from "~/types/seller";
import { getProductDetails } from './getData';

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
const DEBUG = true;
const GRAPHQL_ENDPOINT = 'https://www.walmart.com/orchestra/home/graphql/GetAllSellerOffers/ceb1a19937155516286824bfb2b9cc9331cc89e6d4bea5756776737724d5b3cf';
const GRAPHQL_CACHE_DURATION = 30000;  // 30 seconds cache
const OBSERVER_DEBOUNCE_DELAY = 1000;  // 1 second debounce
const COMPARE_BUTTON_COOLDOWN = 5000;  // 5 seconds cooldown between clicks

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
/**
 * Raw seller data extracted from DOM elements
 */
interface RawSellerData {
    name: string | null;           // Seller name
    price: string | null;          // Product price
    deliveryInfo: string | null;   // Delivery information
    isWFS: boolean;               // Whether seller uses Walmart Fulfillment Services
    isProSeller: boolean;         // Whether seller is a Pro Seller
}

////////////////////////////////////////////////
// Variables:
////////////////////////////////////////////////
// Cache for GraphQL responses
let graphQLCache: {
    data: SellerInfo[];
    timestamp: number;
    productId: string;
} | null = null;

let lastCompareButtonClick = 0;
let isCompareButtonDebouncing = false;

////////////////////////////////////////////////
// DOM Selectors:
////////////////////////////////////////////////
/**
 * Collection of DOM selectors for extracting seller information
 */
const SELLER_SELECTORS = {
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
        "[data-testid*='seller-name']",
        "[data-testid*='seller-info']"
    ],
    DELIVERY_OPTIONS: [
        "div[data-testid='shipping-delivery-date']",
        "div[data-testid='fulfillment-options']",
        "div[data-testid='more-seller-options-fulfillment-option']",
        "div[data-testid='seller-delivery-options']",
        "div[data-testid='delivery-option']",
        "[data-testid*='delivery']",
        "[data-testid*='shipping']"
    ],
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
    COMPARE_SELLERS_BUTTON: [
        "button[aria-label='Compare all sellers']",
        "button[data-testid='compare-sellers-button']",
        "[data-testid*='compare-sellers']",
        "button[data-automation-id='compare-sellers']",
        "a[href*='seller-all']"
    ]
};

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

/**
 * Log debug information if DEBUG is enabled
 * @param message - Debug message to log
 * @param data - Optional data to log with the message
 */
const logDebug = (message: string, data?: any) => {
    if (!DEBUG) return;
    console.log(`[SellerData Debug] ${message}`, data || '');
};

/**
 * Wait for an element to appear in the DOM
 * @param selectors - CSS selector(s) to look for
 * @param maxAttempts - Maximum number of attempts to find the element
 * @returns Promise resolving to the found element or null
 */
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

/**
 * Query an element using multiple selectors
 * @param container - Container element to search within
 * @param selectors - CSS selector(s) to use
 * @returns The first matching element or null
 */
const queryElement = (container: Element, selectors: string | string[]): Element | null => {
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];

    for (const selector of selectorArray) {
        const element = container.querySelector(selector);
        if (element) return element;
    }

    return null;
};

/**
 * Format a price string with proper currency symbol
 * @param price - Raw price string to format
 * @returns Formatted price string or 'N/A' if invalid
 */
const formatPrice = (price: string | null): string => {
    if (!price) return 'N/A';
    const cleanPrice = price.replace(/[^\d.]/g, '');
    return cleanPrice ? `$${cleanPrice}` : 'N/A';
};

/**
 * Extract delivery information from a container element
 * @param container - Container element to search within
 * @returns Formatted delivery information or 'N/A' if not found
 */
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

/**
 * Extract seller information from a container element
 * @param container - Container element to search within
 * @returns Raw seller data object
 */
const extractSellerElements = (container: Element): RawSellerData => {
    logDebug('Extracting data from container:', container);

    // Extract seller info with enhanced detection
    const sellerInfoEl = queryElement(container, SELLER_SELECTORS.SELLER_INFO);
    logDebug('Found seller info element:', sellerInfoEl);

    let sellerName = 'Unknown Seller'; // Default value
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
    logDebug('Extracted seller name:', sellerName);

    // Enhanced price extraction
    const priceEl = queryElement(container, SELLER_SELECTORS.PRICE_ELEMENT);
    logDebug('Found price element:', priceEl);
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

    const data: RawSellerData = {
        name: sellerName,
        price: price,
        deliveryInfo: deliveryInfo,
        isWFS: !!sellerInfoEl?.textContent?.toLowerCase().includes('fulfilled by walmart') ||
               !!container.querySelector(SELLER_SELECTORS.WFS_INDICATOR.join(',')),
        isProSeller: !!container.querySelector(SELLER_SELECTORS.PRO_SELLER_BADGE.join(','))
    };

    logDebug('Extracted seller data:', data);
    return data;
};

/**
 * Validate and transform raw seller data into SellerInfo format
 * @param raw - Raw seller data to validate and transform
 * @returns Validated and transformed SellerInfo or null if invalid
 */
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

/**
 * Determine seller type based on name and flags
 * @param sellerName - Name of the seller
 * @param isWFS - Whether seller uses Walmart Fulfillment Services
 * @param isProSeller - Whether seller is a Pro Seller
 * @returns Seller type ('WMT', 'WFS', or 'SF')
 */
const determineSellerType = (sellerName: string, isWFS: boolean, isProSeller: boolean): SellerInfo['type'] => {
    if (sellerName.toLowerCase().includes('walmart.com')) return 'WMT';
    return isWFS ? 'WFS' : 'SF';
};

/**
 * Determine seller type from offer data
 * @param offer - Offer data from GraphQL response
 * @returns Seller type ('WMT', 'WFS', or 'SF')
 */
const determineSellerTypeFromOffer = (offer: any): SellerInfo['type'] => {
    if (offer.sellerName === 'Walmart.com' || offer.sellerType === 'INTERNAL') {
        return 'WMT';
    }
    return offer.wfsEnabled || offer.fulfillmentType === 'FC' ? 'WFS' : 'SF';
};

/**
 * Format delivery date string
 * @param dateString - Date string to format
 * @returns Formatted date string or 'N/A' if invalid
 */
const formatDeliveryDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return 'N/A';
    }
};

////////////////////////////////////////////////
// Main Functions:
////////////////////////////////////////////////

/**
 * Extract all seller information from the page
 * @returns Promise resolving to array of SellerInfo objects
 */
const extractAllSellers = async (): Promise<SellerInfo[]> => {
    try {
        // First, try to click the "Compare all sellers" button if it exists
        const compareButton = await waitForElement(SELLER_SELECTORS.COMPARE_SELLERS_BUTTON);
        if (compareButton instanceof HTMLElement) {
            const now = Date.now();
            if (now - lastCompareButtonClick < COMPARE_BUTTON_COOLDOWN || isCompareButtonDebouncing) {
                // Skip if on cooldown
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

            return [];
        }

        // Get all seller rows
        const sellerRows = sellersWrapper.querySelectorAll(SELLER_SELECTORS.SELLER_ROW.join(','));

        // Extract seller information from each row
        const sellers = Array.from(sellerRows)
            .map(row => {
                const raw = extractSellerElements(row);
                return validateAndTransformSellerData(raw);
            })
            .filter((seller): seller is SellerInfo => seller !== null);

        return sellers;
    } catch (error) {
        return [];
    }
};

/**
 * Extract single seller information from the main product page
 * @returns Promise resolving to SellerInfo object or null if not found
 */
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

/**
 * Main function to get seller data, prioritizing GraphQL
 * @returns Promise resolving to array of SellerInfo objects
 */
export const extractSellerData = async (): Promise<SellerInfo[]> => {
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

/**
 * Function to observe DOM changes and detect when seller data becomes available
 * @param callback - Function to call when seller data is available
 * @returns Cleanup function to stop observing
 */
export const observeSellerData = (callback: (sellers: SellerInfo[]) => void): () => void => {
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
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

/**
 * Fetch seller data from Walmart's GraphQL endpoint
 * @param itemId - Product ID to fetch seller data for
 * @returns Promise resolving to array of SellerInfo objects
 */
export const fetchSellerDataGraphQL = async (itemId: string): Promise<SellerInfo[]> => {
    try {
        // Check cache first
        if (graphQLCache.productId === itemId && 
            Date.now() - graphQLCache.timestamp < GRAPHQL_CACHE_DURATION) {
            return graphQLCache.data;
        }

        const variables = {
            id: itemId,
            selected: true,
            channel: "WWW",
            pageType: "ItemPageGlobal"
        };

        const response = await fetch(`${GRAPHQL_ENDPOINT}?variables=${encodeURIComponent(JSON.stringify(variables))}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
            },
            credentials: 'include'
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
                    type: determineSellerTypeFromOffer(offer),
                    arrives: formatDeliveryDate(offer.shippingOption?.deliveryDate) || 'N/A',
                    isProSeller: offer.hasSellerBadge || false,
                    isWFS: offer.wfsEnabled || offer.fulfillmentType === 'FC'
                }));

            // Cache the results
            graphQLCache = {
                data: sellers,
                timestamp: Date.now(),
                productId: itemId
            };

            // Single consolidated log for seller data
            console.log('%c[All Seller Data]', 'color: #6366f1; font-weight: bold', {
                timestamp: new Date().toISOString(),
                data: sellers
            });

            return sellers;
        }

        return [];
    } catch (error) {
        return [];
    }
};

////////////////////////////////////////////////
// Exports:
////////////////////////////////////////////////
// Export extractSellerData as getSellerData for backward compatibility
export const getSellerData = extractSellerData;
export default extractSellerData; 