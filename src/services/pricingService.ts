import { memoize } from '../utils/memoization';
import { Product } from '../types';

/**
 * Calculates the referral fee based on the sale price and contract category
 * @param salePrice The sale price
 * @param contractCategory The contract category
 * @returns The referral fee
 */
export const calculateReferralFee = (salePrice: number, contractCategory: string): number => {
  const rate = 0.15; // Default rate
  return salePrice * rate;
};

/**
 * Calculates the prep fee based on the weight
 * @param weight The weight in pounds
 * @returns The prep fee
 */
export const calculatePrepFee = (weight: number): number => {
  return weight * 0.5;
};

/**
 * Calculates additional fees based on the weight
 * @param weight The weight in pounds
 * @returns The additional fees
 */
export const calculateAdditionalFees = (weight: number): number => {
  return weight * 0.1;
};

/**
 * Calculates the Walmart Fulfillment Services (WFS) fee
 * @param product The product information
 * @returns The WFS fee
 */
export const calculateWFSFee = (product: Product): number => {
  return product.weight * 1.0;
};

/**
 * Calculates the inbound shipping cost
 * @param weight The weight in pounds
 * @param isWalmartFulfilled Whether the product is fulfilled by Walmart
 * @returns The inbound shipping cost
 */
export const calculateInboundShipping = (weight: number, isWalmartFulfilled: boolean): number => {
  return isWalmartFulfilled ? weight * 0.75 : weight * 0.5;
};

/**
 * Calculates the seller-fulfilled shipping cost
 * @param weight The weight in pounds
 * @returns The seller-fulfilled shipping cost
 */
export const calculateSfShipping = (weight: number): number => {
  return weight * 0.8;
};

/**
 * Calculates the storage fee
 * @param season The season (Jan-Sep or Oct-Dec)
 * @param cubicFeet The cubic feet
 * @param storageLength The storage length in months
 * @returns The storage fee
 */
export const calculateStorageFee = (season: string, cubicFeet: number, storageLength: number): string => {
  const rate = season === 'peak' ? 2.4 : 0.75;
  const storageFee = rate * cubicFeet * storageLength;
  return storageFee.toFixed(2);
};

/**
 * Calculates the cubic feet
 * @param length The length in inches
 * @param width The width in inches
 * @param height The height in inches
 * @returns The cubic feet
 */
export const calculateCubicFeet = (length: number, width: number, height: number): number => {
  return (length * width * height) / 1728;
};

/**
 * Calculates the total profit
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
  return salePrice * 0.4; // 40% of sale price as starting cost
};

/**
 * Calculates the dimensional weight
 * @param length The length in inches
 * @param width The width in inches
 * @param height The height in inches
 * @returns The dimensional weight
 */
export const calculateDimensionalWeight = (length: number, width: number, height: number): number => {
  return (length * width * height) / 139;
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