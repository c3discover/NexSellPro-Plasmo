////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect, useRef } from "react";
import { getUsedData } from "~/utils/usedData";
import type { UsedProductData } from "~/utils/usedData";
import getData from "~/utils/getData";
import { contractCategoryOptions } from "../constants/options";
import {
  calculateReferralFee,
  calculateWFSFee,
  calculateStorageFee,
  calculateCubicFeet,
  calculateFinalShippingWeightForInbound,
  calculateFinalShippingWeightForWFS,
  calculateStartingProductCost,
  calculateTotalProfit,
  calculateROI,
  calculateMargin,
  calculateAdditionalFees,
  calculateInboundShipping
} from "~/utils/calculations";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
const LOADING_MESSAGE = "Loading pricing data...";
const PRICE_HISTORY_DAYS = 30;
const CHART_COLORS = {
  primary: "#0284c7",    // Sky blue for main lines
  secondary: "#cbd5e1",  // Slate gray for grid lines
  text: "#1e293b"        // Slate blue for text
};

// Default Values
const DEFAULT_CONTRACT_CATEGORY = "Everything Else";
const DEFAULT_SEASON = "Jan-Sep";
const DEFAULT_STORAGE_LENGTH = 1;
const DEFAULT_INBOUND_RATE = 0.5;

// CSS Classes - Keep for consistent styling
const STYLES = {
  container: "items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl",
  header: "font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl",
  section: "flex flex-wrap",
  input: {
    header: "text-base font-bold",
    label: "text-xs p-0.5 mr-2 min-w-[120px] text-left whitespace-nowrap",
    right: "text-sm p-1 pr-3 text-right w-full border rounded-r h-5",
    left: "text-sm p-1 pl-3 text-left w-full border rounded-l h-5",
    leftPrefix: "p-1 inline-block border border-black rounded-l bg-gray-100 text-gray-700 text-xs h-5 flex items-center justify-center",
    rightPrefix: "p-1 inline-block border border-black rounded-r bg-gray-100 text-gray-700 text-xs h-5 flex items-center justify-center"
  }
};

const DEFAULT_HEADER_CLASS = STYLES.input.header;
const DEFAULT_LABEL_CLASS = STYLES.input.label;
const DEFAULT_RIGHT_INPUT_CLASS = STYLES.input.right;
const DEFAULT_LEFT_INPUT_CLASS = STYLES.input.left;
const DEFAULT_LEFT_PREFIX_SUFFIX_CLASS = STYLES.input.leftPrefix;
const DEFAULT_RIGHT_PREFIX_SUFFIX_CLASS = STYLES.input.rightPrefix;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
interface PricingProps {
  areSectionsOpen: boolean;
}

