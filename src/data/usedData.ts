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

export function createFallbackUsedData(productId: string): UsedProductData {
  const fallbackData = getData(false);
  const baselineMetrics = {
    defaultFulfillment: "",
    maxSellers: 0,
    maxStock: 0,
    maxWfsSellers: 0,
    minMargin: 0,
    minMonthlySales: 0,
    minOverallRating: 0,
    minProfit: 0,
    minROI: 0,
    minRatings30Days: 0,
    minTotalRatings: 0,
    walmartFulfilled: true
  };

  const feeSettings: FeeSettings & { storageSettings: any } = {
    inboundShippingCost: 0,
    sfShippingCost: 0,
    storageLength: 1,
    season: "",
    prepCost: 0,
    prepCostType: "each" as const,
    additionalCosts: 0,
    additionalCostType: "each" as const,
    storageSettings: {}
  };

  return {
    ...fallbackData,
    overallRating: parseFloat(fallbackData.overallRating) || 0,
    numberOfRatings: parseInt(fallbackData.numberOfRatings) || 0,
    numberOfReviews: parseInt(fallbackData.numberOfReviews) || 0,
    fulfillmentOptions: fallbackData.fulfillmentOptions.map(opt => opt.type),
    sellerName: "",
    sellerDisplayName: "",
    sellerType: "",
    mainSeller: null,
    otherSellers: [],
    totalSellers: 0,
    totalStock: 0,
    totalProfit: 0,
    roi: 0,
    margin: 0,
    cubicFeet: 0,
    referralFee: 0,
    wfsFee: 0,
    prepFee: 0,
    storageFee: 0,
    inboundShipping: 0,
    sfShipping: 0,
    additionalFees: 0,
    finalShippingWeightWFS: 0,
    finalShippingWeightInbound: 0,
    startingProductCost: 0,
    dimensionalWeight: 0,
    exportSettings: [],
    baselineMetrics,
    feeSettings,
    pricingOverrides: {},
    basic: {
      productID: fallbackData.productID,
      name: fallbackData.name,
      upc: fallbackData.upc,
      brand: fallbackData.brand,
      brandUrl: fallbackData.brandUrl,
      modelNumber: fallbackData.modelNumber
    },
    pricing: {
      currentPrice: fallbackData.currentPrice,
    },
    dimensions: {
      shippingLength: fallbackData.shippingLength,
      shippingWidth: fallbackData.shippingWidth,
      shippingHeight: fallbackData.shippingHeight,
      weight: fallbackData.weight,
      cubicFeet: 0,
      dimensionalWeight: 0
    },
    reviews: {
      overallRating: parseFloat(fallbackData.overallRating) || 0,
      numberOfRatings: parseInt(fallbackData.numberOfRatings) || 0,
      numberOfReviews: parseInt(fallbackData.numberOfReviews) || 0,
      reviewDates: fallbackData.reviewDates,
      customerReviews: fallbackData.customerReviews
    },
    inventory: {
      totalSellers: 0,
      totalStock: 0,
      fulfillmentOptions: fallbackData.fulfillmentOptions.map(opt => opt.type)
    },
    sellers: {
      mainSeller: null,
      otherSellers: [],
      sellerName: "",
      sellerDisplayName: "",
      sellerType: ""
    },
    flags: {
      isHazardousMaterial: false,
      badges: fallbackData.badges
    },
    profitability: {
      totalProfit: 0,
      margin: 0,
      roi: 0,
      referralFee: 0,
      wfsFee: 0,
      prepFee: 0,
      storageFee: 0,
      inboundShipping: 0,
      sfShipping: 0,
      additionalFees: 0
    },
    variants: {
      variantCriteria: fallbackData.variantCriteria,
      variantsMap: fallbackData.variantsMap
    }
  };
}

