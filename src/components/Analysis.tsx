/////////////////////////////////////////////////
// Imports 
/////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
// Import the centralized data extraction function
import getProductDetails from '../utils/getData';

import { FiCheckCircle } from "react-icons/fi";


/////////////////////////////////////////////////
// Constants and Variables
/////////////////////////////////////////////////

// Define class names as constants to maintain consistency and avoid repeating strings
const CLASS_SECTION_HEADER = "bg-[#3a3f47] text-xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black";
const CLASS_SECTION_CONTENT_GREEN = "text-xs font-bold bg-green-100 text-green-600 border-2 border-green-500 text-center p-1 w-full rounded-b-lg shadow-md shadow-black";
const CLASS_SECTION_CONTENT_RED = "text-xs font-bold bg-red-200 text-red-600 border-2 border-red-500 text-center p-1 w-full rounded-b-lg shadow-md shadow-black";
const CLASS_DEFAULT_CONTENT = "text-xs bg-white text-black text-center border-2 border-black p-1 w-full text-center rounded-b-lg shadow-md shadow-black";
const CLASS_BUTTON_STYLE = "text-black text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl";

// Default values and thresholds
const MODAL_WAIT_INTERVAL = 500; // Interval in ms for checking modal presence
const MODAL_WAIT_TIMEOUT = 1000; // Timeout in ms for the modal to be closed
const MODAL_CLOSE_BUTTON_SELECTOR = "[aria-label='Close dialog']";
const MODAL_SELECTOR = ".w_g1_b";
const SINGLE_SELLER_INFO_SELECTOR = "[data-testid='product-seller-info']";
const WALMART_DELIVERY_SELECTOR = "[data-automation-id='Walmart-delivery']";
const PRO_SELLER_INDICATOR = "span.inline-flex.items-center.blue";

// Other important default values (if required, add more here)
const UNKNOWN_SELLER = "Unknown Seller";

// Local Storage Keys
const LOCAL_STORAGE_METRICS_KEY = "desiredMetrics";

// Fetch the centralized product details data from productDetailsUsed
const productDetailsUsed = getProductDetails();

// Destructured data from productDetailsUsed for easier access
const {
  currentPrice,
  sellerDisplayName,
  sellerName,
  brand,
  totalSellers,
  numberOfRatings,
  numberOfReviews,
  fulfillmentOptions,
  images
} = productDetailsUsed || {};

/////////////////////////////////////////////////
// Props and Types
/////////////////////////////////////////////////
// Define the interface for the Product type
interface Product {
  productID?: string;
  shippingLength?: number;
  shippingWidth?: number;
  shippingHeight?: number;
  weight?: number;
  currentPrice?: number;
  totalSellers?: number;
  stock?: number;
  brand?: string;
  brandUrl?: string;
  sellerName?: string;
  sellerDisplayName?: string;
  totalReviewCount?: number;
  fulfillmentOptions?: { type: string; availableQuantity: number }[];
  numberOfRatings?: number;
  numberOfReviews?: number;
  overallRating?: number;
  reviewDates?: string[];
  modelNumber?: string;
  variantCriteria?: string[];
  variantsMap?: Record<string, Variant>;
  images?: { url: string }[];
}

// Define the interface for the Variant type (for use in the variantsMap)
interface Variant {
  availabilityStatus?: string;
  imageUrl?: string;
  priceInfo?: {
    currentPrice?: {
      price: number;
      priceString: string;
    };
  };
  variants?: string[];
}

// Define the interface for Analysis component props
interface AnalysisProps {
  product: Product;
  areSectionsOpen: boolean;
}

