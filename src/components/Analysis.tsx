/////////////////////////////////////////////////
// Imports:
/////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
// Import the centralized data extraction function
import { getUsedData } from '../utils/usedData';
import type { UsedProductData } from '../utils/usedData';
import { FiCheckCircle } from "react-icons/fi";
import { SellerTable } from './SellerTable';

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
  const isBrandSelling = productData?.sellers.otherSellers.some((seller) =>
    productData?.basic.brand && seller.sellerName &&
    productData.basic.brand.toLowerCase().split(' ').some(brandPart =>
      seller.sellerName.toLowerCase().includes(brandPart)
    )
  ) ?? false;

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
   * Function to get the number of days ago from a given date.
   * @param {string} dateString - Date in string format.
   * @returns {number} Number of days since the given date.
   */
  const getDaysAgo = (dateString: string): number => {
    const today = new Date();
    const reviewDate = new Date(dateString);
    const differenceInTime = today.getTime() - reviewDate.getTime();
    return Math.floor(differenceInTime / (1000 * 3600 * 24));
  };

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
    const minRatings30Days = parseFloat(
      JSON.parse(localStorage.getItem(LOCAL_STORAGE_METRICS_KEY) || "{}")?.minRatings30Days || "0"
    );

    // Count reviews within the last 30 days
    const recentReviewCount30Days =
      productData?.reviews.reviewDates?.filter((date) => getDaysAgo(date) <= 30).length || 0;

    // Determine CSS class based on the threshold
    return recentReviewCount30Days >= minRatings30Days
      ? CLASS_SECTION_CONTENT_GREEN // Green for sufficient 30-day reviews
      : CLASS_DEFAULT_CONTENT; // Default for insufficient 30-day reviews
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


        {/* Top Review Section: Total Reviews and Date of Last Review */}
        <div className="w-full p-2 flex justify-between items-center">

          {/* Total Ratings */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Total Ratings
            </p>
            <p
              className={`${applyTotalRatingsHighlight()}`}
            >
              {productData?.reviews.numberOfRatings || "-"}
            </p>
          </div>

          {/* Total Reviews */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Total Reviews
            </p>
            <p className={CLASS_DEFAULT_CONTENT}>
              {productData?.reviews.numberOfReviews || "-"}
            </p>
          </div>

          {/* Overall Rating */}
          <div className="w-1/3 p-1">
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

        {/* Top Review Section: New Reviews */}
        <div className="w-[95%] mx-auto px-2 pb-4 flex justify-between items-center">
          <div className="w-full p-1">
            <p className={CLASS_SECTION_HEADER}>
              Date of Most Recent Reviews
            </p>
            <div className={`${applyRecentReviewsHighlight()}`}>
              {productData?.reviews.reviewDates && productData.reviews.reviewDates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 mx-10 justify-center">
                  {productData.reviews.reviewDates
                    .map(dateString => new Date(dateString)) // Convert strings to Date objects
                    .sort((a, b) => b.getTime() - a.getTime()) // Sort by time (newest to oldest)
                    .map((date, index) => {
                      const daysAgo = getDaysAgo(date.toISOString()); // Get how many days ago the review was
                      let circleLabel = null;
                      let circleStyle = {};

                      // Determine which label to show based on how many days ago the review was submitted
                      if (daysAgo <= 30) {
                        circleLabel = '30';
                        circleStyle = { backgroundColor: 'green', color: 'white' };
                      } else if (daysAgo <= 60) {
                        circleLabel = '60';
                        circleStyle = { backgroundColor: 'purple', color: 'white' };
                      } else if (daysAgo <= 90) {
                        circleLabel = '90';
                        circleStyle = { backgroundColor: 'orange', color: 'white' };
                      } else if (daysAgo <= 365) {
                        circleLabel = '1y';
                        circleStyle = { backgroundColor: 'grey', color: 'white' };
                      } else {
                        ;
                      }

                      return (
                        <div key={index} className="flex items-center justify-center mb-1">
                          <p>{date.toLocaleDateString()}</p>
                          {circleLabel && (
                            <span
                              style={{
                                ...circleStyle,
                                display: 'inline-block',
                                width: '20px',
                                height: '20px',
                                lineHeight: '20px',
                                fontSize: '10px',
                                borderRadius: '50%',
                                textAlign: 'center',
                                marginLeft: '10px',
                                fontWeight: 'bold',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              }}
                            >
                              {circleLabel}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : "No reviews available"}
            </div>
          </div>
        </div>

        {/* Top Stock Section: Stock Information */}
        <div className="w-full p-2 flex justify-between items-center">

          {/* Total Stock */}
          <div className="w-full p-1">
            <p className={CLASS_SECTION_HEADER}>
              Total Stock
            </p>
            <p className={CLASS_DEFAULT_CONTENT}>
              {productData?.inventory.stock || "-"}
            </p>
          </div>
        </div>

        {/* Stock Details Section */}
        <div className="w-[95%] mx-auto px-2 pb-4 flex justify-between items-center">

          {/* Shipping Stock */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Shipping Stock
            </p>
            <p className={CLASS_DEFAULT_CONTENT}>
              {productData?.inventory.fulfillmentOptions?.[0]?.availableQuantity || 0}
            </p>
          </div>

          {/* Pickup Stock */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Pickup Stock
            </p>
            <p className={CLASS_DEFAULT_CONTENT}>
              {productData?.inventory.fulfillmentOptions?.[1]?.availableQuantity || 0}
            </p>
          </div>

          {/* Delivery Stock */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Delivery Stock
            </p>
            <p className={CLASS_DEFAULT_CONTENT}>
              {productData?.inventory.fulfillmentOptions?.[2]?.availableQuantity || 0}
            </p>
          </div>
        </div>



        {/* Bottom Seller Section: Seller Table */}
        <div className="w-full">
          <div className="flex justify-end mx-2 mb-1">
            <button
              onClick={toggleTable}
              className="text-xs font-semibold px-2 py-0.5 bg-gray-200 rounded shadow hover:bg-gray-300"
              aria-label="Toggle seller table"
            >
              {isTableExpanded ? "Hide Table" : "Show Table"}
            </button>
          </div>

          {/* ===== Seller Table Section ===== */}
          {isTableExpanded && (
            <div className="w-full px-2 pb-2">
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
