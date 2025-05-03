/**
 * @fileoverview Data fetching and processing utilities
 * @author Your Name
 * @created 2025-04-18
 * @lastModified 2025-04-18
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import { logGroup, logTable, logGroupEnd, LogModule } from '../utils/logger';
import { sanitizeString, sanitizeNumber } from '../../utils/sanitize';
import RateLimiter from '../../utils/rateLimit';
import { SellerInfo } from '~types/seller';



////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
/**
 * API endpoints for data fetching
 */
const API_ENDPOINTS = {
  products: '/api/products',
  sellers: '/api/sellers',
  categories: '/api/categories',
  pricing: '/api/pricing'
};

/**
 * Default request options
 */
const DEFAULT_OPTIONS: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'include'
};

/**
 * Cache and cooldown configuration
 */
const CACHE_CONFIG = {
  DATA_FETCH: {
    BASE_COOLDOWN: 2000,      // 2 seconds between fetches
    MAX_COOLDOWN: 5000,       // Maximum cooldown time
    RESET_AFTER: 30000,       // Reset cooldown after 30 seconds of no fetches
    MAX_RETRIES: 3,           // Maximum number of quick retries
    RETRY_DELAY: 300         // Delay between retries in ms
  }
};


////////////////////////////////////////////////
// Types:
////////////////////////////////////////////////

/**
 * Interface for API response data
 */
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Interface for pagination parameters
 */
interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface for filter parameters
 */
interface FilterParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

/**
 * Interface for product details
 */
interface ProductDetails {
  badges: string[];
  categories: { name: string; url: string }[];
  stock: number;
  reviewDates: string[];
  shippingLength: string;
  shippingWidth: string;
  shippingHeight: string;
  weight: string;
  totalSellers: number;
  productID: string | null;
  name: string | null;
  upc: string | null;
  brand: string | null;
  brandUrl: string | null;
  imageUrl: string | null;
  mainCategory: string | null;
  fulfillmentOptions: { type: string; availableQuantity: number }[];
  modelNumber: string | null;
  currentPrice: number | null;
  variantCriteria: any[];
  variantsMap: Record<string, any>;
  sellerName: string | null;
  sellerDisplayName: string | null;
  sellerType: string | null;
  images: string[];
  videos: any[];
  overallRating: string;
  numberOfRatings: string;
  numberOfReviews: string;
  customerReviews: any[];
  settings: {
    minProfit?: number;
    minMargin?: number;
    minROI?: number;
    minTotalRatings?: number;
    minRatings30Days?: number;
    maxSellers?: number;
    maxWfsSellers?: number;
    maxStock?: number;
  };
  totalProfit: number;
  margin: number;
  roi: number;
  totalRatings: number;
  ratingsLast30Days: number;
  numSellers: number;
  numWfsSellers: number;
}


////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
/**
 * Construct URL with query parameters
 * @param baseUrl - Base URL to append parameters to
 * @param params - Query parameters to add
 * @returns Complete URL with parameters
 */
const buildUrl = (baseUrl: string, params?: Record<string, any>): string => {
  if (!params) return baseUrl;
  
  const queryParams = new URLSearchParams();
  
  // Add each parameter to URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  // Return URL with query string if parameters exist
  return queryParams.toString() 
    ? `${baseUrl}?${queryParams.toString()}`
    : baseUrl;
};

/**
 * Handle API response
 * @param response - Fetch API response
 * @returns Processed API response
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    data,
    status: response.status
  };
};

// Create rate limiter instance for API calls
const apiRateLimiter = new RateLimiter({
  maxRequests: 100,    // 100 requests
  timeWindow: 60000    // per minute
});

/**
 * Apply rate limiting to API requests
 * @param endpoint - API endpoint to rate limit
 * @returns Rate-limited request function
 */
const withRateLimit = (endpoint: string) => {
  return async (url: string, options: RequestInit) => {
    return apiRateLimiter.executeWithRateLimit(() => fetch(url, options));
  };
};

////////////////////////////////////////////////
// Main Function:
////////////////////////////////////////////////
/**
 * Extract and centralize product details, specifications, and reviews
 * @param product - Product data
 * @param idml - IDML data
 * @param reviews - Reviews data
 * @returns Processed product details
 */
