/**
 * @fileoverview Template for utility/helper files
 * @author Your Name
 * @created 2025-04-18
 * @lastModified 2025-04-18
 */

////////////////////////////////////////////////
// Imports:
// **All external and internal module imports
// **Grouped by type (external, then internal utils/types)
////////////////////////////////////////////////
import {
  logGroup,
  logTable,
  logGroupEnd,
  LogModule
} from '../utils/logger';

////////////////////////////////////////////////
// Constants and Variables:
// **Anything that defines shared constants, static strings, colors, styles, config, etc.
////////////////////////////////////////////////
let loggedOnce = false;

const BASELINE_KEY = 'desiredMetrics';
const FULFILLMENT_KEY = 'defaultFulfillment';
const PREP_COST_TYPE_KEY = 'prepCostType';
const ADDITIONAL_COST_TYPE_KEY = 'additionalCostType';
const EXPORT_SETTINGS_KEY = 'exportSettings';
const PRICING_PREFIX = 'pricing_';
const SHIPPING_PREFIX = 'shippingDimensions_';

declare global {
  interface Window {
    __nsp_logged_localData?: boolean;
  }
}

////////////////////////////////////////////////
// Types and Interfaces:
// **Custom TypeScript interfaces for the data being worked on
////////////////////////////////////////////////
export interface BaselineMetrics {
  defaultFulfillment: string;
  minProfit: number;
  minMargin: number;
  minROI: number;
  minMonthlySales?: number;
  minTotalRatings: number;
  minRatings30Days: number;
  minOverallRating: number;
  maxSellers: number;
  maxWfsSellers: number;
  maxStock: number;
}

export interface FeeSettings {
  inboundShippingCost: number;
  sfShippingCost: number;
  storageLength: number;
  season: string;
  prepCost: number;
  prepCostType: 'per lb' | 'each';
  additionalCosts: number;
  additionalCostType: 'per lb' | 'each';
}

export interface ExportField {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}
export type ExportSettings = ExportField[];

export interface PricingOverrides {
  productCost?: number;
  salePrice?: number;
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  referralFee?: number;
  wfsFee?: number;
  wfsInboundShipping?: number;
  storageFee?: number;
  prepFee?: number;
  additionalFees?: number;
  contractCategory?: string;
}

export interface LocalData {
  baselineMetrics: BaselineMetrics;
  feeSettings: FeeSettings;
  exportSettings: ExportSettings;
  pricingOverrides: PricingOverrides;
}


////////////////////////////////////////////////
// Configuration:
// **For example: rate limiters, retry configs, cache TTLs
////////////////////////////////////////////////
// No configuration needed

