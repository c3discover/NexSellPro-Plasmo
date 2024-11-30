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
function getProductDetails(product, idml, reviews) {
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
    productID: product.usItemId,
    name: product.name,
    upc: product.upc,
    brand: product.brand,
    brandUrl: product.brandUrl,
    imageUrl: product.imageInfo.thumbnailUrl,
    mainCategory: product.category.path[0].name, // This holds the last/main category name
    fulfillmentOptions: [] as { type: string; availableQuantity: number }[], // Store details for each fulfillment option
    modelNumber: product.model,
    currentPrice: product.priceInfo.currentPrice.price,
    variantCriteria: product.variantCriteria,
    variantsMap: product.variantsMap,
    sellerName: product.sellerName,
    sellerDisplayName: product.sellerDisplayName,
    sellerType: product.sellerType,
    images: product?.imageInfo?.allImages || [],

    //Categories from idml getData
    videos: idml?.videos || [],

    //Categories from reviews getData
    averageOverallRating:
      reviews.roundedAverageOverallRating ||
      product.averageRating ||
      "not available",
    numberOfRatings: reviews.totalReviewCount || "0",
    numberOfReviews: reviews.reviewsWithTextCount || "0",
    overallRating: reviews.roundedAverageOverallRating || "0",
    customerReviews: reviews?.customerReviews,
  };

  // Extract shipping information from product specifications.
  const shippingInfo = getProductSpecification(idml, "Assembled Product Dimensions (L x W x H)")?.split("x");
  productDetailsUsed.weight = getProductSpecification(idml, "Assembled Product Weight")?.split(" ")[0] || null;
  productDetailsUsed.shippingLength = shippingInfo[0]?.trim();
  productDetailsUsed.shippingWidth = shippingInfo[1]?.trim();
  productDetailsUsed.shippingHeight = shippingInfo[2]?.split(" ")[1]?.trim();

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

  // Logging for debugging purposes.
  console.log("product  getData : ", product);
  console.log("idml  getData : ", idml);
  console.log("reviews  getData : ", reviews);

  // Logging the data used for transparency and debugging.
  console.log("Product Details Used Summary:", productDetailsUsed);

  return productDetailsUsed;
}

// Main function to retrieve product data from the page and extract details.
function getData() {
  const dataDiv = getDataDiv();
  if (!dataDiv) {
    return null; // Return null if data div is not found
  }

  try {
    const data = JSON.parse(dataDiv.innerText).props.pageProps.initialData.data;
    const { product, idml, reviews } = data;
    const productDetailsUsed = getProductDetails(product, idml, reviews);
    return productDetailsUsed;
  } catch (error) {
    console.error("Failed to parse product data:", error);
    return null;
  }
}

//////////////////////////////////////////////////
// Export Statement:
//////////////////////////////////////////////////
export default getData; // Ensure this is the export
