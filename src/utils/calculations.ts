////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No imports needed here.

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
const DEBUG = false;

// Helper function for debug logging
const debugLog = (message: string, data?: any) => {
    if (!DEBUG) return;
};

////////////////////////////////////////////////
// Props and Types:
////////////////////////////////////////////////

interface Product {
    weight: number;
    length: number;
    width: number;
    height: number;
    isWalmartFulfilled: boolean;
    isApparel?: boolean;
    isHazardousMaterial?: boolean;
    retailPrice?: number;
}

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
// No state or hooks defined here.

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

// Function to calculate referral fee based on the sale price and contract category.
export const calculateReferralFee = (salePrice: number, contractCategory: string): number => {
    let referralRate;

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
            referralRate = 0.15; // Default fee for "Everything Else (Most Items)" or unlisted categories
            break;
    }

    // Calculate and round to two decimal places
    return parseFloat((salePrice * referralRate).toFixed(2));
};

// Function to calculate prep fee based on cost type
export const calculatePrepFee = (weight: number): number => {
    const prepCostType = localStorage.getItem("prepCostType") || "per lb";
    const prepCostPerLb = parseFloat(localStorage.getItem("prepCostPerLb") || "0");
    const prepCostEach = parseFloat(localStorage.getItem("prepCostEach") || "0");

    // Calculate fee based on type and ensure it's a number with 2 decimal places
    const fee = prepCostType === "per lb" ? prepCostPerLb * weight : prepCostEach;
    return parseFloat(fee.toFixed(2));
};

// Function to calculate additional fees based on cost type
export const calculateAdditionalFees = (weight: number): number => {
    const additionalCostType = localStorage.getItem("additionalCostType") || "per lb";
    const additionalCostPerLb = parseFloat(localStorage.getItem("additionalCostPerLb") || "0");
    const additionalCostEach = parseFloat(localStorage.getItem("additionalCostEach") || "0");

    // Calculate fee based on type and ensure it's a number with 2 decimal places
    const fee = additionalCostType === "per lb" ? additionalCostPerLb * weight : additionalCostEach;
    return parseFloat(fee.toFixed(2));
};

export const calculateWFSFee = (product: Product): number => {
    const { weight, length, width, height, isWalmartFulfilled, isApparel, isHazardousMaterial, retailPrice } = product;

    debugLog('WFS Fee Calculation:', { weight, length, width, height, isWalmartFulfilled });

    // If the item is Seller Fulfilled, WFS Fee is 0
    if (!isWalmartFulfilled) {
        debugLog('Seller Fulfilled - returning 0');
        return 0.00;
    }

    // Calculate Girth and Longest Side
    const girth = 2 * (width + height);
    const longestSide = Math.max(length, width, height);
    const medianSide = [length, width, height].sort((a, b) => a - b)[1];

    debugLog('Dimensions:', {
        girth,
        longestSide,
        'longestSide + girth': longestSide + girth
    });

    // Check for Big & Bulky - use actual weight, not dimensional weight
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

    // Oversize conditions
    const isOversize = (
        (longestSide > 48 && longestSide <= 96) ||
        (medianSide > 30) ||
        (longestSide + girth > 105 && longestSide + girth <= 130)
    );

    const isAdditionalOversize = (
        (longestSide > 96 && longestSide <= 108) ||
        (longestSide + girth > 130 && longestSide + girth <= 165)
    );

    if (isOversize) wfsAdditionalFee += 3.00;
    if (isAdditionalOversize) wfsAdditionalFee += 20.00;

    // Calculate standard WFS fees
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
// Event Handlers:
////////////////////////////////////////////////
// No event handlers defined here.

////////////////////////////////////////////////
// Main Calculations:
////////////////////////////////////////////////

// Update calculateInboundShipping to handle both shipping types
export const calculateInboundShipping = (weight: number, isWalmartFulfilled: boolean): number => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    
    if (isWalmartFulfilled) {
        const inboundShippingCost = parseFloat(storedMetrics.inboundShippingCost || "0");
        return weight * inboundShippingCost;
    } else {
        const sfShippingCost = parseFloat(storedMetrics.sfShippingCost || "0");
        return weight * sfShippingCost;
    }
};

// Function to calculate SF shipping cost
export const calculateSfShipping = (weight: number): number => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    const sfShippingCost = parseFloat(storedMetrics.sfShippingCost || "0");
    return weight * sfShippingCost;
};

// Function to calculate storage fee
export const calculateStorageFee = (season: string, cubicFeet: number, storageLength: number): string => {
    let storageRate: number;

    if (season === "Jan-Sep") {
        storageRate = 0.75;
    } else if (season === "Oct-Dec") {
        storageRate = storageLength <= 1 ? 0.75 : 1.50;
    }

    const storageFee = cubicFeet * storageRate * storageLength;
    return storageFee.toFixed(2);
};

// Function to calculate cubic feet
export const calculateCubicFeet = (length: number, width: number, height: number): number => {
    return (length * width * height) / 1728;
};

// Function to calculate total profit
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
    // Calculate total costs (ensure storageFee is treated as a number)
    const totalCosts = productCost + 
                      referralFee + 
                      wfsFee + 
                      inboundShipping + 
                      parseFloat(storageFee.toString()) + 
                      prepFee + 
                      additionalFees;

    // Calculate profit (rounded to 2 decimal places)
    return parseFloat((salePrice - totalCosts).toFixed(2));
};

// Function to calculate ROI
export const calculateROI = (totalProfit: number, productCost: number): string => {
    return ((totalProfit / productCost) * 100).toFixed(2);
};

// Function to calculate margin
export const calculateMargin = (totalProfit: number, salePrice: number): string => {
    return ((totalProfit / salePrice) * 100).toFixed(2);
};

// Function to calculate starting product cost
export const calculateStartingProductCost = (
    salePrice: number,
    ): number => {
    return salePrice / 3
};

// Function to calculate dimensional weight based on dimensions
export const calculateDimensionalWeight = (length: number, width: number, height: number): number => {
    return (length * width * height) / 166;
};

// Function to calculate final shipping weight for WFS following Walmart's guidelines
export const calculateFinalShippingWeightForWFS = (weight: number, length: number, width: number, height: number): number => {
    // Check if item is Big & Bulky first
    const girth = 2 * (width + height);
    const longestSide = Math.max(length, width, height);
    const isBigAndBulky = (
        weight > 150 ||
        (longestSide > 108 && longestSide <= 120) ||
        (longestSide + girth > 165)
    );

    // For Big & Bulky items, use actual weight
    if (isBigAndBulky) {
        return Math.ceil(weight + 0.25); // Just add packaging weight and round up
    }

    // For non-Big & Bulky items, use dimensional weight calculation
    const dimensionalWeight = calculateDimensionalWeight(length, width, height);
    let baseShippingWeight;
    if (weight < 1) {
        baseShippingWeight = weight; // For items less than 1 lb, use the unit weight as-is
    } else {
        baseShippingWeight = Math.max(weight, dimensionalWeight); // For items 1 lb or greater, use the greater of unit or dimensional weight
    }
    return Math.ceil(baseShippingWeight + 0.25); // Add 0.25 lb for packaging and round up
};

// Calculate final shipping weight for inbound shipping fee (greater of weight and dimensional weight)
export const calculateFinalShippingWeightForInbound = (weight: number, length: number, width: number, height: number): number => {
    const dimensionalWeight = calculateDimensionalWeight(length, width, height);
    return Math.max(weight, dimensionalWeight);
  };