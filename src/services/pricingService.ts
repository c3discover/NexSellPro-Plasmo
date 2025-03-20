/**
 * @fileoverview Service for calculating various pricing-related metrics and fees
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// Import memoization utility for performance optimization
import { memoize } from '../utils/memoization';
// Import product type definition
import { Product } from '../types';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Default referral fee rate (15%)
const DEFAULT_REFERRAL_RATE = 0.15;
// Default prep fee rate per pound
const PREP_FEE_RATE = 0.5;
// Default additional fees rate per pound
const ADDITIONAL_FEES_RATE = 0.1;
// Default WFS fee rate per pound
const WFS_FEE_RATE = 1.0;
// Default inbound shipping rate for WFS items
const WFS_INBOUND_RATE = 0.75;
// Default inbound shipping rate for non-WFS items
const NON_WFS_INBOUND_RATE = 0.5;
// Default seller-fulfilled shipping rate
const SF_SHIPPING_RATE = 0.8;
// Storage fee rates by season (per cubic foot per month)
const STORAGE_RATES = {
  peak: 2.4,    // Oct-Dec
  offPeak: 0.75 // Jan-Sep
};
// Starting product cost percentage of sale price
const STARTING_COST_PERCENTAGE = 0.4;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// No additional types needed as we're using imported types

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// No additional configuration needed

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
/**
 * Calculates the dimensional weight of a product
 * @param length The length in inches
 * @param width The width in inches
 * @param height The height in inches
 * @returns The dimensional weight in pounds
 */
function calculateDimensionalWeight(length: number, width: number, height: number): number {
  return (length * width * height) / 139;
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
/**
 * Calculates the referral fee based on the sale price and contract category
 * @param salePrice The sale price
 * @param contractCategory The contract category
 * @returns The referral fee
 */
export const calculateReferralFee = (salePrice: number, contractCategory: string): number => {
  return salePrice * DEFAULT_REFERRAL_RATE;
};

/**
 * Calculates the prep fee based on the weight
 * @param weight The weight in pounds
 * @returns The prep fee
 */
export const calculatePrepFee = (weight: number): number => {
  return weight * PREP_FEE_RATE;
};

/**
 * Calculates additional fees based on the weight
 * @param weight The weight in pounds
 * @returns The additional fees
 */
export const calculateAdditionalFees = (weight: number): number => {
  return weight * ADDITIONAL_FEES_RATE;
};

/**
 * Calculates the Walmart Fulfillment Services (WFS) fee
 * @param product The product information
 * @returns The WFS fee
 */
export const calculateWFSFee = (product: Product): number => {
  return product.weight * WFS_FEE_RATE;
};

/**
 * Calculates the inbound shipping cost
 * @param weight The weight in pounds
 * @param isWalmartFulfilled Whether the product is fulfilled by Walmart
 * @returns The inbound shipping cost
 */
export const calculateInboundShipping = (weight: number, isWalmartFulfilled: boolean): number => {
  return isWalmartFulfilled ? weight * WFS_INBOUND_RATE : weight * NON_WFS_INBOUND_RATE;
};

/**
 * Calculates the seller-fulfilled shipping cost
 * @param weight The weight in pounds
 * @returns The seller-fulfilled shipping cost
 */
export const calculateSfShipping = (weight: number): number => {
  return weight * SF_SHIPPING_RATE;
};

/**
 * Calculates the storage fee based on season and dimensions
 * @param season The season (Jan-Sep or Oct-Dec)
 * @param cubicFeet The cubic feet
 * @param storageLength The storage length in months
 * @returns The storage fee
 */
export const calculateStorageFee = (season: string, cubicFeet: number, storageLength: number): string => {
  const rate = season === 'peak' ? STORAGE_RATES.peak : STORAGE_RATES.offPeak;
  const storageFee = rate * cubicFeet * storageLength;
  return storageFee.toFixed(2);
};

/**
 * Calculates the cubic feet of a product
 * @param length The length in inches
 * @param width The width in inches
 * @param height The height in inches
 * @returns The cubic feet
 */
export const calculateCubicFeet = (length: number, width: number, height: number): number => {
  return (length * width * height) / 1728;
};

/**
 * Calculates the total profit after all fees
 * @param salePrice The sale price
 * @param productCost The product cost
 * @param referralFee The referral fee
 * @param wfsFee The WFS fee
 * @param inboundShippingFee The inbound shipping fee
 * @param storageFee The storage fee
 * @param prepFee The prep fee
 * @param additionalFees Any additional fees
 * @returns The total profit
 */
export const calculateTotalProfit = (
  salePrice: number,
  productCost: number,
  referralFee: number,
  wfsFee: number,
  inboundShippingFee: number,
  storageFee: string | number,
  prepFee: number,
  additionalFees: number
): number => {
  // Convert storageFee to number if it's a string
  const storageFeeNum = typeof storageFee === 'string' ? parseFloat(storageFee) : storageFee;
  
  // Calculate total fees
  const totalFees = referralFee + wfsFee + inboundShippingFee + storageFeeNum + prepFee + additionalFees;
  
  // Calculate profit
  const profit = salePrice - productCost - totalFees;
  
  return parseFloat(profit.toFixed(2));
};

/**
 * Calculates the ROI (Return on Investment)
 * @param totalProfit The total profit
 * @param productCost The product cost
 * @returns The ROI as a percentage string
 */
export const calculateROI = (totalProfit: number, productCost: number): string => {
  if (productCost === 0) return "0.00";
  return ((totalProfit / productCost) * 100).toFixed(2);
};

/**
 * Calculates the profit margin
 * @param totalProfit The total profit
 * @param salePrice The sale price
 * @returns The profit margin as a percentage string
 */
export const calculateMargin = (totalProfit: number, salePrice: number): string => {
  if (salePrice === 0) return "0.00";
  return ((totalProfit / salePrice) * 100).toFixed(2);
};

/**
 * Calculates a starting product cost based on the sale price
 * @param salePrice The sale price
 * @returns A suggested product cost
 */
export const calculateStartingProductCost = (salePrice: number): number => {
  return salePrice * STARTING_COST_PERCENTAGE;
};

/**
 * Calculates the final shipping weight for WFS
 * @param weight The actual weight in pounds
 * @param length The length in inches
 * @param width The width in inches
 * @param height The height in inches
 * @returns The final shipping weight
 */
export const calculateFinalShippingWeightForWFS = (
  weight: number,
  length: number,
  width: number,
  height: number
): number => {
  const dimWeight = calculateDimensionalWeight(length, width, height);
  return Math.max(weight, dimWeight);
};

/**
 * Calculates the final shipping weight for inbound shipping
 * @param weight The actual weight in pounds
 * @param length The length in inches
 * @param width The width in inches
 * @param height The height in inches
 * @returns The final shipping weight
 */
export const calculateFinalShippingWeightForInbound = (
  weight: number,
  length: number,
  width: number,
  height: number
): number => {
  const dimWeight = calculateDimensionalWeight(length, width, height);
  return Math.max(weight, dimWeight);
}; 