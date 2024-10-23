export const calculateReferralFee = (salePrice: number, contractCategory: string): number => {
    switch (contractCategory) {
        case "Apparel & Accessories":
            if (salePrice <= 15) {
                return salePrice * 0.05;
            } else if (salePrice > 15 && salePrice <= 20) {
                return salePrice * 0.10;
            } else if (salePrice > 20) {
                return salePrice * 0.15;
            }
            break;

        case "Automotive & Powersports":
            return salePrice * 0.12;

        case "Automotive Electronics":
            return salePrice * 0.15;

        case "Baby":
            if (salePrice <= 10) {
                return salePrice * 0.08;
            } else {
                return salePrice * 0.15;
            }

        case "Beauty":
            if (salePrice <= 10) {
                return salePrice * 0.08;
            } else {
                return salePrice * 0.15;
            }

        case "Books":
            return salePrice * 0.15;

        case "Camera & Photo":
            return salePrice * 0.08;

        case "Cell Phones":
            return salePrice * 0.08;

        case "Consumer Electronics":
            return salePrice * 0.08;

        case "Electronics Accessories":
            if (salePrice <= 100) {
                return salePrice * 0.15;
            } else {
                return 100 * 0.15 + (salePrice - 100) * 0.08;
            }

        case "Indoor & Outdoor Furniture":
            if (salePrice <= 200) {
                return salePrice * 0.15;
            } else {
                return 200 * 0.15 + (salePrice - 200) * 0.10;
            }

        case "Decor":
            return salePrice * 0.15;

        case "Gourmet Food":
            return salePrice * 0.15;

        case "Grocery":
            if (salePrice <= 10) {
                return salePrice * 0.08;
            } else {
                return salePrice * 0.15;
            }

        case "Health & Personal Care":
            if (salePrice <= 10) {
                return salePrice * 0.08;
            } else {
                return salePrice * 0.15;
            }

        case "Home & Garden":
            return salePrice * 0.15;

        case "Industrial & Scientific":
            return salePrice * 0.12;

        case "Jewelry":
            if (salePrice <= 250) {
                return salePrice * 0.20;
            } else {
                return 250 * 0.20 + (salePrice - 250) * 0.05;
            }

        case "Kitchen":
            return salePrice * 0.15;

        case "Luggage & Travel Accessories":
            return salePrice * 0.15;

        case "Major Appliances":
            return salePrice * 0.08;

        case "Music":
            return salePrice * 0.15;

        case "Musical Instruments":
            return salePrice * 0.12;

        case "Office Products":
            return salePrice * 0.15;

        case "Outdoors":
            return salePrice * 0.15;

        case "Outdoor Power Tools":
            if (salePrice <= 500) {
                return salePrice * 0.15;
            } else {
                return 500 * 0.15 + (salePrice - 500) * 0.08;
            }

        case "Personal Computers":
            return salePrice * 0.06;

        case "Pet Supplies":
            return salePrice * 0.15;

        case "Plumbing Heating Cooling & Ventilation":
            return salePrice * 0.10;

        case "Shoes, Handbags & Sunglasses":
            return salePrice * 0.15;

        case "Software & Computer Video Games":
            return salePrice * 0.15;

        case "Sporting Goods":
            return salePrice * 0.15;

        case "Tires & Wheels":
            return salePrice * 0.10;

        case "Tools & Home Improvement":
            return salePrice * 0.15;

        case "Toys & Games":
            return salePrice * 0.15;

        case "Video & DVD":
            return salePrice * 0.15;

        case "Video Game Consoles":
            return salePrice * 0.08;

        case "Video Games":
            return salePrice * 0.15;

        case "Watches":
            if (salePrice <= 1500) {
                return salePrice * 0.15;
            } else {
                return 1500 * 0.15 + (salePrice - 1500) * 0.03;
            }

        case "Everything Else":
            return salePrice * 0.15;

        default:
            return 0;
    }
};

export const calculateWFSFee = (finalShippingWeight: number, isWalmartFulfilled: boolean): number | string => {
    if (!isWalmartFulfilled) {
        return 0.00; // If Seller Fulfilled, WFS Fee is $0.00
    }

    if (finalShippingWeight < 1) {
        return 3.45;
    } else if (finalShippingWeight === 2) {
        return 4.95;
    } else if (finalShippingWeight === 3) {
        return 5.45;
    } else if (finalShippingWeight < 20) {
        return 0.4 * (finalShippingWeight - 4) + 5.75;
    } else if (finalShippingWeight < 30) {
        return 0.4 * (finalShippingWeight - 21) + 15.55;
    } else if (finalShippingWeight < 50) {
        return 0.4 * (finalShippingWeight - 31) + 14.55;
    } else if (finalShippingWeight < 150) {
        return 0.4 * (finalShippingWeight - 51) + 17.55;
    } else {
        return 'Oversize';
    }
};

export const calculateInboundShipping = (weight: number, ratePerLb: number): number => {
    return weight * ratePerLb;
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
