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
import { Analysis } from "~components/Analysis";
import { BuyGauge } from "~components/BuyGauge";
import { Footer } from "~components/Footer";
import { ListingExport } from "~components/ListingExport";
import { Pricing } from "~components/Pricing";
import { Product } from "~components/Product";
import { ProductInfo } from "~components/ProductInfo";
import { TopHeader } from "~components/TopHeader";
import { Variations } from "~components/Variations";
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
  if (!window.location.href.startsWith("https://www.walmart.com/ip/")) {
    return null;
  }

  // State variables

  // State to track if the sidebar is open or closed
  const [isOpen, setIsOpen] = useState(true);
  // State to trigger refresh on the page when the URL changes
  const [refresh, setRefresh] = useState(false);
  // State to store product details fetched from the page
  const [productDetails, setProductDetails] = useState(null);
  // State to track whether all sections in the UI are expanded or collapsed
  const [areSectionsOpen, setAreSectionsOpen] = useState(true); // Track if all sections are expanded or collapsed
  // Expand/Collapse handler to toggle the open/close state of all sections
  const toggleSections = () => { setAreSectionsOpen(!areSectionsOpen); }; // Toggle the open/close state of sections


  // useEffect hook to detect changes in the URL and refresh product data accordingly
  useEffect(() => {
    const handleUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl.startsWith("https://www.walmart.com/ip/")) {
        setRefresh((prev) => !prev);
      }
    };

    // Listen for URL changes using the History API
    window.addEventListener('popstate', handleUrlChange);
    
    // Also listen for pushState and replaceState calls
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleUrlChange();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleUrlChange();
    };

    // Initial check
    handleUrlChange();

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  // useEffect hook to toggle CSS class when the sidebar is opened or closed
  useEffect(() => {
    document.body.classList.toggle("plasmo-google-sidebar-show", isOpen);
  }, [isOpen]);

  // useEffect hook to fetch product details whenever the refresh state changes
  useEffect(() => {
    setProductDetails(getData());
  }, [refresh]);
  
  //////////////////////////////////////////////////
  // Helper Functions:
  //////////////////////////////////////////////////
  // No helper functions at the moment. This section can be used for reusable utility functions.

  //////////////////////////////////////////////////
  // Event Handlers:
  //////////////////////////////////////////////////
  // No separate event handlers defined here, but toggleSections function could be moved here if preferred.

  //////////////////////////////////////////////////
  // JSX (Return):
  //////////////////////////////////////////////////

  // Display loading indicator while product details are being fetched
  if (!productDetails) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div
      id="sidebar"
      style={{ backgroundColor: "#FBFBFB" }}  // Explicitly set background color here
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

        {/* Expand/Collapse all sections button placed below Product and above BuyGauge */}
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
