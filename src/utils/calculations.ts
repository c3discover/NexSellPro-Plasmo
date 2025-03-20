/**
 * @fileoverview Core calculation functions for product pricing and shipping
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No external imports needed

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Debug flag for development logging
const DEBUG = false;

// Helper function for debug logging
const debugLog = (message: string, data?: any) => {
    if (!DEBUG) return;
};

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Interface for product physical attributes and classification
 */
interface Product {
    weight: number;              // Weight in pounds
    length: number;              // Length in inches
    width: number;               // Width in inches
    height: number;              // Height in inches
    isWalmartFulfilled: boolean; // Whether fulfilled by Walmart
    isApparel?: boolean;         // Whether it's clothing/apparel
    isHazardousMaterial?: boolean; // Whether it's hazardous material
    retailPrice?: number;        // Retail price of the product
}

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

/**
 * Calculate referral fee based on sale price and category
 * @param salePrice - The selling price of the product
 * @param contractCategory - The product's category
 * @returns The calculated referral fee
 */
export const calculateReferralFee = (salePrice: number, contractCategory: string): number => {
    let referralRate;

    // Determine referral rate based on category and price
    switch (contractCategory) {
        case "Apparel & Accessories":
            referralRate = salePrice <= 15 ? 0.05 : (salePrice <= 20 ? 0.10 : 0.15);
            break;

        case "Automotive & Powersports":
            referralRate = 0.12;
            break;

        case "Automotive Electronics":
            referralRate = 0.15;
            break;

        case "Baby":
            referralRate = salePrice <= 10 ? 0.08 : 0.15;
            break;

        case "Beauty":
            referralRate = salePrice <= 10 ? 0.08 : 0.15;
            break;

        case "Books":
            referralRate = 0.15;
            break;

        case "Camera & Photo":
            referralRate = 0.08;
            break;

        case "Cell Phones":
            referralRate = 0.08;
            break;

        case "Consumer Electronics":
            referralRate = 0.08;
            break;

        case "Electronics Accessories":
            referralRate = salePrice <= 100 ? 0.15 : 0.08;
            break;

        case "Indoor & Outdoor Furniture":
            referralRate = salePrice <= 200 ? 0.15 : 0.10;
            break;

        case "Decor":
            referralRate = 0.15;
            break;

        case "Gourmet Food":
            referralRate = 0.15;
            break;

        case "Grocery":
            referralRate = salePrice <= 10 ? 0.08 : 0.15;
            break;

        case "Health & Personal Care":
            referralRate = salePrice <= 10 ? 0.08 : 0.15;
            break;

        case "Home & Garden":
            referralRate = 0.15;
            break;

        case "Industrial & Scientific":
            referralRate = 0.12;
            break;

        case "Jewelry":
            referralRate = salePrice <= 250 ? 0.20 : 0.05;
            break;

        case "Kitchen":
            referralRate = 0.15;
            break;

        case "Luggage & Travel Accessories":
            referralRate = 0.15;
            break;

        case "Major Appliances":
            referralRate = 0.08;
            break;

        case "Music":
            referralRate = 0.15;
            break;

        case "Musical Instruments":
            referralRate = 0.12;
            break;

        case "Office Products":
            referralRate = 0.15;
            break;

        case "Outdoors":
            referralRate = 0.15;
            break;

        case "Outdoor Power Tools":
            referralRate = salePrice <= 500 ? 0.15 : 0.08;
            break;

        case "Personal Computers":
            referralRate = 0.06;
            break;

        case "Pet Supplies":
            referralRate = 0.15;
            break;

        case "Plumbing Heating Cooling & Ventilation":
            referralRate = 0.10;
            break;

        case "Shoes, Handbags & Sunglasses":
            referralRate = 0.15;
            break;

        case "Software & Computer Video Games":
            referralRate = 0.15;
            break;

        case "Sporting Goods":
            referralRate = 0.15;
            break;

        case "Tires & Wheels":
            referralRate = 0.10;
            break;

        case "Tools & Home Improvement":
            referralRate = 0.15;
            break;

        case "Toys & Games":
            referralRate = 0.15;
            break;

        case "Video & DVD":
            referralRate = 0.15;
            break;

        case "Video Game Consoles":
            referralRate = 0.08;
            break;

        case "Video Games":
            referralRate = 0.15;
            break;

        case "Watches":
            referralRate = salePrice <= 1500 ? 0.15 : 0.03;
            break;

        default:
            referralRate = 0.15; // Default fee for unlisted categories
            break;
    }

    // Calculate and round to two decimal places
    return parseFloat((salePrice * referralRate).toFixed(2));
};

/**
 * Calculate prep fee based on weight and cost type
 * @param weight - Product weight in pounds
 * @returns The calculated prep fee
 */
export const calculatePrepFee = (weight: number): number => {
    // Get prep cost settings from localStorage
    const prepCostType = localStorage.getItem("prepCostType") || "per lb";
    const prepCostPerLb = parseFloat(localStorage.getItem("prepCostPerLb") || "0");
    const prepCostEach = parseFloat(localStorage.getItem("prepCostEach") || "0");

    // Calculate fee based on type and round to 2 decimal places
    const fee = prepCostType === "per lb" ? prepCostPerLb * weight : prepCostEach;
    return parseFloat(fee.toFixed(2));
};

