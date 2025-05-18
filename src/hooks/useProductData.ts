import { useState, useEffect } from "react";
import { getUsedData, UsedProductData } from "../data/usedData";

/**
 * useProductData
 * Custom hook to provide all product overview data for the Product component and liveDataCollector.
 * Ensures null safety and consistent field naming.
 */
export function useProductData() {
  const [productData, setProductData] = useState<UsedProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(window.location.href);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        setCurrentUrl(newUrl);
        setProductData(null);
      }
    });
    observer.observe(document, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, [currentUrl]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    const loadProductData = async () => {
      if (!currentUrl) return;
      setIsLoading(true);
      setError(null);
      try {
        const productId = window.location.pathname.match(/\/ip\/[^\/]+\/(\d+)/)?.[1] || '';
        const data = await getUsedData(productId);
        if (isMounted) {
          setProductData(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load product data');
          setIsLoading(false);
        }
      }
    };
    timeoutId = setTimeout(loadProductData, 300);
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [currentUrl]);

  // Return all fields needed by liveDataCollector, stub as needed
  return {
    isLoading,
    error,
    productId: productData?.basic.productID || '',
    name: productData?.basic.name || '',
    brand: productData?.basic.brand || '',
    upc: productData?.basic.upc || '',
    modelNumber: productData?.basic.modelNumber || '',
    mainCategory: productData?.mainCategory || '',
    categories: productData?.categories || [],
    images: productData?.images || [],
    mainImage: productData?.imageUrl || '',
    numImages: productData?.images?.length || 0,
    videos: productData?.videos || [],
    numVideos: productData?.videos?.length || 0,
    badges: productData?.badges || [],
    shelvingPath: productData?.categories?.map(c => c.name).join(' > ') || '',
    // Add more as needed for liveDataCollector
  };
} 