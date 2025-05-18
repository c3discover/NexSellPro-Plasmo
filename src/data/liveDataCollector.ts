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
    timestamp: new Date().toLocaleString("en-US", { hour12: false }),
    title: product.name || "", // 'title' mapped from product.name
    mainImage: product.mainImage || "",
    numImages: product.numImages || 0,
    numVideos: product.numVideos || 0,
    brand: product.brand || "",
    category: product.mainCategory || "",
    shelvingPath: product.shelvingPath || "",
    badges: product.badges || [],

    // Gauge fields (stubbed as needed)
    gaugeLevel: gauge.gaugeLevel || "", // Coming Soon
    gaugeScore: gauge.gaugeScore || 0, // Coming Soon
    profitDifference: gauge.profitDifference || 0, // Coming Soon
    marginDifference: gauge.marginDifference || 0, // Coming Soon
    roiDifference: gauge.roiDifference || 0, // Coming Soon
    totalRatingsDifference: gauge.totalRatingsDifference || 0, // Coming Soon
    ratings30Difference: gauge.ratings30Difference || 0, // Coming Soon
    sellersDifference: gauge.sellersDifference || 0, // Coming Soon
    wfsSellersDifference: gauge.wfsSellersDifference || 0, // Coming Soon
    stockDifference: gauge.stockDifference || 0, // Coming Soon

    estimatedMonthlySales: "", // Coming Soon
    totalProfit: pricing.totalProfit || 0,
    margin: pricing.margin || 0,
    roi: pricing.roi || 0,
    productCost: pricing.productCost || 0,
    salePrice: pricing.salePrice || 0,
    length: pricing.length || "", // Coming Soon
    width: pricing.width || "", // Coming Soon
    height: pricing.height || "", // Coming Soon
    weight: pricing.weight || "", // Coming Soon
    referralFee: pricing.referralFee || 0,
    wfsFee: pricing.wfsFee || 0,
    wfsInboundShipping: pricing.inboundShipping || 0,
    sfShipping: pricing.sfShipping || 0,
    storageFee: pricing.storageFee || 0,
    prepFee: pricing.prepFee || 0,
    additionalFees: pricing.additionalFees || 0,
    contractCategory: pricing.contractCategory || "", // Coming Soon

    itemId: info.productId || "",
    gtin: "", // Coming Soon
    upc: info.upc || "",
    ean: "", // Coming Soon
    modelNumber: info.modelNumber || "",
    countryOfOrigin: "", // Coming Soon
    store1Name: "", store1Link: "", store1Price: "",
    store2Name: "", store2Link: "", store2Price: "",
    store3Name: "", store3Link: "", store3Price: "",
    averageExternalPrice: "",

    totalRatings: analysis.totalRatings || 0,
    totalReviews: analysis.totalReviews || 0, // Coming Soon
    overallRating: analysis.overallRating || 0,
    reviews30: analysis.reviews30Days || 0,
    reviews90: analysis.reviews90Days || 0,
    reviews365: analysis.reviews1Year || 0,
    totalStock: analysis.totalStock || 0, // Coming Soon
    totalSellers: analysis.totalSellers || 0, // Coming Soon
    wfsSellers: analysis.wfsSellerCount || 0,
    walmartSells: analysis.walmartSells || "", // Coming Soon
    brandSells: analysis.brandSells || "", // Coming Soon

    totalVariants: variations.numberOfVariants || 0,
    variantTypes: variations.variantTypes || [], // Coming Soon
    variantItemIds: variations.variantItemIds || [],
    variantsInStock: variations.variantsInStock || 0, // Coming Soon

    notes: "", // Coming Soon
    blankColumn1: "", blankColumn2: "", blankColumn3: "", blankColumn4: ""
  };
}; 