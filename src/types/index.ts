export interface Product {
  weight: number;
  length: number;
  width: number;
  height: number;
  isWalmartFulfilled: boolean;
  isApparel: boolean;
  isHazardousMaterial: boolean;
  retailPrice?: number;
}

export interface PricingOptions {
  maxCacheSize?: number;
  ttl?: number;
  cacheKeyFn?: (...args: any[]) => string;
} 