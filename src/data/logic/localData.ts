/**
 * @fileoverview Local data management and storage utilities
 * @author NexSellPro
 * @created 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import {
  logGroup,
  logTable,
  logGroupEnd,
  LogModule
} from '../utils/logger';
import {
  ExportSettings,
  BaselineMetrics,
  FeeSettings,
  PricingOverrides
} from '../../types/settings';

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
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
////////////////////////////////////////////////

/**
 * Combined local data interface
 */
export interface LocalData {
  baselineMetrics: BaselineMetrics;
  feeSettings: FeeSettings;
  exportSettings: ExportSettings;
  pricingOverrides: PricingOverrides;
}

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

/**
 * Parse JSON with fallback
 */
function parseJSON<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

////////////////////////////////////////////////
// Main Logic:
////////////////////////////////////////////////

/**
 * Get local data for a product
 */
export function getLocalData(productId: string): LocalData {
  // Baseline metrics
  const baselineRaw = localStorage.getItem(BASELINE_KEY);
  const bm = parseJSON<Record<string, string>>(baselineRaw, {});
  const baselineMetrics: BaselineMetrics = {
    defaultFulfillment: localStorage.getItem(FULFILLMENT_KEY) || 'Walmart Fulfilled',
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
    season: bm.season || 'Jan-Sep',
    prepCost: parseFloat(bm.prepCost) || 0,
    prepCostType: (localStorage.getItem(PREP_COST_TYPE_KEY) as 'per lb' | 'each') || 'each',
    additionalCosts: parseFloat(bm.additionalCosts) || 0,
    additionalCostType: (localStorage.getItem(ADDITIONAL_COST_TYPE_KEY) as 'per lb' | 'each') || 'each'
  };

  // Export settings
  const exportRaw = localStorage.getItem(EXPORT_SETTINGS_KEY);
  const exportSettings: ExportSettings = parseJSON<ExportSettings>(exportRaw, { fields: [] });

  // Pricing overrides
  const pricingRaw = localStorage.getItem(PRICING_PREFIX + productId);
  const pricingOverrides: PricingOverrides = parseJSON(pricingRaw, {});

  // Log data if needed
  if (!window.__nsp_logged_localData) {
    window.__nsp_logged_localData = true;
    logGroup(LogModule.LOCAL_DATA, "Local Data");
    logTable(LogModule.LOCAL_DATA2, "Baseline Metrics", baselineMetrics);
    logTable(LogModule.LOCAL_DATA2, "Fee Settings", feeSettings);
    logTable(LogModule.LOCAL_DATA2, "Export Settings", {
      totalFields: exportSettings.fields.length,
      enabledFields: exportSettings.fields.filter(field => field.enabled).length
    });
    logTable(LogModule.LOCAL_DATA2, "Pricing Overrides", pricingOverrides);
    logGroupEnd();
  }

  return {
    baselineMetrics,
    feeSettings,
    exportSettings,
    pricingOverrides
  };
}

export default getLocalData;
