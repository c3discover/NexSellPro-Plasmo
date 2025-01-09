////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import getData from "./getData";
import { getSellerData } from "./sellerData";
import type { SellerInfo } from "~/types/seller";

////////////////////////////////////////////////
// Types:
////////////////////////////////////////////////

// Product Information Types
export interface ProductBasicInfo {
  productID: string | null;
  name: string | null;
  upc: string | null;
  brand: string | null;
  brandUrl: string | null;
  modelNumber: string | null;
}

export interface ProductPricing {
  currentPrice: number | null;
  sellerName: string | null;
  sellerDisplayName: string | null;
  sellerType: string | null;
}

export interface ProductDimensions {
  shippingLength: string | null;
  shippingWidth: string | null;
  shippingHeight: string | null;
  weight: string | null;
}

export interface ProductMedia {
  imageUrl: string | null;
  images: any[];
  videos: any[];
}

export interface ProductCategories {
  mainCategory: string | null;
  categories: { name: string; url: string }[];
}

export interface ProductInventory {
  stock: number;
  totalSellers: number;
  fulfillmentOptions: { type: string; availableQuantity: number }[];
}

export interface ProductReviews {
  overallRating: string | number;
  numberOfRatings: string | number;
  numberOfReviews: string | number;
  customerReviews: any[];
  reviewDates: string[];
}

export interface ProductVariants {
  variantCriteria: any[];
  variantsMap: Record<string, any>;
}

export interface ProductSellers {
  mainSeller: {
    sellerName: string;
    price: string | number;
    type: string;
    arrives: string;
    isProSeller: boolean;
    isWFS: boolean;
    priceInfo?: any;
    fulfillmentStatus?: string;
    arrivalDate?: string;
  } | null;
  otherSellers: SellerInfo[];
  totalSellers: number;
}

// Combined interface for all product data
export interface UsedProductData {
  basic: ProductBasicInfo;
  pricing: ProductPricing;
  dimensions: ProductDimensions;
  media: ProductMedia;
  categories: ProductCategories;
  inventory: ProductInventory;
  reviews: ProductReviews;
  variants: ProductVariants;
  badges: string[];
  sellers: ProductSellers;
  flags: {
    isApparel: boolean;
    isHazardousMaterial: boolean;
  };
}

////////////////////////////////////////////////
// Main Function:
////////////////////////////////////////////////

export async function getUsedData(): Promise<UsedProductData | null> {
  try {
    // Get raw product data
    const rawProductData = getData();
    if (!rawProductData) return null;

    // Get seller data
    const sellerData = await getSellerData();
    const mainSeller = sellerData[0] || null;

    // Organize data into our new structure
    const usedData: UsedProductData = {
      basic: {
        productID: rawProductData.productID,
        name: rawProductData.name,
        upc: rawProductData.upc,
        brand: rawProductData.brand,
        brandUrl: rawProductData.brandUrl,
        modelNumber: rawProductData.modelNumber
      },
      pricing: {
        currentPrice: rawProductData.currentPrice,
        sellerName: rawProductData.sellerName,
        sellerDisplayName: rawProductData.sellerDisplayName,
        sellerType: rawProductData.sellerType
      },
      dimensions: {
        shippingLength: rawProductData.shippingLength,
        shippingWidth: rawProductData.shippingWidth,
        shippingHeight: rawProductData.shippingHeight,
        weight: rawProductData.weight
      },
      media: {
        imageUrl: rawProductData.imageUrl,
        images: rawProductData.images,
        videos: rawProductData.videos
      },
      categories: {
        mainCategory: rawProductData.mainCategory,
        categories: rawProductData.categories
      },
      inventory: {
        stock: rawProductData.stock,
        totalSellers: rawProductData.totalSellers,
        fulfillmentOptions: rawProductData.fulfillmentOptions
      },
      reviews: {
        overallRating: rawProductData.overallRating,
        numberOfRatings: rawProductData.numberOfRatings,
        numberOfReviews: rawProductData.numberOfReviews,
        customerReviews: rawProductData.customerReviews,
        reviewDates: rawProductData.reviewDates
      },
      variants: {
        variantCriteria: rawProductData.variantCriteria,
        variantsMap: rawProductData.variantsMap
      },
      badges: rawProductData.badges,
      sellers: {
        mainSeller,
        otherSellers: sellerData.slice(1),
        totalSellers: sellerData.length
      },
      flags: {
        isApparel: false,
        isHazardousMaterial: false
      }
    };

    console.log('%c[Data Used in Extension]', 'color: #0ea5e9; font-weight: bold', {
      timestamp: new Date().toISOString(),
      data: {
        ...usedData,
        sellers: {
          mainSeller: {
            sellerName: mainSeller?.sellerName,
            price: mainSeller?.price,
            type: mainSeller?.type,
            arrives: mainSeller?.arrives,
            isProSeller: mainSeller?.isProSeller,
            isWFS: mainSeller?.isWFS,
            priceInfo: mainSeller?.priceInfo,
            fulfillmentStatus: mainSeller?.fulfillmentStatus,
            arrivalDate: mainSeller?.arrivalDate
          },
          otherSellers: sellerData.slice(1),
          totalSellers: sellerData.length
        }
      }
    });

    return usedData;
  } catch (error) {
    return null;
  }
} 