export function getProductDetails(product: any, idml: any, reviews: any): ProductDetails {
  // Load settings from localStorage
  const settings = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
  

  const productDetailsUsed: ProductDetails = {
    // Categories below
    badges: [],
    categories: [],
    stock: 0,
    reviewDates: [],
    shippingLength: "0",
    shippingWidth: "0",
    shippingHeight: "0",
    weight: "0",
    totalSellers: 0,

    // Categories from product getData
    productID: product?.usItemId || null,
    name: product?.name || null,
    upc: product?.upc || null,
    brand: product?.brand || null,
    brandUrl: product?.brandUrl || null,
    imageUrl: product?.imageInfo?.thumbnailUrl || null,
    mainCategory: product?.category?.path?.[0]?.name || null,
    fulfillmentOptions: [],
    modelNumber: product?.model || null,
    currentPrice: product?.priceInfo?.currentPrice?.price || null,
    variantCriteria: product?.variantCriteria || [],
    variantsMap: product?.variantsMap || {},
    sellerName: product?.sellerName || null,
    sellerDisplayName: product?.sellerDisplayName || null,
    sellerType: product?.sellerType || null,
    images: product?.imageInfo?.allImages || [],

    // Categories from idml getData
    videos: idml?.videos || [],

    // Categories from reviews getData
    overallRating: reviews?.roundedAverageOverallRating || product?.averageRating || "not available",
    numberOfRatings: reviews?.totalReviewCount || "0",
    numberOfReviews: reviews?.reviewsWithTextCount || "0",
    customerReviews: reviews?.customerReviews || [],

    // Add settings
    settings: {
      minProfit: parseFloat(settings.minProfit) || undefined,
      minMargin: parseFloat(settings.minMargin) || undefined,
      minROI: parseFloat(settings.minROI) || undefined,
      minTotalRatings: parseFloat(settings.minTotalRatings) || undefined,
      minRatings30Days: parseFloat(settings.minRatings30Days) || undefined,
      maxSellers: parseFloat(settings.maxSellers) || undefined,
      maxWfsSellers: parseFloat(settings.maxWfsSellers) || undefined,
      maxStock: parseFloat(settings.maxStock) || undefined
    },
    
    // Add calculated metrics
    totalProfit: 0,
    margin: 0,
    roi: 0,
    totalRatings: reviews?.totalReviewCount || 0,
    ratingsLast30Days: 0,
    numSellers: 0,
    numWfsSellers: 0,
  };

  // Extract shipping information from product specifications
  const shippingInfo = idml?.productHighlights?.find(
    (highlight: any) => highlight.name === "Dimensions"
  )?.value?.split("x");

  // Extract from specifications if available
  const specShippingInfo = idml?.specifications?.find(
    (spec: any) => spec.name === "Assembled Product Dimensions (L x W x H)"
  )?.value?.split("x");

  // Try to get dimensions from either source
  if (shippingInfo && shippingInfo.length === 3) {
    productDetailsUsed.shippingLength = shippingInfo[0]?.trim() || "0";
    productDetailsUsed.shippingWidth = shippingInfo[1]?.trim() || "0";
    productDetailsUsed.shippingHeight = shippingInfo[2]?.split(" ")[1]?.trim() || "0";
  } else if (specShippingInfo && specShippingInfo.length === 3) {
    productDetailsUsed.shippingLength = specShippingInfo[0]?.trim() || "0";
    productDetailsUsed.shippingWidth = specShippingInfo[1]?.trim() || "0";
    productDetailsUsed.shippingHeight = specShippingInfo[2]?.split(" ")[1]?.trim() || "0";
  }

  // Try multiple sources for weight
  let extractedWeight = "0";

  // First try: Check product highlights for weight
  const weightHighlight = idml?.productHighlights?.find(
    (highlight: any) => highlight.name?.toLowerCase().includes('weight') || 
                       highlight.value?.toLowerCase().includes('pound') ||
                       highlight.value?.toLowerCase().includes('lb')
  );

  // Second try: Check specifications for weight
  const weightSpec = idml?.specifications?.find(
    (spec: any) => spec.name?.toLowerCase().includes('weight')
  );

  // Process found weight value
  const rawWeightValue = weightHighlight?.value || weightSpec?.value;

  if (rawWeightValue) {
    // Try different regex patterns to extract the weight
    const patterns = [
      /(\d*\.?\d+)\s*(?:pound|lb|lbs)/i,  // matches "0.66 pounds" or "0.66 lbs"
      /(\d*\.?\d+)\s*(?:oz|ounce|ounces)/i,  // matches ounces
      /(\d*\.?\d+)/  // matches any number as last resort
    ];

    for (const pattern of patterns) {
      const match = rawWeightValue.match(pattern);
      if (match) {
        extractedWeight = match[1];
        // Convert ounces to pounds if needed
        if (rawWeightValue.toLowerCase().includes('oz') || 
            rawWeightValue.toLowerCase().includes('ounce')) {
          extractedWeight = (parseFloat(extractedWeight) / 16).toFixed(2);
        }
        break;
      }
    }
  }

  // Set the weight in productDetailsUsed
  productDetailsUsed.weight = extractedWeight;

  // Extract the last category in the path as the main category
  productDetailsUsed.categories = product.category.path.map((category: any) => ({
    name: category.name,
    url: category.url
  }));

  // Determine total sellers based on additional offers and primary offer existence
  productDetailsUsed.totalSellers = product.buyBoxSuppression
    ? product.additionalOfferCount
    : product.additionalOfferCount + 1;

  // Extract review submission times (dates)
  productDetailsUsed.reviewDates = reviews.customerReviews
    ? reviews.customerReviews.map((review: any) => review.reviewSubmissionTime)
    : [];

  // Extract fulfillment options and calculate total available stock
  productDetailsUsed.fulfillmentOptions = product.fulfillmentOptions.map((option: any) => ({
    type: option.type,
    availableQuantity: option.availableQuantity || 0,
  }));

  productDetailsUsed.stock = productDetailsUsed.fulfillmentOptions.reduce(
    (totalStock, option) => totalStock + option.availableQuantity,
    0
  );

  // Extract badges from product data, or use default if not available
  productDetailsUsed.badges =
    product.badges?.flags?.map((badge: any) => badge.text) || ["No Badges Available"];

  return productDetailsUsed;
}

