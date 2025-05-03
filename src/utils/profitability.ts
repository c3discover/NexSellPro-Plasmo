/**
 * @fileoverview Utility functions for calculating profitability metrics
 */

interface ProfitabilityInputs {
  salePrice: number;
  productCost: number;
  referralFee: number;
  wfsFee: number;
  inboundShippingFee: number;
  storageFee: number;
  prepFee: number;
  additionalFees: number;
}

interface ProfitabilityMetrics {
  totalProfit: number;
  roi: number;
  margin: number;
}

/**
 * Calculates profitability metrics based on input values
 * @param inputs Object containing all required fee and price inputs
 * @returns Object containing calculated totalProfit, ROI, and margin
 */
export function calculateProfitability(inputs: ProfitabilityInputs): ProfitabilityMetrics {
  const {
    salePrice,
    productCost,
    referralFee,
    wfsFee,
    inboundShippingFee,
    storageFee,
    prepFee,
    additionalFees
  } = inputs;

  // Calculate total fees
  const totalFees = referralFee + wfsFee + inboundShippingFee + storageFee + prepFee + additionalFees;

  // Calculate total profit
  const totalProfit = salePrice - productCost - totalFees;

  // Calculate ROI (Return on Investment)
  const roi = productCost > 0 ? (totalProfit / productCost) * 100 : 0;

  // Calculate margin
  const margin = salePrice > 0 ? (totalProfit / salePrice) * 100 : 0;

  return {
    totalProfit: Number(totalProfit.toFixed(2)),
    roi: Number(roi.toFixed(0)),
    margin: Number(margin.toFixed(0))
  };
} 