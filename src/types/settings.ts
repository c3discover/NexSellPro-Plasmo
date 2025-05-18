/**
 * @fileoverview Type definitions for extension settings and configuration
 * @author NexSellPro
 * @created 2024-03-21
 */

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Export field configuration
 */
export interface ExportField {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
  category: string;
}

/**
 * Export settings configuration
 */
export interface ExportSettings {
  fields: ExportField[];
}

/**
 * Baseline metrics for product analysis
 */
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

/**
 * Fee settings configuration
 */
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

/**
 * Pricing overrides configuration
 */
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

/**
 * Storage settings configuration
 */
export interface StorageSettings {
  length: number;
  season: 'Jan-Sep' | 'Oct-Dec';
  cost: number;
}

/**
 * Extended fee settings with storage configuration
 */
export interface ExtendedFeeSettings extends FeeSettings {
  storageSettings: StorageSettings;
}

/**
 * Extended baseline metrics with fulfillment preference
 */
export interface ExtendedBaselineMetrics extends BaselineMetrics {
  walmartFulfilled: boolean;
} 