/**
 * Main function to get product data
 * @param forceRefresh - Whether to force a refresh of the data
 * @returns Product data or null if not available
 */
export default function getData(forceRefresh: boolean = false) {
  try {
    const dataDiv = document.getElementById("__NEXT_DATA__");
    if (!dataDiv) {
      console.error("Data div not found.");
      return null;
    }

    const rawData = JSON.parse(dataDiv.innerText);
    if (!rawData?.props?.pageProps?.initialData?.data) {
      console.error("Incomplete data structure.");
      return null;
    }

    const { product, idml, reviews } = rawData.props.pageProps.initialData.data;
    
    if (!product) {
      console.error("No product data found.");
      return null;
    }

    // Get processed data and return
    return getProductDetails(product, idml, reviews);
  } catch (error) {
    console.error('Error in getData:', error);
    return null;
  }
}

/**
 * Fetch data from API with pagination and filtering
 * @param endpoint - API endpoint to fetch from
 * @param pagination - Pagination parameters
 * @param filters - Filter parameters
 * @returns Paginated and filtered data
 */
export const fetchData = async <T>(
  endpoint: string,
  pagination?: PaginationParams,
  filters?: FilterParams
): Promise<ApiResponse<T>> => {
  try {
    // Sanitize inputs
    const sanitizedPagination = pagination ? {
      ...pagination,
      page: sanitizeNumber(pagination.page),
      limit: sanitizeNumber(pagination.limit)
    } : undefined;
    
    const sanitizedFilters = filters ? {
      ...filters,
      search: filters.search ? sanitizeString(filters.search) : undefined,
      category: filters.category ? sanitizeString(filters.category) : undefined,
      minPrice: filters.minPrice ? sanitizeNumber(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? sanitizeNumber(filters.maxPrice) : undefined,
      status: filters.status ? sanitizeString(filters.status) : undefined
    } : undefined;
    
    // Build URL with parameters
    const url = buildUrl(endpoint, {
      ...sanitizedPagination,
      ...sanitizedFilters
    });
    
    // Make rate-limited request
    const response = await withRateLimit(endpoint)(url, DEFAULT_OPTIONS);
    
    // Handle response
    return handleResponse<T>(response);
  } catch (error) {
    console.error('Error in fetchData:', error);
    throw error;
  }
};

/**
 * Fetch single item by ID
 * @param endpoint - API endpoint to fetch from
 * @param id - ID of item to fetch
 * @returns Item data
 */
export const fetchById = async <T>(endpoint: string, id: string): Promise<ApiResponse<T>> => {
  try {
    // Sanitize ID
    const sanitizedId = sanitizeString(id);
    
    // Build URL with ID
    const url = `${endpoint}/${sanitizedId}`;
    
    // Make rate-limited request
    const response = await withRateLimit(endpoint)(url, DEFAULT_OPTIONS);
    
    // Handle response
    return handleResponse<T>(response);
  } catch (error) {
    console.error('Error in fetchById:', error);
    throw error;
  }
};

/**
 * Create new item
 * @param endpoint - API endpoint to create at
 * @param data - Data to create
 * @returns Created item data
 */
export const createItem = async <T>(endpoint: string, data: Partial<T>): Promise<ApiResponse<T>> => {
  try {
    // Sanitize data
    const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? sanitizeString(value) :
                 typeof value === 'number' ? sanitizeNumber(value) :
                 value;
      return acc;
    }, {} as Record<string, any>);
    
    // Make rate-limited request
    const response = await withRateLimit(endpoint)(endpoint, {
      ...DEFAULT_OPTIONS,
      method: 'POST',
      body: JSON.stringify(sanitizedData)
    });
    
    // Handle response
    return handleResponse<T>(response);
  } catch (error) {
    console.error('Error in createItem:', error);
    throw error;
  }
};