interface CalculationResult {
  value: number;
  error?: string;
}

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const Pricing: React.FC<PricingProps> = ({ areSectionsOpen }) => {
  // Component implementation will be in the following sections


  /////////////////////////////////////////////////
  // State and Hooks
  /////////////////////////////////////////////////
  // UI State
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [productData, setProductData] = useState<UsedProductData | null>(null);
  const [hasEdited, setHasEdited] = useState<{ [key: string]: boolean }>({});

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsedData();
      if (data) {
        setProductData(data);
        setSalePrice(data.pricing.currentPrice || 0);
        const initialProductCost = calculateStartingProductCost(data.pricing.currentPrice || 0);
        setProductCost(initialProductCost);
      }
    };
    fetchData();
  }, []);

  // General State (Group 1)
  const [contractCategory, setContractCategory] = useState<string>("Everything Else");
  const [season, setSeason] = useState<string>("Jan-Sep");
  const [storageLength, setStorageLength] = useState<number>(1);
  const [inboundShippingRate, setInboundShippingRate] = useState<number>(0.0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [roi, setROI] = useState(0);
  const [margin, setMargin] = useState(0);

  // Pricing State (Group 2)
  const [productCost, setProductCost] = useState<number>(0.0);
  const [rawProductCost, setRawProductCost] = useState<string | null>(null);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [rawSalePrice, setRawSalePrice] = useState<string | null>(null);

  const [isWalmartFulfilled, setIsWalmartFulfilled] = useState(() => {
    const savedPreference = localStorage.getItem("isWalmartFulfilled");
    return savedPreference === "true" || savedPreference === null; // Default to true
  });

  // Shipping Dimensions State (Group 3)
  const [shippingLength, setShippingLength] = useState<number>(0);
  const [rawLength, setRawLength] = useState<string | null>(null);
  const [shippingWidth, setShippingWidth] = useState<number>(0);
  const [rawWidth, setRawWidth] = useState<string | null>(null);
  const [shippingHeight, setShippingHeight] = useState<number>(0);
  const [rawHeight, setRawHeight] = useState<string | null>(null);
  const [weight, setWeight] = useState<number>(0);
  const [rawWeight, setRawWeight] = useState<string | null>(null);

  // Fees State (Group 4)
  const [referralFee, setReferralFee] = useState<number>(0);
  const [rawReferralFee, setRawReferralFee] = useState<string | null>(null);
  const [inboundShippingFee, setInboundShippingFee] = useState<number>(0);
  const [rawInboundShippingFee, setRawInboundShippingFee] = useState<string | null>(null);
  const [storageFee, setStorageFee] = useState<number>(0);
  const [rawStorageFee, setRawStorageFee] = useState<string | null>(null);
  const [prepFee, setPrepFee] = useState<number>(0);
  const [rawPrepFee, setRawPrepFee] = useState<string | null>(null);
  const [additionalFees, setAdditionalFees] = useState<number>(0);
  const [rawAdditionalFees, setRawAdditionalFees] = useState<string | null>(null);
  const [wfsFee, setWfsFee] = useState<number>(0);
  const [rawWfsFee, setRawWfsFee] = useState<string | null>(null);

  // Dynamically calculate values needed for WFS fee and other dimensions.
  const cubicFeet = calculateCubicFeet(shippingLength, shippingWidth, shippingHeight);

  const finalShippingWeightForInbound = calculateFinalShippingWeightForInbound(
    weight,
    shippingLength,
    shippingWidth,
    shippingHeight
  );

  const finalShippingWeightForWFS = calculateFinalShippingWeightForWFS(
    weight,
    shippingLength,
    shippingWidth,
    shippingHeight
  );

  // Product data for WFS fee calculation
  const productForWFSFee = {
    weight: finalShippingWeightForWFS,
    length: shippingLength,
    width: shippingWidth,
    height: shippingHeight,
    isWalmartFulfilled,
    isApparel: productData?.flags?.isApparel || false,
    isHazardousMaterial: productData?.flags?.isHazardousMaterial || false,
    retailPrice: productData?.pricing?.currentPrice || 0,
  };

  // Mutable reference for initialization checks
  const hasInitializedProductCost = useRef(false);

  // Add this near the top with other state declarations
  const [desiredMetrics, setDesiredMetrics] = useState({
    minProfit: 0,
    minMargin: 0,
    minROI: 0
  });

  // Add this with other useEffects
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    setDesiredMetrics({
      minProfit: parseFloat(storedMetrics.minProfit || "0"),
      minMargin: parseFloat(storedMetrics.minMargin || "0"),
      minROI: parseFloat(storedMetrics.minROI || "0")
    });
  }, []);



  ////////////////////////////////////////////////
  // Chrome API Handlers:
  ////////////////////////////////////////////////
  // No Chrome API handlers needed for this component





  ////////////////////////////////////////////////
  // Event Handlers:
  ////////////////////////////////////////////////
  // UI Events
  const toggleOpen = () => setIsOpen(!isOpen);
  const handlePriceChange = (value: string, setter: (value: number) => void) => {
    const numValue = parseFloat(value) || 0;
    setter(numValue);
  };

  // Data Update Events
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Initialize WFS Fee and ensure product cost is initialized.
  useEffect(() => {
    if (!hasInitializedProductCost.current) {
      const initialProductCost = calculateStartingProductCost(salePrice);
      setProductCost(initialProductCost);
      initializeWfsFee();
      hasInitializedProductCost.current = true;
    }
  }, [salePrice]);

  // Synchronize section visibility with props.
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Recalculate profit, ROI, and margin whenever key pricing variables change.
  useEffect(() => {
    const updatedTotalProfit = calculateTotalProfit(
      salePrice,
      productCost,
      referralFee,
      wfsFee,
      inboundShippingFee,
      storageFee,
      prepFee,
      additionalFees
    );

    setTotalProfit(updatedTotalProfit);

    // Convert calculateROI result to a number before setting state
    const calculatedROI = parseFloat(calculateROI(updatedTotalProfit, productCost));
    setROI(isNaN(calculatedROI) ? 0 : calculatedROI); // Handle invalid ROI

    // Set margin directly (assuming calculateMargin also returns a string)
    const calculatedMargin = parseFloat(calculateMargin(updatedTotalProfit, salePrice));
    setMargin(isNaN(calculatedMargin) ? 0 : calculatedMargin); // Handle invalid margin

  }, [
    salePrice,
    productCost,
    referralFee,
    wfsFee,
    inboundShippingFee,
    storageFee,
    prepFee,
    additionalFees,
  ]);

  // Dynamically recalculate fees based on fulfillment type and user edits.
  useEffect(() => {
    if (isWalmartFulfilled) {
      if (!hasEdited.wfsFee) {
        setWfsFee(calculateWFSFee(productForWFSFee));
      }
      if (!hasEdited.inboundShippingFee) {
        setInboundShippingFee(calculateInboundShipping(finalShippingWeightForInbound, true));
      }
      if (!hasEdited.storageFee) {
        setStorageFee(parseFloat(calculateStorageFee(season, cubicFeet, storageLength)) || 0);
      }
    } else {
      if (!hasEdited.wfsFee) setWfsFee(0);
      if (!hasEdited.inboundShippingFee) {
        setInboundShippingFee(calculateInboundShipping(finalShippingWeightForInbound, false));
      }
      if (!hasEdited.storageFee) setStorageFee(0);
    }
  }, [
    isWalmartFulfilled,
    productForWFSFee,
    season,
    cubicFeet,
    storageLength,
    finalShippingWeightForInbound,
    hasEdited,
  ]);

  // Load and save fulfillment preferences to localStorage.
  useEffect(() => {
    const savedPreference = localStorage.getItem("isWalmartFulfilled");
    setIsWalmartFulfilled(savedPreference === "true" || savedPreference === null);
  }, []);

  useEffect(() => {
    localStorage.setItem("isWalmartFulfilled", isWalmartFulfilled.toString());
  }, [isWalmartFulfilled]);

  // Load shipping dimensions from localStorage or product data
  useEffect(() => {
    const storedDimensions = JSON.parse(localStorage.getItem("shippingDimensions") || "null");
    
    if (storedDimensions) {
      setShippingLength(parseFloat(storedDimensions.length) || 0);
      setShippingWidth(parseFloat(storedDimensions.width) || 0);
      setShippingHeight(parseFloat(storedDimensions.height) || 0);
      setWeight(parseFloat(storedDimensions.weight) || 0);
    } else if (productData?.dimensions) {
      setShippingLength(parseFloat(productData.dimensions.shippingLength?.toString() || "0"));
      setShippingWidth(parseFloat(productData.dimensions.shippingWidth?.toString() || "0"));
      setShippingHeight(parseFloat(productData.dimensions.shippingHeight?.toString() || "0"));
      setWeight(parseFloat(productData.dimensions.weight?.toString() || "0"));
    }
  }, [productData]);

  // Save shipping dimensions to localStorage when they change
  useEffect(() => {
    localStorage.setItem("shippingDimensions", JSON.stringify({
      length: shippingLength,
      width: shippingWidth,
      height: shippingHeight,
      weight: weight
    }));
  }, [shippingLength, shippingWidth, shippingHeight, weight]);

  // Recalculate dimensions and weight based on product data changes.
  useEffect(() => {
    if (productData?.dimensions) {
      const storedDimensions = JSON.parse(localStorage.getItem("shippingDimensions") || "null");
      if (!storedDimensions) {
        setShippingLength(parseFloat(productData.dimensions.shippingLength?.toString() || "0"));
        setShippingWidth(parseFloat(productData.dimensions.shippingWidth?.toString() || "0"));
        setShippingHeight(parseFloat(productData.dimensions.shippingHeight?.toString() || "0"));
        setWeight(parseFloat(productData.dimensions.weight?.toString() || "0"));
      }
    }
  }, [productData]);

  // Load user settings for season, storage length, and inbound rate.
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    setSeason(storedMetrics.season || "Jan-Sep");
    setStorageLength(parseInt(storedMetrics.storageLength) || 1);
    setInboundShippingRate(parseFloat(storedMetrics.inboundShippingCost) || 0.5);
  }, []);

  // Dynamically update inbound shipping fee based on weight and rate.
  useEffect(() => {
    if (!hasEdited.inboundShippingFee) {
      setInboundShippingFee(calculateInboundShipping(finalShippingWeightForInbound, isWalmartFulfilled));
    }
  }, [finalShippingWeightForInbound, isWalmartFulfilled, hasEdited.inboundShippingFee]);

  // Dynamically update storage fee based on product dimensions and season.
  useEffect(() => {
    const calculatedStorageFee = parseFloat(
      calculateStorageFee(season, cubicFeet, storageLength) || "0"
    );
    setStorageFee(isNaN(calculatedStorageFee) ? 0 : calculatedStorageFee);
  }, [shippingLength, shippingWidth, shippingHeight, cubicFeet, season, storageLength]);

  // Dynamically update referral fee based on sale price and contract category.
  useEffect(() => {
    setReferralFee(calculateReferralFee(salePrice, contractCategory));
  }, [salePrice, contractCategory]);

  // Dynamically recalculate additional fees based on weight.
  useEffect(() => {
    setAdditionalFees(calculateAdditionalFees(weight));
  }, [weight]);


  /////////////////////////////////////////////////
  // Helper Functions
  /////////////////////////////////////////////////
  // Format numbers to two decimal places
  const formatToTwoDecimalPlaces = (value: number): string => value.toFixed(2);

  // Reset functions
  const resetShippingDimensions = () => {
    const dimensions = productData?.dimensions || {
      shippingLength: "0",
      shippingWidth: "0",
      shippingHeight: "0",
      weight: "0"
    };
    setShippingLength(parseFloat(dimensions.shippingLength?.toString() || "0"));
    setShippingWidth(parseFloat(dimensions.shippingWidth?.toString() || "0"));
    setShippingHeight(parseFloat(dimensions.shippingHeight?.toString() || "0"));
    setWeight(parseFloat(dimensions.weight?.toString() || "0"));
    setRawLength(null);
    setRawWidth(null);
    setRawHeight(null);
    setRawWeight(null);
    setHasEdited((prev) => ({
      ...prev,
      shippingLength: false,
      shippingWidth: false,
      shippingHeight: false,
      weight: false,
    }));
    localStorage.removeItem("shippingDimensions");
  };

  // Fetch stored metrics and preferences from localStorage
  const getStoredMetrics = () => {
    return JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
  };

  // Initialize WFS Fee and reset related states
  const initializeWfsFee = () => {
    const recalculatedFee = calculateWFSFee(productForWFSFee);
    setWfsFee(recalculatedFee);
    setRawWfsFee(null);
    setHasEdited((prev) => ({ ...prev, wfsFee: false }));
  };

  // Reset functions
  const resetPricing = () => {
    const initialProductCost = calculateStartingProductCost(salePrice);
    setProductCost(initialProductCost);
    setSalePrice(productData?.pricing?.currentPrice || 0);
    setRawProductCost(null);
    setRawSalePrice(null);
    setHasEdited((prev) => ({
      ...prev,
      productCost: false,
      salePrice: false,
    }));
  };

  const resetFees = () => {
    if (isWalmartFulfilled) {
      setWfsFee(calculateWFSFee(productForWFSFee));
      setInboundShippingFee(finalShippingWeightForInbound * inboundShippingRate);
      setStorageFee(parseFloat(calculateStorageFee(season, cubicFeet, storageLength)) || 0);
    } else {
      setWfsFee(0);
      setInboundShippingFee(0);
      setStorageFee(0);
    }
    setPrepFee(0);
    setAdditionalFees(0);
    setRawWfsFee(null);
    setRawInboundShippingFee(null);
    setRawStorageFee(null);
    setRawPrepFee(null);
    setRawAdditionalFees(null);
    setHasEdited((prev) => ({
      ...prev,
      wfsFee: false,
      inboundShippingFee: false,
      storageFee: false,
      prepFee: false,
      additionalFees: false,
    }));
  };






  /////////////////////////////////////////////////////
  // JSX
  /////////////////////////////////////////////////////

  return (
    <div
      id="Pricing"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >

      {/* Header Section */}
      <h1
        className={STYLES.header}
        onClick={toggleOpen}
      >
        {isOpen ? "🔽  Pricing" : "▶️  Pricing"}
      </h1>

      {/* Main Content Section */}
      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>

        {/* Pricing Groups */}
        <div id="Pricing" className="p-1 bg-[#d7d7d7] rounded-lg shadow-sm">

          {/* ===== Group 1: Revenue - Key Metrics Section ===== */}
          <div className="w-auto mx-3 mt-2 mb-4 p-1 bg-[#FAFAF1] border border-1 rounded-lg shadow-lg shadow-black">
            {/* Monthly Sales Est Row */}
            <div className="flex justify-between items-center mx-8 text-sm">
              <span className="font-semibold">Monthly Sales Est</span>
              <span className="text-sm">Coming Soon...</span>
            </div>

            {/* Total Profit Row */}
            <div className="flex justify-between items-center mx-8 text-sm">
              <span className="font-semibold">Total Profit</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{`$${totalProfit.toFixed(2)}`}</span>
                <div 
                  className={`w-2 h-2 rounded-full ${totalProfit >= desiredMetrics.minProfit ? 'bg-green-500' : 'bg-red-500'}`} 
                  title={`Minimum Profit Goal: $${desiredMetrics.minProfit.toFixed(2)}`}
                />
              </div>
            </div>

            {/* Margin Row */}
            <div className="flex justify-between items-center mx-8 text-sm">
              <span className="font-semibold">Margin</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{`${margin}%`}</span>
                <div 
                  className={`w-2 h-2 rounded-full ${margin >= desiredMetrics.minMargin ? 'bg-green-500' : 'bg-red-500'}`}
                  title={`Minimum Margin Goal: ${desiredMetrics.minMargin}%`}
                />
              </div>
            </div>

            {/* ROI Row */}
            <div className="flex justify-between items-center mx-8 text-sm">
              <span className="font-semibold">ROI</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${productCost === 0 ? "text-red-500 font-extrabold" : "text-black"}`}>
                  {productCost === 0 ? "Enter Cost" : `${roi}%`}
                </span>
                {productCost > 0 && (
                  <div 
                    className={`w-2 h-2 rounded-full ${roi >= desiredMetrics.minROI ? 'bg-green-500' : 'bg-red-500'}`}
                    title={`Minimum ROI Goal: ${desiredMetrics.minROI}%`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ===== Group 2: Pricing Section ===== */}
          <div className="section-wrapper">
            <div className="w-full mb-1 p-1 bg-white rounded-lg shadow-sm">

              {/* ----- Section Header ----- */}
              <div className="flex justify-between items-center mb-1 mx-2">
                <h2 className={DEFAULT_HEADER_CLASS}>Pricing</h2>
                <button
                  onClick={resetPricing}
                  className="reset-button"
                  aria-label="Reset Pricing"
                >
                  ↻
                </button>
              </div>

              {/* ----- Section Content ----- */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mx-5">

                {/* Product Cost Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>
                    Product Cost
                  </label>
                  <div className="flex items-center w-full">
                    <span className={DEFAULT_LEFT_PREFIX_SUFFIX_CLASS}>$</span>
                    <input
                      type="text"
                      value={rawProductCost !== null ? rawProductCost : productCost.toFixed(2)}
                      onChange={(e) => {
                        setRawProductCost(e.target.value);
                        setHasEdited((prev) => ({ ...prev, productCost: true }));
                      }}
                      onBlur={() => {
                        if (rawProductCost !== null) {
                          const formattedValue = parseFloat(rawProductCost).toFixed(2);
                          setProductCost(parseFloat(formattedValue));
                          setRawProductCost(null);
                        }
                      }}
                      className={`${DEFAULT_RIGHT_INPUT_CLASS} ${hasEdited.productCost ? "text-black font-bold" : "text-gray-700"}`}
                    />
                  </div>
                </div>

                {/* Sale Price Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>
                    Sale Price
                  </label>
                  <div className="flex items-center w-full">
                    <span className={DEFAULT_LEFT_PREFIX_SUFFIX_CLASS}>$</span>
                    <input
                      type="text"
                      value={rawSalePrice !== null ? rawSalePrice : salePrice.toFixed(2)}
                      onChange={(e) => setRawSalePrice(e.target.value)}
                      onBlur={() => {
                        const formattedValue = parseFloat(rawSalePrice || salePrice.toString()).toFixed(2);
                        setSalePrice(parseFloat(formattedValue));
                        setRawSalePrice(null);
                        setHasEdited((prev) => ({ ...prev, salePrice: true }));
                      }}
                      className={`${DEFAULT_RIGHT_INPUT_CLASS} ${hasEdited.salePrice ? "text-black font-bold" : "text-gray-700"}`}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ===== Group 3: Shipping Dimensions Section ===== */}
          <div className="section-wrapper">
            <div className="w-full mb-1 p-1 bg-white rounded-lg shadow-sm">

              {/* ----- Section Header ----- */}
              <div className="flex justify-between items-center mb-1 mx-2">
                <h2 className={DEFAULT_HEADER_CLASS}>Shipping Dimensions</h2>
                <button
                  onClick={resetShippingDimensions}
                  className="reset-button"
                  aria-label="Reset Shipping Dimensions"
                >
                  ↻
                </button>
              </div>

              {/* ----- Section Content ----- */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mx-5">

                {/* Length Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>
                    Length
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={rawLength !== null ? rawLength : typeof shippingLength === 'number' ? shippingLength.toFixed(2) : '0.00'}
                      onChange={(e) => setRawLength(e.target.value)}
                      onBlur={() => {
                        const formattedValue = parseFloat(rawLength || shippingLength.toString()).toFixed(2);
                        setShippingLength(parseFloat(formattedValue) || 0);
                        setRawLength(null);
                        setHasEdited((prev) => ({ ...prev, shippingLength: true }));
                      }}
                      className={`${DEFAULT_LEFT_INPUT_CLASS} ${hasEdited.shippingLength ? "text-black font-bold" : shippingLength === 0 ? "bg-red-50 border-red-300" : "text-gray-700"}`}
                    />
                    <span className={`${DEFAULT_RIGHT_PREFIX_SUFFIX_CLASS} ${shippingLength === 0 ? "bg-red-50 border-red-300" : ""}`}>in</span>
                  </div>
                </div>

                {/* Width Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>
                    Width
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={rawWidth !== null ? rawWidth : typeof shippingWidth === 'number' ? shippingWidth.toFixed(2) : '0.00'}
                      onChange={(e) => setRawWidth(e.target.value)}
                      onBlur={() => {
                        const formattedValue = parseFloat(rawWidth || shippingWidth.toString()).toFixed(2);
                        setShippingWidth(parseFloat(formattedValue) || 0);
                        setRawWidth(null);
                        setHasEdited((prev) => ({ ...prev, shippingWidth: true }));
                      }}
                      className={`${DEFAULT_LEFT_INPUT_CLASS} ${hasEdited.shippingWidth ? "text-black font-bold" : shippingWidth === 0 ? "bg-red-50 border-red-300" : "text-gray-700"}`}
                    />
                    <span className={`${DEFAULT_RIGHT_PREFIX_SUFFIX_CLASS} ${shippingWidth === 0 ? "bg-red-50 border-red-300" : ""}`}>in</span>
                  </div>
                </div>

                {/* Height Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>
                    Height
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={rawHeight !== null ? rawHeight : typeof shippingHeight === 'number' ? shippingHeight.toFixed(2) : '0.00'}
                      onChange={(e) => setRawHeight(e.target.value)}
                      onBlur={() => {
                        const formattedValue = parseFloat(rawHeight || shippingHeight.toString()).toFixed(2);
                        setShippingHeight(parseFloat(formattedValue) || 0);
                        setRawHeight(null);
                        setHasEdited((prev) => ({ ...prev, shippingHeight: true }));
                      }}
                      className={`${DEFAULT_LEFT_INPUT_CLASS} ${hasEdited.shippingHeight ? "text-black font-bold" : shippingHeight === 0 ? "bg-red-50 border-red-300" : "text-gray-700"}`}
                    />
                    <span className={`${DEFAULT_RIGHT_PREFIX_SUFFIX_CLASS} ${shippingHeight === 0 ? "bg-red-50 border-red-300" : ""}`}>in</span>
                  </div>
                </div>

                {/* Weight Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>
                    Weight
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={rawWeight !== null ? rawWeight : typeof weight === 'number' ? weight.toFixed(2) : '0.00'}
                      onChange={(e) => setRawWeight(e.target.value)}
                      onBlur={() => {
                        const formattedValue = parseFloat(rawWeight || weight.toString()).toFixed(2);
                        setWeight(parseFloat(formattedValue) || 0);
                        setRawWeight(null);
                        setHasEdited((prev) => ({ ...prev, weight: true }));
                      }}
                      className={`${DEFAULT_LEFT_INPUT_CLASS} ${hasEdited.weight ? "text-black font-bold" : weight === 0 ? "bg-red-50 border-red-300" : "text-gray-700"}`}
                    />
                    <span className={`${DEFAULT_RIGHT_PREFIX_SUFFIX_CLASS} ${weight === 0 ? "bg-red-50 border-red-300" : ""}`}>lbs</span>
                  </div>
                </div>

                {/* Warning Message */}
                {(shippingLength === 0 || shippingWidth === 0 || shippingHeight === 0 || weight === 0) && (
                  <div className="col-span-2 text-center mt-1">
                    <p className="text-red-500 text-xs italic">Please fill in all shipping dimensions for accurate calculations.</p>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ===== Group 4: Fees Section ===== */}
          <div className="section-wrapper">
            <div className="w-full mb-1 p-1 bg-white rounded-lg shadow-sm">

              {/* ----- Section Header ----- */}
              <div className="flex justify-between items-center mb-1 mx-2">
                <h2 className={DEFAULT_HEADER_CLASS}>Fees</h2>
                <button
                  onClick={resetFees}
                  className="reset-button"
                  aria-label="Reset Fees"
                >
                  ↻
                </button>
              </div>

              {/* ----- Section Content ----- */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mx-5">

                {/* Referral Fee Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>
                    Referral Fee
                  </label>
                  <div className="flex items-center w-full">
                    <span className={DEFAULT_LEFT_PREFIX_SUFFIX_CLASS}>$</span>
                    <input
                      type="text"
                      value={rawReferralFee !== null ? rawReferralFee : referralFee.toFixed(2)}
                      onChange={(e) => setRawReferralFee(e.target.value)}
                      onBlur={() => {
                        const formattedValue = parseFloat(rawReferralFee || referralFee.toString()).toFixed(2);
                        setReferralFee(parseFloat(formattedValue) || 0);
                        setRawReferralFee(null);
                        setHasEdited((prev) => ({ ...prev, referralFee: true }));
                      }}
                      className={`${DEFAULT_RIGHT_INPUT_CLASS} ${hasEdited.referralFee ? "text-black font-bold" : "text-gray-700"}`}
                    />
                  </div>
                </div>

                {/* WFS Fee Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>WFS Fee</label>
                  <div className="flex items-center w-full">
                    <span className={DEFAULT_LEFT_PREFIX_SUFFIX_CLASS}>$</span>
                    <input
                      type="text"
                      value={rawWfsFee !== null ? rawWfsFee : wfsFee.toFixed(2)}
                      onChange={(e) => setRawWfsFee(e.target.value)}
                      onBlur={() => {
                        if (rawWfsFee !== null) {
                          const formattedValue = parseFloat(rawWfsFee).toFixed(2);
                          setWfsFee(parseFloat(formattedValue));
                          setRawWfsFee(null);
                        }
                      }}
                      className={`${DEFAULT_RIGHT_INPUT_CLASS} ${hasEdited.wfsFee ? "text-black font-bold" : "text-gray-700"}`}
                    />
                  </div>
                </div>

                {/* Inbound Shipping Fee Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>
                    {isWalmartFulfilled ? "Inbound Shipping Fee" : "SF Shipping Fee"}
                  </label>
                  <div className="flex items-center w-full">
                    <span className={DEFAULT_LEFT_PREFIX_SUFFIX_CLASS}>$</span>
                    <input
                      type="text"
                      value={rawInboundShippingFee !== null ? rawInboundShippingFee : inboundShippingFee.toFixed(2)}
                      onChange={(e) => setRawInboundShippingFee(e.target.value)}
                      onBlur={() => {
                        if (rawInboundShippingFee !== null) {
                          const formattedValue = parseFloat(rawInboundShippingFee).toFixed(2);
                          setInboundShippingFee(parseFloat(formattedValue) || 0);
                          setRawInboundShippingFee(null);
                          setHasEdited((prev) => ({ ...prev, inboundShippingFee: true }));
                        }
                      }}
                      className={`${DEFAULT_RIGHT_INPUT_CLASS} ${hasEdited.inboundShippingFee ? "text-black font-bold" : "text-gray-700"}`}
                    />
                  </div>
                </div>

                {/* Storage Fee Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>Storage Fee</label>
                  <div className="flex items-center w-full">
                    <span className={DEFAULT_LEFT_PREFIX_SUFFIX_CLASS}>$</span>
                    <input
                      type="text"
                      value={rawStorageFee !== null ? rawStorageFee : storageFee.toFixed(2)}
                      onChange={(e) => setRawStorageFee(e.target.value)}
                      onBlur={() => {
                        if (rawStorageFee !== null) {
                          const formattedValue = parseFloat(rawStorageFee).toFixed(2);
                          setStorageFee(parseFloat(formattedValue) || 0);
                          setRawStorageFee(null);
                          setHasEdited((prev) => ({ ...prev, storageFee: true }));
                        }
                      }}
                      className={`${DEFAULT_RIGHT_INPUT_CLASS} ${hasEdited.storageFee ? "text-black font-bold" : "text-gray-700"}`}
                    />
                  </div>
                </div>

                {/* Prep Fee Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>Prep Fee</label>
                  <div className="flex items-center w-full">
                    <span className={DEFAULT_LEFT_PREFIX_SUFFIX_CLASS}>$</span>
                    <input
                      type="text"
                      value={rawPrepFee !== null ? rawPrepFee : prepFee.toFixed(2)}
                      onChange={(e) => setRawPrepFee(e.target.value)}
                      onBlur={() => {
                        if (rawPrepFee !== null) {
                          const formattedValue = parseFloat(rawPrepFee).toFixed(2);
                          setPrepFee(parseFloat(formattedValue) || 0);
                          setRawPrepFee(null);
                          setHasEdited((prev) => ({ ...prev, prepFee: true }));
                        }
                      }}
                      className={`${DEFAULT_RIGHT_INPUT_CLASS} ${hasEdited.prepFee ? "text-black font-bold" : "text-gray-700"}`}
                    />
                  </div>
                </div>

                {/* Additional Fees Row */}
                <div className="flex flex-col items-start">
                  <label className={`${DEFAULT_LABEL_CLASS}`}>Additional Fees</label>
                  <div className="flex items-center w-full">
                    <span className={DEFAULT_LEFT_PREFIX_SUFFIX_CLASS}>$</span>
                    <input
                      type="text"
                      value={rawAdditionalFees !== null ? rawAdditionalFees : additionalFees.toFixed(2)}
                      onChange={(e) => setRawAdditionalFees(e.target.value)}
                      onBlur={() => {
                        if (rawAdditionalFees !== null) {
                          const formattedValue = parseFloat(rawAdditionalFees).toFixed(2);
                          setAdditionalFees(parseFloat(formattedValue) || 0);
                          setRawAdditionalFees(null);
                          setHasEdited((prev) => ({ ...prev, additionalFees: true }));
                        }
                      }}
                      className={`${DEFAULT_RIGHT_INPUT_CLASS} ${hasEdited.additionalFees ? "text-black font-bold" : "text-gray-700"}`}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ===== Group 5: Contract Category Section ===== */}
          <div className="w-full mb-1 p-1 bg-white rounded-lg shadow-sm">

            {/* ----- Section Header ----- */}
            <h2 className={DEFAULT_HEADER_CLASS}>Contract Category</h2>

            {/* Dropdown for Contract Category */}
            <div className="flex items-center mb-1 mx-5 text-sm">
              <div className="w-full">

                {/* Dropdown element */}
                <select
                  value={contractCategory}
                  onChange={(e) => setContractCategory(e.target.value)}
                  className="text-xs p-1 w-full border border-gray-300 rounded bg-gray-100 text-gray-700">

                  {/* Populate options dynamically */}
                  {contractCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* ===== Group 6: Fulfillment Options Section ===== */}
          <div className="flex space-x-2 my-2 mx-5">
            {/* Walmart Fulfilled Button */}
            <div className="flex-1">
              <label
                className={`flex flex-col items-center justify-center p-1.5 border-2 rounded-lg cursor-pointer transition-all duration-150 ${isWalmartFulfilled
                  ? 'bg-[#006EDC] text-white shadow-inner-crisp'
                  : 'bg-gray-200 text-black border-gray-400 shadow-sm hover:bg-gray-300'
                  }`}
                onClick={() => {
                  setIsWalmartFulfilled(true);
                  setHasEdited({});
                }}
              >
                <input
                  type="radio"
                  checked={isWalmartFulfilled}
                  onChange={() => { }}
                  className="hidden"
                />
                <span className="block font-bold text-xs">Walmart</span>
                <span className="block font-bold text-xs">Fulfilled</span>
              </label>
            </div>

            {/* Seller Fulfilled Button */}
            <div className="flex-1">
              <label
                className={`flex flex-col items-center justify-center p-1.5 border-2 rounded-lg cursor-pointer transition-all duration-150 ${!isWalmartFulfilled
                  ? 'bg-[#006EDC] text-white shadow-inner-crisp'
                  : 'bg-gray-200 text-black border-gray-400 shadow-sm hover:bg-gray-300'
                  }`}
                onClick={() => {
                  setIsWalmartFulfilled(false);
                  setHasEdited({});
                }}
              >
                <input
                  type="radio"
                  checked={!isWalmartFulfilled}
                  onChange={() => { }}
                  className="hidden"
                />
                <span className="block font-bold text-xs">Seller</span>
                <span className="block font-bold text-xs">Fulfilled</span>
              </label>
            </div>
          </div>

        </div>
      </div >
    </div >
  );
}


////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default Pricing;


