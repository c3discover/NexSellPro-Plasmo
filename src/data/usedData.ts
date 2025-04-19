/**
 * @fileoverview Central aggregator for all usable extension data (raw, calculated, stored)
 * @author Your Name
 * @created 2025-04-19
 * @lastModified 2025-04-19
 */

////////////////////////////////////////////////
// Imports:
// **All external and internal module imports
// **Grouped by type (external, then internal utils/types)
////////////////////////////////////////////////
import getData from "./sources/getData";
import { getSellerData } from "./sources/sellerData";
import {
  calculateTotalProfit,
  calculateROI,
  calculateMargin,
  calculateCubicFeet,
  calculateReferralFee,
  calculateWFSFee,
  calculatePrepFee,
  calculateStorageFee,
  calculateInboundShipping,
  calculateSfShipping,
  calculateAdditionalFees,
  calculateFinalShippingWeightForWFS,
  calculateFinalShippingWeightForInbound,
  calculateStartingProductCost,
  calculateDimensionalWeight
} from "./logic/calculations";
import { getLocalData, BaselineMetrics, FeeSettings, PricingOverrides, ExportSettings } from "./logic/localData";
import { LogModule, logGroup, logTable, logGroupEnd } from "./utils/logger";

////////////////////////////////////////////////
// Constants and Variables:
// **Anything that defines shared constants, static strings, colors, styles, config, etc.
////////////////////////////////////////////////
let loggedOnce = false;

declare global {
  interface Window {
    __nsp_logged_usedData?: boolean;
  }
}

////////////////////////////////////////////////
// Types and Interfaces:
// **Custom TypeScript interfaces for the data being worked on
////////////////////////////////////////////////

/**
 * Type definition for the data returned by getUsedData
 * This is the central data object used by all components
 */
export interface UsedProductData {
  // Raw Data from getData.ts
  productID: string;
  name: string;
  upc: string;
  brand: string;
  brandUrl: string;
  modelNumber: string;
  currentPrice: number;
  imageUrl: string;
  images: string[];
  videos: string[];
  mainCategory: string;
  categories: {name: string, url: string}[];
  shippingLength: string;
  shippingWidth: string;
  shippingHeight: string;
  weight: string;
  badges: string[];
  variantCriteria: any[];
  variantsMap: any;
  overallRating: number;
  numberOfRatings: number;
  numberOfReviews: number;
  customerReviews: any[];
  reviewDates: string[];
  fulfillmentOptions: string[];

  // Seller Data from sellerData.ts
  sellerName: string;
  sellerDisplayName: string;
  sellerType: string;
  mainSeller: any;
  otherSellers: any[];
  totalSellers: number;
  totalStock: number;

  // Calculated Metrics
  totalProfit: number;
  roi: number;
  margin: number;
  cubicFeet: number;
  referralFee: number;
  wfsFee: number;
  prepFee: number;
  storageFee: number;
  inboundShipping: number;
  sfShipping: number;
  additionalFees: number;
  finalShippingWeightWFS: number;
  finalShippingWeightInbound: number;
  startingProductCost: number;
  dimensionalWeight: number;

  // Local Settings
  exportSettings: ExportSettings;
  baselineMetrics: BaselineMetrics & {
    walmartFulfilled: boolean;
  };
  feeSettings: FeeSettings & {
    storageSettings: any;
  };
  pricingOverrides: PricingOverrides;

  // Additional structure properties needed by components
  basic: {
    productID: string;
    name: string;
    upc: string;
    brand: string;
    brandUrl: string;
    modelNumber: string;
  };
  pricing: {
    currentPrice: number;
    salePrice?: number;
  };
  dimensions: {
    shippingLength: string;
    shippingWidth: string;
    shippingHeight: string;
    weight: string;
    cubicFeet: number;
    dimensionalWeight: number;
  };
  reviews: {
    overallRating: number;
    numberOfRatings: number;
    numberOfReviews: number;
    reviewDates: string[];
    customerReviews: any[];
  };
  inventory: {
    totalSellers: number;
    totalStock: number;
    fulfillmentOptions: string[];
  };
  sellers: {
    mainSeller: any;
    otherSellers: any[];
    sellerName: string;
    sellerDisplayName: string;
    sellerType: string;
  };
  flags: {
    isHazardousMaterial: boolean;
    badges: string[];
  };
  profitability: {
    totalProfit: number;
    margin: number;
    roi: number;
    referralFee: number;
    wfsFee: number;
    prepFee: number;
    storageFee: number;
    inboundShipping: number;
    sfShipping: number;
    additionalFees: number;
  };
  variants: {
    variantCriteria: any[];
    variantsMap: any;
  };
}

