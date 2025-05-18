import { useState, useEffect } from "react";
import { getUsedData, UsedProductData } from "../data/usedData";

/**
 * useVariationsData
 * Custom hook to provide all variations data for the Variations component and liveDataCollector.
 * Ensures null safety and consistent field naming.
 */
export function useVariationsData() {
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

  // Extract and type variantsMap and related fields
  const variantsMap = productData?.variants.variantsMap || {};
  const variantItemIds = Object.keys(variantsMap);
  const numberOfVariants = variantItemIds.length;

  return {
    isLoading,
    error,
    variantsMap,
    variantItemIds,
    numberOfVariants,
    // Add more as needed for liveDataCollector
  };
} 