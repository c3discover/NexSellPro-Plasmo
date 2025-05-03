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
  calculateDimensionalWeight,
  calculateTotalStock
} from "./logic/calculations";
import { getLocalData } from "./logic/localData";
import { LogModule, logGroup, logTable, logGroupEnd } from "./utils/logger";
import {
  ExportSettings,
  BaselineMetrics,
  FeeSettings,
  PricingOverrides,
  ExtendedBaselineMetrics,
  ExtendedFeeSettings
} from "../types/settings";

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
  category: string;
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
  isHazardousMaterial: boolean;

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
  baselineMetrics: ExtendedBaselineMetrics;
  feeSettings: ExtendedFeeSettings;
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

  // 🆕 Flattened fields for export
  timestamp: string;
  itemId: string;
  gtin: string;
  ean: string;
  countryOfOrigin: string;
  mainImage: string;
  numberOfImages: number;
  numberOfVideos: number;
  shelvingPath: string;
  length: string;
  width: string;
  height: string;
  salePrice: string | number;
  estMonthlySales: string;
  productCost: string | number;
  wfsInboundShipping: number;
  totalRatings: number;
  totalReviews: number;
  reviews30Days: number;
  reviews90Days: number;
  reviews1Year: number;
  wfsSellers: number;
  walmartSells: string;
  brandSells: string;
  numberOfVariants: number;
  variationAttributes: string;
  variations: string;
  variantsInStock: number;
  notes: string;
  blankColumn1: string;
  blankColumn2: string;
  blankColumn3: string;
  blankColumn4: string;
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
    category: fallbackData.categories?.[0]?.name || "",
    isHazardousMaterial: false,
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
    exportSettings: {
      fields: []
    },
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
    },
    timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
    itemId: fallbackData.productID,
    gtin: "",
    ean: "",
    countryOfOrigin: "",
    mainImage: fallbackData.imageUrl,
    numberOfImages: fallbackData.images.length,
    numberOfVideos: fallbackData.videos.length,
    shelvingPath: fallbackData.categories.map(c => c.name).join(" > "),
    length: fallbackData.shippingLength,
    width: fallbackData.shippingWidth,
    height: fallbackData.shippingHeight,
    salePrice: fallbackData.currentPrice,
    estMonthlySales: "",
    productCost: fallbackData.currentPrice,
    wfsInboundShipping: 0,
    totalRatings: parseInt(fallbackData.numberOfRatings) || 0,
    totalReviews: parseInt(fallbackData.numberOfReviews) || 0,
    reviews30Days: 0,
    reviews90Days: 0,
    reviews1Year: 0,
    wfsSellers: 0,
    walmartSells: "No",
    brandSells: "No",
    numberOfVariants: 0,
    variationAttributes: "",
    variations: "",
    variantsInStock: 0,
    notes: "",
    blankColumn1: "",
    blankColumn2: "",
    blankColumn3: "",
    blankColumn4: ""
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
      raw?.currentPrice ?? 0,
      local?.pricingOverrides?.productCost ?? 0,
      local?.pricingOverrides?.referralFee ?? calculateReferralFee(raw?.currentPrice ?? 0, local?.pricingOverrides?.contractCategory ?? raw?.mainCategory ?? ''),
      local?.pricingOverrides?.wfsFee ?? calculateWFSFee({
        weight: parseFloat(raw?.weight ?? '0'),
        length: parseFloat(raw?.shippingLength ?? '0'),
        width: parseFloat(raw?.shippingWidth ?? '0'),
        height: parseFloat(raw?.shippingHeight ?? '0'),
        isWalmartFulfilled: raw?.fulfillmentOptions?.map(opt => opt?.type)?.includes("WFS") ?? false,
        isApparel: raw?.badges?.includes("Apparel") ?? false,
        isHazardousMaterial: false,
        retailPrice: raw?.currentPrice ?? 0
      }),
      local?.pricingOverrides?.wfsInboundShipping ?? calculateInboundShipping(parseFloat(raw?.weight ?? '0'), true),
      local?.pricingOverrides?.storageFee ?? parseFloat(
        calculateStorageFee(local?.feeSettings?.season ?? '', calculateCubicFeet(parseFloat(raw?.shippingLength ?? '0'), parseFloat(raw?.shippingWidth ?? '0'), parseFloat(raw?.shippingHeight ?? '0')), local?.feeSettings?.storageLength ?? 1)
      ),
      local?.pricingOverrides?.prepFee ?? calculatePrepFee(parseFloat(raw?.weight ?? '0')),
      local?.pricingOverrides?.additionalFees ?? calculateAdditionalFees(parseFloat(raw?.weight ?? '0'))
    );

    const roiValue = parseFloat(calculateROI(totalProfit, local?.pricingOverrides?.productCost ?? 0));
    const marginValue = parseFloat(calculateMargin(totalProfit, raw?.currentPrice ?? 0));
    const cubicFeet = calculateCubicFeet(parseFloat(raw?.shippingLength ?? '0'), parseFloat(raw?.shippingWidth ?? '0'), parseFloat(raw?.shippingHeight ?? '0'));
    const referralFee = calculateReferralFee(raw?.currentPrice ?? 0, local?.pricingOverrides?.contractCategory ?? raw?.mainCategory ?? '');
    const wfsFee = calculateWFSFee({
      weight: parseFloat(raw?.weight ?? '0'),
      length: parseFloat(raw?.shippingLength ?? '0'),
      width: parseFloat(raw?.shippingWidth ?? '0'),
      height: parseFloat(raw?.shippingHeight ?? '0'),
      isWalmartFulfilled: raw?.fulfillmentOptions?.map(opt => opt?.type)?.includes("WFS") ?? false,
      isApparel: raw?.badges?.includes("Apparel") ?? false,
      isHazardousMaterial: false,
      retailPrice: raw?.currentPrice ?? 0
    });
    const prepFee = calculatePrepFee(parseFloat(raw?.weight ?? '0'));
    const storageFee = parseFloat(calculateStorageFee(local?.feeSettings?.season ?? '', cubicFeet, local?.feeSettings?.storageLength ?? 1));
    const inboundShipping = calculateInboundShipping(parseFloat(raw?.weight ?? '0'), true);
    const sfShipping = calculateSfShipping(parseFloat(raw?.weight ?? '0'));
    const additionalFees = calculateAdditionalFees(parseFloat(raw?.weight ?? '0'));
    const finalShippingWeightWFS = calculateFinalShippingWeightForWFS(parseFloat(raw?.weight ?? '0'), parseFloat(raw?.shippingLength ?? '0'), parseFloat(raw?.shippingWidth ?? '0'), parseFloat(raw?.shippingHeight ?? '0'));
    const finalShippingWeightInbound = calculateFinalShippingWeightForInbound(parseFloat(raw?.weight ?? '0'), parseFloat(raw?.shippingLength ?? '0'), parseFloat(raw?.shippingWidth ?? '0'), parseFloat(raw?.shippingHeight ?? '0'));
    const startingProductCost = calculateStartingProductCost(raw?.currentPrice ?? 0);
    const dimensionalWeight = calculateDimensionalWeight(parseFloat(raw?.shippingLength ?? '0'), parseFloat(raw?.shippingWidth ?? '0'), parseFloat(raw?.shippingHeight ?? '0'));

    // Initialize settings with required properties
    const exportSettings: ExportSettings = {
      fields: local?.exportSettings?.fields ?? []
    };
    
    const baselineMetrics: ExtendedBaselineMetrics = {
      defaultFulfillment: local?.baselineMetrics?.defaultFulfillment ?? "Walmart Fulfilled",
      minProfit: local?.baselineMetrics?.minProfit ?? 0,
      minMargin: local?.baselineMetrics?.minMargin ?? 0,
      minROI: local?.baselineMetrics?.minROI ?? 0,
      minMonthlySales: local?.baselineMetrics?.minMonthlySales,
      minTotalRatings: local?.baselineMetrics?.minTotalRatings ?? 0,
      minRatings30Days: local?.baselineMetrics?.minRatings30Days ?? 0,
      minOverallRating: local?.baselineMetrics?.minOverallRating ?? 0,
      maxSellers: local?.baselineMetrics?.maxSellers ?? 0,
      maxWfsSellers: local?.baselineMetrics?.maxWfsSellers ?? 0,
      maxStock: local?.baselineMetrics?.maxStock ?? 0,
      walmartFulfilled: true
    };

    const feeSettings: ExtendedFeeSettings = {
      inboundShippingCost: local?.feeSettings?.inboundShippingCost ?? 0,
      sfShippingCost: local?.feeSettings?.sfShippingCost ?? 0,
      storageLength: local?.feeSettings?.storageLength ?? 1,
      season: local?.feeSettings?.season ?? "Jan-Sep",
      prepCost: local?.feeSettings?.prepCost ?? 0,
      prepCostType: local?.feeSettings?.prepCostType ?? "each",
      additionalCosts: local?.feeSettings?.additionalCosts ?? 0,
      additionalCostType: local?.feeSettings?.additionalCostType ?? "each",
      storageSettings: {
        length: local?.feeSettings?.storageLength ?? 1,
        season: local?.feeSettings?.season === "Oct-Dec" ? "Oct-Dec" : "Jan-Sep",
        cost: local?.feeSettings?.storageLength ?? 0
      }
    };

    // Log data if needed
    if (!window.__nsp_logged_usedData) {
      window.__nsp_logged_usedData = true;
      logGroup(LogModule.USED_DATA, "Data Used in Extension");
      logTable(LogModule.USED_DATA, "Basic Product Info", {
        productID: raw?.productID ?? '',
        name: raw?.name ?? '',
        upc: raw?.upc ?? '',
        brand: raw?.brand ?? '',
        brandUrl: raw?.brandUrl ?? '',
        modelNumber: raw?.modelNumber ?? '',
        currentPrice: raw?.currentPrice ?? 0,
        imageUrl: raw?.imageUrl ?? '',
        images: `${raw?.images?.length ?? 0} images`,
        videos: `${raw?.videos?.length ?? 0} videos`,
        mainCategory: raw?.mainCategory ?? '',
        categories: `${raw?.categories?.length ?? 0} categories`,
        shippingLength: raw?.shippingLength ?? '',
        shippingWidth: raw?.shippingWidth ?? '',
        shippingHeight: raw?.shippingHeight ?? '',
        weight: raw?.weight ?? '',
        badges: raw?.badges ?? [],
        variantCriteria: raw?.variantCriteria ?? [],
        variantsMap: raw?.variantsMap ?? {},
        overallRating: raw?.overallRating ?? 0,
        numberOfRatings: raw?.numberOfRatings ?? 0,
        numberOfReviews: raw?.numberOfReviews ?? 0,
        customerReviews: raw?.customerReviews ?? [],
        reviewDates: raw?.reviewDates ?? [],
        fulfillmentOptions: raw?.fulfillmentOptions?.map(opt => opt?.type) ?? [],
        sellerName: seller?.[0]?.sellerName ?? '',
        sellerDisplayName: seller?.[0]?.sellerName ?? '',
        sellerType: seller?.[0]?.type ?? '',
        mainSeller: seller?.[0] ?? null,
        otherSellers: `${seller?.slice(1)?.length ?? 0} sellers`,
        totalSellers: seller?.length ?? 0,
        totalStock: calculateTotalStock(seller ?? []),
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
        dimensionalWeight
      });
      logTable(LogModule.USED_DATA, "Pricing Info", {
        currentPrice: raw?.currentPrice ?? 0,
        salePrice: local?.pricingOverrides?.salePrice ?? '',
        productCost: local?.pricingOverrides?.productCost ?? 0,
        referralFee: `$${referralFee.toFixed(2)}`,
        wfsFee: `$${wfsFee.toFixed(2)}`,
        prepFee: `$${prepFee.toFixed(2)}`,
        storageFee: `$${storageFee.toFixed(2)}`,
        inboundShipping: `$${inboundShipping.toFixed(2)}`,
        sfShipping: `$${sfShipping.toFixed(2)}`,
        additionalFees: `$${additionalFees.toFixed(2)}`
      });
      logTable(LogModule.USED_DATA, "Product Dimensions", {
        shippingLength: raw?.shippingLength ?? '',
        shippingWidth: raw?.shippingWidth ?? '',
        shippingHeight: raw?.shippingHeight ?? '',
        weight: raw?.weight ?? '',
        cubicFeet,
        dimensionalWeight
      });
      logTable(LogModule.USED_DATA, "Seller Data", {
        sellerName: seller?.[0]?.sellerName ?? '',
        sellerType: seller?.[0]?.type ?? '',
        sellerDisplayName: seller?.[0]?.sellerName ?? '',
        totalSellers: seller?.length ?? 0,
        totalStock: calculateTotalStock(seller ?? []),
        otherSellers: `${seller?.slice(1)?.length ?? 0} sellers`
      });
      logTable(LogModule.USED_DATA, "Review Data", {
        overallRating: raw?.overallRating ?? 0,
        numberOfRatings: raw?.numberOfRatings ?? 0,
        numberOfReviews: raw?.numberOfReviews ?? 0,
        reviewDates: `${raw?.reviewDates?.length ?? 0} dates`,
        customerReviews: raw?.customerReviews ?? []
      });
      logTable(LogModule.USED_DATA, "Variant Data", {
        variantCriteria: raw?.variantCriteria?.length ?? 0,
        variantsMap: Object.keys(raw?.variantsMap ?? {}).length > 0 ? "Available" : "Not Available"
      });
      logTable(LogModule.USED_DATA, "Profitability Metrics", {
        totalProfit: `$${totalProfit.toFixed(2)}`,
        roi: `${roiValue.toFixed(1)}%`,
        margin: `${marginValue.toFixed(1)}%`
      });
      logTable(LogModule.USED_DATA, "Fee Breakdown", {
        referralFee: `$${referralFee.toFixed(2)}`,
        wfsFee: `$${wfsFee.toFixed(2)}`,
        prepFee: `$${prepFee.toFixed(2)}`,
        storageFee: `$${storageFee.toFixed(2)}`,
        inboundShipping: `$${inboundShipping.toFixed(2)}`,
        sfShipping: `$${sfShipping.toFixed(2)}`,
        additionalFees: `$${additionalFees.toFixed(2)}`
      });
      logTable(LogModule.USED_DATA, "Baseline Metrics", {
        defaultFulfillment: baselineMetrics.defaultFulfillment,
        walmartFulfilled: baselineMetrics.walmartFulfilled,
        minProfit: `$${baselineMetrics.minProfit}`,
        minMargin: `${baselineMetrics.minMargin}%`,
        minROI: `${baselineMetrics.minROI}%`,
        minMonthlySales: baselineMetrics.minMonthlySales ?? 0,
        minTotalRatings: baselineMetrics.minTotalRatings,
        minRatings30Days: baselineMetrics.minRatings30Days,
        minOverallRating: baselineMetrics.minOverallRating,
        maxSellers: baselineMetrics.maxSellers,
        maxWfsSellers: baselineMetrics.maxWfsSellers,
        maxStock: baselineMetrics.maxStock
      });
      logTable(LogModule.USED_DATA, "Fee Settings", {
        inboundShippingCost: `$${feeSettings.inboundShippingCost}`,
        sfShippingCost: `$${feeSettings.sfShippingCost}`,
        storageLength: feeSettings.storageLength,
        season: feeSettings.season,
        prepCost: `$${feeSettings.prepCost}`,
        prepCostType: feeSettings.prepCostType,
        additionalCosts: `$${feeSettings.additionalCosts}`,
        additionalCostType: feeSettings.additionalCostType
      });
      logTable(LogModule.USED_DATA, "Pricing Overrides", {
        productCost: local?.pricingOverrides?.productCost ? `$${local.pricingOverrides.productCost}` : "Not set",
        salePrice: local?.pricingOverrides?.salePrice ? `$${local.pricingOverrides.salePrice}` : "Not set",
        length: local?.pricingOverrides?.length || "Not set",
        width: local?.pricingOverrides?.width || "Not set",
        height: local?.pricingOverrides?.height || "Not set",
        weight: local?.pricingOverrides?.weight || "Not set",
        referralFee: local?.pricingOverrides?.referralFee ? `$${local.pricingOverrides.referralFee}` : "Not set",
        wfsFee: local?.pricingOverrides?.wfsFee ? `$${local.pricingOverrides.wfsFee}` : "Not set",
        wfsInboundShipping: local?.pricingOverrides?.wfsInboundShipping ? `$${local.pricingOverrides.wfsInboundShipping}` : "Not set",
        storageFee: local?.pricingOverrides?.storageFee ? `$${local.pricingOverrides.storageFee}` : "Not set",
        prepFee: local?.pricingOverrides?.prepFee ? `$${local.pricingOverrides.prepFee}` : "Not set",
        additionalFees: local?.pricingOverrides?.additionalFees ? `$${local.pricingOverrides.additionalFees}` : "Not set",
        contractCategory: local?.pricingOverrides?.contractCategory || "Not set"
      });
      logTable(LogModule.USED_DATA, "Export Settings", {
        totalFields: exportSettings.fields.length,
        enabledFields: exportSettings.fields.filter(field => field.enabled).length
      });
      logGroupEnd();
    }

    // Create flattened object for export compatibility
    const used = {
      // System
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),

      // Product Info
      productID: raw?.productID || "",
      name: raw?.name || "",
      brand: raw?.brand || "",
      brandUrl: raw?.brandUrl || "",
      category: raw?.categories?.[0]?.name || "",
      upc: raw?.upc || "",
      modelNumber: raw?.modelNumber || "",
      itemId: raw?.productID || "",
      gtin: "", // TODO: Not yet implemented
      ean: "", // TODO: Not yet implemented
      countryOfOrigin: "", // TODO: Not yet implemented

      // Media
      imageUrl: raw?.imageUrl || "",
      mainImage: raw?.imageUrl || "",
      images: raw?.images || [],
      videos: raw?.videos || [],
      numberOfImages: raw?.images?.length || 0,
      numberOfVideos: raw?.videos?.length || 0,

      // Categories & Badges
      mainCategory: raw?.mainCategory || "",
      categories: raw?.categories || [],
      shelvingPath: raw?.categories?.map(c => c.name).join(" > ") || "",
      badges: raw?.badges || [],

      // Dimensions
      shippingLength: raw?.shippingLength || "",
      shippingWidth: raw?.shippingWidth || "",
      shippingHeight: raw?.shippingHeight || "",
      weight: raw?.weight || "",
      length: raw?.shippingLength || "",
      width: raw?.shippingWidth || "",
      height: raw?.shippingHeight || "",
      cubicFeet,
      dimensionalWeight,
      finalShippingWeightWFS,
      finalShippingWeightInbound,
      startingProductCost,

      // Pricing & Costs
      currentPrice: raw?.currentPrice || 0,
      salePrice: local?.pricingOverrides?.salePrice || raw?.currentPrice || "",
      productCost: local?.pricingOverrides?.productCost || startingProductCost || 0,
      estMonthlySales: "", // TODO: Not yet implemented
      totalProfit,
      roi: roiValue,
      margin: marginValue,

      // Fees
      referralFee,
      wfsFee,
      prepFee,
      storageFee,
      wfsInboundShipping: inboundShipping,
      sfShipping,
      additionalFees,
      inboundShipping,

      // Reviews & Ratings
      overallRating: parseFloat(raw?.overallRating ?? '0') || 0,
      numberOfRatings: parseInt(raw?.numberOfRatings ?? '0') || 0,
      numberOfReviews: parseInt(raw?.numberOfReviews ?? '0') || 0,
      customerReviews: raw?.customerReviews || [],
      reviewDates: raw?.reviewDates || [],
      reviews30Days: raw?.reviewDates?.filter(date => {
        const d = new Date(date)
        return d >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }).length || 0,
      reviews90Days: raw?.reviewDates?.filter(date => {
        const d = new Date(date)
        return d >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      }).length || 0,
      reviews1Year: raw?.reviewDates?.filter(date => {
        const d = new Date(date)
        return d >= new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      }).length || 0,
      totalRatings: parseInt(raw?.numberOfRatings ?? '0') || 0,
      totalReviews: parseInt(raw?.numberOfReviews ?? '0') || 0,

      // Sellers & Inventory
      sellerName: seller?.[0]?.sellerName || "",
      sellerDisplayName: seller?.[0]?.sellerName || "",
      sellerType: seller?.[0]?.type || "",
      mainSeller: seller?.[0] || null,
      otherSellers: seller?.slice(1) || [],
      totalSellers: seller?.length || 0,
      totalStock: calculateTotalStock(seller || []),
      wfsSellers: seller?.filter(s => s.isWFS)?.length || 0,
      walmartSells: seller?.[0]?.sellerName === "Walmart.com" ? "Yes" : "No",
      brandSells: seller?.some(s => s.sellerName?.toLowerCase().includes(raw?.brand?.toLowerCase())) ? "Yes" : "No",
      fulfillmentOptions: raw?.fulfillmentOptions?.map(opt => opt?.type) || [],

      // Variants
      variantCriteria: raw?.variantCriteria || [],
      variantsMap: raw?.variantsMap || {},
      numberOfVariants: Object.keys(raw?.variantsMap || {}).length || 0,
      variationAttributes: Object.values(raw?.variantsMap || {})[0]?.variants?.join(", ") || "",
      variations: Object.keys(raw?.variantsMap || {}).join(", "),
      variantsInStock: Object.values(raw?.variantsMap || {}).filter(v => v.availabilityStatus === "IN_STOCK").length || 0,

      // Settings
      exportSettings,
      baselineMetrics,
      feeSettings,
      pricingOverrides: local?.pricingOverrides || {},

      // Flags
      isHazardousMaterial: false,

      // Misc
      notes: "", // TODO: Not yet implemented
      blankColumn1: "", // TODO: Not yet implemented
      blankColumn2: "", // TODO: Not yet implemented
      blankColumn3: "", // TODO: Not yet implemented
      blankColumn4: "", // TODO: Not yet implemented

      // Required nested structures for backward compatibility
      basic: {
        productID: raw?.productID || "",
        name: raw?.name || "",
        upc: raw?.upc || "",
        brand: raw?.brand || "",
        brandUrl: raw?.brandUrl || "",
        modelNumber: raw?.modelNumber || ""
      },
      pricing: {
        currentPrice: raw?.currentPrice || 0,
        salePrice: local?.pricingOverrides?.salePrice
      },
      dimensions: {
        shippingLength: raw?.shippingLength || "",
        shippingWidth: raw?.shippingWidth || "",
        shippingHeight: raw?.shippingHeight || "",
        weight: raw?.weight || "",
        cubicFeet,
        dimensionalWeight
      },
      reviews: {
        overallRating: parseFloat(raw?.overallRating ?? '0') || 0,
        numberOfRatings: parseInt(raw?.numberOfRatings ?? '0') || 0,
        numberOfReviews: parseInt(raw?.numberOfReviews ?? '0') || 0,
        reviewDates: raw?.reviewDates || [],
        customerReviews: raw?.customerReviews || []
      },
      inventory: {
        totalSellers: seller?.length || 0,
        totalStock: calculateTotalStock(seller || []),
        fulfillmentOptions: raw?.fulfillmentOptions?.map(opt => opt?.type) || []
      },
      sellers: {
        mainSeller: seller?.[0] || null,
        otherSellers: seller?.slice(1) || [],
        sellerName: seller?.[0]?.sellerName || "",
        sellerDisplayName: seller?.[0]?.sellerName || "",
        sellerType: seller?.[0]?.type || ""
      },
      flags: {
        isHazardousMaterial: false,
        badges: raw?.badges || []
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
        variantCriteria: raw?.variantCriteria || [],
        variantsMap: raw?.variantsMap || {}
      }
    };

    return used;
  } catch (err) {
    console.error("[USED DATA] Error getting data:", err);
    throw err;
  }
}

////////////////////////////////////////////////
// Export Statement:
// **The final export(s)
////////////////////////////////////////////////
export default getUsedData; 