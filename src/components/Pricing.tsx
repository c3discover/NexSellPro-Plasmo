import React, { 
  useState, 
  useEffect 
} from "react";

import {
  calculateReferralFee,
  calculateWFSFee,
  calculateInboundShipping,
  calculateStorageFee,
  calculateCubicFeet,
  calculateTotalProfit,
  calculateROI,
  calculateMargin,
  calculateProductCostFromMargin,
  calculateFinalShippingWeightForInbound,
  calculateFinalShippingWeightForWFS,
  calculateAdditionalFees,
} from "../utils/calculations";

import { 
  contractCategoryOptions, 
  seasonOptions 
} from "../constants/options";




// Define the types expected in the component props
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






export const Pricing: React.FC<PricingProps> = ({ product, areSectionsOpen }) => {
  // State to manage the visibility of the Pricing section
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  useEffect(() => setIsOpen(areSectionsOpen), [areSectionsOpen]);

  // Initialize state for product details and calculated values
  const [productCost, setProductCost] = useState(0.0); // Cost of the product
  const [contractCategory, setContractCategory] = useState("Everything Else"); // Category for referral fee
  const [inboundShippingRate, setInboundShippingRate] = useState(0.5); // Rate for inbound shipping per lb
  const [prepFee, setPrepFee] = useState(0); // Preparation fee
  const [isWalmartFulfilled, setIsWalmartFulfilled] = useState(true); // Whether Walmart fulfills the product
  const [salePrice, setSalePrice] = useState(product.currentPrice || 0); // Sale price of the product
  const [inboundShippingFee, setInboundShippingFee] = useState(0); // Calculated inbound shipping fee
  const [storageFee, setStorageFee] = useState(0); // Calculated storage fee
  const [season, setSeason] = useState("Jan-Sep"); // Default storage season
  const [storageLength, setStorageLength] = useState(1); // Default storage length in months
  const [isProductCostEdited, setProductCostEdited] = useState(false);
  const [isSalePriceEdited, setSalePriceEdited] = useState(false);
  const [isInboundShippingFeeEdited, setInboundShippingFeeEdited] = useState(false);
  const [isStorageFeeEdited, setStorageFeeEdited] = useState(false);
  const [isPrepFeeEdited, setPrepFeeEdited] = useState(false);

  // Dimensions and weight of the product
  const [shippingLength, setShippingLength] = useState(product.shippingLength || 0);
  const [shippingWidth, setShippingWidth] = useState(product.shippingWidth || 0);
  const [shippingHeight, setShippingHeight] = useState(product.shippingHeight || 0);
  const [weight, setWeight] = useState(product.weight || 0);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    setSeason(storedMetrics.season || "Jan-Sep");
    setStorageLength(parseInt(storedMetrics.storageLength) || 1);
    setProductCost(parseFloat(storedMetrics.minProfit) || 0);
    setInboundShippingRate(parseFloat(storedMetrics.inboundShippingCost) || 0.5);

    // Retrieve and set the preparation fee based on type
    const savedPrepCostType = localStorage.getItem("prepCostType");
    const savedPrepCostPerLb = parseFloat(localStorage.getItem("prepCostPerLb")) || 0;
    const savedPrepCostEach = parseFloat(localStorage.getItem("prepCostEach")) || 0;
    setPrepFee(savedPrepCostType === "per lb" ? savedPrepCostPerLb * weight : savedPrepCostEach);
  }, [weight]);

  // Calculate the cubic feet based on the product dimensions
  const cubicFeet = calculateCubicFeet(shippingLength, shippingWidth, shippingHeight);

  // Calculate final shipping weights for inbound and WFS purposes
  const finalShippingWeightForInbound = calculateFinalShippingWeightForInbound(weight, shippingLength, shippingWidth, shippingHeight);
  const finalShippingWeightForWFS = calculateFinalShippingWeightForWFS(weight, shippingLength, shippingWidth, shippingHeight);

  // Calculate inbound shipping fee using the inbound-specific final shipping weight
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    const inboundShippingCost = parseFloat(storedMetrics.inboundShippingCost) || 0.5;
    const newInboundShippingFee = finalShippingWeightForInbound * inboundShippingCost;
    setInboundShippingFee(newInboundShippingFee);
  }, [finalShippingWeightForInbound]);

  // Prepare the product data for WFS Fee calculation with WFS-specific weight
  const productForWFSFee = {
    weight: finalShippingWeightForWFS,
    length: shippingLength,
    width: shippingWidth,
    height: shippingHeight,
    isWalmartFulfilled,
    isApparel: product.isApparel || false,
    isHazardousMaterial: product.isHazardousMaterial || false,
    retailPrice: product.retailPrice || 0,
  };

  // Calculate the WFS Fee
  const wfsFee = calculateWFSFee(productForWFSFee);

  // Calculate additional fees (e.g., apparel, hazardous material, etc.)
  const additionalFees = calculateAdditionalFees(weight);

  // Calculate referral fee based on sale price and contract category
  const referralFee = calculateReferralFee(salePrice, contractCategory);

  // Calculate total profit, ROI, and margin based on all fees and costs
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

  // Calculate storage fee based on cubic feet, season, and storage length
  useEffect(() => {
    const calculatedStorageFee = parseFloat(calculateStorageFee(season, cubicFeet, storageLength));
    setStorageFee(isNaN(calculatedStorageFee) ? 0 : calculatedStorageFee);
  }, [shippingLength, shippingWidth, shippingHeight, cubicFeet, season, storageLength]);

  // Helper function to format numbers to two decimal places, showing 0 as "0.00"
  const formatToTwoDecimalPlaces = (value: number): string => {
    return value.toFixed(2);
  };

