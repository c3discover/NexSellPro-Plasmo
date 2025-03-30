/**
 * @fileoverview Product overview component that displays detailed product information
 * @author NexSellPro
 * @created 2024-03-21
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import { useState, useEffect, useMemo, useCallback } from "react";
import { getUsedData } from "../../utils/usedData";
import type { UsedProductData } from "../../utils/usedData";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Loading states for better UX
const LOADING_STATES = {
  INITIAL: 'initial',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

type LoadingState = typeof LOADING_STATES[keyof typeof LOADING_STATES];

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Using UsedProductData interface imported from usedData.ts
// This interface defines the structure of product data including:
// - basic: name, brand
// - categories: category hierarchy
// - media: images, videos
// - pricing: current price
// - reviews: ratings
// - inventory: seller information
// - badges: product badges

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// No props needed for this component as it fetches its own data

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const Product = () => {
  ////////////////////////////////////////////////
  // State Management:
  ////////////////////////////////////////////////
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<UsedProductData | null>(null);

  ////////////////////////////////////////////////
  // State and Hooks:
  ////////////////////////////////////////////////
  // State to manage the copy button feedback
  const [copied, setCopied] = useState<boolean>(false);

  // State to manage loading states
  const [loadingState, setLoadingState] = useState<LoadingState>(LOADING_STATES.INITIAL);

  // State to track image loading
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // State to track current URL
  const [currentUrl, setCurrentUrl] = useState<string>(window.location.href);

  ////////////////////////////////////////////////
  // Effect Hooks:
  ////////////////////////////////////////////////
  // Effect to update URL state
  useEffect(() => {
    const checkUrl = () => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        // Clear existing data first
        setProductData(null);
        setCurrentUrl(newUrl);
        
        // Perform a full extension reload
        if (chrome.runtime && chrome.runtime.reload) {
          chrome.runtime.reload();
        } else {
          window.location.reload();
        }
      }
    };

    // Check URL periodically
    const interval = setInterval(checkUrl, 100);
    return () => {
      clearInterval(interval);
      // Clear data on cleanup
      setProductData(null);
    };
  }, [currentUrl]);

  // Effect hook to fetch product data when URL changes
  useEffect(() => {
    let isMounted = true;

    const loadProductData = async () => {
      if (!currentUrl) return;

      setIsLoading(true);
      setError(null);

      try {
        // Clear existing data before fetching new data
        setProductData(null);
        const data = await getUsedData();
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

    loadProductData();

    return () => {
      isMounted = false;
      // Clear data on cleanup
      setProductData(null);
    };
  }, [currentUrl]);

  ////////////////////////////////////////////////
  // Event Handlers:
  ////////////////////////////////////////////////
  // Memoized copy handler to prevent recreation on every render
  const handleCopy = useCallback(() => {
    if (productData) {
      navigator.clipboard.writeText(productData.basic.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [productData]);

  // Memoized image load handler
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  ////////////////////////////////////////////////
  // Helper Functions:
  ////////////////////////////////////////////////
  // Memoized shelving path renderer
  const renderShelvingPath = useMemo(() => {
    if (!productData?.categories?.categories || productData.categories.categories.length === 0) {
      return <span>No shelving path available</span>;
    }

    return productData.categories.categories.map((category, index) => (
      <span key={index}>
        <a
          href={`https://www.walmart.com${category.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {category.name}
        </a>
        {index < productData.categories.categories.length - 1 && " > "}
      </span>
    ));
  }, [productData?.categories?.categories]);

  // Memoized badges renderer
  const renderBadges = useMemo(() => {
    if (!productData?.badges.length) {
      return <p className="text-sm text-gray-400 italic text-center">No badges available</p>;
    }

    return (
      <div className="flex flex-wrap gap-2 justify-center items-center p-2">
        {productData.badges.map((badge, index) => {
          const badgeText = badge.toLowerCase();
          let badgeStyle = '';
          let icon = null;

          // Popular & Trending Badges
          if (badgeText.includes('best seller')) {
            badgeStyle = 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-600';
            icon = '⭐';
          } else if (badgeText.includes('popular pick') || badgeText.includes('in cart')) {
            badgeStyle = 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600';
            icon = '🔥';
          } else if (badgeText.includes('trending')) {
            badgeStyle = 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-600';
            icon = '📈';
          } 
          // Price-related Badges
          else if (badgeText.includes('clearance')) {
            badgeStyle = 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-600';
            icon = '🏷️';
          } else if (badgeText.includes('rollback')) {
            badgeStyle = 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-600';
            icon = '↩️';
          } else if (badgeText.includes('flash') || badgeText.includes('special buy')) {
            badgeStyle = 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-600';
            icon = '⚡';
          } else if (badgeText.includes('price drop') || badgeText.includes('reduced')) {
            badgeStyle = 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-600';
            icon = '📉';
          }
          // Review & Quality Badges
          else if (badgeText.includes('top rated') || badgeText.includes('review')) {
            badgeStyle = 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white border-indigo-600';
            icon = '⭐';
          } else if (badgeText.includes('built for better')) {
            badgeStyle = 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-teal-600';
            icon = '🌱';
          }
          // Stock & Availability Badges
          else if (badgeText.includes('limited stock') || badgeText.includes('low stock')) {
            badgeStyle = 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-700';
            icon = '⚠️';
          } else if (badgeText.includes('new')) {
            badgeStyle = 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-emerald-600';
            icon = '✨';
          }
          // Special Status Badges
          else if (badgeText.includes('walmart restored')) {
            badgeStyle = 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-600';
            icon = '🔄';
          } else if (badgeText.includes('only at walmart') || badgeText.includes('exclusive')) {
            badgeStyle = 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-700';
            icon = '🎯';
          } else if (badgeText.includes('as seen')) {
            badgeStyle = 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-600';
            icon = '📺';
          }
          // Numeric badges (e.g., "X+ bought")
          else if (/\d+/.test(badgeText)) {
            badgeStyle = 'bg-white text-blue-600 border-blue-300';
            icon = '👥';
          }
          // Generic style for unrecognized badges
          else {
            badgeStyle = 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300';
          }

          return (
            <div
              key={index}
              className={`
                px-3 py-1.5 
                rounded-full
                border
                font-medium
                text-xs
                shadow-sm
                transition-all
                duration-200
                hover:shadow-md
                hover:scale-105
                cursor-default
                ${badgeStyle}
              `}
            >
              {icon && <span className="mr-1">{icon}</span>}
              {badge}
            </div>
          );
        })}
      </div>
    );
  }, [productData?.badges]);

  ////////////////////////////////////////////////
  // Styles:
  ////////////////////////////////////////////////
  // Styles are handled through Tailwind classes

  ////////////////////////////////////////////////
  // JSX:
  ////////////////////////////////////////////////
  // Handle different loading states
  if (isLoading) {
    return (
      <div className="p-4 w-full text-center">
        <div className="mx-auto w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 w-full text-center text-red-500">
        Error loading product data. Please try again later.
      </div>
    );
  }

  if (!productData) return null;

  // Get first category for the main category link
  const firstCategory = productData.categories.categories[0];

  return (
    <div
      id="product"
      className="flex items-center justify-start flex-col bg-[#d7d7d7] max-w-[100%] p-2 gap-2 rounded-lg shadow-2xl"
    >
      {/* Product Name Section with Copy Functionality */}
      <div id="productName" className="flex items-center justify-between w-full">
        <p className="text-black font-bold text-sm text-center p-1 mb-2 mr-1 ml-2 rounded-lg bg-[#bfbfbf] shadow-black shadow-xl">
          {productData.basic.name}
        </p>

        {/* Copy Icon - Shows when not copied */}
        <svg
          onClick={handleCopy}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lucide lucide-copy cursor-pointer w-10 h-10 ${copied ? "hidden" : ""} hover:scale-110 transition-transform duration-200 m-2`}
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>

        {/* Check Icon - Shows when copied */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lucide lucide-copy cursor-pointer w-10 h-10 text-green-500 ${copied ? "" : "hidden"} hover:scale-110 transition-transform duration-200 m-2`}
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      {/* Product General Info Section */}
      <div id="productGeneralInfo" className="flex flex-col lg:flex-row items-stretch justify-between w-full gap-3">
        {/* Product Image Section with Loading State */}
        <div id="productImage" className="flex-1 flex flex-col items-center justify-between bg-white p-1 rounded-lg shadow-lg">
          <div className="relative w-full h-[150px] group">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin"></div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={productData.media.imageUrl}
                alt={productData.basic.name}
                className={`w-auto h-auto max-h-[140px] object-contain transition-transform duration-300 ease-in-out ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-150 group-hover:z-50`}
                onLoad={handleImageLoad}
                loading="lazy"
              />
            </div>
          </div>
          <div>
            <p className="font-bold text-center text-black text-sm">
              Images: <span className="font-normal">{productData.media.images?.length || 0}</span>
            </p>
            <p className="font-bold text-center text-black text-sm p-1">
              Videos: <span className="font-normal">{productData.media.videos?.length || 0}</span>
            </p>
          </div>
        </div>

        {/* Product Details Section - Quick Stats */}
        <div id="productDetails" className="flex-1 flex flex-col items-center justify-center bg-white p-1 rounded-lg shadow-lg">
          <div className="w-full px-2">
            {/* Price Information */}
            <p className="text-black text-sm p-1 flex justify-between items-center">
              <span className="font-bold">Price</span>
              <span className="px-2 py-1 bg-gray-300 rounded-lg text-black text-sm">
                ${productData.pricing.currentPrice ? productData.pricing.currentPrice.toFixed(2) : '0.00'}
              </span>
            </p>

            {/* Ratings Count */}
            <p className="text-black text-sm p-1 flex justify-between items-center">
              <span className="font-bold">Ratings</span>
              <span className="px-2 py-1 bg-gray-300 rounded-lg text-black text-sm">
                {productData.reviews.numberOfRatings}
              </span>
            </p>

            {/* Total Sellers */}
            <p className="text-black text-sm p-1 flex justify-between items-center">
              <span className="font-bold">Sellers</span>
              <span className="px-2 py-1 bg-gray-300 rounded-lg text-black text-sm">
                {productData.inventory.totalSellers}
              </span>
            </p>

            {/* Walmart Selling Status */}
            <p className="text-black text-sm p-1 flex justify-between items-center">
              <span className="font-bold">Walmart Selling?</span>
              {productData.pricing.sellerName === "Walmart.com" ? (
                <span className="px-1 py-1 text-sm bg-red-100 text-red-700 font-bold border border-red-500 rounded-lg shadow-sm">YES</span>
              ) : (
                <span className="px-1 py-1 text-sm bg-green-100 text-green-700 font-bold border border-green-500 rounded-lg shadow-sm">NO</span>
              )}
            </p>

            {/* Variations Count */}
            <p className="text-black text-sm p-1 flex justify-between items-center">
              <span className="font-bold">Variations</span>
              <span className="px-2 py-1 bg-gray-300 rounded-lg text-black text-sm">
                {Object.keys(productData.variants.variantsMap || {}).length || "-"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Brand and Category Information Section */}
      <div className="flex flex-col items-left px-3 py-1 rounded-lg shadow-2xl bg-white w-full">
        {/* Brand with Link to Search */}
        <p className="text-black font-bold text-start text-md">
          Brand:{" "}
          <a
            href={`https://www.walmart.com/search?q=${productData.basic.brand}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-500 hover:underline"
          >
            {productData.basic.brand}
          </a>
        </p>

        {/* Category with Link */}
        <p className="text-black font-bold text-start text-md">
          Category:{" "}
          {firstCategory ? (
            <a
              href={`https://www.walmart.com${firstCategory.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-500 hover:underline"
            >
              {firstCategory.name}
            </a>
          ) : (
            <span>No Category Available</span>
          )}
        </p>

        {/* Full Category Path */}
        <p className="text-black font-bold text-start text-md">
          Shelving Path: <span className="ml-2 text-sm font-normal align-middle">{renderShelvingPath}</span>
        </p>
      </div>

      {/* Product Badges Section - Updated container styling */}
      <div className="w-full p-2 rounded-lg shadow-lg bg-white">
        {renderBadges}
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default Product;