/**
 * Update existing item
 * @param endpoint - API endpoint to update at
 * @param id - ID of item to update
 * @param data - Data to update
 * @returns Updated item data
 */
export const updateItem = async <T>(
  endpoint: string,
  id: string,
  data: Partial<T>
): Promise<ApiResponse<T>> => {
  try {
    // Sanitize inputs
    const sanitizedId = sanitizeString(id);
    const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? sanitizeString(value) :
                 typeof value === 'number' ? sanitizeNumber(value) :
                 value;
      return acc;
    }, {} as Record<string, any>);
    
    // Build URL with ID
    const url = `${endpoint}/${sanitizedId}`;
    
    // Make rate-limited request
    const response = await withRateLimit(endpoint)(url, {
      ...DEFAULT_OPTIONS,
      method: 'PUT',
      body: JSON.stringify(sanitizedData)
    });
    
    // Handle response
    return handleResponse<T>(response);
  } catch (error) {
    // Log error and rethrow
    console.error('Error in updateItem:', {
      message: `Failed to update item with ID ${id} at ${endpoint}`,
      error,
      context: { endpoint, id, data }
    });
    throw error;
  }
};

/**
 * Delete item
 * @param endpoint - API endpoint to delete from
 * @param id - ID of item to delete
 * @returns Deletion response
 */
export const deleteItem = async (endpoint: string, id: string): Promise<ApiResponse<void>> => {
  try {
    // Sanitize ID
    const sanitizedId = sanitizeString(id);
    
    // Build URL with ID
    const url = `${endpoint}/${sanitizedId}`;
    
    // Make rate-limited request
    const response = await withRateLimit(endpoint)(url, {
      ...DEFAULT_OPTIONS,
      method: 'DELETE'
    });
    
    // Handle response
    return handleResponse<void>(response);
  } catch (error) {
    // Log error and rethrow
    console.error('Error in deleteItem:', {
      message: `Failed to delete item with ID ${id} from ${endpoint}`,
      error,
      context: { endpoint, id }
    });
    throw error;
  }
};


////////////////////////////////////////////////
// Logging:
////////////////////////////////////////////////
function logProductData(data: ProductDetails[]): void {
  if (!window.__nsp_logged_sellerData) {
    logGroup(LogModule.RAW_DATA, "Raw Product Data");
    logTable(LogModule.RAW_DATA2, "Product Details", data);
  logGroupEnd();
    window.__nsp_logged_sellerData = true;
  }
}

////////////////////////////////////////////////
// Export:
////////////////////////////////////////////////
// All functions and types are exported above