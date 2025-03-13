////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No imports needed here.

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants or variables defined here.

////////////////////////////////////////////////
// Props and Types:
////////////////////////////////////////////////
// No props or types defined here.

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
// No state or hooks defined here.

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

// Function to get the data div element by its ID. It continues to search until it finds the element.
function getDataDiv() {
  let dataDiv = null;
  let retryCount = 0;
  const maxRetries = 10; // Add a limit to avoid an infinite loop

  while (!dataDiv && retryCount < maxRetries) {
    dataDiv = document.getElementById("__NEXT_DATA__");
    if (!dataDiv) {
      setTimeout(() => {
        dataDiv = document.getElementById("__NEXT_DATA__");
      }, 1000);
      retryCount++;
    }
  }

  if (!dataDiv) {
    console.error("Data div not found.");
    return null; // Return null if the element is not found after retries
  }

  return dataDiv;
}

// Helper function to extract product specifications by name.
const getProductSpecification = (idml, name) => {
  return idml.specifications.find((spec) => spec.name === name)?.value || null;
}

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////
// No event handlers defined here.

////////////////////////////////////////////////
// JSX (Return):
////////////////////////////////////////////////
// No JSX return here, as this is a data processing module.

////////////////////////////////////////////////
// Main Function:
////////////////////////////////////////////////

import { secureStorage } from './secureStorage';
import {
  calculateTotalProfit,
  calculateROI,
  calculateMargin,
  calculateStartingProductCost,
  calculateReferralFee,
  calculateWFSFee
} from '../utils/calculations';