////////////////////////////////////////////////
// Main Logic:
////////////////////////////////////////////////
export async function getUsedData(productId: string): Promise<UsedProductData> {
  try {
    const raw = getData(false);
    const seller = await getSellerData(productId) || [];
    const local = getLocalData(productId);

    // Add validation
    if (!raw) {
      throw new Error("Failed to get product data");
    }

    // Calculate all metrics with null checks
    const totalProfit = calculateTotalProfit(
      raw.currentPrice || 0,
      local.pricingOverrides.productCost ?? 0,
      local.pricingOverrides.referralFee ?? calculateReferralFee(raw.currentPrice || 0, local.pricingOverrides.contractCategory || raw.mainCategory || ''),
      local.pricingOverrides.wfsFee ?? calculateWFSFee({
        weight: parseFloat(raw.weight || '0'),
        length: parseFloat(raw.shippingLength || '0'),
        width: parseFloat(raw.shippingWidth || '0'),
        height: parseFloat(raw.shippingHeight || '0'),
        isWalmartFulfilled: raw.fulfillmentOptions.map(opt => opt.type).includes("WFS") || false,
        isApparel: raw.badges?.includes("Apparel") || false,
        isHazardousMaterial: false,
        retailPrice: raw.currentPrice || 0
      }),
      local.pricingOverrides.wfsInboundShipping ?? calculateInboundShipping(parseFloat(raw.weight || '0'), true),
      local.pricingOverrides.storageFee ?? parseFloat(
        calculateStorageFee(local.feeSettings.season || '', calculateCubicFeet(parseFloat(raw.shippingLength || '0'), parseFloat(raw.shippingWidth || '0'), parseFloat(raw.shippingHeight || '0')), local.feeSettings.storageLength || 1)
      ),
      local.pricingOverrides.prepFee ?? calculatePrepFee(parseFloat(raw.weight || '0')),
      local.pricingOverrides.additionalFees ?? calculateAdditionalFees(parseFloat(raw.weight || '0'))
    );

    const roiValue = parseFloat(calculateROI(totalProfit, local.pricingOverrides.productCost ?? 0));
    const marginValue = parseFloat(calculateMargin(totalProfit, raw.currentPrice || 0));
    const cubicFeet = calculateCubicFeet(parseFloat(raw.shippingLength || '0'), parseFloat(raw.shippingWidth || '0'), parseFloat(raw.shippingHeight || '0'));
    const referralFee = calculateReferralFee(raw.currentPrice || 0, local.pricingOverrides.contractCategory || raw.mainCategory || '');
    const wfsFee = calculateWFSFee({
      weight: parseFloat(raw.weight || '0'),
      length: parseFloat(raw.shippingLength || '0'),
      width: parseFloat(raw.shippingWidth || '0'),
      height: parseFloat(raw.shippingHeight || '0'),
      isWalmartFulfilled: raw.fulfillmentOptions.map(opt => opt.type).includes("WFS") || false,
      isApparel: raw.badges?.includes("Apparel") || false,
      isHazardousMaterial: false,
      retailPrice: raw.currentPrice || 0
    });
    const prepFee = calculatePrepFee(parseFloat(raw.weight || '0'));
    const storageFee = parseFloat(calculateStorageFee(local.feeSettings.season || '', cubicFeet, local.feeSettings.storageLength || 1));
    const inboundShipping = calculateInboundShipping(parseFloat(raw.weight || '0'), true);
    const sfShipping = calculateSfShipping(parseFloat(raw.weight || '0'));
    const additionalFees = calculateAdditionalFees(parseFloat(raw.weight || '0'));
    const finalShippingWeightWFS = calculateFinalShippingWeightForWFS(parseFloat(raw.weight || '0'), parseFloat(raw.shippingLength || '0'), parseFloat(raw.shippingWidth || '0'), parseFloat(raw.shippingHeight || '0'));
    const finalShippingWeightInbound = calculateFinalShippingWeightForInbound(parseFloat(raw.weight || '0'), parseFloat(raw.shippingLength || '0'), parseFloat(raw.shippingWidth || '0'), parseFloat(raw.shippingHeight || '0'));
    const startingProductCost = calculateStartingProductCost(raw.currentPrice || 0);
    const dimensionalWeight = calculateDimensionalWeight(parseFloat(raw.shippingLength || '0'), parseFloat(raw.shippingWidth || '0'), parseFloat(raw.shippingHeight || '0'));

    const used: UsedProductData = {
      ...raw,
      overallRating: parseFloat(raw.overallRating) || 0,
      numberOfRatings: parseInt(raw.numberOfRatings) || 0,
      numberOfReviews: parseInt(raw.numberOfReviews) || 0,
      fulfillmentOptions: raw.fulfillmentOptions.map(opt => opt.type),
      sellerName: seller[0]?.sellerName || '',
      sellerDisplayName: seller[0]?.sellerName || '',
      sellerType: seller[0]?.type || '',
      mainSeller: seller[0] || null,
      otherSellers: seller.slice(1) || [],
      totalSellers: seller.length,
      totalStock: seller.reduce((sum, s) => sum + (s.stock ?? 0), 0),
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
        overallRating: parseFloat(raw.overallRating) || 0,
        numberOfRatings: parseInt(raw.numberOfRatings) || 0,
        numberOfReviews: parseInt(raw.numberOfReviews) || 0,
        reviewDates: raw.reviewDates,
        customerReviews: raw.customerReviews
      },
      inventory: {
        totalSellers: seller.length,
        totalStock: seller.reduce((sum, s) => sum + (s.stock ?? 0), 0),
        fulfillmentOptions: raw.fulfillmentOptions.map(opt => opt.type)
      },
      sellers: {
        mainSeller: seller[0] || null,
        otherSellers: seller.slice(1) || [],
        sellerName: seller[0]?.sellerName || '',
        sellerDisplayName: seller[0]?.sellerName || '',
        sellerType: seller[0]?.type || ''
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

    // Log data if needed
    if (!window.__nsp_logged_usedData) {
      window.__nsp_logged_usedData = true;
      logGroup(LogModule.USED_DATA, "Data Used in Extension");
      logTable(LogModule.USED_DATA, "Basic Product Info", used.basic);
      logTable(LogModule.USED_DATA, "Pricing Info", used.pricing);
      logTable(LogModule.USED_DATA, "Product Dimensions", used.dimensions);
      logTable(LogModule.USED_DATA, "Product Media", {
        imageUrl: used.imageUrl,
        images: `${used.images?.length || 0} images`,
        videos: `${used.videos?.length || 0} videos`
      });
      logTable(LogModule.USED_DATA, "Categories & Badges", {
        mainCategory: used.mainCategory,
        categories: `${used.categories?.length || 0} categories`,
        badges: used.badges
      });
      logTable(LogModule.USED_DATA, "Seller Data", {
        sellerName: used.sellerName,
        sellerType: used.sellerType,
        sellerDisplayName: used.sellerDisplayName,
        totalSellers: used.totalSellers,
        totalStock: used.totalStock,
        otherSellers: `${used.otherSellers?.length || 0} sellers`
      });
      logTable(LogModule.USED_DATA, "Review Data", {
        overallRating: used.overallRating,
        numberOfRatings: used.numberOfRatings,
        numberOfReviews: used.numberOfReviews,
        reviewDates: `${used.reviewDates?.length || 0} dates`
      });
      logTable(LogModule.USED_DATA, "Variant Data", {
        variantCriteria: used.variantCriteria ? `${used.variantCriteria.length || 0} criteria` : "Not Available",
        variantsMap: used.variantsMap ? "Available" : "Not Available"
      });
      logTable(LogModule.USED_DATA, "Profitability Metrics", {
        totalProfit: `$${used.totalProfit.toFixed(2)}`,
        roi: `${used.roi.toFixed(1)}%`,
        margin: `${used.margin.toFixed(1)}%`
      });
      logTable(LogModule.USED_DATA, "Fee Breakdown", {
        referralFee: `$${used.referralFee.toFixed(2)}`,
        wfsFee: `$${used.wfsFee.toFixed(2)}`,
        prepFee: `$${used.prepFee.toFixed(2)}`,
        storageFee: `$${used.storageFee.toFixed(2)}`,
        inboundShipping: `$${used.inboundShipping.toFixed(2)}`,
        sfShipping: `$${used.sfShipping.toFixed(2)}`,
        additionalFees: `$${used.additionalFees.toFixed(2)}`
      });
      logTable(LogModule.USED_DATA, "Baseline Metrics", {
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
      });
      logTable(LogModule.USED_DATA, "Fee Settings", {
        inboundShippingCost: `$${used.feeSettings.inboundShippingCost}`,
        sfShippingCost: `$${used.feeSettings.sfShippingCost}`,
        storageLength: used.feeSettings.storageLength,
        season: used.feeSettings.season,
        prepCost: `$${used.feeSettings.prepCost}`,
        prepCostType: used.feeSettings.prepCostType,
        additionalCosts: `$${used.feeSettings.additionalCosts}`,
        additionalCostType: used.feeSettings.additionalCostType
      });
      logTable(LogModule.USED_DATA, "Pricing Overrides", {
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
      });
      logTable(LogModule.USED_DATA, "Export Settings", {
        totalFields: `${used.exportSettings?.length || 0} fields`,
        enabledFields: used.exportSettings?.filter(field => field.enabled).length || 0
      });
      logGroupEnd();
    }

    return used;
  } catch (error) {
    logGroup(LogModule.USED_DATA, "Error in getUsedData");
    logTable(LogModule.USED_DATA, "Error Details", { error });
    logGroupEnd();
    
    // Return safe fallback data
    return createFallbackUsedData(productId);
  }
}

////////////////////////////////////////////////
// Export Statement:
// **The final export(s)
////////////////////////////////////////////////
export default getUsedData; 