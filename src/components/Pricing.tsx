import React, { useState, useEffect } from "react";

// Import calculation functions for different fees and metrics
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
} from "../utils/calculations";

// Import category options
import { contractCategoryOptions, seasonOptions } from "../constants/options";

// Define interfaces for expected prop types
interface Product {
  shippingLength?: number;
  shippingWidth?: number;
  shippingHeight?: number;
  weight?: number;
  currentPrice?: number;
}

interface PricingProps {
  product: Product;
  areSectionsOpen: boolean;
}

export const Pricing: React.FC<PricingProps> = ({ product, areSectionsOpen }) => {
  // Controls the visibility of the Pricing section
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  useEffect(() => setIsOpen(areSectionsOpen), [areSectionsOpen]);

  // States for various input and calculated values
  const [productCost, setProductCost] = useState<number>(0.00);
  const [contractCategory, setContractCategory] = useState<string>("Everything Else");
  const [inboundShippingRate, setInboundShippingRate] = useState<number>(0.5);
  const [prepFee, setPrepFee] = useState<number>(0);
  const [additionalFees, setAdditionalFees] = useState<number>(0);
  const [isWalmartFulfilled, setIsWalmartFulfilled] = useState<boolean>(true);
  const [salePrice, setSalePrice] = useState<number>(product.currentPrice || 0);
  const [inboundShippingFee, setInboundShippingFee] = useState(0);
  const [storageFee, setStorageFee] = useState(0);
  const [season, setSeason] = useState("Jan-Sep");
  const [storageLength, setStorageLength] = useState(1);

  // Extract product dimensions and weight from the API-provided `product` object
  const [shippingLength, setShippingLength] = useState<number>(product.shippingLength || 0);
  const [shippingWidth, setShippingWidth] = useState<number>(product.shippingWidth || 0);
  const [shippingHeight, setShippingHeight] = useState<number>(product.shippingHeight || 0);
  const [weight, setWeight] = useState<number>(product.weight || 0);

  // Initialize settings for season and storage length from localStorage
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    setSeason(storedMetrics.season || "Jan-Sep");
    setStorageLength(parseInt(storedMetrics.storageLength) || 1);
  }, []); // Run once on mount

  // Calculate cubic feet based on product dimensions
  const cubicFeet = calculateCubicFeet(shippingLength, shippingWidth, shippingHeight);

  // Calculate fees and metrics based on product details
  const referralFee = calculateReferralFee(salePrice, contractCategory);
  const finalShippingWeight = weight + 0.25; // Add buffer for packaging
  const wfsFee = calculateWFSFee(finalShippingWeight, isWalmartFulfilled) as number;
  const inboundShipping = calculateInboundShipping(weight, inboundShippingRate);

  // Calculate profit, ROI, and margin based on input values
  const totalProfit = calculateTotalProfit(
    salePrice,
    productCost,
    referralFee,
    wfsFee,
    inboundShipping,
    storageFee,
    prepFee,
    additionalFees
  );
  const roi = calculateROI(totalProfit, productCost);
  const margin = calculateMargin(totalProfit, salePrice);

  // Load additional metrics from localStorage on mount
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics"));
    if (storedMetrics) {
      setProductCost(parseFloat(storedMetrics.minProfit) || 0);
      setInboundShippingRate(parseFloat(storedMetrics.inboundShippingCost) || 0.5);
      setStorageLength(parseInt(storedMetrics.storageLength) || 1);
      setSeason(storedMetrics.season || "Jan-Sep");
    }

    // Determine prep and additional fees based on cost type (per lb or per unit)
    const savedPrepCostType = localStorage.getItem("prepCostType");
    const savedPrepCostPerLb = parseFloat(localStorage.getItem("prepCostPerLb")) || 0;
    const savedPrepCostEach = parseFloat(localStorage.getItem("prepCostEach")) || 0;
    setPrepFee(savedPrepCostType === "per lb" ? savedPrepCostPerLb : savedPrepCostEach);

    const savedAdditionalCostType = localStorage.getItem("additionalCostType");
    const savedAdditionalCostPerLb = parseFloat(localStorage.getItem("additionalCostPerLb")) || 0;
    const savedAdditionalCostEach = parseFloat(localStorage.getItem("additionalCostEach")) || 0;
    setAdditionalFees(savedAdditionalCostType === "per lb" ? savedAdditionalCostPerLb : savedAdditionalCostEach);
  }, []);

  // Calculate initial product cost to achieve target margin
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics"));
    const minMargin = parseFloat(storedMetrics?.minMargin || "0");
    if (minMargin && salePrice) {
      const initialProductCost = calculateProductCostFromMargin(
        salePrice,
        minMargin,
        referralFee,
        wfsFee,
        inboundShipping,
        storageFee,
        prepFee,
        additionalFees
      );
      setProductCost(parseFloat(initialProductCost.toFixed(2)));
    }
  }, [salePrice, referralFee, wfsFee, inboundShipping, storageFee, prepFee, additionalFees]);

  // Calculate inbound shipping fee dynamically based on weight and inbound shipping cost from settings
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    const inboundShippingCost = parseFloat(storedMetrics.inboundShippingCost) || 0.5;
    const newInboundShippingFee = calculateInboundShipping(weight, inboundShippingCost);
    setInboundShippingFee(newInboundShippingFee);
  }, [weight]);

  // Calculate storage fee based on cubic feet, season, and storage length
  useEffect(() => {
    const calculatedStorageFee = parseFloat(calculateStorageFee(season, cubicFeet, storageLength));
    setStorageFee(isNaN(calculatedStorageFee) ? 0 : calculatedStorageFee);
  }, [shippingLength, shippingWidth, shippingHeight, cubicFeet, season, storageLength]);

  // Toggle the visibility of the Pricing section
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
                    name="minProfit"
                    value={productCost.toFixed(2)}
                    onChange={(e) => {
                      // Format input to keep two decimal places
                      let input = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                      if (input) {
                        input = (parseFloat(input) / 100).toFixed(2); // Automatically add decimal places
                        setProductCost(parseFloat(input));
                      } else {
                        setProductCost(0); // Set to 0 if input is empty
                      }
                    }}
                    className="p-1 pr-3 text-right w-full border rounded-r"
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
                    name="minProfit"
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    className="p-1 pr-3 text-right w-full border rounded-r"
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
                      let input = e.target.value.replace(/[^0-9]/g, "");
                      if (input) {
                        input = (parseFloat(input) / 100).toFixed(2);
                        setShippingLength(parseFloat(input));
                      } else {
                        setShippingLength(0);
                      }
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
                      let input = e.target.value.replace(/[^0-9]/g, "");
                      if (input) {
                        input = (parseFloat(input) / 100).toFixed(2);
                        setShippingWidth(parseFloat(input));
                      } else {
                        setShippingWidth(0);
                      }
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
                      let input = e.target.value.replace(/[^0-9]/g, "");
                      if (input) {
                        input = (parseFloat(input) / 100).toFixed(2);
                        setShippingHeight(parseFloat(input));
                      } else {
                        setShippingHeight(0);
                      }
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
                      let input = e.target.value.replace(/[^0-9]/g, "");
                      if (input) {
                        input = (parseFloat(input) / 100).toFixed(2);
                        setWeight(parseFloat(input));
                      } else {
                        setWeight(0);
                      }
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
                    value={referralFee.toFixed(2)}
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
                    value={wfsFee.toFixed(2)}
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
                    onChange={(e) => setAdditionalFees(parseFloat(e.target.value))}
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