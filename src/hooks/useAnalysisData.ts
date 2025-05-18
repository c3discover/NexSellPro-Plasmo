import { useState, useEffect, useMemo } from "react";
import { getUsedData, UsedProductData } from "../data/usedData";
import { isBrandMatch, getDaysAgo } from "../utils/analysisHelpers";

/**
 * useAnalysisData
 * Custom hook to provide all analysis data for the Analysis component and liveDataCollector.
 * Ensures null safety and consistent field naming.
 */
export function useAnalysisData() {
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

  // Derived values
  const wfsSellerCount = productData?.sellers.otherSellers.filter(
    seller => seller.type === "WFS" || seller.type === "WFS-Brand"
  ).length ?? 0;

  const isBrandSelling = useMemo(() => {
    if (!productData?.basic?.brand) return false;
    return productData.sellers.otherSellers.some((seller) =>
      isBrandMatch(productData.basic.brand, seller.sellerName)
    );
  }, [productData?.basic?.brand, productData?.sellers.otherSellers]);

  // Use getDaysAgo for review date filtering
  const reviews30Days = productData?.reviews.reviewDates?.filter(date => getDaysAgo(date) <= 30).length || 0;
  const reviews90Days = productData?.reviews.reviewDates?.filter(date => getDaysAgo(date) <= 90).length || 0;
  const reviews1Year = productData?.reviews.reviewDates?.filter(date => getDaysAgo(date) <= 365).length || 0;

  // Return all fields needed by liveDataCollector, stub as needed
  return {
    isLoading,
    error,
    totalRatings: productData?.reviews.numberOfRatings || 0,
    reviews30Days,
    reviews90Days,
    reviews1Year,
    overallRating: productData?.reviews.overallRating || 0,
    wfsSellerCount,
    isBrandSelling,
    getDaysAgo, // Expose for UI compatibility
    // Add more as needed for liveDataCollector
  };
} 