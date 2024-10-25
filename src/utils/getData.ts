function getDataDiv() {
  let dataDiv = null;
  while (!dataDiv) {
    dataDiv = document.getElementById("__NEXT_DATA__");
    if (!dataDiv) {
      setTimeout(() => {
        dataDiv = document.getElementById("__NEXT_DATA__");
      }, 1000);
    }
  }
  return dataDiv;
}

function getProductDetails(product, idml, reviews) {
  const getProductSpecification = (name) =>
    idml.specifications.find((spec) => spec.name === name)?.value || null;

  const shippingInfo = getProductSpecification(
    "Assembled Product Dimensions (L x W x H)"
  )?.split("x");
  const weight =
    getProductSpecification("Assembled Product Weight")?.split(" ")[0] || null;

  const categories = product.category.path.map((category) => ({
    name: category.name,
    url: category.url
  }));

  // Extract the last category in the path as the main category
  const mainCategory = categories.length > 0 ? categories[categories.length - 1].name : "Unknown";

  // Extract review submission times (dates)
  const reviewDates = reviews.customerReviews
    ? reviews.customerReviews.map(review => review.reviewSubmissionTime)
    : [];
  
  const fulfillmentOptions = product.fulfillmentOptions;
  let stock = 0;
  for (let i = 0; i < fulfillmentOptions.length; i++) {
    stock += fulfillmentOptions[i].availableQuantity;
  }

  console.log("product  getData : ", product);
  console.log("idml  getData : ", idml);
  console.log("reviews  getData : ", reviews);
  console.log("Variants Map Data:", product.variantsMap);  

  const badges =
    product.badges?.flags?.map((badge) => badge.text) || ["No Badges Available"];


    
  return {
    productID: product.usItemId,
    name: product.name,
    upc: product.upc,
    badges,
    brand: product.brand,
    brandUrl: product.brandUrl,
    imageUrl: product.imageInfo.thumbnailUrl,
    categories, // This holds the full path of categories
    category: product.category.path[0].name, // This holds the last/main category name
    stock,
    fulfillmentOptions,
    fulfillmentType: product.fulfillmentType,
    modelNumber: product.model,
    currentPrice: product.priceInfo.currentPrice.price,
    variantCriteria: product.variantCriteria,
    variantsMap: product.variantsMap,
    sellerName: product.sellerName,
    sellerType: product.sellerType,
    numberOfRatings: reviews.totalReviewCount || "0",
    numberOfReviews: reviews.reviewsWithTextCount || "0",
    overallRating: reviews.roundedAverageOverallRating || "0",
    reviewDates,
    averageOverallRating:
      reviews.roundedAverageOverallRating ||
      product.averageRating ||
      product.reviews?.averageOverallRating ||
      "not available",
    customerReviews: reviews?.customerReviews,
    shippingLength: shippingInfo ? shippingInfo[0] : null,
    shippingWidth: shippingInfo ? shippingInfo[1] : null,
    shippingHeight: shippingInfo ? shippingInfo[2]?.split(" ")[1] : null,
    weight,
    images: product?.imageInfo?.allImages || [],
    videos: idml?.videos || [],
    totalSellers: product.additionalOfferCount + 1
  };
}

function getData() {
  const dataDiv = getDataDiv();
  const data = JSON.parse(dataDiv.innerText).props.pageProps.initialData.data;
  const { product, idml, reviews } = data;
  const productDetails = getProductDetails(product, idml, reviews);
  return productDetails;
}

export default getData; // Ensure this is the export
