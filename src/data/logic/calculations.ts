/**
 * @fileoverview Core calculation functions for product pricing and shipping
 * @author Your Name
 * @created 2025-04-18
 * @lastModified 2025-04-18
 */

////////////////////////////////////////////////
// Imports:
// **All external and internal module imports
// **Grouped by type (external, then internal utils/types)
////////////////////////////////////////////////
import { logGroup, logTable, logGroupEnd, LogModule } from '../utils/logger';

////////////////////////////////////////////////
// Constants and Variables:
// **Anything that defines shared constants, static strings, colors, styles, config, etc.
////////////////////////////////////////////////
let loggedOnce = false;

////////////////////////////////////////////////
// Types and Interfaces:
// **Custom TypeScript interfaces for the data being worked on
////////////////////////////////////////////////
interface Product {
  weight: number;              // Weight in pounds
  length: number;              // Length in inches
  width: number;               // Width in inches
  height: number;              // Height in inches
  isWalmartFulfilled: boolean; // Whether fulfilled by Walmart
  isApparel?: boolean;
  isHazardousMaterial?: boolean;
  retailPrice?: number;
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
export const calculateReferralFee = (
  salePrice: number,
  contractCategory: string
): number => {
  let referralRate: number;

  switch (contractCategory) {
    case 'Apparel & Accessories':
      referralRate = salePrice <= 15 ? 0.05 : salePrice <= 20 ? 0.10 : 0.15;
      break;
    case 'Automotive & Powersports': referralRate = 0.12; break;
    case 'Automotive Electronics': referralRate = 0.15; break;
    case 'Baby': referralRate = salePrice <= 10 ? 0.08 : 0.15; break;
    case 'Beauty': referralRate = salePrice <= 10 ? 0.08 : 0.15; break;
    case 'Books': referralRate = 0.15; break;
    case 'Camera & Photo': referralRate = 0.08; break;
    case 'Cell Phones': referralRate = 0.08; break;
    case 'Consumer Electronics': referralRate = 0.08; break;
    case 'Electronics Accessories': referralRate = salePrice <= 100 ? 0.15 : 0.08; break;
    case 'Indoor & Outdoor Furniture': referralRate = salePrice <= 200 ? 0.15 : 0.10; break;
    case 'Decor': referralRate = 0.15; break;
    case 'Gourmet Food': referralRate = 0.15; break;
    case 'Grocery': referralRate = salePrice <= 10 ? 0.08 : 0.15; break;
    case 'Health & Personal Care': referralRate = salePrice <= 10 ? 0.08 : 0.15; break;
    case 'Home & Garden': referralRate = 0.15; break;
    case 'Industrial & Scientific': referralRate = 0.12; break;
    case 'Jewelry': referralRate = salePrice <= 250 ? 0.20 : 0.05; break;
    case 'Kitchen': referralRate = 0.15; break;
    case 'Luggage & Travel Accessories': referralRate = 0.15; break;
    case 'Major Appliances': referralRate = 0.08; break;
    case 'Music': referralRate = 0.15; break;
    case 'Musical Instruments': referralRate = 0.12; break;
    case 'Office Products': referralRate = 0.15; break;
    case 'Outdoors': referralRate = 0.15; break;
    case 'Outdoor Power Tools': referralRate = salePrice <= 500 ? 0.15 : 0.08; break;
    case 'Personal Computers': referralRate = 0.06; break;
    case 'Pet Supplies': referralRate = 0.15; break;
    case 'Plumbing Heating Cooling & Ventilation': referralRate = 0.10; break;
    case 'Shoes, Handbags & Sunglasses': referralRate = 0.15; break;
    case 'Software & Computer Video Games': referralRate = 0.15; break;
    case 'Sporting Goods': referralRate = 0.15; break;
    case 'Tires & Wheels': referralRate = 0.10; break;
    case 'Tools & Home Improvement': referralRate = 0.15; break;
    case 'Toys & Games': referralRate = 0.15; break;
    case 'Video & DVD': referralRate = 0.15; break;
    case 'Video Game Consoles': referralRate = 0.08; break;
    case 'Video Games': referralRate = 0.15; break;
    case 'Watches': referralRate = salePrice <= 1500 ? 0.15 : 0.03; break;
    default: referralRate = 0.15;
  }

  return parseFloat((salePrice * referralRate).toFixed(2));
};

export const calculatePrepFee = (weight: number): number => {
  const type = localStorage.getItem('prepCostType') || 'per lb';
  const perLb = parseFloat(localStorage.getItem('prepCostPerLb') || '0');
  const each = parseFloat(localStorage.getItem('prepCostEach') || '0');
  const fee = type === 'per lb' ? perLb * weight : each;
  return parseFloat(fee.toFixed(2));
};

export const calculateAdditionalFees = (weight: number): number => {
  const type = localStorage.getItem('additionalCostType') || 'per lb';
  const perLb = parseFloat(localStorage.getItem('additionalCostPerLb') || '0');
  const each = parseFloat(localStorage.getItem('additionalCostEach') || '0');
  const fee = type === 'per lb' ? perLb * weight : each;
  return parseFloat(fee.toFixed(2));
};

export const calculateWFSFee = (product: Product): number => {
  const { weight, length, width, height, isWalmartFulfilled, isApparel, isHazardousMaterial, retailPrice } = product;

  if (!isWalmartFulfilled) return 0;

  const girth = 2 * (width + height);
  const longest = Math.max(length, width, height);
  const median = [length, width, height].sort((a, b) => a - b)[1];

  const bigBulky = weight > 150 || (longest > 108 && longest <= 120) || (longest + girth > 165);
  if (bigBulky) {
    const base = 155;
    const extra = weight > 90 ? (weight - 90) * 0.80 : 0;
    return parseFloat((base + extra).toFixed(2));
  }

  let extraFee = 0;
  if (isApparel) extraFee += 0.50;
  if (isHazardousMaterial) extraFee += 0.50;
  if (retailPrice && retailPrice < 10) extraFee += 1.00;

  const oversize = (longest > 48 && longest <= 96) || median > 30 || (longest + girth > 105 && longest + girth <= 130);
  const addOversize = (longest > 96 && longest <= 108) || (longest + girth > 130 && longest + girth <= 165);
  if (oversize) extraFee += 3.00;
  if (addOversize) extraFee += 20.00;

  const baseFee =
    weight <= 1 ? 3.45 :
      weight <= 2 ? 4.95 :
        weight <= 3 ? 5.45 :
          weight <= 20 ? 5.75 + 0.40 * (weight - 4) :
            weight <= 30 ? 15.55 + 0.40 * (weight - 21) :
              weight <= 50 ? 14.55 + 0.40 * (weight - 31) :
                weight > 50 ? 17.55 + 0.40 * (weight - 51) : 0;

  return parseFloat((baseFee + extraFee).toFixed(2));
};

export const calculateInboundShipping = (weight: number, isWalmartFulfilled: boolean): number => {
  const metrics = JSON.parse(localStorage.getItem('desiredMetrics') || '{}');
  const rateKey = isWalmartFulfilled ? 'inboundShippingCost' : 'sfShippingCost';
  return weight * parseFloat(metrics[rateKey] || '0');
};

export const calculateSfShipping = (weight: number): number => {
  const metrics = JSON.parse(localStorage.getItem('desiredMetrics') || '{}');
  return weight * parseFloat(metrics.sfShippingCost || '0');
};

export const calculateStorageFee = (season: string, cubicFeet: number, months: number): string => {
  let rate = season === 'Jan-Sep' ? 0.75 : months <= 1 ? 0.75 : 1.50;
  return (cubicFeet * rate * months).toFixed(2);
};

export const calculateCubicFeet = (length: number, width: number, height: number): number => {
  return (length * width * height) / 1728;
};

export const calculateTotalProfit = (
  salePrice: number,
  productCost: number,
  referralFee: number,
  wfsFee: number,
  inboundShipping: number,
  storageFee: string | number,
  prepFee: number,
  additionalFees: number
): number => {
  const total = productCost + referralFee + wfsFee + inboundShipping + parseFloat(storageFee.toString()) + prepFee + additionalFees;
  return parseFloat((salePrice - total).toFixed(2));
};

export const calculateROI = (totalProfit: number, productCost: number): string => {
  return ((totalProfit / productCost) * 100).toFixed(2);
};

export const calculateMargin = (totalProfit: number, salePrice: number): string => {
  return ((totalProfit / salePrice) * 100).toFixed(2);
};

export const calculateStartingProductCost = (salePrice: number): number => {
  return salePrice / 3;
};

export const calculateDimensionalWeight = (length: number, width: number, height: number): number => {
  return (length * width * height) / 166;
};

export const calculateFinalShippingWeightForWFS = (weight: number, length: number, width: number, height: number): number => {
  const girth = 2 * (width + height);
  const longest = Math.max(length, width, height);
  const bigBulky = weight > 150 || (longest > 108 && longest <= 120) || (longest + girth > 165);
  if (bigBulky) return Math.ceil(weight + 0.25);
  const dim = calculateDimensionalWeight(length, width, height);
  const base = weight < 1 ? weight : Math.max(weight, dim);
  return Math.ceil(base + 0.25);
};

export const calculateFinalShippingWeightForInbound = (weight: number, length: number, width: number, height: number): number => {
  const dim = calculateDimensionalWeight(length, width, height);
  return Math.max(weight, dim);
};

export const calculateTotalStock = (sellers: { availableQuantity?: number }[]): number => {
  return sellers.reduce((sum, seller) => sum + (seller.availableQuantity || 0), 0);
};

////////////////////////////////////////////////
// Logging:
// **Clean console.log output with styling
////////////////////////////////////////////////
if (!loggedOnce) {
  logGroup(LogModule.CALCULATIONS, "Calculated Metrics");
  //logTable(LogModule.CALCULATIONS2, "Input Values", {
  //  salePrice,
  //  productCost,
  //  referralFee,
  //  wfsFee,
  //  inboundShipping,
  //  storageFee,
  //  prepFee,
  //  additionalFees,
  //});
  logTable(LogModule.CALCULATIONS2, "Output Results", {
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
    calculateTotalStock,
  });
  logGroupEnd();
  loggedOnce = true;
}

////////////////////////////////////////////////
// Export Statement:
// **The final export(s)
////////////////////////////////////////////////
// All functions are named exports above
