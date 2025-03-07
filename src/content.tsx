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
// Props and Types:
////////////////////////////////////////////////

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
const ContentUI = () => {
  // State variables
  const [isOpen, setIsOpen] = useState(true);
  const [productDetails, setProductDetails] = useState(null);
  const [areSectionsOpen, setAreSectionsOpen] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);

  // URL monitoring
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

    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup
    return () => {
      clearInterval(interval);
      chrome.runtime.onMessage.removeListener(handleMessage);
      document.body.classList.remove("plasmo-google-sidebar-show");
    };
  }, []);

  // React to URL changes
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

  // Toggle sidebar visibility in the DOM
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

  // Expand/Collapse handler
  const toggleSections = () => {
    setAreSectionsOpen(!areSectionsOpen);
  };

  return (
    <div
      id="sidebar"
      style={{ backgroundColor: "#FBFBFB" }}
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

        <BuyGauge areSectionsOpen={areSectionsOpen} />
        <Pricing product={productDetails} areSectionsOpen={areSectionsOpen} />
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

// Exporting the ContentUI component as default
export default ContentUI;
