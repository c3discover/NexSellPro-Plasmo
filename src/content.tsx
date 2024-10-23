import iconBase64 from "data-base64:~assets/icon.png";
import cssText from "data-text:~/style.css";
import type { PlasmoCSConfig } from "plasmo";
import { useEffect, useState } from "react";

// Inject to the webpage itself
import "./style.css";

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

export const config: PlasmoCSConfig = {
  matches: ["https://www.walmart.com/*"]
};

// Inject into the ShadowDOM
export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

export const getShadowHostId = () => "plasmo-google-sidebar";

const ContentUI = () => {
  if (!window.location.href.startsWith("https://www.walmart.com/ip/")) {
    return null;
  }
  const [isOpen, setIsOpen] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [areSectionsOpen, setAreSectionsOpen] = useState(true); // Track if all sections are expanded or collapsed

  // Expand/Collapse handler
  const toggleSections = () => {
    setAreSectionsOpen(!areSectionsOpen); // Toggle the open/close state of sections
  };

  // if window url changes, refresh the page
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (window.location.href.startsWith("https://www.walmart.com/ip/")) {
        window.location.reload();
        setRefresh(!refresh);
      }
    });
    observer.observe(document.querySelector("title"), {
      childList: true,
      subtree: true
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("plasmo-google-sidebar-show", isOpen);
  }, [isOpen]);

  useEffect(() => {
    console.log("page refreshed");
    setProductDetails(getData());
  }, [refresh]);

  if (!productDetails) {
    return <div>Loading</div>;
  }

  return (
    <div
      id="sidebar"
      style={{ backgroundColor: "#FBFBFB" }}
      className={`w-full h-full flex flex-col p-4 ${isOpen ? "open" : "closed"}`}
    >
      <button
        className={`sidebar-toggle mt-2 bg-gray-100 text-gray-700 font-bold text-xs py-2 px-4 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-150 border border-gray-400`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "🔴 Close" : "🟢 Open"}
      </button>

      <div className="flex flex-col space-y-5">
        <TopHeader />
        <Product product={productDetails} />

        {/* Expand/Collapse all sections button placed below Product and above BuyGauge */}
        <div style={{ display: 'inline-block' }}>
          <button
            className={`pr-4 space-y-3 w-auto bg-[#3a3f47] font-bold text-white text-left text-xs rounded-xl drop-shadow-xl`}
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

export default ContentUI;
