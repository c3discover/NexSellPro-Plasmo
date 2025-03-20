/**
 * @fileoverview Main content script component for the Walmart product analysis extension
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// Importing the text of the CSS file for styling
import cssText from "data-text:~/style.css";
// Importing types for Plasmo content script configuration
import type { PlasmoCSConfig } from "plasmo";
// Importing React hooks for managing component state and lifecycle
import { useEffect, useState } from "react";

// Inject to the webpage itself
import "./style.css";

// Importing extension components used in the UI
import { Analysis } from "~components/6Analysis/Analysis";
import { BuyGauge } from "~components/3BuyGauge/BuyGauge";
import { Footer } from "~components/9Footer/Footer";
import { ListingExport } from "~components/8ListingExport/ListingExport";
import { Pricing } from "~components/4Pricing/Pricing";
import { Product } from "~components/2ProductOverview/Product";
import { ProductInfo } from "~components/5ProductInfo/ProductInfo";
import { TopHeader } from "~components/1Header/TopHeader";
import { Variations } from "~components/7Variations/Variations";
import getData from "~utils/getData";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Plasmo content script configuration that defines which URLs the content script should run on
export const config: PlasmoCSConfig = {
  matches: ["https://www.walmart.com/*"]
};

// ShadowDOM style injection function
export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

// Function to get the ShadowDOM host ID
export const getShadowHostId = () => "plasmo-google-sidebar";

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Interface for product metrics state
interface ProductMetrics {
  profit: number;
  margin: number;
  roi: number;
  totalRatings: number;
  ratingsLast30Days: number;
  numSellers: number;
  numWfsSellers: number;
}

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// No props interface needed as this is the root component

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
const ContentUI = () => {
  ////////////////////////////////////////////////
  // State and Hooks:
  ////////////////////////////////////////////////
  // State for controlling sidebar visibility
  const [isOpen, setIsOpen] = useState(true);
  // State for storing product details
  const [productDetails, setProductDetails] = useState(null);
  // State for controlling section expansion/collapse
  const [areSectionsOpen, setAreSectionsOpen] = useState(true);
  // State for tracking current URL
  const [currentUrl, setCurrentUrl] = useState(window.location.href);
  // State for storing product metrics
  const [metrics, setMetrics] = useState<ProductMetrics>({
    profit: 0,
    margin: 0,
    roi: 0,
    totalRatings: 0,
    ratingsLast30Days: 0,
    numSellers: 0,
    numWfsSellers: 0
  });

  ////////////////////////////////////////////////
  // Chrome API Handlers:
  ////////////////////////////////////////////////
  // URL monitoring effect
  useEffect(() => {
    let lastUrl = window.location.href;

    // Function to check URL changes
    const checkForUrlChange = () => {
      const newUrl = window.location.href;
      
      // Always update currentUrl to trigger the effect
      setCurrentUrl(newUrl);
      
      // If URL actually changed, handle cleanup
      if (newUrl !== lastUrl) {
        lastUrl = newUrl;
        if (!newUrl.includes("/ip/")) {
          setProductDetails(null);
          document.body.classList.remove("plasmo-google-sidebar-show");
        }
      }
    };

    // Check immediately
    checkForUrlChange();

    // Set up interval to check URL
    const interval = setInterval(checkForUrlChange, 100);

    // Listen for URL changes from background script as backup
    const handleMessage = (message: any) => {
      if (message.type === 'URL_CHANGED') {
        checkForUrlChange();
      }
    };

    try {
      chrome.runtime.onMessage.addListener(handleMessage);
    } catch (error) {
      // Attempt to gracefully handle the error
      if (chrome.runtime && chrome.runtime.reload) {
        chrome.runtime.reload();
      }
    }

    // Cleanup function to remove listeners and clear classes
    return () => {
      clearInterval(interval);
      try {
        chrome.runtime.onMessage.removeListener(handleMessage);
      } catch (error) {
      }
      document.body.classList.remove("plasmo-google-sidebar-show");
    };
  }, []);

  ////////////////////////////////////////////////
  // Event Handlers:
  ////////////////////////////////////////////////
  // Handler for toggling section expansion/collapse
  const toggleSections = () => {
    setAreSectionsOpen(!areSectionsOpen);
  };

  ////////////////////////////////////////////////
  // Helper Functions:
  ////////////////////////////////////////////////
  // Effect to update product details when URL changes
  useEffect(() => {
    const isProductPage = currentUrl.includes("/ip/");
    
    if (isProductPage) {
      const data = getData();
      if (data) {
        setProductDetails(data);
      } else {
        setProductDetails(null);
      }
    } else {
      setProductDetails(null);
    }
  }, [currentUrl]);

  // Effect to handle sidebar visibility
  useEffect(() => {
    const isProductPage = currentUrl.includes("/ip/");
    document.body.classList.toggle("plasmo-google-sidebar-show", isOpen && isProductPage && productDetails !== null);
    
    return () => {
      document.body.classList.remove("plasmo-google-sidebar-show");
    };
  }, [isOpen, currentUrl, productDetails]);

  // Don't render anything if not on a product page
  if (!currentUrl.includes("/ip/") || !productDetails) {
    return null;
  }

  ////////////////////////////////////////////////
  // Styles:
  ////////////////////////////////////////////////
  // Inline styles for the sidebar container
  const sidebarStyle = {
    backgroundColor: "#FBFBFB"
  };

  ////////////////////////////////////////////////
  // JSX:
  ////////////////////////////////////////////////
  return (
    <div
      id="sidebar"
      style={sidebarStyle}
      className={`absolute w-[400px] h-screen transition-all duration-500 ease-in-out mb-3 text-sm flex flex-col p-2 ${isOpen ? "open" : "closed"}`}
    >
      {/* Toggle button for sidebar open/close */}
      <button
        className="fixed right-[-10px] top-6 p-1 transform rotate-90 bg-[#d7d7d7] text-xl font-semibold rounded-lg shadow-lg transition-transform duration-200 ease-in-out hover:scale-110 hover:shadow-lg border-2 border-gray-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "🟢" : "🔴"}
      </button>

      {/* Main content of the sidebar */}
      <div className="flex flex-col space-y-5">
        <TopHeader />
        <Product />

        {/* Expand/Collapse all sections button */}
        <div style={{ display: 'inline-block' }}>
          <button
            className={`pl-1 py-1 pr-4 bg-[#3a3f47] font-semibold text-white text-start !text-sm rounded-xl drop-shadow-xl`}
            style={{ display: 'flex', justifyContent: 'flex-start', border: 'none' }}
            onClick={toggleSections}
          >
            {areSectionsOpen ? "🔺 Collapse All" : "🔻 Expand All"}
          </button>
        </div>

        {/* Product analysis components */}
        <BuyGauge 
          areSectionsOpen={areSectionsOpen} 
          productData={metrics}
          settings={{
            minProfit: productDetails?.settings?.minProfit,
            minMargin: productDetails?.settings?.minMargin,
            minROI: productDetails?.settings?.minROI,
            minTotalRatings: productDetails?.settings?.minTotalRatings,
            minRatings30Days: productDetails?.settings?.minRatings30Days,
            maxSellers: productDetails?.settings?.maxSellers,
            maxWfsSellers: productDetails?.settings?.maxWfsSellers
          }}
        />
        <Pricing 
          product={productDetails} 
          areSectionsOpen={areSectionsOpen}
          onMetricsUpdate={setMetrics}
        />
        <ProductInfo product={productDetails} areSectionsOpen={areSectionsOpen} />
        <Analysis product={productDetails} areSectionsOpen={areSectionsOpen} />
        <Variations
          variantsMap={productDetails?.variantsMap}
          areSectionsOpen={areSectionsOpen}
        />
        <ListingExport areSectionsOpen={areSectionsOpen} />
        <div id="space" className="min-h-4 flex"></div>
        <Footer />
        <div id="space" className="min-h-4 flex"></div>
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default ContentUI;
