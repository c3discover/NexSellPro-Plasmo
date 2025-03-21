/**
 * @fileoverview Pricing Calculator Component for product profitability analysis
 * @author NexSellPro
 * @created 2024-03-20
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect, useRef } from "react";
import { getUsedData } from "../../utils/usedData";
import type { UsedProductData } from "../../utils/usedData";
import getData from "../../utils/getData";
import { contractCategoryOptions } from "../../constants/options";
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
  calculateInboundShipping,
  calculatePrepFee
} from "../../utils/calculations";

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
const DEFAULT_CONTRACT_CATEGORY = "Everything Else (Most Items)";
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
  product?: any; // Adding product prop as optional since it might be null initially
  onMetricsUpdate?: (metrics: {
    profit: number;
    margin: number;
    roi: number;
    totalRatings: number;
    ratingsLast30Days: number;
    numSellers: number;
    numWfsSellers: number;
  }) => void;
}

interface CalculationResult {
  value: number;
  error?: string;
}

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const Pricing: React.FC<PricingProps> = ({ areSectionsOpen, onMetricsUpdate }) => {
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
  const [contractCategory, setContractCategory] = useState<string>(DEFAULT_CONTRACT_CATEGORY);
  const [season, setSeason] = useState<string>(DEFAULT_SEASON);
  const [storageLength, setStorageLength] = useState<number>(DEFAULT_STORAGE_LENGTH);
  const [inboundShippingRate, setInboundShippingRate] = useState<number>(DEFAULT_INBOUND_RATE);
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
  const [wfsFee, setWfsFee] = useState<number>(0);
  const [inboundShippingFee, setInboundShippingFee] = useState<number>(0);
  const [storageFee, setStorageFee] = useState<number>(0);
  const [prepFee, setPrepFee] = useState<number>(0);
  const [additionalFees, setAdditionalFees] = useState<number>(0);

  // Raw input states for fees
  const [rawReferralFee, setRawReferralFee] = useState<string | null>(null);
  const [rawWfsFee, setRawWfsFee] = useState<string | null>(null);
  const [rawInboundShippingFee, setRawInboundShippingFee] = useState<string | null>(null);
  const [rawStorageFee, setRawStorageFee] = useState<string | null>(null);
  const [rawPrepFee, setRawPrepFee] = useState<string | null>(null);
  const [rawAdditionalFees, setRawAdditionalFees] = useState<string | null>(null);

  // Desired metrics for goal tracking
  const [desiredMetrics, setDesiredMetrics] = useState({
    minProfit: 0,
    minMargin: 0,
    minROI: 0
  });

  // Refs for initialization tracking
  const hasInitializedProductCost = useRef(false);

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

  // Add this with other useEffects
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    setDesiredMetrics({
      minProfit: parseFloat(storedMetrics.minProfit || "0"),
      minMargin: parseFloat(storedMetrics.minMargin || "0"),
      minROI: parseFloat(storedMetrics.minROI || "0")
    });
  }, []);

  // Add new state for tracking edited fields
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());

  // Load saved values from localStorage on mount
  useEffect(() => {
    try {
      if (productData?.basic?.productID) {
        const storageKey = `pricing_${productData.basic.productID}`;
        const savedPricing = JSON.parse(localStorage.getItem(storageKey) || "{}");
        
        if (Object.keys(savedPricing).length > 0) {
          // Load all saved values
          if (savedPricing.productCost) setProductCost(parseFloat(savedPricing.productCost));
          if (savedPricing.salePrice) setSalePrice(parseFloat(savedPricing.salePrice));
          if (savedPricing.referralFee) setReferralFee(parseFloat(savedPricing.referralFee));
          if (savedPricing.wfsFee) setWfsFee(parseFloat(savedPricing.wfsFee));
          if (savedPricing.inboundShippingFee) setInboundShippingFee(parseFloat(savedPricing.inboundShippingFee));
          if (savedPricing.storageFee) setStorageFee(parseFloat(savedPricing.storageFee));
          if (savedPricing.prepFee) setPrepFee(parseFloat(savedPricing.prepFee));
          if (savedPricing.additionalFees) setAdditionalFees(parseFloat(savedPricing.additionalFees));
          
          // Mark fields as edited
          setEditedFields(new Set(Object.keys(savedPricing)));
        }
      }
    } catch (error) {
      console.error("Error loading pricing data:", error);
    }
  }, [productData?.basic?.productID]);

  // Save values to localStorage when they change
  useEffect(() => {
    if (productData?.basic?.productID && editedFields.size > 0) {
      const storageKey = `pricing_${productData.basic.productID}`;
      const pricingData = {
        productCost: productCost.toFixed(2),
        salePrice: salePrice.toFixed(2),
        referralFee: referralFee.toFixed(2),
        wfsFee: wfsFee.toFixed(2),
        inboundShippingFee: inboundShippingFee.toFixed(2),
        storageFee: storageFee.toFixed(2),
        prepFee: prepFee.toFixed(2),
        additionalFees: additionalFees.toFixed(2)
      };
      localStorage.setItem(storageKey, JSON.stringify(pricingData));
    }
  }, [
    productData?.basic?.productID,
    productCost,
    salePrice,
    referralFee,
    wfsFee,
    inboundShippingFee,
    storageFee,
    prepFee,
    additionalFees,
    editedFields
  ]);

  // Helper function to get input className
  const getInputClassName = (fieldName: string, baseClassName: string) => {
    return `${baseClassName} ${editedFields.has(fieldName) ? "font-bold" : ""}`;
  };

  // Reset functions
  const resetPricing = () => {
    const initialProductCost = calculateStartingProductCost(salePrice);
    setProductCost(initialProductCost);
    setSalePrice(productData?.pricing?.currentPrice || 0);
    setRawProductCost(null);
    setRawSalePrice(null);
    
    // Remove from localStorage and clear edited state
    if (productData?.basic?.productID) {
      const storageKey = `pricing_${productData.basic.productID}`;
      localStorage.removeItem(storageKey);
    }
    setEditedFields(new Set());
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

    // Remove from localStorage and clear edited state for fees
    if (productData?.basic?.productID) {
      const storageKey = `pricing_${productData.basic.productID}`;
      const savedPricing = JSON.parse(localStorage.getItem(storageKey) || "{}");
      delete savedPricing.wfsFee;
      delete savedPricing.inboundShippingFee;
      delete savedPricing.storageFee;
      delete savedPricing.prepFee;
      delete savedPricing.additionalFees;
      localStorage.setItem(storageKey, JSON.stringify(savedPricing));
    }
    
    setEditedFields(prev => {
      const newEdited = new Set(prev);
      ['wfsFee', 'inboundShippingFee', 'storageFee', 'prepFee', 'additionalFees'].forEach(field => {
        newEdited.delete(field);
      });
      return newEdited;
    });
  };

  // Update input handlers to mark fields as edited
  const handleInputChange = (value: string, setter: (value: string | null) => void, field: string) => {
    setter(value);
    setEditedFields(prev => new Set([...prev, field]));
  };

  const handleInputBlur = (rawValue: string | null, setter: (value: number) => void, field: string) => {
    if (rawValue !== null) {
      const formattedValue = parseFloat(rawValue).toFixed(2);
      setter(parseFloat(formattedValue));
    }
  };

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
      if (!hasEdited.prepFee) {
        setPrepFee(calculatePrepFee(weight));
      }
      if (!hasEdited.additionalFees) {
        setAdditionalFees(calculateAdditionalFees(weight));
      }
    } else {
      if (!hasEdited.wfsFee) setWfsFee(0);
      if (!hasEdited.inboundShippingFee) {
        setInboundShippingFee(calculateInboundShipping(finalShippingWeightForInbound, false));
      }
      if (!hasEdited.storageFee) setStorageFee(0);
      if (!hasEdited.prepFee) {
        setPrepFee(calculatePrepFee(weight));
      }
      if (!hasEdited.additionalFees) {
        setAdditionalFees(calculateAdditionalFees(weight));
      }
    }
  }, [
    isWalmartFulfilled,
    productForWFSFee,
    season,
    cubicFeet,
    storageLength,
    finalShippingWeightForInbound,
    weight,
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

  // Load shipping dimensions from product data first, fallback to product-specific localStorage
  useEffect(() => {
    if (productData?.basic?.productID) {
      const storageKey = `shippingDimensions_${productData.basic.productID}`;
      const storedDimensions = JSON.parse(localStorage.getItem(storageKey) || "null");
      
      if (productData?.dimensions) {
        // Log the dimensions data for debugging
        
        // Parse dimensions, ensuring we handle both string and number types
        const newLength = parseFloat(productData.dimensions.shippingLength?.toString() || "0");
        const newWidth = parseFloat(productData.dimensions.shippingWidth?.toString() || "0");
        const newHeight = parseFloat(productData.dimensions.shippingHeight?.toString() || "0");
        const newWeight = parseFloat(productData.dimensions.weight?.toString() || "0");


        // If we have valid product dimensions, use them on first load
        if (!storedDimensions && (newLength > 0 || newWidth > 0 || newHeight > 0 || newWeight > 0)) {
          setShippingLength(newLength);
          setShippingWidth(newWidth);
          setShippingHeight(newHeight);
          setWeight(newWeight);
        } 
        // If we have stored dimensions for this specific product, use those
        else if (storedDimensions) {
          setShippingLength(parseFloat(storedDimensions.length) || 0);
          setShippingWidth(parseFloat(storedDimensions.width) || 0);
          setShippingHeight(parseFloat(storedDimensions.height) || 0);
          setWeight(parseFloat(storedDimensions.weight) || 0);
        }
      }
    }
  }, [productData]);

  // Save shipping dimensions to localStorage when they are manually changed
  useEffect(() => {
    if (productData?.basic?.productID && 
        (hasEdited.shippingLength || hasEdited.shippingWidth || hasEdited.shippingHeight || hasEdited.weight)) {
      const storageKey = `shippingDimensions_${productData.basic.productID}`;
      localStorage.setItem(storageKey, JSON.stringify({
        length: shippingLength,
        width: shippingWidth,
        height: shippingHeight,
        weight: weight
      }));
    }
  }, [shippingLength, shippingWidth, shippingHeight, weight, hasEdited, productData?.basic?.productID]);

  // Reset function - only uses product data or zeros
  const resetShippingDimensions = () => {
    const dimensions = productData?.dimensions || {
      shippingLength: "0",
      shippingWidth: "0",
      shippingHeight: "0",
      weight: "0"
    };

    // Reset to product data values or zeros
    setShippingLength(parseFloat(dimensions.shippingLength?.toString() || "0"));
    setShippingWidth(parseFloat(dimensions.shippingWidth?.toString() || "0"));
    setShippingHeight(parseFloat(dimensions.shippingHeight?.toString() || "0"));
    setWeight(parseFloat(dimensions.weight?.toString() || "0"));

    // Reset raw values
    setRawLength(null);
    setRawWidth(null);
    setRawHeight(null);
    setRawWeight(null);

    // Reset edit flags
    setHasEdited((prev) => ({
      ...prev,
      shippingLength: false,
      shippingWidth: false,
      shippingHeight: false,
      weight: false,
    }));

    // Remove from localStorage if it exists
    if (productData?.basic?.productID) {
      const storageKey = `shippingDimensions_${productData.basic.productID}`;
      localStorage.removeItem(storageKey);
    }
  };

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

  // Add effect to notify parent of metrics updates
  useEffect(() => {
    onMetricsUpdate?.({
      profit: totalProfit,
      margin: margin,
      roi: roi,
      totalRatings: parseInt(productData?.reviews?.numberOfRatings?.toString() || "0"),
      ratingsLast30Days: productData?.reviews?.reviewDates?.filter(date => {
        if (!date) return false;
        const reviewDate = new Date(date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return reviewDate >= thirtyDaysAgo;
      }).length || 0,
      numSellers: productData?.inventory?.totalSellers || 0,
      numWfsSellers: productData?.sellers?.otherSellers?.filter(s => s.isWFS)?.length || 0
    });
  }, [totalProfit, margin, roi, productData, onMetricsUpdate]);


  /////////////////////////////////////////////////
  // Helper Functions
  /////////////////////////////////////////////////
  // Format numbers to two decimal places
  const formatToTwoDecimalPlaces = (value: number): string => value.toFixed(2);

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
            <div className="flex justify-between items-center mx-8 text-sm group relative">
              <span className="font-semibold">Total Profit</span>
              <div className="flex items-center gap-2">
                <span 
                  className="text-sm cursor-help relative"
                  data-tooltip-id="profit-tooltip"
                >
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 mr-2 w-[300px] hidden group-hover:block bg-cyan-900 text-white p-6 rounded text-xs whitespace-pre font-mono shadow-lg">
{`Calculation Breakdown:

Sale Price                   $${salePrice.toFixed(2)}
Product Cost                  -$${productCost.toFixed(2)}
Referral Fee                  -$${referralFee.toFixed(2)}
WFS Fee                       -$${wfsFee.toFixed(2)}
Inbound Shipping              -$${inboundShippingFee.toFixed(2)}
Storage Fee                   -$${storageFee.toFixed(2)}
Prep Fee                      -$${prepFee.toFixed(2)}
Additional Fees               -$${additionalFees.toFixed(2)}
─────────────────────────────────────
Total Profit                  $${totalProfit.toFixed(2)}`}</div>
                  {`$${totalProfit.toFixed(2)}`}
                </span>
                <div 
                  className={`w-2 h-2 rounded-full ${totalProfit >= desiredMetrics.minProfit ? 'bg-green-500' : 'bg-red-500'}`} 
                  title={`Minimum Profit Goal: $${desiredMetrics.minProfit.toFixed(2)}`}
                />
              </div>
            </div>

            {/* Margin Row */}
            <div className="flex justify-between items-center mx-8 text-sm group relative">
              <span className="font-semibold">Margin</span>
              <div className="flex items-center gap-2">
                <span 
                  className="text-sm cursor-help relative"
                  data-tooltip-id="margin-tooltip"
                >
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 mr-2 w-[300px] hidden group-hover:block bg-cyan-900 text-white p-6 rounded text-xs whitespace-pre font-mono shadow-lg">
{`Calculation:

Margin = (Total Profit / Sale Price) × 100

($${totalProfit.toFixed(2)} / $${salePrice.toFixed(2)}) × 100 = ${margin}%`}</div>
                  {`${margin.toFixed(0)}%`}
                </span>
                <div 
                  className={`w-2 h-2 rounded-full ${margin >= desiredMetrics.minMargin ? 'bg-green-500' : 'bg-red-500'}`}
                  title={`Minimum Margin Goal: ${desiredMetrics.minMargin}%`}
                />
              </div>
            </div>

            {/* ROI Row */}
            <div className="flex justify-between items-center mx-8 text-sm group relative">
              <span className="font-semibold">ROI</span>
              <div className="flex items-center gap-2">
                <span 
                  className={`text-sm cursor-help relative ${productCost === 0 ? "text-red-500 font-extrabold" : "text-black"}`}
                  data-tooltip-id="roi-tooltip"
                >
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 mr-2 w-[300px] hidden group-hover:block bg-cyan-900 text-white p-6 rounded text-xs whitespace-pre font-mono shadow-lg">
{productCost === 0 ? "Please enter a product cost" : 
`Calculation:

ROI = (Total Profit / Product Cost) × 100

($${totalProfit.toFixed(2)} / $${productCost.toFixed(2)}) × 100 = ${roi}%`}</div>
                  {productCost === 0 ? "Enter Cost" : `${roi.toFixed(0)}%`}
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
              {/* ----- Section Header ----- */}
              <div className="flex justify-between items-center mb-1 mx-1 pb-1 border-b border-gray-200">
                <h2 className={DEFAULT_HEADER_CLASS}>Pricing</h2>
                <button
                  onClick={resetPricing}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Reset Pricing"
                >
                  ↻
                </button>
              </div>

              {/* ----- Section Content ----- */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mx-3">
                {/* Product Cost Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    Product Cost
                  </label>
                  <div className="flex items-center w-full">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-l text-gray-600 text-xs">$</span>
                    <input
                      type="text"
                      value={rawProductCost !== null ? rawProductCost : productCost.toFixed(2)}
                      onChange={(e) => handleInputChange(e.target.value, setRawProductCost, 'productCost')}
                      onBlur={() => handleInputBlur(rawProductCost, setProductCost, 'productCost')}
                      className={getInputClassName('productCost', 'py-1 px-2 w-full border-y border-r border-gray-200 rounded-r text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                  </div>
                </div>

                {/* Sale Price Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    Sale Price
                  </label>
                  <div className="flex items-center w-full">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-l text-gray-600 text-xs">$</span>
                    <input
                      type="text"
                      value={rawSalePrice !== null ? rawSalePrice : salePrice.toFixed(2)}
                      onChange={(e) => handleInputChange(e.target.value, setRawSalePrice, 'salePrice')}
                      onBlur={() => handleInputBlur(rawSalePrice, setSalePrice, 'salePrice')}
                      className={getInputClassName('salePrice', 'py-1 px-2 w-full border-y border-r border-gray-200 rounded-r text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                  </div>
                </div>
              </div>
          </div>

          {/* ===== Group 3: Shipping Dimensions Section ===== */}
          <div className="section-wrapper">
              {/* ----- Section Header ----- */}
              <div className="flex justify-between items-center mb-1 mx-1 pb-1 border-b border-gray-200">
                <h2 className={DEFAULT_HEADER_CLASS}>Shipping Dimensions</h2>
                <button
                  onClick={resetShippingDimensions}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Reset Shipping Dimensions"
                >
                  ↻
                </button>
              </div>

              {/* ----- Section Content ----- */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mx-3">
                {/* Length Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    Length
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={rawLength !== null ? rawLength : typeof shippingLength === 'number' ? shippingLength.toFixed(2) : '0.00'}
                      onChange={(e) => handleInputChange(e.target.value, setRawLength, 'shippingLength')}
                      onBlur={() => handleInputBlur(rawLength, setShippingLength, 'shippingLength')}
                      className={getInputClassName('shippingLength', 'py-1 px-2 w-full border border-gray-200 rounded-l text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                    <span className="px-2 py-1 bg-gray-50 border-y border-r border-gray-200 rounded-r text-gray-600 text-xs">in</span>
                  </div>
                </div>

                {/* Width Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    Width
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={rawWidth !== null ? rawWidth : typeof shippingWidth === 'number' ? shippingWidth.toFixed(2) : '0.00'}
                      onChange={(e) => handleInputChange(e.target.value, setRawWidth, 'shippingWidth')}
                      onBlur={() => handleInputBlur(rawWidth, setShippingWidth, 'shippingWidth')}
                      className={getInputClassName('shippingWidth', 'py-1 px-2 w-full border border-gray-200 rounded-l text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                    <span className="px-2 py-1 bg-gray-50 border-y border-r border-gray-200 rounded-r text-gray-600 text-xs">in</span>
                  </div>
                </div>

                {/* Height Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    Height
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={rawHeight !== null ? rawHeight : typeof shippingHeight === 'number' ? shippingHeight.toFixed(2) : '0.00'}
                      onChange={(e) => handleInputChange(e.target.value, setRawHeight, 'shippingHeight')}
                      onBlur={() => handleInputBlur(rawHeight, setShippingHeight, 'shippingHeight')}
                      className={getInputClassName('shippingHeight', 'py-1 px-2 w-full border border-gray-200 rounded-l text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                    <span className="px-2 py-1 bg-gray-50 border-y border-r border-gray-200 rounded-r text-gray-600 text-xs">in</span>
                  </div>
                </div>

                {/* Weight Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    Weight
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      type="text"
                      value={rawWeight !== null ? rawWeight : typeof weight === 'number' ? weight.toFixed(2) : '0.00'}
                      onChange={(e) => handleInputChange(e.target.value, setRawWeight, 'weight')}
                      onBlur={() => handleInputBlur(rawWeight, setWeight, 'weight')}
                      className={getInputClassName('weight', 'py-1 px-2 w-full border border-gray-200 rounded-l text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                    <span className="px-2 py-1 bg-gray-50 border-y border-r border-gray-200 rounded-r text-gray-600 text-xs">lbs</span>
                  </div>
                </div>
              </div>
          </div>

          {/* ===== Group 4: Fees Section ===== */}
          <div className="section-wrapper">
              {/* ----- Section Header ----- */}
              <div className="flex justify-between items-center mb-1 mx-1 pb-1 border-b border-gray-200">
                <h2 className={DEFAULT_HEADER_CLASS}>Fees</h2>
                <button
                  onClick={resetFees}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Reset Fees"
                >
                  ↻
                </button>
              </div>

              {/* ----- Section Content ----- */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mx-3">
                {/* Referral Fee Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    Referral Fee
                  </label>
                  <div className="flex items-center w-full">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-l text-gray-600 text-xs">$</span>
                    <input
                      type="text"
                      value={rawReferralFee !== null ? rawReferralFee : referralFee.toFixed(2)}
                      onChange={(e) => handleInputChange(e.target.value, setRawReferralFee, 'referralFee')}
                      onBlur={() => handleInputBlur(rawReferralFee, setReferralFee, 'referralFee')}
                      className={getInputClassName('referralFee', 'py-1 px-2 w-full border-y border-r border-gray-200 rounded-r text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                  </div>
                </div>

                {/* WFS Fee Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    WFS Fee
                  </label>
                  <div className="flex items-center w-full">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-l text-gray-600 text-xs">$</span>
                    <input
                      type="text"
                      value={rawWfsFee !== null ? rawWfsFee : wfsFee.toFixed(2)}
                      onChange={(e) => handleInputChange(e.target.value, setRawWfsFee, 'wfsFee')}
                      onBlur={() => handleInputBlur(rawWfsFee, setWfsFee, 'wfsFee')}
                      className={getInputClassName('wfsFee', 'py-1 px-2 w-full border-y border-r border-gray-200 rounded-r text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                  </div>
                </div>

                {/* Inbound Shipping Fee Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    {isWalmartFulfilled ? "WFS Inbound Shipping" : "SF Shipping"}
                  </label>
                  <div className="flex items-center w-full">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-l text-gray-600 text-xs">$</span>
                    <input
                      type="text"
                      value={rawInboundShippingFee !== null ? rawInboundShippingFee : inboundShippingFee.toFixed(2)}
                      onChange={(e) => handleInputChange(e.target.value, setRawInboundShippingFee, 'inboundShippingFee')}
                      onBlur={() => handleInputBlur(rawInboundShippingFee, setInboundShippingFee, 'inboundShippingFee')}
                      className={getInputClassName('inboundShippingFee', 'py-1 px-2 w-full border-y border-r border-gray-200 rounded-r text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                  </div>
                </div>

                {/* Storage Fee Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    Storage Fee
                  </label>
                  <div className="flex items-center w-full">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-l text-gray-600 text-xs">$</span>
                    <input
                      type="text"
                      value={rawStorageFee !== null ? rawStorageFee : storageFee.toFixed(2)}
                      onChange={(e) => handleInputChange(e.target.value, setRawStorageFee, 'storageFee')}
                      onBlur={() => handleInputBlur(rawStorageFee, setStorageFee, 'storageFee')}
                      className={getInputClassName('storageFee', 'py-1 px-2 w-full border-y border-r border-gray-200 rounded-r text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                  </div>
                </div>

                {/* Prep Fee Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    Prep Fee
                  </label>
                  <div className="flex items-center w-full">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-l text-gray-600 text-xs">$</span>
                    <input
                      type="text"
                      value={rawPrepFee !== null ? rawPrepFee : prepFee.toFixed(2)}
                      onChange={(e) => handleInputChange(e.target.value, setRawPrepFee, 'prepFee')}
                      onBlur={() => handleInputBlur(rawPrepFee, setPrepFee, 'prepFee')}
                      className={getInputClassName('prepFee', 'py-1 px-2 w-full border-y border-r border-gray-200 rounded-r text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                  </div>
                </div>

                {/* Additional Fees Row */}
                <div className="flex flex-col items-start">
                  <label className="text-xs text-gray-600 mb-0.5">
                    Additional Fees
                  </label>
                  <div className="flex items-center w-full">
                    <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-l text-gray-600 text-xs">$</span>
                    <input
                      type="text"
                      value={rawAdditionalFees !== null ? rawAdditionalFees : additionalFees.toFixed(2)}
                      onChange={(e) => handleInputChange(e.target.value, setRawAdditionalFees, 'additionalFees')}
                      onBlur={() => handleInputBlur(rawAdditionalFees, setAdditionalFees, 'additionalFees')}
                      className={getInputClassName('additionalFees', 'py-1 px-2 w-full border-y border-r border-gray-200 rounded-r text-right text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500')}
                    />
                  </div>
                </div>
              </div>
          </div>

          {/* ===== Group 5: Contract Category Section ===== */}
          <div className="section-wrapper">
              {/* ----- Section Header ----- */}
              <div className="flex justify-between items-center mb-1 mx-1 pb-1 border-b border-gray-200">
                <h2 className={DEFAULT_HEADER_CLASS}>Contract Category</h2>
              </div>

              {/* ----- Section Content ----- */}
              <div className="mx-3">
                <div className="flex flex-col items-start">

                  <select
                    value={contractCategory}
                    onChange={(e) => setContractCategory(e.target.value)}
                    className="w-full py-1 px-2 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                  >
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



