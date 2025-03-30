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
const DEFAULT_INBOUND_RATE = 0.0;

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
  product: UsedProductData | null;
  areSectionsOpen: boolean;
  onMetricsUpdate?: (metrics: {
    profit: number;
    margin: number;
    roi: number;
    totalRatings: number;
    ratingsLast30Days: number;
    numSellers: number;
    numWfsSellers: number;
    totalStock: number;
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

        // Set shipping dimensions from product data
        setShippingLength(parseFloat(data.dimensions.shippingLength || "0"));
        setShippingWidth(parseFloat(data.dimensions.shippingWidth || "0"));
        setShippingHeight(parseFloat(data.dimensions.shippingHeight || "0"));
        setWeight(parseFloat(data.dimensions.weight || "0"));
      }
    };
    fetchData();
  }, []);

  // General State (Group 1)
  const [contractCategory, setContractCategory] = useState<string>("Everything Else (Most Items)");
  const [season, setSeason] = useState<string>(DEFAULT_SEASON);
  const [storageLength, setStorageLength] = useState<number>(DEFAULT_STORAGE_LENGTH);
  const [inboundShippingRate, setInboundShippingRate] = useState<number>(DEFAULT_INBOUND_RATE);
  const [sfShippingRate, setSfShippingRate] = useState<number>(DEFAULT_INBOUND_RATE);
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
    isApparel: contractCategory === "Apparel & Accessories",
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

  // Update input handlers to mark fields as edited
  const handleInputChange = (value: string, setter: (value: string | null) => void, field: string) => {
    setter(value);
    setEditedFields(prev => new Set([...prev, field]));
  };

  // Update handleInputBlur to handle fee fields
  const handleInputBlur = (rawValue: string | null, setter: (value: number) => void, field: string) => {
    if (rawValue !== null) {
      const numValue = parseFloat(rawValue) || 0;
      let formattedValue;
      
      // Group 2: Pricing (2 decimals)
      if (['productCost', 'salePrice'].includes(field)) {
        formattedValue = numValue.toFixed(2);
        setter(parseFloat(formattedValue));
        
        if (field === 'productCost') setRawProductCost(formattedValue);
        if (field === 'salePrice') setRawSalePrice(formattedValue);

        // Save to pricing localStorage
        if (productData?.basic?.productID) {
          const storageKey = `pricing_${productData.basic.productID}`;
          const savedPricing = JSON.parse(localStorage.getItem(storageKey) || "{}");
          savedPricing[field] = formattedValue;
          localStorage.setItem(storageKey, JSON.stringify(savedPricing));
        }
      }
      // Group 3: Shipping Dimensions (2 decimals for dimensions, 1 for weight)
      else if (['shippingLength', 'shippingWidth', 'shippingHeight', 'weight'].includes(field)) {
        formattedValue = field === 'weight' ? numValue.toFixed(1) : numValue.toFixed(2);
        setter(parseFloat(formattedValue));
        
        if (field === 'shippingLength') setRawLength(formattedValue);
        if (field === 'shippingWidth') setRawWidth(formattedValue);
        if (field === 'shippingHeight') setRawHeight(formattedValue);
        if (field === 'weight') setRawWeight(formattedValue);

        // Save to dimensions localStorage
        if (productData?.basic?.productID) {
          const storageKey = `shippingDimensions_${productData.basic.productID}`;
          const savedDimensions = JSON.parse(localStorage.getItem(storageKey) || "{}");
          
          if (field === 'shippingLength') savedDimensions.length = formattedValue;
          if (field === 'shippingWidth') savedDimensions.width = formattedValue;
          if (field === 'shippingHeight') savedDimensions.height = formattedValue;
          if (field === 'weight') savedDimensions.weight = formattedValue;
          
          localStorage.setItem(storageKey, JSON.stringify(savedDimensions));
        }
      }
      // Group 4: Fees (2 decimals)
      else if (['referralFee', 'wfsFee', 'inboundShippingFee', 'storageFee', 'prepFee', 'additionalFees'].includes(field)) {
        formattedValue = numValue.toFixed(2);
        setter(parseFloat(formattedValue));
        
        if (field === 'referralFee') setRawReferralFee(formattedValue);
        if (field === 'wfsFee') setRawWfsFee(formattedValue);
        if (field === 'inboundShippingFee') setRawInboundShippingFee(formattedValue);
        if (field === 'storageFee') setRawStorageFee(formattedValue);
        if (field === 'prepFee') setRawPrepFee(formattedValue);
        if (field === 'additionalFees') setRawAdditionalFees(formattedValue);

        // Save to pricing localStorage
        if (productData?.basic?.productID) {
          const storageKey = `pricing_${productData.basic.productID}`;
          const savedPricing = JSON.parse(localStorage.getItem(storageKey) || "{}");
          savedPricing[field] = formattedValue;
          localStorage.setItem(storageKey, JSON.stringify(savedPricing));
        }
      }

      // If we formatted a value, mark the field as edited
      if (formattedValue) {
        setEditedFields(prev => new Set([...prev, field]));
      }
    }
  };

  // Update the useEffect that loads saved values to handle fees
  useEffect(() => {
    try {
      if (productData?.basic?.productID) {
        const pricingKey = `pricing_${productData.basic.productID}`;
        const dimensionsKey = `shippingDimensions_${productData.basic.productID}`;
        const savedPricing = JSON.parse(localStorage.getItem(pricingKey) || "{}");
        const savedDimensions = JSON.parse(localStorage.getItem(dimensionsKey) || "{}");
        const editedFieldsSet = new Set<string>();
        
        // Load pricing values
        if (savedPricing.productCost) {
          setProductCost(parseFloat(savedPricing.productCost));
          setRawProductCost(savedPricing.productCost);
          editedFieldsSet.add('productCost');
        }
        if (savedPricing.salePrice) {
          setSalePrice(parseFloat(savedPricing.salePrice));
          setRawSalePrice(savedPricing.salePrice);
          editedFieldsSet.add('salePrice');
        }

        // Load shipping dimensions
        if (savedDimensions.length) {
          setShippingLength(parseFloat(savedDimensions.length));
          setRawLength(savedDimensions.length);
          editedFieldsSet.add('shippingLength');
        }
        if (savedDimensions.width) {
          setShippingWidth(parseFloat(savedDimensions.width));
          setRawWidth(savedDimensions.width);
          editedFieldsSet.add('shippingWidth');
        }
        if (savedDimensions.height) {
          setShippingHeight(parseFloat(savedDimensions.height));
          setRawHeight(savedDimensions.height);
          editedFieldsSet.add('shippingHeight');
        }
        if (savedDimensions.weight) {
          setWeight(parseFloat(savedDimensions.weight));
          setRawWeight(savedDimensions.weight);
          editedFieldsSet.add('weight');
        }

        // Load fee values from localStorage
        if (savedPricing.referralFee) {
          setReferralFee(parseFloat(savedPricing.referralFee));
          setRawReferralFee(savedPricing.referralFee);
          editedFieldsSet.add('referralFee');
        }
        if (savedPricing.wfsFee) {
          setWfsFee(parseFloat(savedPricing.wfsFee));
          setRawWfsFee(savedPricing.wfsFee);
          editedFieldsSet.add('wfsFee');
        }
        if (savedPricing.inboundShippingFee) {
          setInboundShippingFee(parseFloat(savedPricing.inboundShippingFee));
          setRawInboundShippingFee(savedPricing.inboundShippingFee);
          editedFieldsSet.add('inboundShippingFee');
        }
        if (savedPricing.storageFee) {
          setStorageFee(parseFloat(savedPricing.storageFee));
          setRawStorageFee(savedPricing.storageFee);
          editedFieldsSet.add('storageFee');
        }
        if (savedPricing.prepFee) {
          setPrepFee(parseFloat(savedPricing.prepFee));
          setRawPrepFee(savedPricing.prepFee);
          editedFieldsSet.add('prepFee');
        }
        if (savedPricing.additionalFees) {
          setAdditionalFees(parseFloat(savedPricing.additionalFees));
          setRawAdditionalFees(savedPricing.additionalFees);
          editedFieldsSet.add('additionalFees');
        }

        // Only update editedFields if we found any
        if (editedFieldsSet.size > 0) {
          setEditedFields(prev => new Set([...prev, ...editedFieldsSet]));
        }
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  }, [productData?.basic?.productID]);

  // Helper function to get input className
  const getInputClassName = (fieldName: string, baseClassName: string) => {
    return `${baseClassName} ${editedFields.has(fieldName) ? "font-bold" : ""}`;
  };

  // Reset functions
  const resetPricing = () => {
    const initialProductCost = calculateStartingProductCost(productData?.pricing?.currentPrice || 0);
    setProductCost(initialProductCost);
    setSalePrice(productData?.pricing?.currentPrice || 0);
    setRawProductCost(null);
    setRawSalePrice(null);
    
    // Only remove pricing data from localStorage
    if (productData?.basic?.productID) {
      const storageKey = `pricing_${productData.basic.productID}`;
      const savedPricing = JSON.parse(localStorage.getItem(storageKey) || "{}");
      delete savedPricing.productCost;
      delete savedPricing.salePrice;
      if (Object.keys(savedPricing).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(savedPricing));
      } else {
        localStorage.removeItem(storageKey);
      }
    }
    
    // Only remove these two fields from editedFields
    setEditedFields(prev => {
      const newEdited = new Set(prev);
      newEdited.delete('productCost');
      newEdited.delete('salePrice');
      return newEdited;
    });
  };

  // Update resetFees to only handle the six fee values
  const resetFees = () => {
    // Reset all fee values to their calculated defaults
    if (isWalmartFulfilled) {
      setWfsFee(calculateWFSFee(productForWFSFee));
      setInboundShippingFee(finalShippingWeightForInbound * inboundShippingRate);
      setStorageFee(parseFloat(calculateStorageFee(season, cubicFeet, storageLength)) || 0);
    } else {
      setWfsFee(0);
      setInboundShippingFee(0);
      setStorageFee(0);
    }
    setReferralFee(calculateReferralFee(salePrice, contractCategory));
    setPrepFee(0);
    setAdditionalFees(0);

    // Reset all raw fee values
    setRawReferralFee(null);
    setRawWfsFee(null);
    setRawInboundShippingFee(null);
    setRawStorageFee(null);
    setRawPrepFee(null);
    setRawAdditionalFees(null);

    // Remove fee data from localStorage
    if (productData?.basic?.productID) {
      const storageKey = `pricing_${productData.basic.productID}`;
      const savedPricing = JSON.parse(localStorage.getItem(storageKey) || "{}");
      
      // Remove only fee fields
      delete savedPricing.referralFee;
      delete savedPricing.wfsFee;
      delete savedPricing.inboundShippingFee;
      delete savedPricing.storageFee;
      delete savedPricing.prepFee;
      delete savedPricing.additionalFees;
      
      if (Object.keys(savedPricing).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(savedPricing));
      } else {
        localStorage.removeItem(storageKey);
      }
    }

    // Remove only fee fields from editedFields
    setEditedFields(prev => {
      const newEdited = new Set(prev);
      ['referralFee', 'wfsFee', 'inboundShippingFee', 'storageFee', 'prepFee', 'additionalFees'].forEach(field => {
        newEdited.delete(field);
      });
      return newEdited;
    });
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
    const savedFulfillment = localStorage.getItem("defaultFulfillment");
    if (savedFulfillment) {
      setIsWalmartFulfilled(savedFulfillment === "Walmart Fulfilled");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isWalmartFulfilled", isWalmartFulfilled.toString());
  }, [isWalmartFulfilled]);

  // Load user settings for season, storage length, and shipping rates
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    setSeason(storedMetrics.season || "Jan-Sep");
    setStorageLength(parseInt(storedMetrics.storageLength) || 1);
    setInboundShippingRate(parseFloat(storedMetrics.inboundShippingCost) || 0.5);
    setSfShippingRate(parseFloat(storedMetrics.sfShippingCost) || 0.5);
  }, []);

  // Helper function to calculate shipping based on fulfillment type
  const calculateShippingFee = (weight: number, isWFS: boolean): number => {
    const rate = isWFS ? inboundShippingRate : sfShippingRate;
    return weight * rate;
  };

  // Dynamically update inbound shipping fee based on weight, rate, and fulfillment type
  useEffect(() => {
    if (!hasEdited.inboundShippingFee) {
      const shippingFee = calculateShippingFee(finalShippingWeightForInbound, isWalmartFulfilled);
      setInboundShippingFee(shippingFee);
    }
  }, [finalShippingWeightForInbound, isWalmartFulfilled, inboundShippingRate, sfShippingRate, hasEdited.inboundShippingFee]);

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
      numWfsSellers: productData?.sellers?.otherSellers?.filter(s => s.isWFS)?.length || 0,
      totalStock: productData?.inventory?.totalStock || 0
    });
  }, [totalProfit, margin, roi, productData, onMetricsUpdate]);

  // Add new useEffect for contract category
  useEffect(() => {
    if (productData?.categories?.mainCategory) {
      const mainCategory = productData.categories.mainCategory;
      console.log('Setting contract category based on main category:', mainCategory);
      
      switch (mainCategory) {
        case "Clothing":
          setContractCategory("Apparel & Accessories");
          break;
        case "Beauty":
          setContractCategory("Beauty");
          break;
        case "Baby":
          setContractCategory("Baby");
          break;
        case "Health":
        case "Personal Care":
          setContractCategory("Health & Personal Care");
          break;
        case "Food":
          setContractCategory("Grocery");
          break;
        case "Cell Phones":
          setContractCategory("Cell Phones");
          break;
        case "Camera":
        case "Photo":
          setContractCategory("Camera & Photo");
          break;
        default:
          setContractCategory("Everything Else (Most Items)");
      }
    }
  }, [productData?.categories?.mainCategory]);

  // Add state for fulfillment type
  const [fulfillmentType, setFulfillmentType] = useState<string>("Walmart Fulfilled");

  // Update useEffect to load fulfillment type from localStorage
  useEffect(() => {
    const savedFulfillment = localStorage.getItem("defaultFulfillment");
    if (savedFulfillment) {
      setIsWalmartFulfilled(savedFulfillment === "Walmart Fulfilled");
    }
  }, []);


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

  // Update resetShippingDimensions to only handle these four values
  const resetShippingDimensions = () => {
    // Reset to product data values or zeros
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

    // Reset raw values
    setRawLength(null);
    setRawWidth(null);
    setRawHeight(null);
    setRawWeight(null);

    // Remove from localStorage
    if (productData?.basic?.productID) {
      const storageKey = `shippingDimensions_${productData.basic.productID}`;
      localStorage.removeItem(storageKey);
    }

    // Remove only shipping fields from editedFields
    setEditedFields(prev => {
      const newEdited = new Set(prev);
      ['shippingLength', 'shippingWidth', 'shippingHeight', 'weight'].forEach(field => {
        newEdited.delete(field);
      });
      return newEdited;
    });
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
                      onBlur={(e) => handleInputBlur(e.target.value, setProductCost, 'productCost')}
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
                      onBlur={(e) => handleInputBlur(e.target.value, setSalePrice, 'salePrice')}
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
                      onBlur={(e) => handleInputBlur(e.target.value, setShippingLength, 'shippingLength')}
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
                      onBlur={(e) => handleInputBlur(e.target.value, setShippingWidth, 'shippingWidth')}
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
                      onBlur={(e) => handleInputBlur(e.target.value, setShippingHeight, 'shippingHeight')}
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
                      value={rawWeight !== null ? rawWeight : typeof weight === 'number' ? weight.toFixed(1) : '0.0'}
                      onChange={(e) => handleInputChange(e.target.value, setRawWeight, 'weight')}
                      onBlur={(e) => handleInputBlur(e.target.value, setWeight, 'weight')}
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
                      onBlur={(e) => handleInputBlur(e.target.value, setReferralFee, 'referralFee')}
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
                      onBlur={(e) => handleInputBlur(e.target.value, setWfsFee, 'wfsFee')}
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
                      onBlur={(e) => handleInputBlur(e.target.value, setInboundShippingFee, 'inboundShippingFee')}
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
                      onBlur={(e) => handleInputBlur(e.target.value, setStorageFee, 'storageFee')}
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
                      onBlur={(e) => handleInputBlur(e.target.value, setPrepFee, 'prepFee')}
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
                      onBlur={(e) => handleInputBlur(e.target.value, setAdditionalFees, 'additionalFees')}
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
          <div className="flex gap-2 my-3 mx-4">
            {/* Walmart Fulfilled Button */}
            <div className="flex-1">
              <label
                className={`group relative flex items-center justify-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  isWalmartFulfilled
                    ? 'bg-gradient-to-br from-[#0071DC] to-[#004F9A] text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => {
                  setIsWalmartFulfilled(true);
                  setHasEdited({});
                  resetFees();
                }}
              >
                <input
                  type="radio"
                  checked={isWalmartFulfilled}
                  onChange={() => {}}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <div className={`relative w-4 h-4 rounded-sm border-2 transition-colors duration-200 ${
                    isWalmartFulfilled 
                      ? 'border-white bg-white' 
                      : 'border-gray-400'
                  }`}>
                    {isWalmartFulfilled && (
                      <svg className="absolute inset-0 w-full h-full text-[#0071DC]" viewBox="0 0 24 24" fill="none">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Walmart</span>
                    <span className="text-xs font-semibold">Fulfilled</span>
                  </div>
                </div>
                {isWalmartFulfilled && (
                  <div className="absolute inset-0 bg-white opacity-10 rounded-lg"></div>
                )}
              </label>
            </div>

            {/* Seller Fulfilled Button */}
            <div className="flex-1">
              <label
                className={`group relative flex items-center justify-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  !isWalmartFulfilled
                    ? 'bg-gradient-to-br from-[#0071DC] to-[#004F9A] text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => {
                  setIsWalmartFulfilled(false);
                  setHasEdited({});
                  resetFees();
                }}
              >
                <input
                  type="radio"
                  checked={!isWalmartFulfilled}
                  onChange={() => {}}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <div className={`relative w-4 h-4 rounded-sm border-2 transition-colors duration-200 ${
                    !isWalmartFulfilled 
                      ? 'border-white bg-white' 
                      : 'border-gray-400'
                  }`}>
                    {!isWalmartFulfilled && (
                      <svg className="absolute inset-0 w-full h-full text-[#0071DC]" viewBox="0 0 24 24" fill="none">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Seller</span>
                    <span className="text-xs font-semibold">Fulfilled</span>
                  </div>
                </div>
                {!isWalmartFulfilled && (
                  <div className="absolute inset-0 bg-white opacity-10 rounded-lg"></div>
                )}
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