// Function to extract and centralize product details, specifications, and reviews from given data
export function getProductDetails(product, idml, reviews) {
  // Load settings from localStorage
  const settings = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
  
  const productDetailsUsed = {
    //Categories below
    badges: [] as string[],
    categories: [] as { name: string; url: string }[],
    stock: 0,
    reviewDates: [] as string[],
    shippingLength: "0",
    shippingWidth: "0",
    shippingHeight: "0",
    weight: "0",
    totalSellers: 0,

    //Categories from product getData
    productID: product?.usItemId || null,
    name: product?.name || null,
    upc: product?.upc || null,
    brand: product?.brand || null,
    brandUrl: product?.brandUrl || null,
    imageUrl: product?.imageInfo?.thumbnailUrl || null,
    mainCategory: product?.category?.path?.[0]?.name || null, // This holds the last/main category name
    fulfillmentOptions: [] as { type: string; availableQuantity: number }[], // Store details for each fulfillment option
    modelNumber: product?.model || null,
    currentPrice: product?.priceInfo?.currentPrice?.price || null,
    variantCriteria: product?.variantCriteria || [],
    variantsMap: product?.variantsMap || {},
    sellerName: product?.sellerName || null,
    sellerDisplayName: product?.sellerDisplayName || null,
    sellerType: product?.sellerType || null,
    images: product?.imageInfo?.allImages || [],

    //Categories from idml getData
    videos: idml?.videos || [],

    //Categories from reviews getData
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
      maxWfsSellers: parseFloat(settings.maxWfsSellers) || undefined
    },
    
    // Add calculated metrics
    totalProfit: 0,
    margin: 0,
    roi: 0,
    totalRatings: reviews?.totalReviewCount || 0,
    ratingsLast30Days: 0, // We'll calculate this from reviewDates
    numSellers: 0,
    numWfsSellers: 0,
  };

  // Extract shipping information from product specifications.
  const shippingInfo = idml?.productHighlights?.find(
    (highlight) => highlight.name === "Dimensions"
  )?.value?.split("x");

  // Extract from specifications if available
  const specShippingInfo = idml?.specifications?.find(
    (spec) => spec.name === "Assembled Product Dimensions (L x W x H)"
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

  // Extract weight with detailed logging
  console.log('[getData] Raw data structure:', {
    idml: idml,
    productHighlights: idml?.productHighlights,
    specifications: idml?.specifications,
    allHighlights: idml?.productHighlights?.map((h, i) => ({ index: i, name: h.name, value: h.value }))
  });

  // Try multiple sources for weight
  let extractedWeight = "0";
  
  // First try: Check product highlights for weight
  const weightHighlight = idml?.productHighlights?.find(
    highlight => highlight.name?.toLowerCase().includes('weight') || 
                 highlight.value?.toLowerCase().includes('pound') ||
                 highlight.value?.toLowerCase().includes('lb')
  );

  // Second try: Check specifications for weight
  const weightSpec = idml?.specifications?.find(
    spec => spec.name?.toLowerCase().includes('weight')
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

  // Extract the last category in the path as the main category.
  productDetailsUsed.categories = product.category.path.map((category) => ({
    name: category.name,
    url: category.url
  }));

  // Determine total sellers based on additional offers and primary offer existence
  productDetailsUsed.totalSellers = product.buyBoxSuppression
    ? product.additionalOfferCount
    : product.additionalOfferCount + 1;

  // Extract review submission times (dates)
  productDetailsUsed.reviewDates = reviews.customerReviews
    ? reviews.customerReviews.map(review => review.reviewSubmissionTime)
    : [];

  // Extract fulfillment options and calculate total available stock.
  productDetailsUsed.fulfillmentOptions = product.fulfillmentOptions.map((option) => ({
    type: option.type,
    availableQuantity: option.availableQuantity || 0,
  }));

  productDetailsUsed.stock = productDetailsUsed.fulfillmentOptions.reduce(
    (totalStock, option) => totalStock + option.availableQuantity,
    0
  );

  // Extract badges from product data, or use default if not available.
  productDetailsUsed.badges =
    product.badges?.flags?.map((badge) => badge.text) || ["No Badges Available"];

  // Calculate profit, margin, and ROI
  const salePrice = product?.priceInfo?.currentPrice?.price || 0;
  const productCost = calculateStartingProductCost(salePrice);
  const referralFee = calculateReferralFee(salePrice, "Everything Else (Most Items)");
  const wfsFee = calculateWFSFee({
    weight: product?.shippingWeight || 0,
    length: product?.dimensions?.length || 0,
    width: product?.dimensions?.width || 0,
    height: product?.dimensions?.height || 0,
    isWalmartFulfilled: true,
    isApparel: false,
    isHazardousMaterial: false,
    retailPrice: salePrice
  });
  const inboundShippingFee = 0; // This will be calculated later
  const storageFee = 0; // This will be calculated later
  const prepFee = 0; // This will be calculated later
  const additionalFees = 0; // This will be calculated later

  productDetailsUsed.totalProfit = calculateTotalProfit(
    salePrice,
    productCost,
    referralFee,
    wfsFee,
    inboundShippingFee,
    storageFee,
    prepFee,
    additionalFees
  );

  productDetailsUsed.margin = parseFloat(calculateMargin(productDetailsUsed.totalProfit, salePrice));
  productDetailsUsed.roi = parseFloat(calculateROI(productDetailsUsed.totalProfit, productCost));

  // Logging the data used for transparency and debugging.

  return productDetailsUsed;
}

// Cache for data
let lastData: any = null;
let lastDataTimestamp = 0;
const DATA_COOLDOWN = 1000; // 1 second cooldown
const MAX_RETRIES = 5;
const RETRY_DELAY = 300; // ms

export default function getData() {
    // Return cached data if it's recent enough
    const now = Date.now();
    if (lastData && now - lastDataTimestamp < DATA_COOLDOWN) {
        return lastData;
    }

    // Try to get data with retries
    return getDataWithRetry(0);
}

function getDataWithRetry(retryCount: number): any {
    try {
        const dataDiv = document.getElementById("__NEXT_DATA__");
        if (!dataDiv) {
            if (retryCount < MAX_RETRIES) {
                setTimeout(() => getDataWithRetry(retryCount + 1), RETRY_DELAY);
                return null;
            } else {
                console.error("Data div not found after maximum retries.");
                return null;
            }
        }

        try {
            const rawData = JSON.parse(dataDiv.innerText);
            if (!rawData?.props?.pageProps?.initialData?.data) {
                if (retryCount < MAX_RETRIES) {
                    setTimeout(() => getDataWithRetry(retryCount + 1), RETRY_DELAY);
                    return null;
                } else {
                    console.error("Incomplete data structure after maximum retries.");
                    return null;
                }
            }

            const { product, idml, reviews } = rawData.props.pageProps.initialData.data;
            
            // Check if we have valid product data
            if (!product) {
                if (retryCount < MAX_RETRIES) {
                    setTimeout(() => getDataWithRetry(retryCount + 1), RETRY_DELAY);
                    return null;
                } else {
                    console.error("No product data found after maximum retries.");
                    return null;
                }
            }

            // Always log the raw data
            console.log('%c[All JSON Data]', 'color: #22c55e; font-weight: bold', {
                timestamp: new Date().toISOString(),
                data: { product, idml, reviews }
            });

            // Cache the processed data
            lastData = getProductDetails(product, idml, reviews);
            lastDataTimestamp = Date.now();
            return lastData;
        } catch (parseError) {
            console.error('Error parsing data:', parseError);
            if (retryCount < MAX_RETRIES) {
                setTimeout(() => getDataWithRetry(retryCount + 1), RETRY_DELAY);
                return null;
            } else {
                console.error("Failed to parse data after maximum retries.");
                return null;
            }
        }
    } catch (error) {
        console.error('Error in getData:', error);
        if (retryCount < MAX_RETRIES) {
            setTimeout(() => getDataWithRetry(retryCount + 1), RETRY_DELAY);
            return null;
        } else {
            console.error("Failed to get data after maximum retries.");
            return null;
        }
    }
}
