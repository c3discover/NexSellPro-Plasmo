import { useState, useEffect } from "react";
import { getUsedData, UsedProductData } from "../data/usedData";

/**
 * useBuyGaugeData
 * Custom hook to provide all buy gauge data for the BuyGauge component and liveDataCollector.
 * Ensures null safety and consistent field naming.
 */
export function useBuyGaugeData() {
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
    totalProfit: productData?.profitability.totalProfit || 0,
    margin: productData?.profitability.margin || 0,
    roi: productData?.profitability.roi || 0,
    totalRatings: productData?.reviews.numberOfRatings || 0,
    ratingsLast30Days: productData?.reviews.reviewDates?.filter(date => {
      if (!date) return false;
      const reviewDate = new Date(date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return reviewDate >= thirtyDaysAgo;
    }).length || 0,
    numSellers: productData?.inventory.totalSellers || 0,
    numWfsSellers: productData?.sellers.otherSellers?.filter(s => s.isWFS)?.length || 0,
    totalStock: productData?.inventory.totalStock || 0,
    // Add more as needed for liveDataCollector
  };
} 