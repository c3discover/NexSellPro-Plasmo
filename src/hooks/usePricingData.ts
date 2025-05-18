import { useState, useEffect } from "react";
import { getUsedData, UsedProductData } from "../data/usedData";

// Migrated constants from usePricingState
export const DEFAULT_CONTRACT_CATEGORY = "Everything Else (Most Items)";
export const DEFAULT_SEASON = "Jan-Sep";
export const DEFAULT_STORAGE_LENGTH = 1;
export const DEFAULT_INBOUND_RATE = 0.00;

// Helper function for formatting
export const formatToTwoDecimalPlaces = (value: number): string => value.toFixed(2);

/**
 * usePricingData
 * Custom hook to provide all pricing data for the Pricing component and liveDataCollector.
 * Ensures null safety and consistent field naming.
 */
export function usePricingData() {
  const [productData, setProductData] = useState<UsedProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const productId = window.location.pathname.match(/\/ip\/[^\/]+\/(\d+)/)?.[1] || '';
        const data = await getUsedData(productId);
        setProductData(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product data');
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Return all fields needed by liveDataCollector, stub as needed
  return {
    isLoading,
    error,
    salePrice: productData?.pricing.salePrice ?? productData?.pricing.currentPrice ?? 0,
    productCost: productData?.pricingOverrides.productCost ?? 0,
    referralFee: productData?.profitability.referralFee ?? 0,
    wfsFee: productData?.profitability.wfsFee ?? 0,
    prepFee: productData?.profitability.prepFee ?? 0,
    storageFee: productData?.profitability.storageFee ?? 0,
    inboundShipping: productData?.profitability.inboundShipping ?? 0,
    sfShipping: productData?.profitability.sfShipping ?? 0,
    additionalFees: productData?.profitability.additionalFees ?? 0,
    totalProfit: productData?.profitability.totalProfit ?? 0,
    margin: productData?.profitability.margin ?? 0,
    roi: productData?.profitability.roi ?? 0,
    // Expose migrated constants for UI compatibility
    DEFAULT_CONTRACT_CATEGORY,
    DEFAULT_SEASON,
    DEFAULT_STORAGE_LENGTH,
    DEFAULT_INBOUND_RATE,
    formatToTwoDecimalPlaces,
    // Add more as needed for liveDataCollector
  };
} 