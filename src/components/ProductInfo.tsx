import React, { useState, useEffect } from "react";

interface Product {
  shippingLength?: number;
  shippingWidth?: number;
  shippingHeight?: number;
  weight?: number;
  currentPrice?: number;
  productID?: number;
  upc?: number;
  modelNumber?: string;
}

interface ProductInfoProps {
  product: Product;
  areSectionsOpen: boolean;  // Add this prop
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, areSectionsOpen }) => {
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);
  const toggleOpen = () => setIsOpen(!isOpen);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const infoRows = [
    { label: "ITEM ID", value: product.productID || "" },
    { label: "GTIN", value: "coming soon" },
    { label: "UPC", value: product.upc || "" },
    { label: "EAN", value: "coming soon" },
    { label: "Model Number", value: product.modelNumber || "" },
    { label: "Country of Origin", value: "coming soon" },
  ];

  const externalData = [
    { store: "Store Name", link: "Link Coming Soon...", price: "$0.00" },
    { store: "Store Name", link: "Link Coming Soon...", price: "$0.00" },
    { store: "Store Name", link: "Link Coming Soon...", price: "$0.00" },
  ];

  return (
    <div
      id="ProductInfo"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      <h1
        className="font-montserrat text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "▼ Product Information" : "▶ Product Information"}
      </h1>

      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>




        {/* Top Section: IDENTIFIERS */}
        <p className="font-extrabold text-base text-center bg-[#d7d7d7] w-full p-2">
          Product Identifiers
        </p>
        <table className="table-auto w-full text-black mx-2">
          <tbody>
            {infoRows.map((row, index) => (
              <tr
                key={index}
                className="border-2 border-black text-center"
              >
                <td className="bg-[#3a3f47] w-[100px] text-xs font-bold text-white tracking-tight">{row.label}</td>
                <td className="bg-[#ffffff] w-[150px] text-xs border-b border-black tracking-tight">{row.value}</td>
                <td
                  className="bg-[#3a3f47] w-[50px] text-xs text-white underline cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(String(row.value));
                    setCopiedIndex(index);
                  }}
                >
                  {copiedIndex === index ? "Copied" : "Copy"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>





        {/* Top Section: EXTERNAL DATA */}
        <div className="flex flex-col w-full">
          {/* Wrap p and table in a flex container */}
          <div className="flex flex-col">
            {/* External Data Label */}
            <p className="font-extrabold text-base items-center text-center p-2 bg-[#d7d7d7] ">
              External Data
            </p>
            <table className="table-auto border-2 border-black mx-2">
              <tbody>
                {externalData.map((row, index) => (
                  <tr key={index} className="border-b border-black text-center">
                    <td className="text-white w-[100px] text-xs bg-[#3a3f47] font-bold tracking-tight px-1">{row.store}</td>
                    <td className="w-[150px] text-xs border border-black tracking-tight px-1">{row.link}</td>
                    <td className="w-[50px] text-xs border border-black tracking-tight px-1">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>



          {/* Top Section: AVG EXTERNAL PRICE */}
          <p className="font-extrabold items-center text-center p-2 text-base bg-[#d7d7d7]">
            Average External Price
          </p>

          <div className="flex justify-center mb-2"> {/* This ensures the box is centered */}
            <div className="text-xs text-center p-3 bg-white text-black border-2 border-black w-auto">
              Coming Soon...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