/**
 * Calculate additional fees based on weight and cost type
 * @param weight - Product weight in pounds
 * @returns The calculated additional fees
 */
export const calculateAdditionalFees = (weight: number): number => {
    // Get additional cost settings from localStorage
    const additionalCostType = localStorage.getItem("additionalCostType") || "per lb";
    const additionalCostPerLb = parseFloat(localStorage.getItem("additionalCostPerLb") || "0");
    const additionalCostEach = parseFloat(localStorage.getItem("additionalCostEach") || "0");

    // Calculate fee based on type and round to 2 decimal places
    const fee = additionalCostType === "per lb" ? additionalCostPerLb * weight : additionalCostEach;
    return parseFloat(fee.toFixed(2));
};

/**
 * Calculate Walmart Fulfillment Services (WFS) fee
 * @param product - Product details including dimensions and flags
 * @returns The calculated WFS fee
 */
export const calculateWFSFee = (product: Product): number => {
    const { weight, length, width, height, isWalmartFulfilled, isApparel, isHazardousMaterial, retailPrice } = product;

    debugLog('WFS Fee Calculation:', { weight, length, width, height, isWalmartFulfilled });

    // Return 0 if not Walmart fulfilled
    if (!isWalmartFulfilled) {
        debugLog('Seller Fulfilled - returning 0');
        return 0.00;
    }

    // Calculate shipping dimensions
    const girth = 2 * (width + height);
    const longestSide = Math.max(length, width, height);
    const medianSide = [length, width, height].sort((a, b) => a - b)[1];

    debugLog('Dimensions:', {
        girth,
        longestSide,
        'longestSide + girth': longestSide + girth
    });

    // Check if item is Big & Bulky
    const isBigAndBulky = (
        weight > 150 ||
        (longestSide > 108 && longestSide <= 120) ||
        (longestSide + girth > 165)
    );

    debugLog('Big & Bulky Check:', {
        isBigAndBulky,
        'weight > 150': weight > 150,
        'longestSide > 108': longestSide > 108,
        'longestSide + girth > 165': longestSide + girth > 165
    });

    // Calculate Big & Bulky fees
    if (isBigAndBulky) {
        const baseFee = 155;
        const additionalPerPoundFee = weight > 90 ? (weight - 90) * 0.80 : 0;
        const totalFee = baseFee + additionalPerPoundFee;
        debugLog('Big & Bulky Fee:', { baseFee, additionalPerPoundFee, totalFee });
        return parseFloat(totalFee.toFixed(2));
    }

    // Initialize WFS-specific additional fees
    let wfsAdditionalFee = 0;

    // Apply WFS-specific additional fees
    if (isApparel) wfsAdditionalFee += 0.50;
    if (isHazardousMaterial) wfsAdditionalFee += 0.50;
    if (retailPrice && retailPrice < 10) wfsAdditionalFee += 1.00;

    // Check for oversize conditions
    const isOversize = (
        (longestSide > 48 && longestSide <= 96) ||
        (medianSide > 30) ||
        (longestSide + girth > 105 && longestSide + girth <= 130)
    );

    const isAdditionalOversize = (
        (longestSide > 96 && longestSide <= 108) ||
        (longestSide + girth > 130 && longestSide + girth <= 165)
    );

    // Apply oversize fees
    if (isOversize) wfsAdditionalFee += 3.00;
    if (isAdditionalOversize) wfsAdditionalFee += 20.00;

    // Calculate standard WFS fees based on weight
    const baseWFSFee = weight <= 1 ? 3.45 :
                      weight <= 2 ? 4.95 :
                      weight <= 3 ? 5.45 :
                      weight <= 20 ? 5.75 + 0.40 * (weight - 4) :
                      weight <= 30 ? 15.55 + 0.40 * (weight - 21) :
                      weight <= 50 ? 14.55 + 0.40 * (weight - 31) :
                      weight > 50 ? 17.55 + 0.40 * (weight - 51) : 1000;

    const totalFee = baseWFSFee + wfsAdditionalFee;
    debugLog('Standard Fee:', { baseWFSFee, wfsAdditionalFee, totalFee });
    return parseFloat(totalFee.toFixed(2));
};

////////////////////////////////////////////////
// Main Calculations:
////////////////////////////////////////////////

/**
 * Calculate inbound shipping cost
 * @param weight - Product weight in pounds
 * @param isWalmartFulfilled - Whether fulfilled by Walmart
 * @returns The calculated inbound shipping cost
 */
export const calculateInboundShipping = (weight: number, isWalmartFulfilled: boolean): number => {
    // Get shipping rates from localStorage
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    
    // Calculate based on fulfillment type
    if (isWalmartFulfilled) {
        const inboundShippingCost = parseFloat(storedMetrics.inboundShippingCost || "0");
        return weight * inboundShippingCost;
    } else {
        const sfShippingCost = parseFloat(storedMetrics.sfShippingCost || "0");
        return weight * sfShippingCost;
    }
};

