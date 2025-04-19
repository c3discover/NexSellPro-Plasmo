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
import { getUsedData } from "~data/usedData";
import { clearProductCache } from "~services/productService";

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
  totalStock: number;
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
    numWfsSellers: 0,
    totalStock: 0
  });

  ////////////////////////////////////////////////
  // Message Handlers:
  ////////////////////////////////////////////////
  const handleMessage = async (message: any) => {
    if (message.type === 'URL_CHANGED') {
      
      // Update URL state
      setCurrentUrl(message.url);
      
      // Handle product page state
      if (message.isProductPage) {
        // Clear cache before getting new data
        clearProductCache();
        
        // Get new product data using getUsedData instead of getData
        // Note: Since getUsedData requires a productId, we extract it from the URL
        const productId = message.url.split('/ip/')[1]?.split('/')[0] || '';
        if (productId) {
          const data = await getUsedData(productId);
          if (data) {
            setProductDetails(data);
            document.body.classList.add("plasmo-google-sidebar-show");
          } else {
            setProductDetails(null);
            document.body.classList.remove("plasmo-google-sidebar-show");
          }
        }
      } else {
        setProductDetails(null);
        document.body.classList.remove("plasmo-google-sidebar-show");
      }
    }
    return true; // Keep the message channel open
  };

  ////////////////////////////////////////////////
  // URL Change Detection:
  ////////////////////////////////////////////////
  useEffect(() => {
    let lastUrl = window.location.href;
    
    // Function to check URL changes
    const checkForUrlChange = async () => {
      try {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
          lastUrl = currentUrl;
          
          const isProductPage = currentUrl.includes("/ip/");
          if (isProductPage) {
            clearProductCache();
            
            // Extract productId from URL
            const productId = currentUrl.split('/ip/')[1]?.split('/')[0] || '';
            if (productId) {
              const data = await getUsedData(productId);
              if (data) {
                setProductDetails(data);
                document.body.classList.add("plasmo-google-sidebar-show");
              }
            }
          } else {
            setProductDetails(null);
            document.body.classList.remove("plasmo-google-sidebar-show");
          }
        }
      } catch (error) {
        console.error('Error in checkForUrlChange:', error);
      }
    };

    // Set up observers for URL changes
    const observer = new MutationObserver((mutations) => {
      // Only check for URL changes if the mutation is relevant
      if (mutations.some(mutation => 
        mutation.type === 'childList' && 
        mutation.target === document.body
      )) {
        checkForUrlChange();
      }
    });

    // Observe only the body element
    if (document.body) {
      observer.observe(document.body, { 
        childList: true,
        subtree: false 
      });
    }

    // Check URL changes on history events
    window.addEventListener('popstate', checkForUrlChange);
    window.addEventListener('pushState', checkForUrlChange);
    window.addEventListener('replaceState', checkForUrlChange);

    // Initial page check
    const checkInitialPage = async () => {
      try {
        const currentLocation = window.location.href;
        if (currentLocation.includes("/ip/")) {
          // Extract productId from URL
          const productId = currentLocation.split('/ip/')[1]?.split('/')[0] || '';
          if (productId) {
            const data = await getUsedData(productId);
            if (data) {
              setProductDetails(data);
              document.body.classList.add("plasmo-google-sidebar-show");
            }
          }
        }
      } catch (error) {
        console.error('Error in checkInitialPage:', error);
      }
    };

    // Run initial check
    checkInitialPage();

    // Cleanup function
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', checkForUrlChange);
      window.removeEventListener('pushState', checkForUrlChange);
      window.removeEventListener('replaceState', checkForUrlChange);
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
        className="fixed right-[-25px] top-1/2 -translate-y-1/2 p-3 bg-[#3a3f47] text-sm font-medium rounded-l-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl border border-black-600 flex items-center justify-center group z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg 
            className={`w-7 h-5 text-white transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none" 
            viewBox="0 0 4 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </div>
      </button>

      {/* Main content of the sidebar */}
      <div className="flex flex-col space-y-5">
        <TopHeader />
        <Product />

        {/* Expand/Collapse all sections button */}
        <div style={{ display: 'inline-block' }}>
          <button
            className={`pl-1 py-1 pr-4 bg-[#3a3f47] font-medium text-white text-start !text-[12px] rounded-xl drop-shadow-xl`}
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
            minProfit: productDetails?.baselineMetrics?.minProfit,
            minMargin: productDetails?.baselineMetrics?.minMargin,
            minROI: productDetails?.baselineMetrics?.minROI,
            minTotalRatings: productDetails?.baselineMetrics?.minTotalRatings,
            minRatings30Days: productDetails?.baselineMetrics?.minRatings30Days,
            maxSellers: productDetails?.baselineMetrics?.maxSellers,
            maxWfsSellers: productDetails?.baselineMetrics?.maxWfsSellers,
            maxStock: productDetails?.baselineMetrics?.maxStock
          }}
        />
        <Pricing 
          product={productDetails} 
          areSectionsOpen={areSectionsOpen}
          onMetricsUpdate={setMetrics}
          settings={{
            profit: metrics.profit,
            margin: metrics.margin,
            roi: metrics.roi,
            totalRatings: metrics.totalRatings,
            ratingsLast30Days: metrics.ratingsLast30Days,
            numSellers: metrics.numSellers,
            numWfsSellers: metrics.numWfsSellers,
            totalStock: metrics.totalStock
          }}
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
