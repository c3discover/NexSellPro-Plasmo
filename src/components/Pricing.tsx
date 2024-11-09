import React, { useState, useEffect } from "react";

import {
  calculateReferralFee,
  calculateWFSFee,
  calculateInboundShipping,
  calculateStorageFee,
  calculateCubicFeet,
  calculateTotalProfit,
  calculateROI,
  calculateMargin,
} from "../utils/calculations";
import { contractCategoryOptions, seasonOptions } from "../constants/options";

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

interface PricingBlockProps {
  label: string;
  content: string;
  backgroundColor: string;
  textColor?: string; // New prop for text color
}

export const Pricing: React.FC<PricingProps> = ({ product, areSectionsOpen }) => {
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  const [productCost, setProductCost] = useState<number>(0.00);
  const [contractCategory, setContractCategory] = useState<string>("Everything Else");
  const [season, setSeason] = useState<string>("Jan-Sep");
  const [storageLength, setStorageLength] = useState<number>(1);
  const [inboundShippingRate, setInboundShippingRate] = useState<number>(0.5);
  const [prepFee, setPrepFee] = useState<number>(0);
  const [additionalFees, setAdditionalFees] = useState<number>(0);
  const [isWalmartFulfilled, setIsWalmartFulfilled] = useState<boolean>(true);
  const [salePrice, setSalePrice] = useState<number>(product.currentPrice || 0);
  const toggleOpen = () => setIsOpen(!isOpen);

  const shippingLength = product.shippingLength || 0;
  const shippingWidth = product.shippingWidth || 0;
  const shippingHeight = product.shippingHeight || 0;
  const weight = product.weight || 0;

  const cubicFeet = calculateCubicFeet(shippingLength, shippingWidth, shippingHeight);
  const storageFee = parseFloat(calculateStorageFee(season, cubicFeet, storageLength));
  const finalShippingWeight = parseFloat(weight.toString()) + 0.25;
  const referralFee = calculateReferralFee(salePrice, contractCategory);
  const wfsFee = calculateWFSFee(finalShippingWeight, isWalmartFulfilled) as number;
  const inboundShipping = calculateInboundShipping(weight, inboundShippingRate);
  const totalProfit = calculateTotalProfit(salePrice, productCost, referralFee, wfsFee, inboundShipping, storageFee, prepFee, additionalFees);
  const roi = calculateROI(totalProfit, productCost);
  const margin = calculateMargin(totalProfit, salePrice);

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
                    onChange={(e) => setProductCost(parseFloat(e.target.value))}
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
                    onChange={(e) => setSalePrice(parseFloat(e.target.value))}
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
                  Length (in)
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={shippingLength}
                    className="p-1 pr-3 text-right w-full border rounded-l"
                  />
                  <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">in</span>
                </div>
              </div>

              {/* Width Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Width (in)
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={shippingWidth}
                    className="p-1 pr-3 text-right w-full border rounded-l"
                  />
                  <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">in</span>
                </div>
              </div>

              {/* Height Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Height (in)
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={shippingHeight}
                    className="p-1 pr-3 text-right w-full border rounded-l"
                  />
                  <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">in</span>
                </div>
              </div>

              {/* Weight Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Weight (lbs)
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="text"
                    value={weight}
                    className="p-1 pr-3 text-right w-full border rounded-l"
                  />
                  <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">in</span>
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
                    onChange={(e) => setPrepFee(parseFloat(e.target.value))}
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
                    onChange={(e) => setPrepFee(parseFloat(e.target.value))}
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

              {/* Inbound Shipping Fee Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Inbound Shipping Fee
                </label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={inboundShipping.toFixed(2)}
                    onChange={(e) => setPrepFee(parseFloat(e.target.value))}
                    className="p-1 pr-3 text-right w-full border rounded-r"
                  />
                </div>
              </div>

              {/* Storage Fee Row */}
              <div className="flex items-center mx-5">
                <label className="p-1 mr-2 min-w-[150px] text-left whitespace-nowrap">
                  Storage Fee
                </label>
                <div className="flex items-center w-full">
                  <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                  <input
                    type="text"
                    value={storageFee.toFixed(2)}
                    onChange={(e) => setPrepFee(parseFloat(e.target.value))}
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