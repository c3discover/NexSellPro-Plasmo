import React, { useState, useEffect } from "react";
import PricingBlock from "./common/PricingBlock";
import SelectBlock from "./common/SelectBlock";
import InputBlock from "./common/InputBlock";
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
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "▼ Pricing" : "▶ Pricing"}
      </h1>

      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>
        
        
        
        
        {/* Left Section */}
        <div className="w-2/3 p-2">        
          <div className="flex flex-wrap">

            {/* Product Cost and Sale Price */}
            <div className="w-1/2">
              <InputBlock 
                label="Product Cost" 
                value={productCost} 
                backgroundColor="#3a3f47" 
                onChange={(e) => setProductCost(parseFloat(e.target.value))} 
                />
            </div>

            <div className="w-1/2">
              <InputBlock 
                label="Sale Price" 
                value={salePrice} 
                backgroundColor="#3a3f47" 
                onChange={(e) => setSalePrice(parseFloat(e.target.value))} 
                />
            </div>



            {/* Shipping Dimensions */}
            <div className="w-full p-1">
              <p className="text-center font-bold shadow-inherit shadow-md">Shipping Dimensions</p>
            </div>


            <div className="w-1/4">
              <PricingBlock 
                label="Length (in)" 
                content={shippingLength.toString()} 
                backgroundColor="#3a3f47" 
                textColor="text-black"
                />
            </div>


            <div className="w-1/4">
              <PricingBlock 
                label="Width (in)" 
                content={shippingWidth.toString()} 
                backgroundColor="#3a3f47" 
                textColor="text-black"
                />
            </div>


            <div className="w-1/4">
              <PricingBlock 
                label="Height (in)" 
                content={shippingHeight.toString()} 
                backgroundColor="#3a3f47" 
                textColor="text-black"
                />
            </div>


            <div className="w-1/4">
              <PricingBlock 
                label="Weight (lbs)" 
                content={weight.toString()} 
                backgroundColor="#3a3f47" 
                textColor="text-black"
                />
            </div>



            {/* Fees Section */}
            <div className="w-1/2">
              <PricingBlock 
                label="Referral Fee" 
                content={`$${referralFee.toFixed(2)}`} 
                backgroundColor="#3a3f47" 
                textColor="text-black"
                />
            </div>


            <div className="w-1/2">
              <PricingBlock 
                label="WFS Fee" 
                content={`$${wfsFee.toFixed(2)}`} 
                backgroundColor="#3a3f47" 
                textColor="text-black"
                />
            </div>


            <div className="w-1/2">
              <PricingBlock 
                label="Inbound Shipping" 
                content={`$${inboundShipping.toFixed(2)}`} 
                backgroundColor="#3a3f47" 
                textColor="text-black"
                />
            </div>


            <div className="w-1/2">
              <PricingBlock 
                label="Storage" 
                content={`$${storageFee.toFixed(2)}`} 
                backgroundColor="#3a3f47" 
                textColor="text-black"
                />
            </div>


            <div className="w-1/2">
              <InputBlock 
                label="Prep Fee" 
                value={prepFee} 
                backgroundColor="#3a3f47" 
                onChange={(e) => setPrepFee(parseFloat(e.target.value))} 
                />
            </div>


            <div className="w-1/2">
              <InputBlock 
                label="Additional Fees" 
                value={additionalFees} 
                backgroundColor="#3a3f47" 
                onChange={(e) => setAdditionalFees(parseFloat(e.target.value))} 
                />
            </div>


            {/* Contract Category */}
            <div className="w-full">
              <SelectBlock 
                label="Contract Category (Determines Fee)" 
                selectedValue={contractCategory} 
                options={contractCategoryOptions} 
                backgroundColor="#3a3f47" 
                onChange={(e) => setContractCategory(e.target.value)} />
            </div>


            <div className="w-1/2 mt-4">
              <label 
                className={`flex flex-col items-center justify-center p-2 border-2 cursor-pointer ${
                  isWalmartFulfilled 
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

            <div className="w-1/2 mt-4">
              <label 
                className={`flex flex-col items-center justify-center p-2 border-2 cursor-pointer ${
                  !isWalmartFulfilled 
                  ? 'bg-[#006EDC] text-white shadow-inner-crisp' 
                  : 'bg-gray-200 text-black shadow-none'}`}
                onClick={() => setIsWalmartFulfilled(false)}>
                <input 
                  type="radio" 
                  checked={!isWalmartFulfilled} 
                  onChange={() => setIsWalmartFulfilled(false)} 
                  className="hidden" />
                <span className="block font-bold">Seller</span>
                <span className="block font-bold ">Fulfilled</span>
              </label>
            </div>
          </div>
        </div>




        {/* Right Section */}
        <div className="w-1/3 p-2">
          <div className="flex flex-wrap">


            <div className="w-full">
              <PricingBlock 
                label="Monthly Sales Estimate" 
                content="Coming Soon..." 
                backgroundColor="#3a3f47" 
                textColor="text-black"/>
            </div>
            <div className="w-full">
              <PricingBlock 
                label="Total Profit" 
                content={`$${totalProfit.toFixed(2)}`} 
                backgroundColor="#3a3f47" 
                textColor="text-black"/>
            </div>
            <div className="w-full">
              <PricingBlock 
                label="Margin" 
                content={`${margin}%`} 
                backgroundColor="#3a3f47" 
                textColor="text-black"/>
            </div>
            <div className="w-full">
                <PricingBlock 
                label="ROI" 
                content={productCost === 0 ? "Enter Cost" : `${roi}%`} 
                backgroundColor="#3a3f47" 
                textColor={productCost === 0 ? "text-red-500 font-extrabold" : "text-black"} />
            </div>



            {/* Bottom Section */}
            <div className="w-full justify-center">
              <InputBlock 
                label="Inbound Shipping per lb" 
                value={inboundShippingRate} 
                backgroundColor="#3a3f47" 
                onChange={(e) => setInboundShippingRate(parseFloat(e.target.value))} />
            </div>


            <div className="w-full">
              <div className="w-full p-1">
                <p className="text-center font-bold shadow-inherit shadow-md" >
                  Storage </p>
              </div>
            </div>

            <div className="w-full">
              <InputBlock
                label="Storage Length (months)"
                value={storageLength}
                backgroundColor="#3a3f47"
                onChange={(e) => setStorageLength(Number(e.target.value))}
              />
            </div>
            <div className="w-full">
              <SelectBlock 
                label="Season" 
                selectedValue={season} 
                options={seasonOptions} 
                backgroundColor="#3a3f47" 
                onChange={(e) => setSeason(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
