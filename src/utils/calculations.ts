////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No imports needed here.

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants or variables defined here.

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
            referralRate = 0.15; // Default fee for "Everything Else" or unlisted categories
            break;
    }

    // Calculate and round to two decimal places
    return parseFloat((salePrice * referralRate).toFixed(2));
};

// Function to calculate additional fees based on cost type
export const calculateAdditionalFees = (weight: number): number => {
    const additionalCostType = localStorage.getItem("additionalCostType") || "per lb";
    const additionalCostPerLb = parseFloat(localStorage.getItem("additionalCostPerLb") || "0");
    const additionalCostEach = parseFloat(localStorage.getItem("additionalCostEach") || "0");

    return additionalCostType === "per lb" ? additionalCostPerLb * weight : additionalCostEach;
};

export const calculateWFSFee = (product: Product): number => {
    const { weight: rawWeight, length: rawLength, width: rawWidth, height: rawHeight, isWalmartFulfilled, isApparel, isHazardousMaterial, retailPrice } = product;

    console.log('\n=== WFS Fee Calculation Debug ===');
    
    // Get the stored values (manually entered)
    const storedValues = JSON.parse(localStorage.getItem('storedValues') || '{"weight": "0", "length": "0", "width": "0", "height": "0"}');
    // Get the scraped values
    const scrapedValues = JSON.parse(localStorage.getItem('scrapedValues') || '{"weight": "0", "length": "0", "width": "0", "height": "0"}');
    
    console.log('Raw Input Values:', { rawWeight, rawLength, rawWidth, rawHeight });
    console.log('Stored Values:', storedValues);
    console.log('Scraped Values:', scrapedValues);
    
    // Helper function to get the correct value
    const getValue = (raw: number, stored: string, scraped: string): number => {
        if (raw > 0) return raw;
        const storedVal = parseFloat(stored);
        if (storedVal > 0) return storedVal;
        const scrapedVal = parseFloat(scraped);
        if (scrapedVal > 0) return scrapedVal;
        return 0;
    };

    // Use raw input first if not zero, then stored values if not zero, then scraped values if not zero, then default to 0
    const weight = getValue(rawWeight, storedValues.weight, scrapedValues.weight);
    const length = getValue(rawLength, storedValues.length, scrapedValues.length);
    const width = getValue(rawWidth, storedValues.width, scrapedValues.width);
    const height = getValue(rawHeight, storedValues.height, scrapedValues.height);

    console.log('Final Values:', { weight, length, width, height });

    // If the item is Seller Fulfilled, WFS Fee is 0
    if (!isWalmartFulfilled) {
        console.log('Item is Seller Fulfilled, WFS Fee = $0.00');
        return 0.00;
    }

    // First determine base weight (greater of unit weight or dimensional weight)
    const dimensionalWeight = (length * width * height) / 139;
    console.log('Dimensional Weight:', dimensionalWeight.toFixed(2), 'lbs');
    
    // For items under 1 lb, use actual weight. Otherwise use greater of actual or dimensional
    const baseWeight = weight < 1 ? weight : Math.max(weight, dimensionalWeight);
    console.log('Base Weight (max of actual or dimensional):', baseWeight.toFixed(2), 'lbs');
    
    // Then add packaging weight and round up
    const finalWeight = Math.ceil(baseWeight + 0.25);
    console.log('Final Weight (with packaging, rounded up):', finalWeight, 'lbs');

    // Calculate Girth and Longest Side
    const dimensions = [length, width, height].sort((a, b) => b - a);
    const longestSide = dimensions[0];
    const medianSide = dimensions[1];
    const shortestSide = dimensions[2];
    const girth = 2 * (medianSide + shortestSide);

    console.log('Size Measurements:', {
        girth: girth.toFixed(2),
        'longest side': longestSide.toFixed(2),
        'median side': medianSide.toFixed(2),
        'length + girth': (longestSide + girth).toFixed(2)
    });

    // STEP 1: Check for Big & Bulky
    const isBigAndBulky = (
        weight > 150 ||
        longestSide > 108 ||
        (longestSide + girth) > 165 ||
        (longestSide > 72 && baseWeight > 30) ||
        (medianSide > 30 && baseWeight > 30)
    );

    console.log('Big & Bulky Check:', {
        isBigAndBulky,
        'weight > 150': weight > 150,
        'longestSide > 108': longestSide > 108,
        'length + girth > 165': longestSide + girth > 165,
        'longestSide > 72 && weight > 30': longestSide > 72 && baseWeight > 30,
        'medianSide > 30 && weight > 30': medianSide > 30 && baseWeight > 30
    });

    if (isBigAndBulky) {
        const baseFee = 55;
        const additionalPerPoundFee = Math.max(0, (Math.ceil(baseWeight) - 30) * 0.40);
        const totalFee = baseFee + additionalPerPoundFee;
        console.log('Big & Bulky Fee Calculation:', {
            baseFee,
            additionalPerPoundFee,
            totalFee
        });
        return parseFloat(totalFee.toFixed(2));
    }

    // STEP 2: Calculate base WFS fee
    let baseWFSFee;
    console.log('Weight Tier Calculation:');
    if (finalWeight <= 1) {
        baseWFSFee = 3.45;
        console.log('Tier: ≤ 1 lb =', baseWFSFee);
    } else if (finalWeight <= 2) {
        baseWFSFee = 4.95;
        console.log('Tier: 1-2 lbs =', baseWFSFee);
    } else if (finalWeight <= 3) {
        baseWFSFee = 5.45;
        console.log('Tier: 2-3 lbs =', baseWFSFee);
    } else if (finalWeight <= 20) {
        baseWFSFee = 5.75 + (0.40 * (finalWeight - 3));
        console.log('Tier: 3-20 lbs = 5.75 + 0.40 * (', finalWeight, '- 3) =', baseWFSFee);
    } else if (finalWeight <= 30) {
        baseWFSFee = 12.55 + (0.40 * (finalWeight - 20));
        console.log('Tier: 20-30 lbs = 12.55 + 0.40 * (', finalWeight, '- 20) =', baseWFSFee);
    } else if (finalWeight <= 50) {
        baseWFSFee = 16.55 + (0.40 * (finalWeight - 30));
        console.log('Tier: 30-50 lbs = 16.55 + 0.40 * (', finalWeight, '- 30) =', baseWFSFee);
    } else if (finalWeight <= 150) {
        baseWFSFee = 24.55 + (0.40 * (finalWeight - 50));
        console.log('Tier: 50-150 lbs = 24.55 + 0.40 * (', finalWeight, '- 50) =', baseWFSFee);
    }

    // STEP 3: Calculate additional fees
    let additionalFee = 0;
    console.log('\nAdditional Fees:');

    // Product-specific fees
    if (isApparel) {
        additionalFee += 0.50;
        console.log('Apparel Fee: +$0.50');
    }
    if (isHazardousMaterial) {
        additionalFee += 0.50;
        console.log('Hazmat Fee: +$0.50');
    }
    if (retailPrice && retailPrice < 10) {
        additionalFee += 1.00;
        console.log('Low Price Fee: +$1.00');
    }

    // Size-based fees
    const isOversize = (
        (longestSide > 48 && longestSide <= 108) ||
        (medianSide > 30) ||
        (longestSide + girth > 105 && longestSide + girth <= 165)
    );
    console.log('Oversize Check:', {
        isOversize,
        'longestSide > 48': longestSide > 48,
        'medianSide > 30': medianSide > 30,
        'longestSide + girth > 105': longestSide + girth > 105
    });

    if (isOversize) {
        additionalFee += 3.00;
        console.log('Oversize Fee: +$3.00');
    }

    // Calculate final fee
    const totalFee = parseFloat((baseWFSFee + additionalFee).toFixed(2));
    console.log('\nFinal Fee Calculation:', {
        baseWFSFee: baseWFSFee.toFixed(2),
        additionalFee: additionalFee.toFixed(2),
        totalFee: totalFee.toFixed(2)
    });

    return totalFee;
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
    storageFee: number,
    prepFee: number,
    additionalFees: number
): number => {
    return salePrice - (productCost + referralFee + wfsFee + inboundShipping + storageFee + prepFee + additionalFees);
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
    return (length * width * height) / 139;
};

// Function to calculate final shipping weight for WFS following Walmart's guidelines
export const calculateFinalShippingWeightForWFS  = (weight: number, length: number, width: number, height: number): number => {
    // Calculate dimensional weight
    const dimensionalWeight = calculateDimensionalWeight(length, width, height);

    // Determine base weight
    let baseShippingWeight;
    if (weight < 1) {
        baseShippingWeight = weight;        // For items less than 1 lb, use the unit weight as-is
    } else {
        baseShippingWeight = Math.max(weight, dimensionalWeight);        // For items 1 lb or greater, use the greater of unit or dimensional weight
    }
    return Math.ceil(baseShippingWeight + 0.25);    // Add 0.25 lb for packaging and round up to the nearest whole pound
};

// Calculate final shipping weight for inbound shipping fee (greater of weight and dimensional weight)
export const calculateFinalShippingWeightForInbound = (weight: number, length: number, width: number, height: number): number => {
    const dimensionalWeight = calculateDimensionalWeight(length, width, height);
    return Math.max(weight, dimensionalWeight);
  };