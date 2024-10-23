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
      className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
      onClick={toggleOpen}
    >
      {isOpen ? "▼ Product Information" : "▶ Product Information"}
    </h1>



    <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>
        
        
        
      <p className="font-extrabold text-center text-sm bg-[#d7d7d7] w-full p-2">
          Product Identifiers
        </p>
        <table className="table-auto w-full text-black mx-2">
          <tbody>
            {infoRows.map((row, index) => (
              <tr
                key={index}
                className="border-2 border-black text-center"
              >
                <td className="bg-[#3a3f47] text-2xs font-bold text-white tracking-tight">{row.label}</td>
                <td className="bg-[#ffffff] text-2xs border-b border-black tracking-tight">{row.value}</td>
                <td
                  className="bg-[#3a3f47] text-2xs text-white underline cursor-pointer"
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
        
        
        
        
        
       
        <div className="flex w-full">
        {/* Wrap p and table in a flex container */}
        <div className="flex flex-col w-5/6">
        {/* External Data Label */}
          <p className="font-extrabold items-center text-center p-2 text-sm bg-[#d7d7d7] ">
          External Data
          </p>
          <table className="table-auto border-2 border-black ml-4 mb-4 mr-2">
            <tbody>
              {externalData.map((row, index) => (
                <tr key={index} className="border-b border-black text-center">
                  <td className="text-white text-2xs bg-[#3a3f47] font-bold tracking-tight px-1">{row.store}</td>
                  <td className="text-2xs border border-black tracking-tight px-1">{row.link}</td>
                  <td className="text-2xs border border-black tracking-tight px-1">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>        


          <div className="w-1/6 bg-[#d7d7d7] text-center flex flex-col justify-center p-2 mr-4 mb-4">
            <p className="font-extrabold text-sm">Average</p>
            <p className="font-extrabold text-sm">External</p>
            <p className="font-extrabold text-sm">Price</p>
            <div className="text-2xs text-center p-1 bg-white text-black border-2 border-black">
              Coming Soon...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
