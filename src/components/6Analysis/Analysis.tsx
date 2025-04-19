/**
 * @fileoverview Analysis component for displaying product metrics and seller information
 * @author NexSellPro
 * @created 2024-03-21
 * @lastModified 2024-03-21
 */

/////////////////////////////////////////////////
// Imports:
/////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { getUsedData, UsedProductData } from "../../data/usedData";
import { FiCheckCircle } from "react-icons/fi";
import { SellerTable } from '../../components/6Analysis/SellerTable';
import { getDaysAgo, isBrandMatch } from '../../utils/analysisHelpers';

/////////////////////////////////////////////////
// Constants and Variables:
/////////////////////////////////////////////////
// Define class names as constants to maintain consistency and avoid repeating strings
const CLASS_SECTION_HEADER = "bg-[#3a3f47] text-xs text-white text-center p-1.5 rounded-t-lg";
const CLASS_SECTION_CONTENT_GREEN = "text-xs font-medium bg-white border-l-4 border-l-emerald-500 text-center p-2 rounded-lg shadow-sm";
const CLASS_SECTION_CONTENT_RED = "text-xs font-medium bg-white border-l-4 border-l-rose-500 text-center p-2 rounded-lg shadow-sm";
const CLASS_DEFAULT_CONTENT = "text-xs font-medium bg-white text-center p-2 rounded-lg shadow-sm";
const CLASS_BUTTON_STYLE = "text-black text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl";

// Other important default values
const UNKNOWN_SELLER = "Unknown Seller";

// Local Storage Keys
const LOCAL_STORAGE_METRICS_KEY = "desiredMetrics";

/////////////////////////////////////////////////
// Types and Interfaces:
/////////////////////////////////////////////////
interface AnalysisProps {
  areSectionsOpen: boolean;
  product?: any; // Adding product prop as optional since it might be null initially
}

/////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////