// Define a custom style for input fields that change color based on edit state
const inputBaseStyle = "p-1 pr-3 text-right w-full border rounded-r";
const greyTextStyle = "text-gray-500 font-normal"; // Style for initial values
const blackBoldStyle = "text-black font-bold"; // Style for manually edited values

// Utility function for handling user input formatting and styling
const formatInputValue = (value: number) => value.toFixed(2);

// Function to apply conditional style for input fields
const getConditionalInputStyle = (isEdited: boolean) => `${inputBaseStyle} ${isEdited ? blackBoldStyle : greyTextStyle}`;

  // Handlers for input changes with formatting and style updates
  const handleProductCostChange = (e) => {
    const formattedValue = parseFloat(e.target.value) || 0;
    setProductCost(formattedValue);
    setProductCostEdited(true);
  };

  const handleSalePriceChange = (e) => {
    const formattedValue = parseFloat(e.target.value) || 0;
    setSalePrice(formattedValue);
    setSalePriceEdited(true);
  };

  const handleInboundShippingFeeChange = (e) => {
    const formattedValue = parseFloat(e.target.value) || 0;
    setInboundShippingFee(formattedValue);
    setInboundShippingFeeEdited(true);
  };

  const handleStorageFeeChange = (e) => {
    const formattedValue = parseFloat(e.target.value) || 0;
    setStorageFee(formattedValue);
    setStorageFeeEdited(true);
  };

  const handlePrepFeeChange = (e) => {
    const formattedValue = parseFloat(e.target.value) || 0;
    setPrepFee(formattedValue);
    setPrepFeeEdited(true);
  };

  // Toggle Pricing section visibility
  const toggleOpen = () => setIsOpen(!isOpen);




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
                value={formatInputValue(productCost)}
                onChange={handleProductCostChange}
                className={getConditionalInputStyle(isProductCostEdited)}
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
                value={formatInputValue(salePrice)}
                onChange={handleSalePriceChange}
                className={getConditionalInputStyle(isSalePriceEdited)}
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
                    value={shippingLength}
                    onChange={(e) => {
                      let input = e.target.value.replace(/[^0-9.]/g, ""); // Allow only numbers and decimal point
                      setShippingLength(parseFloat(input) || 0);
                    }}
                    className="p-1 pr-3 text-right w-full border rounded-l"
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
                    value={shippingWidth}
                    onChange={(e) => {
                      let input = e.target.value.replace(/[^0-9.]/g, ""); // Allow only numbers and decimal point
                      setShippingWidth(parseFloat(input) || 0);
                    }}
                    className="p-1 pr-3 text-right w-full border rounded-l"
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
                    value={shippingHeight}
                    onChange={(e) => {
                      let input = e.target.value.replace(/[^0-9.]/g, ""); // Allow only numbers and decimal point
                      setShippingHeight(parseFloat(input) || 0);
                    }}
                    className="p-1 pr-3 text-right w-full border rounded-l"
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
                    value={weight}
                    onChange={(e) => {
                      let input = e.target.value.replace(/[^0-9.]/g, ""); // Allow only numbers and decimal point
                      setWeight(parseFloat(input) || 0);
                    }}
                    className="p-1 pr-3 text-right w-full border rounded-l"
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
                    value={typeof referralFee === "number" ? referralFee.toFixed(2) : referralFee} // Check if referralFee is a number before using toFixed
                    readOnly
                    className="p-1 pr-3 text-right w-full border rounded-r"
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
                    value={typeof wfsFee === "number" ? wfsFee.toFixed(2) : wfsFee} // Check if wfsFee is a number before using toFixed
                    readOnly
                    className="p-1 pr-3 text-right w-full border rounded-r"
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
                    value={inboundShippingFee.toFixed(2)}
                    onChange={(e) => {
                      let input = e.target.value.replace(/[^0-9]/g, ""); // Only numeric input
                      if (input) {
                        input = (parseFloat(input) / 100).toFixed(2); // Automatically format to 2 decimals
                        setInboundShippingFee(parseFloat(input));
                      } else {
                        setInboundShippingFee(0); // Default to 0 if empty
                      }
                    }}
                    className="p-1 pr-3 text-right w-full border rounded-r"
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
                    value={storageFee.toFixed(2)}
                    onChange={(e) => {
                      let input = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                      if (input) {
                        input = (parseFloat(input) / 100).toFixed(2); // Format with two decimal places
                        setStorageFee(parseFloat(input));
                      } else {
                        setStorageFee(0); // Default to 0 if input is empty
                      }
                    }}
                    className="p-1 pr-3 text-right w-full border rounded-r"
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
                    value={prepFee.toFixed(2)}
                    onChange={(e) => setPrepFee(parseFloat(e.target.value))}
                    className="p-1 pr-3 text-right w-full border rounded-r"
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
                    value={additionalFees.toFixed(2)}
                    readOnly // Set to read-only as additionalFees is calculated
                    className="p-1 pr-3 text-right w-full border rounded-r"
                  />
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
          <div className="flex space-x-2 my-4 mx-5"> {/* Flex container with spacing between buttons */}
            <div className="flex-1">
              <label
                className={`flex flex-col items-center justify-center p-2 border-2 cursor-pointer ${isWalmartFulfilled
                  ? 'bg-[#006EDC] text-white shadow-inner-crisp'
                  : 'bg-gray-200 text-black shadow-none'
                  }`}
                onClick={() => setIsWalmartFulfilled(true)}>
                <input
                  type="radio"
                  checked={isWalmartFulfilled}
                  onChange={() => setIsWalmartFulfilled(true)}
                  className="hidden" />
                <span className="block font-bold">Walmart</span>
                <span className="block font-bold">Fulfilled</span>
              </label>
            </div>

            <div className="flex-1">
              <label
                className={`flex flex-col items-center justify-center p-2 border-2 cursor-pointer ${!isWalmartFulfilled
                  ? 'bg-[#006EDC] text-white shadow-inner-crisp'
                  : 'bg-gray-200 text-black shadow-none'}`}
                onClick={() => setIsWalmartFulfilled(false)}>
                <input
                  type="radio"
                  checked={!isWalmartFulfilled}
                  onChange={() => setIsWalmartFulfilled(false)}
                  className="hidden" />
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