////////////////////////////////////////////////
// Helper Functions:
// **Utility functions (scrapers, parsers, sanitizers, formatters, fallbacks)
////////////////////////////////////////////////
function parseJSON<T>(raw: string | null, defaultVal: T): T {
  try {
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}


////////////////////////////////////////////////
// Main Logic:
// **The code that runs on import/execute (e.g., fetch, parse, etc.)
////////////////////////////////////////////////
export function getLocalData(productId: string): LocalData {
  // Baseline metrics
  const baselineRaw = localStorage.getItem(BASELINE_KEY);
  const bm = parseJSON<Record<string, string>>(baselineRaw, {});
  const baselineMetrics: BaselineMetrics = {
    defaultFulfillment: localStorage.getItem(FULFILLMENT_KEY) || '',
    minProfit: parseFloat(bm.minProfit) || 0,
    minMargin: parseFloat(bm.minMargin) || 0,
    minROI: parseFloat(bm.minROI) || 0,
    minMonthlySales: bm.minMonthlySales ? parseFloat(bm.minMonthlySales) : undefined,
    minTotalRatings: parseInt(bm.minTotalRatings) || 0,
    minRatings30Days: parseInt(bm.minRatings30Days) || 0,
    minOverallRating: parseFloat(bm.minOverallRating) || 0,
    maxSellers: parseInt(bm.maxSellers) || 0,
    maxWfsSellers: parseInt(bm.maxWfsSellers) || 0,
    maxStock: parseInt(bm.maxStock) || 0
  };

  // Fee settings
  const feeSettings: FeeSettings = {
    inboundShippingCost: parseFloat(bm.inboundShippingCost) || 0,
    sfShippingCost: parseFloat(bm.sfShippingCost) || 0,
    storageLength: parseInt(bm.storageLength) || 1,
    season: bm.season || '',
    prepCost: parseFloat(bm.prepCost) || 0,
    prepCostType: (localStorage.getItem(PREP_COST_TYPE_KEY) as 'per lb' | 'each') || 'each',
    additionalCosts: parseFloat(bm.additionalCosts) || 0,
    additionalCostType: (localStorage.getItem(ADDITIONAL_COST_TYPE_KEY) as 'per lb' | 'each') || 'each'
  };

  // Export settings
  const exportRaw = localStorage.getItem(EXPORT_SETTINGS_KEY);
  const es = parseJSON<{ fields: ExportField[] }>(exportRaw, { fields: [] });
  const exportSettings: ExportSettings = es.fields;

  // Pricing overrides
  const pricingRaw = localStorage.getItem(PRICING_PREFIX + productId);
  const pricingData = parseJSON<Record<string, string>>(pricingRaw, {});
  const shippingRaw = localStorage.getItem(SHIPPING_PREFIX + productId);
  const shippingData = parseJSON<Record<string, string>>(shippingRaw, {});

  const pricingOverrides: PricingOverrides = {
    productCost: pricingData.productCost ? parseFloat(pricingData.productCost) : undefined,
    salePrice: pricingData.salePrice ? parseFloat(pricingData.salePrice) : undefined,
    length: shippingData.length ? parseFloat(shippingData.length) : undefined,
    width: shippingData.width ? parseFloat(shippingData.width) : undefined,
    height: shippingData.height ? parseFloat(shippingData.height) : undefined,
    weight: shippingData.weight ? parseFloat(shippingData.weight) : undefined,
    referralFee: pricingData.referralFee ? parseFloat(pricingData.referralFee) : undefined,
    wfsFee: pricingData.wfsFee ? parseFloat(pricingData.wfsFee) : undefined,
    wfsInboundShipping: pricingData.inboundShippingFee ? parseFloat(pricingData.inboundShippingFee) : undefined,
    storageFee: pricingData.storageFee ? parseFloat(pricingData.storageFee) : undefined,
    prepFee: pricingData.prepFee ? parseFloat(pricingData.prepFee) : undefined,
    additionalFees: pricingData.additionalFees ? parseFloat(pricingData.additionalFees) : undefined,
    contractCategory: pricingData.contractCategory || undefined
  };

  const result = {
    baselineMetrics,
    feeSettings,
    exportSettings,
    pricingOverrides
  };

////////////////////////////////////////////////
// Logging:
// **Clean console output with styling
////////////////////////////////////////////////
if (!loggedOnce) {
  if (!window.__nsp_logged_localData) {
  window.__nsp_logged_localData = true;
  logGroup(LogModule.LOCAL_DATA, "Local Stored Data");
  logTable(LogModule.LOCAL_DATA2, "Baseline Metrics", baselineMetrics);
  logTable(LogModule.LOCAL_DATA2, "Fee Settings", feeSettings);
  logTable(LogModule.LOCAL_DATA2, "Export Settings", exportSettings);
  logTable(LogModule.LOCAL_DATA2, "Pricing Overrides", pricingOverrides);
  logGroupEnd();
  loggedOnce = true;
}}

return result;
}
////////////////////////////////////////////////
// Export Statement:
// **The final export(s)
//////////////////////////////////////////////// 
// getLocalData above
