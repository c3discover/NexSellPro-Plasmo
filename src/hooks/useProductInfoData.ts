import { useState, useEffect } from "react";
import { getUsedData, UsedProductData } from "../data/usedData";

/**
 * useProductInfoData
 * Custom hook to provide all product info data for the ProductInfo component and liveDataCollector.
 * Ensures null safety and consistent field naming.
 */
export function useProductInfoData() {
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
    productId: productData?.basic.productID || '',
    gtin: productData?.gtin || '',
    upc: productData?.basic.upc || '',
    ean: productData?.ean || '',
    modelNumber: productData?.basic.modelNumber || '',
    countryOfOrigin: productData?.countryOfOrigin || '',
    // Add more as needed for liveDataCollector
  };
} 