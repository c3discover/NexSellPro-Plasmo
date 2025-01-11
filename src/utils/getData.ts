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

// Function to extract and centralize product details, specifications, and reviews from given data
export function getProductDetails(product, idml, reviews) {
  const productDetailsUsed = {
    //Categories below
    badges: [] as string[],
    categories: [] as { name: string; url: string }[],
    stock: 0,
    reviewDates: [] as string[],
    shippingLength: null,
    shippingWidth: null,
    shippingHeight: null,
    weight: null,
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
  };

  // Extract shipping information from product specifications.
  const shippingInfo = idml?.productHighlights?.find(
    (highlight) => highlight.name === "Dimensions"
  )?.value?.split("x");

  if (shippingInfo && shippingInfo.length === 3) {
    productDetailsUsed.shippingLength = shippingInfo[0]?.trim();
    productDetailsUsed.shippingWidth = shippingInfo[1]?.trim();
    productDetailsUsed.shippingHeight = shippingInfo[2]?.split(" ")[1]?.trim();
  } else {
    // Extract from specifications if available
    const specShippingInfo = idml?.specifications?.find(
      (spec) => spec.name === "Assembled Product Dimensions (L x W x H)"
    )?.value?.split("x");
    
    if (specShippingInfo && specShippingInfo.length === 3) {
      productDetailsUsed.shippingLength = specShippingInfo[0]?.trim();
      productDetailsUsed.shippingWidth = specShippingInfo[1]?.trim();
      productDetailsUsed.shippingHeight = specShippingInfo[2]?.split(" ")[1]?.trim();
    }
  }

  productDetailsUsed.weight = idml?.specifications?.find(
    (spec) => spec.name === "Assembled Product Weight"
  )?.value?.split(" ")[0] || null;

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

  // Logging the data used for transparency and debugging.

  return productDetailsUsed;
}

// Cache for data
let lastData: any = null;
let lastDataTimestamp = 0;
const DATA_COOLDOWN = 1000; // 1 second cooldown

export default function getData() {
    try {
        const dataDiv = document.getElementById("__NEXT_DATA__");
        if (!dataDiv) return null;

        const rawData = JSON.parse(dataDiv.innerText);
        const { product, idml, reviews } = rawData.props.pageProps.initialData.data;

        // Always log the raw data
        console.log('%c[All JSON Data]', 'color: #22c55e; font-weight: bold', {
            timestamp: new Date().toISOString(),
            data: { product, idml, reviews }
        });

        return getProductDetails(product, idml, reviews);
    } catch (error) {
        console.error('Error in getData:', error);
        return null;
    }
}
