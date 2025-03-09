////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No imports needed

////////////////////////////////////////////////
// Types:
////////////////////////////////////////////////

/**
 * Product dimensions and weight
 */
export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  weight: number;
}

/**
 * Product pricing information
 */
export interface ProductPricing {
  currentPrice: number;
  listPrice?: number;
  priceHistory?: {
    date: string;
    price: number;
  }[];
  salePrice?: number;
  savingsAmount?: number;
  savingsPercent?: number;
}

/**
 * Product review information
 */
export interface ProductReviews {
  averageRating: number;
  numberOfReviews: number;
  reviewsData?: {
    text: string;
    rating: number;
    date: string;
    reviewer: string;
    title?: string;
  }[];
}

/**
 * Product category and classification
 */
export interface ProductCategory {
  primaryCategory: string;
  subCategory?: string;
  contractCategory?: string;
  department?: string;
}

/**
 * Product variation information
 */
export interface ProductVariation {
  id: string;
  name: string;
  value: string;
  selected: boolean;
  url?: string;
  image?: string;
  price?: number;
  inStock?: boolean;
}

/**
 * Product variation map
 */
export interface ProductVariationsMap {
  [key: string]: {
    name: string;
    values: ProductVariation[];
  };
}

/**
 * Product flags for special handling
 */
export interface ProductFlags {
  isApparel: boolean;
  isHazardousMaterial: boolean;
  isFragile: boolean;
  isOversized: boolean;
  isWalmartFulfilled: boolean;
  isInStock: boolean;
  isBestSeller?: boolean;
}

/**
 * Product specifications
 */
export interface ProductSpecifications {
  [key: string]: string | number | boolean;
}

/**
 * Complete product details
 */
export interface ProductDetails {
  // Basic information
  id: string;
  name: string;
  brand: string;
  upc?: string;
  brandUrl?: string;
  modelNumber?: string;

  // Pricing
  price: number;
  currentPrice?: number;
  listPrice?: number;
  salePrice?: number;
  savingsAmount?: number;
  savingsPercent?: number;
  priceHistory?: {
    date: string;
    price: number;
  }[];

  // Categories
  category: string;
  mainCategory?: string;
  categories?: { name: string; url: string }[];
  contractCategory?: string;
  department?: string;

  // Reviews
  rating: number;
  reviewCount: number;
  reviewDates?: string[];
  reviewsData?: {
    text: string;
    rating: number;
    date: string;
    reviewer: string;
    title?: string;
  }[];

  // Physical attributes
  specifications: Record<string, string>;
  shippingLength?: string;
  shippingWidth?: string;
  shippingHeight?: string;
  weight?: string;

  // Inventory
  inStock: boolean;
  stock?: number;
  fulfillmentOptions?: { type: string; availableQuantity: number }[];

  // Media
  imageUrl?: string;

  // Variations
  variantCriteria?: {
    id: string;
    name: string;
    value: string;
    selected: boolean;
    url?: string;
    image?: string;
    price?: number;
    inStock?: boolean;
  }[];
  variantsMap?: {
    [key: string]: {
      name: string;
      values: {
        id: string;
        name: string;
        value: string;
        selected: boolean;
        url?: string;
        image?: string;
        price?: number;
        inStock?: boolean;
      }[];
    };
  };

  // Flags and badges
  badges?: string[];
  totalSellers?: number;
  isBestSeller?: boolean;
}

/**
 * Raw product data from API response
 */
export interface RawProductData {
  product: {
    usItemId: string;
    name: string;
    brand?: string;
    upc?: string;
    brandUrl?: string;
    imageInfo?: {
      thumbnailUrl?: string;
    };
    category?: {
      path?: { name: string }[];
    };
    priceInfo?: {
      currentPrice?: {
        price: number;
      };
    };
    variantCriteria?: any[];
    variantsMap?: any;
    model?: string;
    badges?: { key: string }[];
    sellerInfo?: {
      sellerCount?: number;
    };
    fulfillmentOptions?: {
      fulfillmentType: string;
      availableQuantity: number;
    }[];
  };
  idml?: {
    specifications?: {
      name: string;
      value: string;
    }[];
  };
  reviews?: {
    reviewStatistics?: {
      reviewDateDistribution?: {
        date: string;
      }[];
    };
  };
} 