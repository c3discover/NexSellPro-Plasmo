import { useProductData } from "../hooks/useProductData";
import { useBuyGaugeData } from "../hooks/useBuyGaugeData";
import { usePricingData } from "../hooks/usePricingData";
import { useProductInfoData } from "../hooks/useProductInfoData";
import { useAnalysisData } from "../hooks/useAnalysisData";
import { useVariationsData } from "../hooks/useVariationsData";

export const useLiveExportData = (): Record<string, any> => {
  const product = useProductData();
  const gauge = useBuyGaugeData();
  const pricing = usePricingData();
  const info = useProductInfoData();
  const analysis = useAnalysisData();
  const variations = useVariationsData();

  return {
    // 1. Auto Generated
    timestamp: new Date().toLocaleString("en-US", { hour12: false }),

    // 2-9. Overview
    title: product.name || "",
    mainImage: product.mainImage || "",
    numberOfImages: product.numImages || 0,
    numberOfVideos: product.numVideos || 0,
    brand: product.brand || "",
    category: product.mainCategory || "",
    shelvingPath: product.shelvingPath || "",
    badges: product.badges.join('\n') || "",

    // 10-19. Buy Gauge (all stubbed for now)
    gaugeLevel: gauge.gaugeLevel || "", // Coming Soon
    gaugeScore: gauge.gaugeScore || 0, // Coming Soon
    profitDifference: gauge.profitDifference || 0, // Coming Soon
    marginDifference: gauge.marginDifference || 0, // Coming Soon
    roiDifference: gauge.roiDifference || 0, // Coming Soon
    totalRatingsDifference: gauge.totalRatingsDifference || 0, // Coming Soon
    ratings30DayDifference: gauge.ratings30DayDifference || 0, // Coming Soon
    sellersDifference: gauge.sellersDifference || 0, // Coming Soon
    wfsSellersDifference: gauge.wfsSellersDifference || 0, // Coming Soon
    stockDifference: gauge.stockDifference || 0, // Coming Soon

    // 20-37. Pricing
    estMonthlySales: "", // Coming Soon
    totalProfit: pricing.totalProfit || 0,
    margin: pricing.margin || 0,
    roi: pricing.roi || 0,
    productCost: pricing.productCost || 0,
    salePrice: pricing.salePrice || 0,
    length: pricing.length || 0,
    width: pricing.width || 0,
    height: pricing.height || 0,
    weight: pricing.weight || 0,
    referralFee: pricing.referralFee || 0,
    wfsFee: pricing.wfsFee || 0,
    wfsInboundShipping: pricing.inboundShipping || 0,
    sfShipping: pricing.sfShipping || 0,
    storageFee: pricing.storageFee || 0,
    prepFee: pricing.prepFee || 0,
    additionalFees: pricing.additionalFees || 0,
    contractCategory: pricing.contractCategory || "",

    // 38-53. Product Info
    itemId: info.productId || "",
    gtin: info.gtin || "",
    upc: info.upc || "",
    ean: info.ean || "",
    modelNumber: info.modelNumber || "",
    countryOfOrigin: info.countryOfOrigin || "",
    store1Name: "", // Coming Soon
    store1Link: "", // Coming Soon
    store1Price: "", // Coming Soon
    store2Name: "", // Coming Soon
    store2Link: "", // Coming Soon
    store2Price: "", // Coming Soon
    store3Name: "", // Coming Soon
    store3Link: "", // Coming Soon
    store3Price: "", // Coming Soon
    averageExternalPrice: "", // Coming Soon

    // 54-64. Analysis
    totalRatings: analysis.totalRatings || 0,
    totalReviews: analysis.totalReviews || 0,
    overallRating: analysis.overallRating || 0,
    reviews30Days: analysis.reviews30Days || 0,
    reviews90Days: analysis.reviews90Days || 0,
    reviews1Year: analysis.reviews1Year || 0,
    totalStock: analysis.totalStock || 0,
    totalSellers: analysis.numSellers || 0,
    wfsSellers: analysis.wfsSellerCount || 0,
    walmartSells: analysis.walmartSells || 0,
    brandSells: analysis.brandSells || 0,

    // 65-68. Variations
    numberOfVariants: variations.numberOfVariants || 0,
    variantTypes: variations.variantTypes || [],
    variantItemIds: variations.variantItemIds || [],
    variantsInStock: variations.variantsInStock || 0,

    // 69-73. Other
    notes: "", // Coming Soon
    blankColumn1: "",
    blankColumn2: "",
    blankColumn3: "",
    blankColumn4: ""
  };
}; 