/////////////////////////////////////////////////
// State and Hooks
/////////////////////////////////////////////////
export const Analysis: React.FC<AnalysisProps> = ({ product, areSectionsOpen }) => {
  // State for controlling section visibility
  const [isOpen, setIsOpen] = useState(areSectionsOpen);

  // State to store detailed product information, fetched using `getData.ts`
  const [productDetailsUsed, setProductDetailsUsed] = useState<Product | null>(null);

  // State to keep track of the extracted data of all captured sellers
  const [capturedData, setCapturedData] = useState<any[]>([]);

  // State to control if the seller table is expanded or collapsed
  const [isTableExpanded, setIsTableExpanded] = useState(true);

  // State to track when specific data is copied to the clipboard
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Calculate the number of WFS sellers (including Brand-WFS)
  const wfsSellerCount = capturedData.filter(
    seller =>
      seller.fulfillmentStatus === "WFS" || seller.fulfillmentStatus === "Brand-WFS"
  ).length;

  // Check if the brand is one of the sellers
  const isBrandSelling = capturedData.some((seller) =>
    productDetailsUsed?.brand && seller.sellerName &&
    productDetailsUsed?.brand.toLowerCase().split(' ').some(brandPart =>
      seller.sellerName.toLowerCase().includes(brandPart)
    )
  );

  // Sync isOpen state with the passed prop value to control visibility externally
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Fetch product data from getData and update the state for productDetails and totalSellers
  useEffect(() => {
    const productData = getProductDetails();
    if (productData) {
      setProductDetailsUsed(productData);
    } else {
      console.error("Error loading product data");
    }
  }, []);

  // Primary function to capture seller data based on the number of sellers
  useEffect(() => {
    if (productDetailsUsed?.totalSellers && productDetailsUsed.totalSellers > 1) {
      // Multi-seller scenario
      const captureSellerData = async () => {
        const compareSellersButton = document.querySelector("[aria-label='Compare all sellers']") as HTMLButtonElement;

        if (compareSellersButton) {
          compareSellersButton.click();
          const modalNode = await waitForModal();

          // Observe changes in the modal to capture seller data
          const observer = observeDomChanges(modalNode);

          // Disconnect observer after a set period
          setTimeout(() => {
            if (observer) observer.disconnect();
            closeModalIfOpen();
          }, MODAL_WAIT_TIMEOUT);
        } else {
          extractSingleSellerData();
        }
      };

      captureSellerData();
    } else if (productDetailsUsed?.totalSellers === 1) {
      // Single seller scenario
      extractSingleSellerData();
    }
  }, [productDetailsUsed?.totalSellers]);




  /////////////////////////////////////////////////////
  // Helper Functions
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
   * Function to observe DOM changes for a given target node.
   * @param {HTMLElement} targetNode - The HTML node to observe.
   * @returns {MutationObserver | null} The observer instance or null if no node provided.
   */
  const observeDomChanges = (targetNode: HTMLElement): MutationObserver | null => {
    if (targetNode) {
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            setTimeout(() => {
              const jsonData = extractDataFromModal(targetNode);
              setCapturedData(jsonData);
              closeModalIfOpen();
            }, MODAL_WAIT_INTERVAL); // Extract data after interval
          }
        });
      });

      observer.observe(targetNode, { childList: true, subtree: true });
      return observer;
    }
    return null;
  };

  /**
   * Function to wait for a modal to appear in the DOM.
   * @returns {Promise<HTMLElement>} Resolves with the modal node.
   */
  const waitForModal = (): Promise<HTMLElement> => {
    return new Promise<HTMLElement>((resolve) => {
      const checkButtonExist = setInterval(() => {
        const compareButton = document.querySelector("button[aria-label='Compare all sellers']") as HTMLButtonElement;

        if (compareButton) {
          compareButton.click();
          clearInterval(checkButtonExist);

          const checkModalExist = setInterval(() => {
            const modalNode = document.querySelector(MODAL_SELECTOR) as HTMLElement;
            if (modalNode) {
              clearInterval(checkModalExist);
              resolve(modalNode);
            }
          }, MODAL_WAIT_INTERVAL); // Using polling interval constant
        }
      }, MODAL_WAIT_INTERVAL);
    });
  };

  /**
   * Function to close a modal if it is currently open.
   */
  const closeModalIfOpen = () => {
    const closeButton = document.querySelector(MODAL_CLOSE_BUTTON_SELECTOR) as HTMLElement | null;

    if (closeButton) {
      closeButton.click(); // Close modal using close button if found
    } else {
      const modalNode = document.querySelector(MODAL_SELECTOR) as HTMLElement | null;
      if (modalNode) {
        modalNode.style.display = "none"; // Hide modal if no close button available
      }
    }
  };

  /**
   * Function to extract data from a single seller if no comparison modal is present.
   */
  const extractSingleSellerData = () => {
    if (!productDetailsUsed) {
      console.error("Product details are not available for single seller extraction.");
      return;
    }
    // Extract offer price
    const price = productDetailsUsed.currentPrice || null;
    let seller = productDetailsUsed.sellerDisplayName || productDetailsUsed.sellerName || UNKNOWN_SELLER;

    // Extract seller name
    const sellerElement = document.querySelector(SINGLE_SELLER_INFO_SELECTOR);
    if (!seller && sellerElement) {
      const sellerLink = sellerElement.querySelector("a[data-testid='seller-name-link']");
      seller = sellerLink ? sellerLink.textContent.trim() : sellerElement.getAttribute("aria-label")?.replace("Sold and shipped by ", "").trim() || UNKNOWN_SELLER;
    }

    // Determine if pro seller 
    const isProSeller = !!document.querySelector(PRO_SELLER_INDICATOR)?.textContent.includes("Pro Seller");

    // Determine if WFS
    const walmartFulfilled = !!document.querySelector(WALMART_DELIVERY_SELECTOR);

    // Determine if brand is the seller
    const brandMatchesSeller =
      productDetailsUsed?.brand &&
      seller &&
      productDetailsUsed.brand.toLowerCase().split(" ").some((brandPart) => seller.toLowerCase().includes(brandPart));

    // Set fulfillment status based on conditions
    const fulfillmentStatus =
      seller === "Walmart.com"
        ? "WMT"
        : brandMatchesSeller
          ? (walmartFulfilled
            ? "Brand-WFS"
            : "Brand-SF")
          : walmartFulfilled
            ? "WFS"
            : "SF";

    // Update `capturedData` with the single seller's data
    const singleSellerData = [{
      priceInfo: {
        currentPrice: {
          price: price,
          priceString: price !== null ? `$${price.toFixed(2)}` : "-"
        }
      },
      sellerName: seller,
      isProSeller,
      fulfillmentStatus
    }];
    setCapturedData(singleSellerData);

    console.log("Captured data for single seller:", singleSellerData);
  };

  /**
   * Function to extract JSON data from a modal and return an array of seller details.
   * @param {HTMLElement} modalNode - The modal node to extract data from.
   * @returns {Array} Array of extracted seller data.
   */
  const extractDataFromModal = (modalNode: HTMLElement) => {
    const data: Array<{
      priceInfo: { currentPrice: { price: number | null; priceString: string } };
      sellerName: string | null;
      isProSeller: boolean;
      fulfillmentStatus: string;
      arrivalDate: string | null; // Add arrival date to captured data
    }> = [];

    // Select all offers for the sellers in the modal
    const offers = modalNode.querySelectorAll("[data-testid='allSellersOfferLine']");

    // Iterate through each offer to extract seller information
    offers.forEach((offer) => {
      // Extract price
      const priceElement = offer.querySelector(".b.f4.w-50");
      const price = priceElement ? parseFloat(priceElement.textContent.replace(/[^0-9.]/g, '')) : null;

      // Extract arrival date
      const arrivalElement = offer.querySelector("span.b.black");
      const arrivalDateMatch = arrivalElement?.textContent?.match(/arrives by [a-zA-Z]+, ([a-zA-Z]+ \d+)/);
      const arrivalDate = arrivalDateMatch ? arrivalDateMatch[1] : null;

      // Extract seller name, prioritizing `aria-label` if it includes "Sold and shipped by"
      const sellerInfoElement = offer.querySelector("[data-testid='product-seller-info']");
      const sellerAriaLabel = sellerInfoElement?.getAttribute("aria-label")?.toLowerCase();

      // Determine the seller name, prioritizing `aria-label` when necessary
      let seller = sellerInfoElement?.querySelector("[data-testid='seller-name-link']")?.textContent.trim() || null;
      if (!seller && sellerAriaLabel?.includes("walmart.com")) {
        seller = "Walmart.com";
      } else if (!seller && sellerAriaLabel?.includes("sold and shipped by")) {
        seller = sellerAriaLabel.replace("sold and shipped by", "").trim();
      }

      // Determine if pro seller 
      const isProSeller = !!document.querySelector(PRO_SELLER_INDICATOR)?.textContent.includes("Pro Seller");

      // Check for Walmart Fulfilled
      const walmartFulfilled = !!document.querySelector(WALMART_DELIVERY_SELECTOR);

      // Determine if brand matches seller
      const brandMatchesSeller =
        productDetailsUsed?.brand &&
        seller &&
        productDetailsUsed.brand.toLowerCase().split(" ").some((brandPart) => seller.toLowerCase().includes(brandPart));
      //OLD const brandMatchesSeller = product.brand && seller && product.brand.toLowerCase().split(' ').some(brandPart => seller.toLowerCase().includes(brandPart));

      // Set fulfillment status based on the conditions
      let fulfillmentStatus;
      if (seller === "Walmart.com") {
        fulfillmentStatus = "WMT"; // Walmart's own fulfillment
      } else if (brandMatchesSeller) {
        if (walmartFulfilled) {
          fulfillmentStatus = "Brand-WFS"; // Brand fulfilled by Walmart (WFS)
        } else if (sellerAriaLabel?.includes("sold and shipped by")) {
          fulfillmentStatus = "Brand-SF"; // Brand fulfilled by the seller directly (SF)
        } else {
          fulfillmentStatus = "Brand-?";
        }
      } else if (walmartFulfilled) {
        fulfillmentStatus = "WFS"; // Other sellers using Walmart Fulfillment (WFS)
      } else if (sellerAriaLabel?.includes("sold and shipped by")) {
        fulfillmentStatus = "SF"; // Default to Seller Fulfilled (SF) for others
      } else {
        fulfillmentStatus = "?";
      }

      data.push({
        priceInfo: { currentPrice: { price: price, priceString: price !== null ? `$${price.toFixed(2)}` : "-" } },
        sellerName: seller,
        isProSeller,
        fulfillmentStatus,
        arrivalDate, // Add extracted arrival date
      });
    });

    console.log("Captured data from multiple sellers:", data); // Log the final data array

    closeModalIfOpen();

    return data;
  };


  /////////////////////////////////////////////////////
  // OTHER FUNCTIONS
  /////////////////////////////////////////////////////
  /**
   * Apply formatting to the total ratings element based on the settings and product ratings.
   * @returns {string} The CSS classes to apply for styling the total ratings element.
   */
  const applyTotalRatingsHighlight = (): string => {
    // Get total ratings from product details
    const totalRatings = productDetailsUsed?.numberOfRatings || 0;

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
      productDetailsUsed?.reviewDates?.filter((date) => getDaysAgo(date) <= 30).length || 0;

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
      typeof productDetailsUsed?.overallRating === "number"
        ? productDetailsUsed.overallRating
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
    const currentWfsSellers = capturedData.filter(
      seller => seller.fulfillmentStatus === "WFS"
    ).length;

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


  // Function to close the modal after extracting data
  const closeModal = () => {
    const closeButton = document.querySelector(MODAL_CLOSE_BUTTON_SELECTOR) as HTMLButtonElement | null;

    if (closeButton) {
      closeButton.click(); // Close the modal if button is found
    } else {
      const modalNode = document.querySelector(MODAL_SELECTOR) as HTMLElement | null;
      if (modalNode) {
        modalNode.style.display = "none"; // Hide modal if no close button
      }
    }
  };


  /////////////////////////////////////////////////////
  // Event Handlers
  /////////////////////////////////////////////////////
  /**
   * Event handler to toggle the visibility of the analysis component.
   * Updates the state to either expand or collapse the component.
   */
  const toggleOpen = (): void => {
    setIsOpen((prev) => !prev);
  };
  /**
   * Event handler to expand or collapse the seller data table.
   * Updates the state controlling the table's expanded view.
   */
  const toggleTable = (): void => {
    setIsTableExpanded((prev) => !prev);
  };

  /**
   * Event handler for copying specific product information to the clipboard.
   * @param {string | number} value - The value to be copied to the clipboard.
   * @param {number} index - The index of the copied item.
   */
  const handleCopy = (value: string | number, index: number): void => {
    navigator.clipboard.writeText(String(value));
    setCopiedIndex(index);
  };

  /////////////////////////////////////////////////////
  // JSX (Return)
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
              {productDetailsUsed ? productDetailsUsed.numberOfRatings : "-"}
            </p>
          </div>

          {/* Total Reviews */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Total Reviews
            </p>
            <p className={CLASS_DEFAULT_CONTENT}>
              {productDetailsUsed ? productDetailsUsed.numberOfReviews : "-"} {/* Display total reviews */}
            </p>
          </div>

          {/* Overall Rating */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Overall Rating
            </p>
            <p className={`${applyOverallRatingHighlight()}`}>
              {productDetailsUsed && typeof productDetailsUsed.overallRating === "number"
                ? productDetailsUsed.overallRating.toFixed(1)
                : "-"} {/* Display overall rating */}
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
              {productDetailsUsed && productDetailsUsed.reviewDates && productDetailsUsed.reviewDates.length > 0
                ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 mx-10 justify-center">
                    {productDetailsUsed.reviewDates
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
                          circleLabel = '  ';
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
              {productDetailsUsed?.stock || "-"}
            </p>
          </div>
        </div>

        <div className="w-[95%] mx-auto px-2 pb-4 flex justify-between items-center">

          {/* Shipping Stock */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Shipping Stock
            </p>
            <p className={CLASS_DEFAULT_CONTENT}>
              {productDetailsUsed?.fulfillmentOptions?.[0]?.availableQuantity || 0}
            </p>
          </div>

          {/* Pickup Stock */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Pickup Stock
            </p>
            <p className={CLASS_DEFAULT_CONTENT}>
              {productDetailsUsed?.fulfillmentOptions?.[1]?.availableQuantity || 0}
            </p>
          </div>

          {/* Delivery Stock */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Delivery Stock
            </p>
            <p className={CLASS_DEFAULT_CONTENT}>
              {productDetailsUsed?.fulfillmentOptions?.[2]?.availableQuantity || 0}
            </p>
          </div>
        </div>


        {/* Top Seller Section: Seller Information */}
        <div className="w-full p-2 flex justify-between items-center">

          {/* Total Sellers */}
          <div className="w-full p-1">
            <p className={CLASS_SECTION_HEADER}>
              Total Sellers
            </p>
            <p className={CLASS_DEFAULT_CONTENT}>
              {productDetailsUsed?.totalSellers || "-"}            </p>
          </div>
        </div>

        <div className="w-[95%] mx-auto px-2 pb-4 flex justify-between items-center">

          {/* WFS Sellers */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              WFS Sellers
            </p>
            <p
              className={`${applyMaxWfsSellersHighlight()}`} // Apply visual styling based on the settings
            >
              {wfsSellerCount || "-"}
            </p>
          </div>

          {/* Walmart Sells */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Walmart Sells
            </p>
            <p
              className={`${CLASS_DEFAULT_CONTENT} ${productDetailsUsed?.sellerName === "Walmart.com"
                ? CLASS_SECTION_CONTENT_RED
                : CLASS_SECTION_CONTENT_GREEN
                }`}
            >
              {productDetailsUsed?.sellerName === "Walmart.com" ? "YES" : "NO"}
            </p>
          </div>

          {/* Brand Sells */}
          <div className="w-1/3 p-1">
            <p className={CLASS_SECTION_HEADER}>
              Brand Sells
            </p>
            <p
              className={`${CLASS_DEFAULT_CONTENT} ${isBrandSelling
                ? CLASS_SECTION_CONTENT_RED
                : CLASS_SECTION_CONTENT_GREEN
                }`}
            >
              {isBrandSelling ? "YES" : "NO"}
            </p>
          </div>

        </div>

        {/* Bottom Seller Section: Seller Table */}

        {/* Toggle Button for the Seller Table */}
        <div className="flex items-center justify-start px-2">
          <button
            onClick={toggleTable}
            className="text-xs font-semibold px-2 py-0.5 bg-gray-200 rounded shadow hover:bg-gray-300 border border-gray-400"
            aria-label="Toggle seller table"
          >
            {isTableExpanded ? "🔼" : "🔽"}
          </button>
        </div>

        {/* Conditionally Render the Seller Table */}
        <div className="w-full px-2 pb-2">
          <table className="min-w-full border-collapse border border-black">

            {/* Table Header */}
            <thead>
              <tr>
                <th className={"py-1 text-xs text-white bg-[#3a3f47] uppercase border-2 border-black"}>
                  SELLER NAME
                </th>
                <th className={"py-1 text-xs text-white bg-[#3a3f47] uppercase border-2 border-black"}>
                  PRICE
                </th>
                <th className={"py-1 text-xs text-white bg-[#3a3f47] uppercase border-2 border-black"}>
                  TYPE
                </th>
                <th className={"py-1 text-xs text-white bg-[#3a3f47] uppercase border-2 border-black"}>
                  ARRIVES
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            {isTableExpanded && (
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Check if capturedData has data */}
                {capturedData && capturedData.length > 0 ? (
                  capturedData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100">

                      {/* Seller Name */}
                      <td className="px-1 text-center text-2xs border-2 border-black bg-white">
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                          {item.sellerName || "-"}
                          {item.isProSeller && (
                            <FiCheckCircle style={{ color: "#006EDC", fontSize: "14px", marginLeft: "5px", }} />
                          )}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-1 text-center whitespace-nowrap text-2xs border-2 border-black bg-white">
                        {item.priceInfo?.currentPrice?.priceString || "-"}
                      </td>

                      {/* Fulfillment Status */}
                      <td className="px-1 text-center whitespace-nowrap text-2xs border-2 border-black bg-white">
                        {item.fulfillmentStatus === "WMT" ? (
                          <span className="bg-blue-100 border-blue-500 text-blue-700 font-bold border rounded-lg px-2">
                            WMT
                          </span>
                        ) : item.fulfillmentStatus === "Brand-WFS" ? (
                          <span className="bg-purple-100 border-purple-500 text-purple-700 font-bold border rounded-lg px-2">
                            Brand-WFS
                          </span>
                        ) : item.fulfillmentStatus === "Brand-SF" ? (
                          <span className="bg-purple-100 border-purple-500 text-purple-700 font-bold border rounded-lg px-2">
                            Brand-SF
                          </span>
                        ) : item.fulfillmentStatus === "Brand-?" ? (
                          <span className="bg-purple-100 border-purple-500 text-purple-700 font-bold border rounded-lg px-2">
                            Brand-?
                          </span>
                        ) : item.fulfillmentStatus === "WFS" ? (
                          <span className="bg-red-100 border-red-500 text-red-700 font-bold border rounded-lg px-2">
                            WFS
                          </span>
                        ) : item.fulfillmentStatus === "SF" ? (
                          <span className="bg-green-100 border-green-500 text-green-700 font-bold border rounded-lg px-2">
                            SF
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-black-700 font-bold border border-red-500 rounded-lg px-2">
                            ?
                          </span>
                        )}
                      </td>

                      {/* Arrival Date */}
                      <td className="px-1 text-center whitespace-nowrap text-2xs border-2 border-black bg-white">
                        {item.arrivalDate || "-"} {/* Display extracted arrival date */}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4}
                      className="px-2 py-4 text-center text-xs text-gray-500 italic border-2 border-black bg-white"
                    >
                      No seller data available
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>

        </div>

      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement
////////////////////////////////////////////////
export default Analysis;
