/////////////////////////////////////////////////
// Imports and Type Definitions
/////////////////////////////////////////////////

import React, { useState, useEffect } from "react";
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

  // Pricing (Group 2)
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
  const totalProfit = calculateTotalProfit(
    salePrice,
    productCost,
    referralFee,
    wfsFee,
    inboundShippingFee,
    storageFee,
    prepFee,
    additionalFees
  );
  const roi = calculateROI(totalProfit, productCost);
  const margin = calculateMargin(totalProfit, salePrice);

  // State to manage the visibility of the Pricing section
  const [isOpen, setIsOpen] = useState<boolean>(areSectionsOpen);
  useEffect(() => setIsOpen(areSectionsOpen), [areSectionsOpen]); // Sync with props




  /////////////////////////////////////////////////////
  // Effects
  /////////////////////////////////////////////////////

  // Sync state with product data
  useEffect(() => {
    if (product) {
      setShippingLength(product.shippingLength ?? 0);
      setShippingWidth(product.shippingWidth ?? 0);
      setShippingHeight(product.shippingHeight ?? 0);
      setWeight(product.weight ?? 0);
      setIsWalmartFulfilled(product.isWalmartFulfilled || false);
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

  // WFS Fee Calculation
  useEffect(() => {
    const recalculatedWFSFee = calculateWFSFee(productForWFSFee);
    setWfsFee(recalculatedWFSFee);
  }, [productForWFSFee]);

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
            <h2 className="text-base font-bold mb-1">Revenue Metrics</h2>
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
          {/* Pricing Section */}
          <div className="w-full mb-2 p-1 bg-white rounded-lg shadow-sm">
            <h2 className="text-base font-bold mb-2">Pricing</h2>
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
                    onChange={(e) => setRawProductCost(e.target.value)} // Update raw input
                    onBlur={() => {
                      const formattedValue = parseFloat(rawProductCost || productCost.toString()).toFixed(2);
                      setProductCost(parseFloat(formattedValue)); // Update productCost state
                      setRawProductCost(null); // Clear raw input state
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
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
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
                  />
                </div>
              </div>
            </div>
          </div>


          {/*----------------------------------------------------------------*/}
          {/* Group 3: Shipping Dimensions */}
          <div className="w-full mb-2 p-1 bg-white rounded-lg shadow-sm">
            <h2 className="text-base font-bold mb-2">Shipping Dimensions</h2>
            <div className="space-y-2 text-sm"> {/* Vertical spacing between items */}

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
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
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
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
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
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
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
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
                  />
                  <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">lbs</span>
                </div>
              </div>

            </div>
          </div>



          {/*----------------------------------------------------------------*/}
          {/* Group 4: Fees */}
          <div className="w-full mb-2 p-1 bg-white rounded-lg shadow-sm">
            <h2 className="text-base font-bold mb-2">Fees</h2>
            <div className="space-y-2 text-sm"> {/* Adds vertical spacing between rows */}

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
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black" // Remove `readOnly` to allow editing
                  />
                </div>
              </div>


              {/* WFS Fee Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  WFS Fee
                </label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={rawWfsFee !== null ? rawWfsFee : wfsFee.toFixed(2)} // Display rawWfsFee if editing, else formatted wfsFee
                    onChange={(e) => setRawWfsFee(e.target.value)} // Allow editing
                    onBlur={() => {
                      if (rawWfsFee !== null) {
                        const formattedValue = parseFloat(rawWfsFee || wfsFee.toString()).toFixed(2);
                        setWfsFee(parseFloat(formattedValue) || 0); // Update WFS Fee state
                        setRawWfsFee(null); // Clear raw input
                      }
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
                  />
                  <button
                    onClick={() => {
                      const recalculatedFee = calculateWFSFee(productForWFSFee); // Recalculate WFS Fee
                      setWfsFee(recalculatedFee); // Reset to calculated value
                      setRawWfsFee(null); // Exit edit mode
                    }}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                  >
                    ↻
                  </button>
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
                      // Store the raw input as the user types
                      const input = e.target.value.replace(/[^0-9.]/g, ""); // Allow numbers and a single decimal point
                      setRawInboundShippingFee(input);
                    }}
                    onBlur={() => {
                      // Format and save the value on blur
                      if (rawInboundShippingFee !== null) {
                        const formattedValue = parseFloat(rawInboundShippingFee).toFixed(2); // Format to 2 decimals
                        setInboundShippingFee(parseFloat(formattedValue) || 0); // Update actual state
                        setRawInboundShippingFee(null); // Clear raw input
                      }
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
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
                        setStorageFee(parseFloat(formattedValue) || 0); // Update actual storage fee state
                        setRawStorageFee(null); // Clear raw input state
                      }
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
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
                      }
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
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
                    }}
                    onBlur={() => {
                      if (rawAdditionalFees !== null) {
                        const formattedValue = parseFloat(rawAdditionalFees).toFixed(2); // Format to 2 decimal places
                        setAdditionalFees(parseFloat(formattedValue) || 0); // Update actual state
                        setRawAdditionalFees(null); // Clear raw input state
                      }
                    }}
                    className="p-1 pr-3 text-right w-full border rounded text-black"
                  />
                  <button
                    onClick={() => {
                      const recalculatedFee = calculateAdditionalFees(weight); // Ensure this returns a number
                      setAdditionalFees(recalculatedFee); // Update state with the recalculated fee
                      setRawAdditionalFees(null); // Clear raw input state
                    }}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
                  >
                    ↻
                  </button>
                </div>
              </div>


            </div>
          </div>



          {/*----------------------------------------------------------------*/}
          {/* Group 5: Contract Category */}
          <div className="w-full mb-2 p-1 bg-white rounded-lg shadow-sm">
            <h2 className="text-base font-bold mb-2">Contract Category</h2>
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
                onClick={() => setIsWalmartFulfilled(true)}
              >
                <input
                  type="radio"
                  checked={isWalmartFulfilled}
                  onChange={() => setIsWalmartFulfilled(true)}
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
                onClick={() => setIsWalmartFulfilled(false)}
              >
                <input
                  type="radio"
                  checked={!isWalmartFulfilled}
                  onChange={() => setIsWalmartFulfilled(false)}
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
