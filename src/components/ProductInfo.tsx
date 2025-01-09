////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { getUsedData } from "~/utils/usedData";
import type { UsedProductData } from "~/utils/usedData";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
const externalData = [
  { store: "Store Name", link: "Link", price: "$0.00" },
  { store: "Store Name", link: "Link", price: "$0.00" },
  { store: "Store Name", link: "Link", price: "$0.00" },
];

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
interface ProductInfoProps {
  areSectionsOpen: boolean;
}

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const ProductInfo: React.FC<ProductInfoProps> = ({ areSectionsOpen }) => {

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [productData, setProductData] = useState<UsedProductData | null>(null);

  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsedData();
      if (data) {
        setProductData(data);
      }
    };
    fetchData();
  }, []);

////////////////////////////////////////////////
// Chrome API Handlers:
////////////////////////////////////////////////
// No Chrome API handlers needed for this component

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////
  const toggleOpen = () => setIsOpen(!isOpen);

  const handleCopy = (value: string, index: number) => {
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
  const getInfoRows = () => {
    if (!productData) return [];
    return [
      { label: "ITEM ID", value: productData.basic.productID || "" },
      { label: "GTIN", value: "Coming Soon" },
      { label: "UPC", value: productData.basic.upc || "" },
      { label: "EAN", value: "Coming Soon" },
      { label: "Model Number", value: productData.basic.modelNumber || "" },
      { label: "Country of Origin", value: "Coming Soon" },
    ];
  };

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
  if (!productData) {
    return <div>Loading product information...</div>;
  }

  return (
    <div
      id="ProductInfo"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${
        isOpen ? "h-auto opacity-100" : "h-12"
      }`}
    >
      {/* Header Section */}
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "🔽  Product Information" : "▶️  Product Information"}
      </h1>

      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>
        {/* Product Identifiers Section */}
        <p className="font-extrabold text-base text-center bg-[#d7d7d7] w-full p-2">
          Product Identifiers
        </p>
        <table className="table-auto w-full text-black mx-2">
          <tbody>
            {getInfoRows().map((row, index) => (
              <tr
                key={index}
                className="border-2 border-black text-center"
              >
                <td className="bg-[#3a3f47] w-[100px] text-xs font-bold text-white tracking-tight">
                  {row.label}
                </td>
                <td className="bg-[#ffffff] w-[150px] text-xs border-b border-black tracking-tight">
                  {row.value}
                </td>
                <td
                  className="bg-[#3a3f47] w-[50px] text-xs text-white underline cursor-pointer"
                  onClick={() => handleCopy(String(row.value), index)}
                >
                  {copiedIndex === index ? "Copied" : "Copy"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* External Data Section */}
        <div className="flex flex-col w-full mt-2">
          <p className="font-extrabold text-base text-center bg-[#d7d7d7] w-full p-2">
            External Data (Coming Soon with AI)
          </p>
          <table className="table-auto border-2 border-black mx-2">
            <tbody>
              {externalData.map((row, index) => (
                <tr key={index} className="border-b border-black text-center">
                  <td className="text-white w-[100px] text-xs bg-[#3a3f47] font-bold tracking-tight px-1">
                    {row.store}
                  </td>
                  <td className="w-[150px] text-xs border border-black tracking-tight px-1">
                    {row.link}
                  </td>
                  <td className="w-[50px] text-xs border border-black tracking-tight px-1">
                    {row.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Average External Price Section */}
        <div className="flex flex-col w-full mt-2">
          <p className="font-extrabold text-base text-center bg-[#d7d7d7] w-full p-2">
            Average External Price
          </p>
          <div className="flex justify-center mb-2">
            <div className="text-xs text-center p-3 bg-white text-black border-2 border-black w-auto">
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default ProductInfo;