/////////////////////////////////////////////////
// State and Hooks
/////////////////////////////////////////////////
export const Analysis: React.FC<AnalysisProps> = ({ areSectionsOpen }) => {
  // State for controlling section visibility
  const [isOpen, setIsOpen] = useState(areSectionsOpen);

  // State to store product data
  const [productData, setProductData] = useState<UsedProductData | null>(null);

  // State to control if the seller table is expanded or collapsed
  const [isTableExpanded, setIsTableExpanded] = useState(true);

  // Calculate the number of WFS sellers (including Brand-WFS)
  const wfsSellerCount = productData?.sellers.otherSellers.filter(
    seller => seller.type === "WFS" || seller.type === "WFS-Brand"
  ).length ?? 0;

  // Check if the brand is one of the sellers
  const isBrandSelling = React.useMemo(() => {
    if (!productData?.basic?.brand) return false;
    return productData.sellers.otherSellers.some((seller) =>
      isBrandMatch(productData.basic.brand, seller.sellerName)
    );
  }, [productData?.basic?.brand, productData?.sellers.otherSellers]);

  // Sync isOpen state with the passed prop value
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Fetch product data and update state
  useEffect(() => {
    const fetchData = async () => {
      const productId = window.location.pathname.match(/\/ip\/[^\/]+\/(\d+)/)?.[1] || '';
      const data = await getUsedData(productId);
      if (data) {
        setProductData(data);
      }
    };
    fetchData();
  }, []);

  ////////////////////////////////////////////////
  // Chrome API Handlers:
  ////////////////////////////////////////////////

  ////////////////////////////////////////////////
  // Event Handlers:
  ////////////////////////////////////////////////
  /**
   * Event handler to toggle the visibility of the analysis component.
   */
  const toggleOpen = (): void => {
    setIsOpen((prev) => !prev);
  };

  /**
   * Event handler to expand or collapse the seller data table.
   */
  const toggleTable = (): void => {
    setIsTableExpanded((prev) => !prev);
  };

  /////////////////////////////////////////////////////
  // Helper Functions:
  /////////////////////////////////////////////////////
  /**
   * Apply formatting to the total ratings element based on the settings and product ratings.
   * @returns {string} The CSS classes to apply for styling the total ratings element.
   */
  const applyTotalRatingsHighlight = (): string => {
    // Get total ratings from product details
    const totalRatings = productData?.reviews.numberOfRatings || 0;

    // Get minimum total ratings from settings
    const storedSettings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_METRICS_KEY) || "{}");
    const minTotalRatings =
      typeof storedSettings.minTotalRatings === "string"
        ? parseFloat(storedSettings.minTotalRatings)
        : storedSettings.minTotalRatings || null;

    // Determine CSS classes based on the threshold
    if (minTotalRatings === null || minTotalRatings === 0) {
      return CLASS_DEFAULT_CONTENT; // Default formatting
    }
    // Apply green or red formatting based on comparison
    return totalRatings >= minTotalRatings
      ? CLASS_SECTION_CONTENT_GREEN // Green for meeting or exceeding threshold
      : CLASS_SECTION_CONTENT_RED;  // Red for below threshold
  };

  /**
   * Apply formatting to the Date of Most Recent Reviews box based on the settings.
   * @returns {string} The CSS classes to apply for styling the element.
   */
  const applyRecentReviewsHighlight = (): string => {
    // Retrieve the minimum 30-day reviews threshold from settings
    const storedSettings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_METRICS_KEY) || "{}");
    const minRatings30Days = parseFloat(storedSettings.minRatings30Days || "0");

    // If no threshold is set, return default styling
    if (minRatings30Days === 0) {
      return CLASS_DEFAULT_CONTENT;
    }

    // Count reviews within the last 30 days
    const recentReviewCount30Days =
      productData?.reviews.reviewDates?.filter((date) => getDaysAgo(date) <= 30).length || 0;

    // Determine CSS class based on the threshold
    return recentReviewCount30Days >= minRatings30Days
      ? CLASS_SECTION_CONTENT_GREEN // Green for sufficient 30-day reviews
      : CLASS_SECTION_CONTENT_RED; // Red for insufficient 30-day reviews
  };

  /**
   * Apply formatting to the overall rating element based on the settings.
   * @returns {string} The CSS classes to apply for styling the overall rating element.
   */
  const applyOverallRatingHighlight = (): string => {
    // Get overall rating from product details
    const overallRating =
      typeof productData?.reviews.overallRating === "number"
        ? productData.reviews.overallRating
        : 0;

    // Get minimum overall rating from settings
    const storedSettings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_METRICS_KEY) || "{}");
    const minOverallRating =
      typeof storedSettings.minOverallRating === "string"
        ? parseFloat(storedSettings.minOverallRating)
        : storedSettings.minOverallRating || 0;

    // Determine CSS classes based on the threshold
    if (minOverallRating === 0) {
      return CLASS_DEFAULT_CONTENT; // Default formatting
    }
    return overallRating >= minOverallRating
      ? CLASS_SECTION_CONTENT_GREEN // Green for meeting or exceeding threshold
      : CLASS_SECTION_CONTENT_RED;  // Red for below threshold
  };

  /**
   * Apply formatting to the WFS sellers element based on the settings.
   * @returns {string} The CSS classes to apply for styling the WFS sellers element.
   */
  const applyMaxWfsSellersHighlight = (): string => {
    // Get the current WFS seller count
    const currentWfsSellers = productData?.sellers.otherSellers.filter(
      seller => seller.type === "WFS"
    ).length ?? 0;

    // Get the maximum WFS sellers threshold from settings
    const storedSettings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_METRICS_KEY) || "{}");
    const maxWfsSellers =
      typeof storedSettings.maxWfsSellers === "string"
        ? parseFloat(storedSettings.maxWfsSellers)
        : storedSettings.maxWfsSellers || null;

    // Determine CSS classes based on the threshold
    if (maxWfsSellers === null || maxWfsSellers === 0) {
      return CLASS_DEFAULT_CONTENT; // Default formatting
    }

    // Apply green or red formatting based on comparison
    return currentWfsSellers <= maxWfsSellers
      ? CLASS_SECTION_CONTENT_GREEN // Green if below or equal to max threshold
      : CLASS_SECTION_CONTENT_RED;  // Red if above the max threshold
  };

  /**
   * Apply formatting to the total stock element based on the settings.
   * @returns {string} The CSS classes to apply for styling the total stock element.
   */
  const applyTotalStockHighlight = (): string => {
    // Get total stock from all sellers
    const totalStock = productData ? (
      [...(productData.sellers.mainSeller ? [productData.sellers.mainSeller] : []),
       ...(productData.sellers.otherSellers || [])]
      .reduce((total, seller) => total + (seller.availableQuantity || 0), 0)
    ) : 0;

    // Get maximum stock from settings
    const storedSettings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_METRICS_KEY) || "{}");
    const maxStock =
      typeof storedSettings.maxStock === "string"
        ? parseFloat(storedSettings.maxStock)
        : storedSettings.maxStock || null;

    // Determine CSS classes based on the threshold
    if (maxStock === null || maxStock === 0) {
      return CLASS_DEFAULT_CONTENT; // Default formatting
    }
    return totalStock <= maxStock
      ? CLASS_SECTION_CONTENT_GREEN // Green for meeting or below threshold
      : CLASS_SECTION_CONTENT_RED;  // Red for above threshold
  };

  /////////////////////////////////////////////////////
  // JSX:
  /////////////////////////////////////////////////////
  return (
    <div
      id="Analysis"
      className={`bg-[#d7d7d7] m-1 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isOpen ? "h-auto opacity-100" : "h-9"
      }`}
    >
      {/* Section Header */}
      <h1
        className="font-medium text-black text-start text-[12px] cursor-pointer w-full px-2.5 py-1 bg-cyan-500 flex items-center justify-between group hover:bg-cyan-600 transition-colors"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{isOpen ? "▾" : "▸"}</span>
          Analysis
        </div>
      </h1>

      {/* Content Wrapper */}
      <div className={`${isOpen ? "block" : "hidden"} p-2 space-y-3`}>
        {/* Main Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Total Ratings */}
          <div className={applyTotalRatingsHighlight()}>
            <div className="text-[10px] text-gray-600 mb-1">Total Ratings</div>
            <div className="text-base font-semibold">{productData?.reviews.numberOfRatings || "-"}</div>
            </div>

            {/* Total Reviews */}
          <div className={applyTotalRatingsHighlight()}>
            <div className="text-[10px] text-gray-600 mb-1">Total Reviews</div>
            <div className="text-base font-semibold">{productData?.reviews.numberOfReviews || "-"}</div>
            </div>

            {/* Overall Rating */}
          <div className={applyOverallRatingHighlight()}>
            <div className="text-[10px] text-gray-600 mb-1">Overall Rating</div>
            <div className="text-base font-semibold">
                {typeof productData?.reviews.overallRating === 'number'
                  ? productData.reviews.overallRating.toFixed(1)
                  : "-"}
            </div>
          </div>
        </div>

        {/* Review Timeline Section */}
        <div className={`${applyRecentReviewsHighlight()} p-3`}>
          <div className="text-[10px] text-gray-600 mb-2">Review Timeline</div>
          <div className="grid grid-cols-3 gap-4">
              {/* 30 Day Reviews */}
              <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                  {productData?.reviews.reviewDates?.filter(date => getDaysAgo(date) <= 30).length || 0}
              </div>
              <div className="mt-1 text-[10px] font-medium text-gray-600">30 Days</div>
              </div>

              {/* 90 Day Reviews */}
              <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                  {productData?.reviews.reviewDates?.filter(date => getDaysAgo(date) <= 90).length || 0}
              </div>
              <div className="mt-1 text-[10px] font-medium text-gray-600">90 Days</div>
              </div>

              {/* 1 Year Reviews */}
              <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white flex items-center justify-center text-sm font-medium shadow-sm">
                  {productData?.reviews.reviewDates?.filter(date => getDaysAgo(date) <= 365).length || 0}
              </div>
              <div className="mt-1 text-[10px] font-medium text-gray-600">1 Year</div>
            </div>
          </div>
        </div>

        {/* Total Stock Section */}
        <div className={applyTotalStockHighlight()}>
          <div className="text-[10px] text-gray-600 mb-1">Total Stock</div>
          <div className="text-base font-semibold">{productData?.inventory.totalStock ?? "-"}</div>
        </div>

        {/* Seller Information Section */}
        <div className="bg-white rounded-lg p-3">
          <div className="grid grid-cols-4 gap-2">
            {/* Total Sellers */}
            <div className="text-center">
              <div className="text-[10px] text-gray-600 mb-1">Total Sellers</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                (() => {
                  const maxSellers = JSON.parse(localStorage.getItem("desiredMetrics") || "{}")?.maxSellers;
                  if (!maxSellers || maxSellers === 0) return 'bg-gray-50 text-gray-600';
                  return (productData?.totalSellers || 0) <= maxSellers
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700';
                })()
              }`}>
                {productData?.totalSellers || 0}
              </div>
            </div>

            {/* WFS Sellers */}
            <div className="text-center">
              <div className="text-[10px] text-gray-600 mb-1">WFS Sellers</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                productData?.sellers.otherSellers.filter(s => s.type === "WFS" || s.type === "WFS-Brand").length === 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
              }`}>
                {productData?.sellers.otherSellers.filter(s => s.type === "WFS" || s.type === "WFS-Brand").length || "0"}
              </div>
            </div>

            {/* Walmart Sells */}
            <div className="text-center">
              <div className="text-[10px] text-gray-600 mb-1">Walmart Sells</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                productData?.sellers.mainSeller?.sellerName === "Walmart.com"
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
              }`}>
                {productData?.sellers.mainSeller?.sellerName === "Walmart.com" ? "YES" : "NO"}
              </div>
            </div>

            {/* Brand Sells */}
            <div className="text-center">
              <div className="text-[10px] text-gray-600 mb-1">Brand Sells</div>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                productData?.sellers.otherSellers.some(s =>
                  productData?.basic.brand && s.sellerName &&
                  productData.basic.brand.toLowerCase().split(' ').some(brandPart =>
                    s.sellerName.toLowerCase().includes(brandPart)
                  )
                )
                ? 'bg-rose-50 text-rose-700'
                : 'bg-emerald-50 text-emerald-700'
              }`}>
                {productData?.sellers.otherSellers.some(s =>
                  productData?.basic.brand && s.sellerName &&
                  productData.basic.brand.toLowerCase().split(' ').some(brandPart =>
                    s.sellerName.toLowerCase().includes(brandPart)
                  )
                ) ? "YES" : "NO"}
              </div>
            </div>
          </div>
        </div>

        {/* Seller Table Section */}
        <div className="w-full">
          <div className="flex justify-end mb-1">
            <button
              onClick={toggleTable}
              className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              {isTableExpanded ? "Hide Table" : "Show Table"}
            </button>
          </div>

          {isTableExpanded && (
            <div className="w-full">
              <SellerTable />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default Analysis;