////////////////////////////////////////////////
// Configuration:
// **For example: rate limiters, retry configs, cache TTLs
////////////////////////////////////////////////

////////////////////////////////////////////////
// Helper Functions:
// **Utility functions (scrapers, parsers, sanitizers, formatters, fallbacks)
////////////////////////////////////////////////

////////////////////////////////////////////////
// Main Logic:
// **The code that runs on import/execute (e.g., fetch, parse, etc.)
////////////////////////////////////////////////
export async function getUsedData(productId: string): Promise<UsedProductData> {
  const raw = getData();
  const seller = await getSellerData();
  const local = getLocalData(productId);

  // Calculate all metrics
  const totalProfit = calculateTotalProfit(
    raw.currentPrice,
    local.pricingOverrides.productCost ?? 0,
    local.pricingOverrides.referralFee ?? calculateReferralFee(raw.currentPrice, local.pricingOverrides.contractCategory || raw.mainCategory),
    local.pricingOverrides.wfsFee ?? calculateWFSFee({
      weight: raw.weight,
      length: raw.shippingLength,
      width: raw.shippingWidth,
      height: raw.shippingHeight,
      isWalmartFulfilled: raw.fulfillmentOptions.includes("WFS"),
      isApparel: raw.badges.includes("Apparel"),
      isHazardousMaterial: false,
      retailPrice: raw.currentPrice
    }),
    local.pricingOverrides.wfsInboundShipping ?? calculateInboundShipping(raw.weight, true),
    local.pricingOverrides.storageFee ?? parseFloat(
      calculateStorageFee(local.feeSettings.season, calculateCubicFeet(raw.shippingLength, raw.shippingWidth, raw.shippingHeight), local.feeSettings.storageLength)
    ),
    local.pricingOverrides.prepFee ?? calculatePrepFee(raw.weight),
    local.pricingOverrides.additionalFees ?? calculateAdditionalFees(raw.weight)
  );

  // Calculate all individual metrics
  const roiValue = parseFloat(calculateROI(totalProfit, local.pricingOverrides.productCost ?? 0));
  const marginValue = parseFloat(calculateMargin(totalProfit, raw.currentPrice));
  const cubicFeet = calculateCubicFeet(raw.shippingLength, raw.shippingWidth, raw.shippingHeight);
  const referralFee = calculateReferralFee(raw.currentPrice, local.pricingOverrides.contractCategory || raw.mainCategory);
  const wfsFee = calculateWFSFee({
      weight: raw.weight,
      length: raw.shippingLength,
      width: raw.shippingWidth,
      height: raw.shippingHeight,
      isWalmartFulfilled: raw.fulfillmentOptions.includes("WFS"),
      isApparel: raw.badges.includes("Apparel"),
      isHazardousMaterial: false,
      retailPrice: raw.currentPrice
  });
  const prepFee = calculatePrepFee(raw.weight);
  const storageFee = parseFloat(calculateStorageFee(local.feeSettings.season, cubicFeet, local.feeSettings.storageLength));
  const inboundShipping = calculateInboundShipping(raw.weight, true);
  const sfShipping = calculateSfShipping(raw.weight);
  const additionalFees = calculateAdditionalFees(raw.weight);
  const finalShippingWeightWFS = calculateFinalShippingWeightForWFS(raw.weight, raw.shippingLength, raw.shippingWidth, raw.shippingHeight);
  const finalShippingWeightInbound = calculateFinalShippingWeightForInbound(raw.weight, raw.shippingLength, raw.shippingWidth, raw.shippingHeight);
  const startingProductCost = calculateStartingProductCost(raw.currentPrice);
  const dimensionalWeight = calculateDimensionalWeight(raw.shippingLength, raw.shippingWidth, raw.shippingHeight);

  const used: UsedProductData = {
    // Raw Data
    productID: raw.productID,
    name: raw.name,
    upc: raw.upc,
    brand: raw.brand,
    brandUrl: raw.brandUrl,
    modelNumber: raw.modelNumber,
    currentPrice: raw.currentPrice,
    imageUrl: raw.imageUrl,
    images: raw.images,
    videos: raw.videos,
    mainCategory: raw.mainCategory,
    categories: raw.categories,
    shippingLength: raw.shippingLength,
    shippingWidth: raw.shippingWidth,
    shippingHeight: raw.shippingHeight,
    weight: raw.weight,
    badges: raw.badges,
    variantCriteria: raw.variantCriteria,
    variantsMap: raw.variantsMap,
    overallRating: raw.overallRating,
    numberOfRatings: raw.numberOfRatings,
    numberOfReviews: raw.numberOfReviews,
    customerReviews: raw.customerReviews,
    reviewDates: raw.reviewDates,
    fulfillmentOptions: raw.fulfillmentOptions,

    // Seller Data
    sellerName: seller[0]?.sellerName,
    sellerDisplayName: seller[0]?.sellerName,
    sellerType: seller[0]?.type,
    mainSeller: seller[0],
    otherSellers: seller.slice(1),
    totalSellers: seller.length,
    totalStock: seller.reduce((sum, s) => sum + (s.stock ?? 0), 0),

    // Calculated Metrics
    totalProfit,
    roi: roiValue,
    margin: marginValue,
    cubicFeet,
    referralFee,
    wfsFee,
    prepFee,
    storageFee,
    inboundShipping,
    sfShipping,
    additionalFees,
    finalShippingWeightWFS,
    finalShippingWeightInbound,
    startingProductCost,
    dimensionalWeight,

    // Local Settings
    exportSettings: local.exportSettings,
    baselineMetrics: {
      ...local.baselineMetrics,
      walmartFulfilled: true
    },
    feeSettings: {
      ...local.feeSettings,
      storageSettings: {}
    },
    pricingOverrides: local.pricingOverrides,

    // Additional nested structure for component compatibility
    basic: {
      productID: raw.productID,
      name: raw.name,
      upc: raw.upc,
      brand: raw.brand,
      brandUrl: raw.brandUrl,
      modelNumber: raw.modelNumber
    },
    pricing: {
      currentPrice: raw.currentPrice,
      salePrice: local.pricingOverrides?.salePrice
    },
    dimensions: {
      shippingLength: raw.shippingLength,
      shippingWidth: raw.shippingWidth,
      shippingHeight: raw.shippingHeight,
      weight: raw.weight,
      cubicFeet,
      dimensionalWeight
    },
    reviews: {
      overallRating: raw.overallRating,
      numberOfRatings: raw.numberOfRatings,
      numberOfReviews: raw.numberOfReviews,
      reviewDates: raw.reviewDates,
      customerReviews: raw.customerReviews
    },
    inventory: {
      totalSellers: seller.length,
      totalStock: seller.reduce((sum, s) => sum + (s.stock ?? 0), 0),
      fulfillmentOptions: raw.fulfillmentOptions
    },
    sellers: {
      mainSeller: seller[0],
      otherSellers: seller.slice(1),
      sellerName: seller[0]?.sellerName,
      sellerDisplayName: seller[0]?.sellerName,
      sellerType: seller[0]?.type
    },
    flags: {
      isHazardousMaterial: false,
      badges: raw.badges
    },
    profitability: {
      totalProfit,
      roi: roiValue,
      margin: marginValue,
      referralFee,
      wfsFee,
      prepFee,
      storageFee,
      inboundShipping,
      sfShipping,
      additionalFees
    },
    variants: {
      variantCriteria: raw.variantCriteria,
      variantsMap: raw.variantsMap
    }
  };

////////////////////////////////////////////////
// Logging:
// **Clean console.log output with styling
////////////////////////////////////////////////
if (!window.__nsp_logged_usedData) {
  window.__nsp_logged_usedData = true;
  logGroup(LogModule.USED_DATA, "Data Used in Extension");
  
  console.log(LogModule.USED_DATA2, "Basic Product Info", {
    productID: used.productID,
    name: used.name,
    upc: used.upc,
    brand: used.brand,
    brandUrl: used.brandUrl,
    modelNumber: used.modelNumber
  });
  
  console.log(LogModule.USED_DATA2, "Pricing Info", {
    currentPrice: used.currentPrice,
    salePrice: used.pricing.salePrice || "Not set"
  });
  
  console.log(LogModule.USED_DATA2, "Product Dimensions",
    {
      shippingLength: used.shippingLength,
      shippingWidth: used.shippingWidth,
      shippingHeight: used.shippingHeight,
      weight: used.weight,
      cubicFeet: used.cubicFeet.toFixed(2),
      dimensionalWeight: used.dimensionalWeight.toFixed(2)
    }
  );

  console.log(LogModule.USED_DATA2, "Product Media",
    {
      imageUrl: used.imageUrl,
      images: `${used.images?.length || 0} images`,
      videos: `${used.videos?.length || 0} videos`
    }
  );

  console.log(LogModule.USED_DATA2, "Categories & Badges",
    {
      mainCategory: used.mainCategory,
      categories: `${used.categories?.length || 0} categories`,
      badges: used.badges
    }
  );

  console.log(LogModule.USED_DATA2, "Seller Data",
    {
      sellerName: used.sellerName,
      sellerType: used.sellerType,
      sellerDisplayName: used.sellerDisplayName,
      totalSellers: used.totalSellers,
      totalStock: used.totalStock,
      otherSellers: `${used.otherSellers?.length || 0} sellers`
    }
  );

  console.log(LogModule.USED_DATA2, "Review Data",
    {
      overallRating: used.overallRating,
      numberOfRatings: used.numberOfRatings,
      numberOfReviews: used.numberOfReviews,
      reviewDates: `${used.reviewDates?.length || 0} dates`
    }
  );

  console.log(LogModule.USED_DATA2, "Variant Data",
    {
      variantCriteria: used.variantCriteria ? `${used.variantCriteria.length || 0} criteria` : "Not Available",
      variantsMap: used.variantsMap ? "Available" : "Not Available"
    }
  );

  console.log(LogModule.USED_DATA2, "Profitability Metrics",
    {
      totalProfit: `$${used.totalProfit.toFixed(2)}`,
      roi: `${used.roi.toFixed(1)}%`,
      margin: `${used.margin.toFixed(1)}%`
    }
  );

  console.log(LogModule.USED_DATA2, "Fee Breakdown",
    {
      referralFee: `$${used.referralFee.toFixed(2)}`,
      wfsFee: `$${used.wfsFee.toFixed(2)}`,
      prepFee: `$${used.prepFee.toFixed(2)}`,
      storageFee: `$${used.storageFee.toFixed(2)}`,
      inboundShipping: `$${used.inboundShipping.toFixed(2)}`,
      sfShipping: `$${used.sfShipping.toFixed(2)}`,
      additionalFees: `$${used.additionalFees.toFixed(2)}`
    }
  );

  console.log(LogModule.USED_DATA2, "Baseline Metrics",
    {
      defaultFulfillment: used.baselineMetrics.defaultFulfillment,
      walmartFulfilled: used.baselineMetrics.walmartFulfilled,
      minProfit: `$${used.baselineMetrics.minProfit}`,
      minMargin: `${used.baselineMetrics.minMargin}%`,
      minROI: `${used.baselineMetrics.minROI}%`,
      minMonthlySales: used.baselineMetrics.minMonthlySales || 0,
      minTotalRatings: used.baselineMetrics.minTotalRatings,
      minRatings30Days: used.baselineMetrics.minRatings30Days,
      minOverallRating: used.baselineMetrics.minOverallRating,
      maxSellers: used.baselineMetrics.maxSellers,
      maxWfsSellers: used.baselineMetrics.maxWfsSellers,
      maxStock: used.baselineMetrics.maxStock
    }
  );

  console.log(LogModule.USED_DATA2, "Fee Settings",
    {
      inboundShippingCost: `$${used.feeSettings.inboundShippingCost}`,
      sfShippingCost: `$${used.feeSettings.sfShippingCost}`,
      storageLength: used.feeSettings.storageLength,
      season: used.feeSettings.season,
      prepCost: `$${used.feeSettings.prepCost}`,
      prepCostType: used.feeSettings.prepCostType,
      additionalCosts: `$${used.feeSettings.additionalCosts}`,
      additionalCostType: used.feeSettings.additionalCostType
    }
  );

  console.log(LogModule.USED_DATA2, "Pricing Overrides",
    {
      productCost: used.pricingOverrides?.productCost ? `$${used.pricingOverrides.productCost}` : "Not set",
      salePrice: used.pricingOverrides?.salePrice ? `$${used.pricingOverrides.salePrice}` : "Not set",
      length: used.pricingOverrides?.length || "Not set",
      width: used.pricingOverrides?.width || "Not set",
      height: used.pricingOverrides?.height || "Not set",
      weight: used.pricingOverrides?.weight || "Not set",
      referralFee: used.pricingOverrides?.referralFee ? `$${used.pricingOverrides.referralFee}` : "Not set",
      wfsFee: used.pricingOverrides?.wfsFee ? `$${used.pricingOverrides.wfsFee}` : "Not set",
      wfsInboundShipping: used.pricingOverrides?.wfsInboundShipping ? `$${used.pricingOverrides.wfsInboundShipping}` : "Not set",
      storageFee: used.pricingOverrides?.storageFee ? `$${used.pricingOverrides.storageFee}` : "Not set",
      prepFee: used.pricingOverrides?.prepFee ? `$${used.pricingOverrides.prepFee}` : "Not set",
      additionalFees: used.pricingOverrides?.additionalFees ? `$${used.pricingOverrides.additionalFees}` : "Not set",
      contractCategory: used.pricingOverrides?.contractCategory || "Not set"
    }
  );

  console.log(LogModule.USED_DATA2, "Export Settings", {
    totalFields: `${used.exportSettings?.length || 0} fields`,
    enabledFields: used.exportSettings?.filter(field => field.enabled).length || 0
  });

  logGroupEnd();
  
  loggedOnce = true;
}

return used;
}

////////////////////////////////////////////////
// Export Statement:
// **The final export(s)
////////////////////////////////////////////////
export default getUsedData; 