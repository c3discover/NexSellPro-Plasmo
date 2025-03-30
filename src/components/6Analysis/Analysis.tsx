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
// Import the centralized data extraction function
import { getUsedData } from '../../utils/usedData';
import type { UsedProductData } from '../../utils/usedData';
import { FiCheckCircle } from "react-icons/fi";
import { SellerTable } from '../../components/6Analysis/SellerTable';
import { getDaysAgo, isBrandMatch } from '../../utils/analysisHelpers';

/////////////////////////////////////////////////
// Constants and Variables:
/////////////////////////////////////////////////
// Define class names as constants to maintain consistency and avoid repeating strings
const CLASS_SECTION_HEADER = "bg-[#3a3f47] text-xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black";
const CLASS_SECTION_CONTENT_GREEN = "text-xs font-bold bg-green-100 text-black-600 border-2 border-green-500 text-center p-1 w-full rounded-b-lg shadow-md shadow-black";
const CLASS_SECTION_CONTENT_RED = "text-xs font-bold bg-red-200 text-black-600 border-2 border-red-500 text-center p-1 w-full rounded-b-lg shadow-md shadow-black";
const CLASS_DEFAULT_CONTENT = "text-xs bg-white text-black text-center border-2 border-black p-1 w-full text-center rounded-b-lg shadow-md shadow-black";
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
      const data = await getUsedData();
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
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      {/* Section Header */}
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "🔽  Analysis" : "▶️  Analysis"}
      </h1>

      {/* Content Wrapper */}
      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>
        {/* Main Metrics Grid */}
        <div className="w-full p-2">
          <div className="grid grid-cols-3 gap-2">
            {/* Total Ratings */}
            <div className="flex flex-col">
              <p className={CLASS_SECTION_HEADER}>
                Total Ratings
              </p>
              <p className={`${applyTotalRatingsHighlight()}`}>
                {productData?.reviews.numberOfRatings || "-"}
              </p>
            </div>

            {/* Total Reviews */}
            <div className="flex flex-col">
              <p className={CLASS_SECTION_HEADER}>
                Total Reviews
              </p>
              <p className={`${applyTotalRatingsHighlight()}`}>
                {productData?.reviews.numberOfReviews || "-"}
              </p>
            </div>

            {/* Overall Rating */}
            <div className="flex flex-col">
              <p className={CLASS_SECTION_HEADER}>
                Overall Rating
              </p>
              <p className={`${applyOverallRatingHighlight()}`}>
                {typeof productData?.reviews.overallRating === 'number'
                  ? productData.reviews.overallRating.toFixed(1)
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Review Timeline Section */}
        <div className="w-full px-2 pb-2">
          <p className={CLASS_SECTION_HEADER}>
            Review Timeline
          </p>
          <div className={`${applyRecentReviewsHighlight()} p-2`}>
            <div className="grid grid-cols-3 gap-2">
              {/* 30 Day Reviews */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold mb-1">30 Days</span>
                <span className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                  {productData?.reviews.reviewDates?.filter(date => getDaysAgo(date) <= 30).length || 0}
                </span>
              </div>

              {/* 90 Day Reviews */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold mb-1">90 Days</span>
                <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm">
                  {productData?.reviews.reviewDates?.filter(date => getDaysAgo(date) <= 90).length || 0}
                </span>
              </div>

              {/* 1 Year Reviews */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold mb-1">1 Year</span>
                <span className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center text-sm">
                  {productData?.reviews.reviewDates?.filter(date => getDaysAgo(date) <= 365).length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="w-full px-2 pb-2">
          <p className={CLASS_SECTION_HEADER}>
            Total Stock
          </p>
          <p className={applyTotalStockHighlight()}>
            {productData?.inventory.totalStock ?? "-"}
          </p>
        </div>

        {/* Seller Table Section */}
        <div className="w-full px-2 pb-2">
          <div className="flex justify-end mb-1">
            <button
              onClick={toggleTable}
              className="text-xs font-semibold px-2 py-1 bg-gray-200 rounded shadow hover:bg-gray-300 transition-colors duration-200"
              aria-label="Toggle seller table"
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