/**
 * Calculate seller fulfilled shipping cost
 * @param weight - Product weight in pounds
 * @returns The calculated shipping cost
 */
export const calculateSfShipping = (weight: number): number => {
    // Get shipping rate from localStorage
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    const sfShippingCost = parseFloat(storedMetrics.sfShippingCost || "0");
    return weight * sfShippingCost;
};

/**
 * Calculate storage fee based on season and dimensions
 * @param season - Current season (Jan-Sep or Oct-Dec)
 * @param cubicFeet - Product volume in cubic feet
 * @param storageLength - Storage duration in months
 * @returns The calculated storage fee
 */
export const calculateStorageFee = (season: string, cubicFeet: number, storageLength: number): string => {
    let storageRate: number;

    // Determine storage rate based on season
    if (season === "Jan-Sep") {
        storageRate = 0.75;
    } else if (season === "Oct-Dec") {
        storageRate = storageLength <= 1 ? 0.75 : 1.50;
    }

    // Calculate total storage fee
    const storageFee = cubicFeet * storageRate * storageLength;
    return storageFee.toFixed(2);
};

/**
 * Calculate product volume in cubic feet
 * @param length - Length in inches
 * @param width - Width in inches
 * @param height - Height in inches
 * @returns Volume in cubic feet
 */
export const calculateCubicFeet = (length: number, width: number, height: number): number => {
    return (length * width * height) / 1728; // Convert cubic inches to cubic feet
};

/**
 * Calculate total profit for a product
 * @param salePrice - Selling price
 * @param productCost - Cost of the product
 * @param referralFee - Referral fee
 * @param wfsFee - WFS fee
 * @param inboundShipping - Inbound shipping cost
 * @param storageFee - Storage fee
 * @param prepFee - Prep fee
 * @param additionalFees - Additional fees
 * @returns Total profit
 */
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
    // Calculate total costs
    const totalCosts = productCost + 
                      referralFee + 
                      wfsFee + 
                      inboundShipping + 
                      parseFloat(storageFee.toString()) + 
                      prepFee + 
                      additionalFees;

    // Calculate and round profit to 2 decimal places
    return parseFloat((salePrice - totalCosts).toFixed(2));
};

/**
 * Calculate Return on Investment (ROI)
 * @param totalProfit - Total profit
 * @param productCost - Cost of the product
 * @returns ROI as a percentage
 */
export const calculateROI = (totalProfit: number, productCost: number): string => {
    return ((totalProfit / productCost) * 100).toFixed(2);
};

/**
 * Calculate profit margin
 * @param totalProfit - Total profit
 * @param salePrice - Selling price
 * @returns Margin as a percentage
 */
export const calculateMargin = (totalProfit: number, salePrice: number): string => {
    return ((totalProfit / salePrice) * 100).toFixed(2);
};

/**
 * Calculate starting product cost
 * @param salePrice - Selling price
 * @returns Suggested starting cost
 */
export const calculateStartingProductCost = (salePrice: number): number => {
    return salePrice / 3; // One-third of sale price as starting point
};

/**
 * Calculate dimensional weight for shipping
 * @param length - Length in inches
 * @param width - Width in inches
 * @param height - Height in inches
 * @returns Dimensional weight in pounds
 */
export const calculateDimensionalWeight = (length: number, width: number, height: number): number => {
    return (length * width * height) / 166; // Standard dimensional weight divisor
};

/**
 * Calculate final shipping weight for WFS
 * @param weight - Product weight in pounds
 * @param length - Length in inches
 * @param width - Width in inches
 * @param height - Height in inches
 * @returns Final shipping weight
 */
export const calculateFinalShippingWeightForWFS = (weight: number, length: number, width: number, height: number): number => {
    // Calculate shipping dimensions
    const girth = 2 * (width + height);
    const longestSide = Math.max(length, width, height);
    const isBigAndBulky = (
        weight > 150 ||
        (longestSide > 108 && longestSide <= 120) ||
        (longestSide + girth > 165)
    );

    // For Big & Bulky items, use actual weight plus packaging
    if (isBigAndBulky) {
        return Math.ceil(weight + 0.25);
    }

    // For non-Big & Bulky items, use dimensional weight
    const dimensionalWeight = calculateDimensionalWeight(length, width, height);
    let baseShippingWeight;
    
    if (weight < 1) {
        baseShippingWeight = weight;
    } else {
        baseShippingWeight = Math.max(weight, dimensionalWeight);
    }
    
    return Math.ceil(baseShippingWeight + 0.25);
};

/**
 * Calculate final shipping weight for inbound shipping
 * @param weight - Product weight in pounds
 * @param length - Length in inches
 * @param width - Width in inches
 * @param height - Height in inches
 * @returns Final shipping weight
 */
export const calculateFinalShippingWeightForInbound = (weight: number, length: number, width: number, height: number): number => {
    const dimensionalWeight = calculateDimensionalWeight(length, width, height);
    return Math.max(weight, dimensionalWeight);
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// All functions are exported above