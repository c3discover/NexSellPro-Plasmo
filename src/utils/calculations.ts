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

// Update calculateWFSFee to include additional costs
export const calculateWFSFee = (product: Product): number => {
    const { weight, length, width, height, isWalmartFulfilled, isApparel, isHazardousMaterial, retailPrice } = product;

    // If the item is Seller Fulfilled, WFS Fee is 0
    if (!isWalmartFulfilled) {
        console.log("WFS Fee Calculation: Item is Seller Fulfilled, fee is 0");
        return 0.00;
    }

    // Calculate Girth and Longest Side
    const girth = 2 * (width + height);
    const longestSide = Math.max(length, width, height);
    const medianSide = [length, width, height].sort((a, b) => a - b)[1];

    // Check for Big & Bulky
    const isBigAndBulky = (
        weight > 150 ||
        (longestSide > 108 && longestSide <= 120) ||
        (longestSide + girth > 165)
    );

    if (isBigAndBulky) {
        const baseFee = 155;
        const additionalPerPoundFee = weight > 90 ? (weight - 90) * 0.80 : 0;
        return baseFee + additionalPerPoundFee + calculateAdditionalFees(weight);
    }

    // Initialize additional fee for non-Big & Bulky items
    let additionalFee = 0;

    // Apply specific additional fees
    if (isApparel) additionalFee += 0.50;
    if (isHazardousMaterial) additionalFee += 0.50;
    if (retailPrice && retailPrice < 10) additionalFee += 1.00;

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

    if (isOversize) additionalFee += 3.00;
    if (isAdditionalOversize) additionalFee += 20.00;

    // Calculate standard WFS fees
    const baseWFSFee = weight <= 1 ? 3.45 :
                      weight <= 2 ? 4.95 :
                      weight <= 3 ? 5.45 :
                      weight <= 20 ? 5.75 + 0.40 * (weight - 4) :
                      weight <= 30 ? 15.55 + 0.40 * (weight - 21) :
                      weight <= 50 ? 14.55 + 0.40 * (weight - 31) :
                      weight >50 ? 17.55 + 0.40 * (weight - 51) : 1000;

    return baseWFSFee + additionalFee + calculateAdditionalFees(weight);
};

export const calculateInboundShipping = (weight: number, inboundShippingCost: number): number => {
    return weight * inboundShippingCost;
};

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

export const calculateCubicFeet = (length: number, width: number, height: number): number => {
    return (length * width * height) / 1728;
};

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

export const calculateROI = (totalProfit: number, productCost: number): string => {
    return ((totalProfit / productCost) * 100).toFixed(2);
};

export const calculateMargin = (totalProfit: number, salePrice: number): string => {
    return ((totalProfit / salePrice) * 100).toFixed(2);
};

export const calculateStartingProductCost = (
    salePrice: number,
    ): number => {
    return salePrice / 3
};

// Function to calculate dimensional weight based on dimensions
export const calculateDimensionalWeight = (length: number, width: number, height: number): number => {
    return (length * width * height) / 139;
};

// Function to calculate final shipping weight following Walmart's guidelines
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