/////////////////////////////////////////////////
// Imports and Type Definitions
/////////////////////////////////////////////////

import React, { useState, useEffect, useRef } from "react";
import {
  calculateReferralFee,
  calculateWFSFee,
  calculateStorageFee,
  calculateCubicFeet,
  calculateTotalProfit,
  calculateROI,
  calculateMargin,
  calculateFinalShippingWeightForInbound,
  calculateFinalShippingWeightForWFS,
  calculateAdditionalFees,
  calculateProductCostFromMargin
} from "../utils/calculations";

import { contractCategoryOptions } from "../constants/options";

// Types for component props
interface Product {
  shippingLength?: number;
  shippingWidth?: number;
  shippingHeight?: number;
  weight?: number;
  currentPrice?: number;
  isWalmartFulfilled: boolean;
  isApparel?: boolean;
  isHazardousMaterial?: boolean;
  retailPrice?: number;
}

interface PricingProps {
  product: Product;
  areSectionsOpen: boolean;
}

/////////////////////////////////////////////////
// Component Definition
/////////////////////////////////////////////////

export const Pricing: React.FC<PricingProps> = ({ product, areSectionsOpen }) => {
  /////////////////////////////////////////////////////
  // State Initialization
  /////////////////////////////////////////////////////

  // MISC
  const [contractCategory, setContractCategory] = useState<string>("Everything Else");
  const [season, setSeason] = useState<string>("Jan-Sep");
  const [storageLength, setStorageLength] = useState<number>(1);
  const [inboundShippingRate, setInboundShippingRate] = useState<number>(0.0);
  const [hasEdited, setHasEdited] = useState<{ [key: string]: boolean }>({});

  // Pricing (Group 2)
  const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
  const minMargin = parseFloat(storedMetrics.minMargin || "0");

  const initialProductCost = calculateProductCostFromMargin(
    product.currentPrice || 0, // Use currentPrice as salePrice
    minMargin,
    calculateReferralFee(product.currentPrice || 0, "Everything Else"), // Referral Fee
    0, // Placeholder WFS Fee (will update later)
    0, // Placeholder Inbound Shipping Fee (will update later)
    0, // Placeholder Storage Fee (will update later)
    0, // Placeholder Prep Fee (will update later)
    0  // Placeholder Additional Fees (will update later)
  );

  const hasInitializedProductCost = useRef(false);

  const [productCost, setProductCost] = useState<number>(0.0);
  const [rawProductCost, setRawProductCost] = useState<string | null>(null);


  const [salePrice, setSalePrice] = useState<number>(product.currentPrice || 0);
  const [rawSalePrice, setRawSalePrice] = useState<string | null>(null);

  // Shipping Dimensions (Group 3)
  const [shippingLength, setShippingLength] = useState<number>(
    typeof product.shippingLength === "string"
      ? parseFloat(product.shippingLength)
      : product.shippingLength ?? 0
  );
  const [rawLength, setRawLength] = useState<string | null>(null);

  const [shippingWidth, setShippingWidth] = useState<number>(
    typeof product.shippingWidth === "string"
      ? parseFloat(product.shippingWidth)
      : product.shippingWidth ?? 0
  );
  const [rawWidth, setRawWidth] = useState<string | null>(null);

  const [shippingHeight, setShippingHeight] = useState<number>(
    typeof product.shippingHeight === "string"
      ? parseFloat(product.shippingHeight)
      : product.shippingHeight ?? 0
  );
  const [rawHeight, setRawHeight] = useState<string | null>(null);

  const [weight, setWeight] = useState<number>(
    typeof product.weight === "string"
      ? parseFloat(product.weight)
      : product.weight ?? 0
  );
  const [rawWeight, setRawWeight] = useState<string | null>(null);

  // Fees (Group 4)
  const [referralFee, setReferralFee] = useState<number>(
    calculateReferralFee(product.currentPrice || 0, contractCategory)
  ); const [rawReferralFee, setRawReferralFee] = useState<string | null>(null);

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
  const [isWalmartFulfilled, setIsWalmartFulfilled] = useState<boolean>(() => {
    const savedPreference = localStorage.getItem("isWalmartFulfilled");
    return savedPreference === "true" || savedPreference === null; // Default to true if no preference
  });
  const initializeWfsFee = () => {
    const recalculatedFee = calculateWFSFee(productForWFSFee); // Calculate WFS Fee
    setWfsFee(recalculatedFee); // Set the initial value
    setRawWfsFee(null); // Ensure no raw edits are active
    setHasEdited((prev) => ({ ...prev, wfsFee: false })); // Mark as unedited
  };

  useEffect(() => {
    initializeWfsFee(); // Simulate button click logic
  }, []); // Empty dependency array ensures it runs only once

  /////////////////////////////////////////////////////
  // Derived Values
  /////////////////////////////////////////////////////

  // Calculate dimensions and weights
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

  // Product data for WFS Fee calculation
  const productForWFSFee = {
    weight: finalShippingWeightForWFS,
    length: shippingLength,
    width: shippingWidth,
    height: shippingHeight,
    isWalmartFulfilled: isWalmartFulfilled,
    isApparel: product.isApparel || false,
    isHazardousMaterial: product.isHazardousMaterial || false,
    retailPrice: product.retailPrice || 0,
  };

  // Profit, ROI, and Margin calculations
  const [totalProfit, setTotalProfit] = useState(0); // Store Total Profit
  const [roi, setROI] = useState(0);                 // Store ROI
  const [margin, setMargin] = useState(0);           // Store Margin


  // State to manage the visibility of the Pricing section
  const [isOpen, setIsOpen] = useState<boolean>(areSectionsOpen);
  useEffect(() => setIsOpen(areSectionsOpen), [areSectionsOpen]); // Sync with props


  /////////////////////////////////////////////////////
  // Reset Button
  /////////////////////////////////////////////////////

  // Reset Pricing Section
  const resetPricing = () => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    const minMargin = parseFloat(storedMetrics.minMargin || "0");

    const initialProductCost = calculateProductCostFromMargin(
      salePrice,
      minMargin,
      referralFee,
      wfsFee,
      inboundShippingFee,
      storageFee,
      prepFee,
      additionalFees
    );

    setProductCost(initialProductCost);
    setSalePrice(product.currentPrice || 0);
    setRawProductCost(null);
    setRawSalePrice(null);

    // Reset text color
    setHasEdited((prev) => ({
      ...prev,
      productCost: false,
      salePrice: false,
    }));
  };


  const resetShippingDimensions = () => {
    setShippingLength(product.shippingLength || 0);
    setShippingWidth(product.shippingWidth || 0);
    setShippingHeight(product.shippingHeight || 0);
    setWeight(product.weight || 0);

    setRawLength(null);
    setRawWidth(null);
    setRawHeight(null);
    setRawWeight(null);

    // Reset text color
    setHasEdited((prev) => ({
      ...prev,
      shippingLength: false,
      shippingWidth: false,
      shippingHeight: false,
      weight: false,
    }));
  };


  const resetFees = () => {
    if (isWalmartFulfilled) {
      const recalculatedWfsFee = calculateWFSFee(productForWFSFee);
      const recalculatedStorageFee = parseFloat(
        calculateStorageFee(season, cubicFeet, storageLength)
      ) || 0;
      const recalculatedInboundShippingFee =
        finalShippingWeightForInbound * inboundShippingRate;

      setWfsFee(recalculatedWfsFee);
      setInboundShippingFee(recalculatedInboundShippingFee);
      setStorageFee(recalculatedStorageFee);
    } else {

      setWfsFee(0);
      setInboundShippingFee(0);
      setStorageFee(0);
    }

    // Reset other fees
    setPrepFee(0);
    setAdditionalFees(0);

    // Clear raw inputs and reset edit state
    setRawWfsFee(null);
    setRawInboundShippingFee(null);
    setRawStorageFee(null);
    setRawPrepFee(null);
    setRawAdditionalFees(null);

    setHasEdited({
      wfsFee: false,
      inboundShippingFee: false,
      storageFee: false,
      prepFee: false,
      additionalFees: false,
    });
  };

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

    setTotalProfit(updatedTotalProfit); // Update Total Profit

    const calculatedROI = parseFloat(calculateROI(updatedTotalProfit, productCost)); // Parse ROI
    setROI(isNaN(calculatedROI) ? 0 : calculatedROI); // Handle invalid ROI

    const calculatedMargin = parseFloat(calculateMargin(updatedTotalProfit, salePrice)); // Parse Margin
    setMargin(isNaN(calculatedMargin) ? 0 : calculatedMargin); // Handle invalid Margin
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



  /////////////////////////////////////////////////////
  // Effects
  /////////////////////////////////////////////////////

  useEffect(() => {
    if (!hasInitializedProductCost.current) {
      console.log("Initial Values:", {
        salePrice,
        referralFee,
        wfsFee,
        inboundShippingFee,
        storageFee,
        prepFee,
        additionalFees,
      });
  
      const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
      const minMargin = parseFloat(storedMetrics.minMargin || "0");
  
      const initialProductCost = calculateProductCostFromMargin(
        salePrice,
        minMargin,
        referralFee,
        wfsFee,
        inboundShippingFee,
        storageFee,
        prepFee,
        additionalFees
      );
  
      console.log("Initial Product Cost Calculated:", initialProductCost);
  
      setProductCost(initialProductCost);
      hasInitializedProductCost.current = true;
    }
  }, [
    salePrice,
    referralFee,
    wfsFee,
    inboundShippingFee,
    storageFee,
    prepFee,
    additionalFees,
  ]);
  
  

  useEffect(() => {
    if (isWalmartFulfilled) {
      // Only recalculate WFS Fee if it has not been manually edited
      if (!hasEdited.wfsFee) {
        const recalculatedWfsFee = calculateWFSFee(productForWFSFee);
        setWfsFee(recalculatedWfsFee);
      }

      // Only reset inbound shipping fee if not manually edited
      if (!hasEdited.inboundShippingFee) {
        const recalculatedInboundShippingFee =
          finalShippingWeightForInbound * inboundShippingRate;
        setInboundShippingFee(recalculatedInboundShippingFee); // No inbound shipping for Walmart Fulfilled
      }

      // Only reset storage fee if not manually edited
      if (!hasEdited.storageFee) {
        const recalculatedStorageFee = parseFloat(
          calculateStorageFee(season, cubicFeet, storageLength)
        ) || 0;
        setStorageFee(recalculatedStorageFee);
      }
    } else {
      // Seller Fulfilled logic
      if (!hasEdited.wfsFee) {
        setWfsFee(0); // No WFS Fee for Seller Fulfilled
      }

      if (!hasEdited.inboundShippingFee) {
        const recalculatedInboundShippingFee =
          finalShippingWeightForInbound * inboundShippingRate;
        setInboundShippingFee(recalculatedInboundShippingFee);
      }

      if (!hasEdited.storageFee) {
        setStorageFee(0); // No storage fee for Seller Fulfilled
      }
    }
  }, [
    isWalmartFulfilled,
    productForWFSFee,
    season,
    cubicFeet,
    storageLength,
    finalShippingWeightForInbound,
    inboundShippingRate,
    hasEdited, // Track edits to prevent overwrites
  ]);


  useEffect(() => {
    const savedPreference = localStorage.getItem("isWalmartFulfilled");
    const initialFulfillment = savedPreference === "true" || savedPreference === null;

    setIsWalmartFulfilled(initialFulfillment); // Default to Walmart Fulfilled
  }, []);


  // Sync state with product data
  useEffect(() => {
    if (product) {
      setShippingLength(
        typeof product.shippingLength === "string"
          ? parseFloat(product.shippingLength)
          : product.shippingLength ?? 0
      );
      setShippingWidth(
        typeof product.shippingWidth === "string"
          ? parseFloat(product.shippingWidth)
          : product.shippingWidth ?? 0
      );
      setShippingHeight(
        typeof product.shippingHeight === "string"
          ? parseFloat(product.shippingHeight)
          : product.shippingHeight ?? 0
      );
      setWeight(
        typeof product.weight === "string"
          ? parseFloat(product.weight)
          : product.weight ?? 0
      );
    }
  }, [product]);


  // Load settings from localStorage
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    setSeason(storedMetrics.season || "Jan-Sep");
    setStorageLength(parseInt(storedMetrics.storageLength) || 1);
    setInboundShippingRate(parseFloat(storedMetrics.inboundShippingCost) || 0.5);
  }, []);

  // Update inbound shipping fee
  useEffect(() => {
    const newInboundShippingFee = finalShippingWeightForInbound * inboundShippingRate;
    setInboundShippingFee(newInboundShippingFee);
  }, [finalShippingWeightForInbound, inboundShippingRate]);

  // Update storage fee
  useEffect(() => {
    const calculatedStorageFee = parseFloat(
      calculateStorageFee(season, cubicFeet, storageLength) || "0"
    );
    setStorageFee(isNaN(calculatedStorageFee) ? 0 : calculatedStorageFee);
  }, [shippingLength, shippingWidth, shippingHeight, cubicFeet, season, storageLength]);

  // Update referral fee
  useEffect(() => {
    const updatedReferralFee = calculateReferralFee(salePrice, contractCategory);
    setReferralFee(updatedReferralFee);
  }, [salePrice, contractCategory]);

  // Additional Fees Calculation
  useEffect(() => {
    const recalculatedAdditionalFees = calculateAdditionalFees(weight);
    setAdditionalFees(recalculatedAdditionalFees);
  }, [weight]);


  /////////////////////////////////////////////////////
  // Fulfilment Buttons
  /////////////////////////////////////////////////////
  // Load preference on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem("isWalmartFulfilled");
    setIsWalmartFulfilled(savedPreference === "true" || savedPreference === null); // Default to Walmart Fulfilled if no preference
  }, []);

  // Save preference whenever it changes
  useEffect(() => {
    localStorage.setItem("isWalmartFulfilled", isWalmartFulfilled.toString());
  }, [isWalmartFulfilled]);

  /////////////////////////////////////////////////////
  // Helper Functions
  /////////////////////////////////////////////////////

  const formatToTwoDecimalPlaces = (value: number): string => value.toFixed(2);

  const toggleOpen = () => setIsOpen(!isOpen);





  /////////////////////////////////////////////////


  return (
    <div
      id="Pricing"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}>
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}>
        {isOpen ? "▼ Pricing" : "▶ Pricing"}
      </h1>
      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>



        <div id="Pricing" className="p-1 bg-[#d7d7d7] rounded-lg shadow-sm">


          {/*----------------------------------------------------------------*/}
          {/*Group 1: Revenue - Key Metrics*/}
          <div className="w-full mb-2 p-1 bg-white rounded-lg shadow-sm">
            <h2 className="text-base font-bold mb-3 mx-2">Revenue Metrics</h2>
            <div className="space-y-2"> {/* Adds spacing between items */}

              {/* Monthly Sales Est Row */}
              <div className="flex justify-between items-center mx-5 text-sm">
                <span className="font-semibold">Monthly Sales Est</span>
                <span className="text-sm">Coming Soon...</span>
              </div>

              {/* Total Profit Row */}
              <div className="flex justify-between items-center mx-5 text-sm">
                <span className="font-semibold">Total Profit</span>
                <span className="text-sm">{`$${totalProfit.toFixed(2)}`}</span>
              </div>

              {/* Margin Row */}
              <div className="flex justify-between items-center mx-5 text-sm">
                <span className="font-semibold">Margin</span>
                <span className="text-sm">{`${margin}%`}</span>
              </div>

              {/* ROI Row */}
              <div className="flex justify-between items-center mx-5 text-sm">
                <span className="font-semibold">ROI</span>
                <span className={`text-sm  ${productCost === 0 ? "text-red-500 font-extrabold" : "text-black"}`}>
                  {productCost === 0 ? "Enter Cost" : `${roi}%`}
                </span>
              </div>

            </div>
          </div>




          {/*----------------------------------------------------------------*/}
          { /* Group 2: Pricing */}
          <div className="w-full mb-2 p-1 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3 mx-2">
              <h2 className="text-base font-bold">Pricing</h2>
              <button
                onClick={resetPricing}
                className="p-0.5 px-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                aria-label="Reset Pricing"
              >
                ↻
              </button>
            </div>
            <div className="space-y-2 text-sm">


              {/* Product Cost Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Product Cost
                </label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={rawProductCost !== null ? rawProductCost : productCost.toFixed(2)}
                    onChange={(e) => {
                      setRawProductCost(e.target.value); // Capture raw input
                      setHasEdited((prev) => ({ ...prev, productCost: true })); // Mark as edited
                    }}
                    onBlur={() => {
                      if (rawProductCost !== null) {
                        const formattedValue = parseFloat(rawProductCost).toFixed(2); // Format input
                        setProductCost(parseFloat(formattedValue)); // Update state
                        setRawProductCost(null); // Clear raw input
                      }
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.productCost ? "text-black font-bold" : "text-gray-700"}`}
                  />
                </div>
              </div>

              {/* Sale Price Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Sale Price
                </label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={rawSalePrice !== null ? rawSalePrice : salePrice.toFixed(2)}
                    onChange={(e) => setRawSalePrice(e.target.value)} // Update raw input
                    onBlur={() => {
                      const formattedValue = parseFloat(rawSalePrice || salePrice.toString()).toFixed(2);
                      setSalePrice(parseFloat(formattedValue)); // Update salePrice state
                      setRawSalePrice(null); // Clear raw input state
                      setHasEdited((prev) => ({ ...prev, salePrice: true })); // Mark Additional Fees as edited
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.salePrice ? "text-black font-bold" : "text-gray-700"}`}
                  />
                </div>
              </div>
            </div>
          </div>


          {/*----------------------------------------------------------------*/}
          {/* Group 3: Shipping Dimensions */}
          <div className="w-full mb-2 p-1 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3 mx-2">
              <h2 className="text-base font-bold">Shipping Dimensions</h2>
              <button
                onClick={resetShippingDimensions}
                className="p-0.5 px-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                aria-label="Reset Shipping Dimensions"
              >
                ↻
              </button>
            </div>
            <div className="space-y-2 text-sm">

              {/* Length Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Length
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={rawLength !== null ? rawLength : typeof shippingLength === 'number' ? shippingLength.toFixed(2) : '0.00'}
                    onChange={(e) => setRawLength(e.target.value)}
                    onBlur={() => {
                      const formattedValue = parseFloat(rawLength || shippingLength.toString()).toFixed(2);
                      setShippingLength(parseFloat(formattedValue) || 0); // Update actual length state
                      setRawLength(null); // Clear raw input state
                      setHasEdited((prev) => ({ ...prev, shippingLength: true })); // Mark Additional Fees as edited
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.shippingLength ? "text-black font-bold" : "text-gray-700"}`}
                  />
                  <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">in</span>
                </div>
              </div>

              {/* Width Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Width
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={rawWidth !== null ? rawWidth : typeof shippingWidth === 'number' ? shippingWidth.toFixed(2) : '0.00'}
                    onChange={(e) => setRawWidth(e.target.value)}
                    onBlur={() => {
                      const formattedValue = parseFloat(rawWidth || shippingWidth.toString()).toFixed(2);
                      setShippingWidth(parseFloat(formattedValue) || 0); // Update actual width state
                      setRawWidth(null); // Clear raw input state
                      setHasEdited((prev) => ({ ...prev, shippingWidth: true })); // Mark Additional Fees as edited
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.shippingWidth ? "text-black font-bold" : "text-gray-700"}`}
                  />
                  <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">in</span>
                </div>
              </div>

              {/* Height Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Height
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={rawHeight !== null ? rawHeight : typeof shippingHeight === 'number' ? shippingHeight.toFixed(2) : '0.00'}
                    onChange={(e) => setRawHeight(e.target.value)}
                    onBlur={() => {
                      const formattedValue = parseFloat(rawHeight || shippingHeight.toString()).toFixed(2);
                      setShippingHeight(parseFloat(formattedValue) || 0); // Update actual height state
                      setRawHeight(null); // Clear raw input state
                      setHasEdited((prev) => ({ ...prev, shippingHeight: true })); // Mark Additional Fees as edited
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.shippingHeight ? "text-black font-bold" : "text-gray-700"}`}
                  />
                  <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">in</span>
                </div>
              </div>

              {/* Weight Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Weight
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={rawWeight !== null ? rawWeight : typeof weight === 'number' ? weight.toFixed(2) : '0.00'}
                    onChange={(e) => setRawWeight(e.target.value)}
                    onBlur={() => {
                      const formattedValue = parseFloat(rawWeight || weight.toString()).toFixed(2);
                      setWeight(parseFloat(formattedValue) || 0); // Update actual weight state
                      setRawWeight(null); // Clear raw input state
                      setHasEdited((prev) => ({ ...prev, weight: true })); // Mark Additional Fees as edited
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.weight ? "text-black font-bold" : "text-gray-700"}`}
                  />
                  <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">lbs</span>
                </div>
              </div>

            </div>
          </div>



          {/*----------------------------------------------------------------*/}
          {/* Group 4: Fees */}
          <div className="w-full mb-2 p-1 bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3 mx-2">
              <h2 className="text-base font-bold">Fees</h2>
              <button
                onClick={resetFees}
                className="p-0.5 px-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                aria-label="Reset Fees"
              >
                ↻
              </button>
            </div>
            <div className="space-y-2 text-sm">

              {/* Referral Fee Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Referral Fee
                </label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={rawReferralFee !== null ? rawReferralFee : referralFee.toFixed(2)} // Use rawReferralFee if editing, otherwise formatted referralFee
                    onChange={(e) => setRawReferralFee(e.target.value)} // Update rawReferralFee on input change
                    onBlur={() => {
                      const formattedValue = parseFloat(rawReferralFee || referralFee.toString()).toFixed(2); // Format input to 2 decimal places
                      setReferralFee(parseFloat(formattedValue) || 0); // Update referralFee state
                      setRawReferralFee(null); // Clear rawReferralFee state
                      setHasEdited((prev) => ({ ...prev, referralFee: true })); // Mark Additional Fees as edited
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.referralFee ? "text-black font-bold" : "text-gray-700"}`}
                  />
                </div>
              </div>

              {/* WFS Fee Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">WFS Fee</label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={rawWfsFee !== null ? rawWfsFee : wfsFee.toFixed(2)} // Show raw or formatted WFS Fee
                    onChange={(e) => {
                      const input = e.target.value.replace(/[^0-9.]/g, ""); // Allow numbers and a single decimal point
                      setRawWfsFee(input); // Store the raw input
                      setHasEdited((prev) => ({ ...prev, wfsFee: true })); // Mark as edited
                    }}
                    onBlur={() => {
                      if (rawWfsFee !== null) {
                        const formattedValue = parseFloat(rawWfsFee).toFixed(2); // Format input to 2 decimals
                        setWfsFee(parseFloat(formattedValue)); // Update WFS Fee state with formatted value
                        setRawWfsFee(null); // Clear raw input
                      }
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.wfsFee ? "text-black font-bold" : "text-gray-700"
                      }`}
                  />
                </div>
              </div>

              {/* Inbound Shipping Fee Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">Inbound Shipping Fee</label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={rawInboundShippingFee !== null ? rawInboundShippingFee : inboundShippingFee.toFixed(2)}
                    onChange={(e) => {
                      const input = e.target.value.replace(/[^0-9.]/g, ""); // Allow numbers and a single decimal point
                      setRawInboundShippingFee(input); // Store the raw input
                    }}
                    onBlur={() => {
                      if (rawInboundShippingFee !== null) {
                        const formattedValue = parseFloat(rawInboundShippingFee).toFixed(2); // Format to 2 decimals
                        setInboundShippingFee(parseFloat(formattedValue) || 0); // Update actual state
                        setRawInboundShippingFee(null); // Clear raw input
                        setHasEdited((prev) => ({ ...prev, inboundShippingFee: true })); // Mark as edited
                      }
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.inboundShippingFee ? "text-black font-bold" : "text-gray-700"
                      }`}
                  />
                </div>
              </div>

              {/* Storage Fee Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">Storage Fee</label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={rawStorageFee !== null ? rawStorageFee : storageFee.toFixed(2)}
                    onChange={(e) => {
                      const input = e.target.value.replace(/[^0-9.]/g, ""); // Allow numbers and a single decimal point
                      setRawStorageFee(input); // Update raw input state
                    }}
                    onBlur={() => {
                      if (rawStorageFee !== null) {
                        const formattedValue = parseFloat(rawStorageFee).toFixed(2); // Format to 2 decimals
                        setStorageFee(parseFloat(formattedValue) || 0); // Update storage fee state
                        setRawStorageFee(null); // Clear raw input state
                        setHasEdited((prev) => ({ ...prev, storageFee: true })); // Mark as edited
                      }
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.storageFee ? "text-black font-bold" : "text-gray-700"
                      }`}
                  />
                </div>
              </div>

              {/* Prep Fee Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Prep Fee
                </label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={rawPrepFee !== null ? rawPrepFee : prepFee.toFixed(2)}
                    onChange={(e) => {
                      const input = e.target.value.replace(/[^0-9.]/g, ""); // Allow only numbers and a single decimal point
                      setRawPrepFee(input); // Update raw input state
                    }}
                    onBlur={() => {
                      if (rawPrepFee !== null) {
                        const formattedValue = parseFloat(rawPrepFee).toFixed(2); // Format to 2 decimal places
                        setPrepFee(parseFloat(formattedValue) || 0); // Update actual state
                        setRawPrepFee(null); // Clear raw input state
                        setHasEdited((prev) => ({ ...prev, prepFee: true })); // Mark Additional Fees as edited
                      }
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.prepFee ? "text-black font-bold" : "text-gray-700"}`}
                  />
                </div>
              </div>

              {/* Additional Fees Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Additional Fees
                </label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={rawAdditionalFees !== null ? rawAdditionalFees : additionalFees.toFixed(2)} // Display raw input if editing, otherwise formatted additionalFees
                    onChange={(e) => {
                      const input = e.target.value.replace(/[^0-9.]/g, ""); // Allow numbers and a single decimal point
                      setRawAdditionalFees(input); // Update raw input state
                      setHasEdited((prev) => ({ ...prev, additionalFees: true })); // Mark Additional Fees as edited
                    }}
                    onBlur={() => {
                      if (rawAdditionalFees !== null) {
                        const formattedValue = parseFloat(rawAdditionalFees).toFixed(2); // Format to 2 decimal places
                        setAdditionalFees(parseFloat(formattedValue) || 0); // Update actual state
                        setRawAdditionalFees(null); // Clear raw input state
                      }
                    }}
                    className={`p-1 pr-3 text-right w-full border rounded ${hasEdited.additionalFees ? "text-black font-bold" : "text-gray-700"}`}
                  />
                </div>
              </div>
            </div>
          </div>



          {/*----------------------------------------------------------------*/}
          {/* Group 5: Contract Category */}
          <div className="w-full mb-2 p-1 bg-white rounded-lg shadow-sm">
            <h2 className="text-base font-bold mb-3 mx-2">Contract Category</h2>
            <div className="flex items-center mx-5 text-sm">

              <div className="w-full">
                <select
                  value={contractCategory}
                  onChange={(e) => setContractCategory(e.target.value)}
                  className="p-1 w-full border border-gray-300 rounded bg-gray-100 text-gray-700">
                  {contractCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>



          {/*----------------------------------------------------------------*/}
          {/* Group 6: Fulfillment Buttons */}
          <div className="flex space-x-2 my-4 mx-5">
            {/* Walmart Fulfilled */}
            <div className="flex-1">
              <label
                className={`flex flex-col items-center justify-center p-2 border-2 cursor-pointer ${isWalmartFulfilled
                  ? 'bg-[#006EDC] text-white shadow-inner-crisp'
                  : 'bg-gray-200 text-black shadow-none'
                  }`}
                onClick={() => {
                  setIsWalmartFulfilled(true);
                  setHasEdited({}); // Clear edited states on toggle
                }}
              >
                <input
                  type="radio"
                  checked={isWalmartFulfilled}
                  className="hidden"
                />
                <span className="block font-bold">Walmart</span>
                <span className="block font-bold">Fulfilled</span>
              </label>
            </div>

            {/* Seller Fulfilled */}
            <div className="flex-1">
              <label
                className={`flex flex-col items-center justify-center p-2 border-2 cursor-pointer ${!isWalmartFulfilled
                  ? 'bg-[#006EDC] text-white shadow-inner-crisp'
                  : 'bg-gray-200 text-black shadow-none'
                  }`}
                onClick={() => {
                  setIsWalmartFulfilled(false);
                  setHasEdited({}); // Clear edited states on toggle
                }}
              >
                <input
                  type="radio"
                  checked={!isWalmartFulfilled}
                  className="hidden"
                />
                <span className="block font-bold">Seller</span>
                <span className="block font-bold">Fulfilled</span>
              </label>
            </div>
          </div>


        </div>
      </div >
    </div >
  );
}
