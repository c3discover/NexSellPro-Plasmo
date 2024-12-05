////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";


////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
const externalData = [
  { store: "Store Name", link: "Link Coming Soon...", price: "$0.00" },
  { store: "Store Name", link: "Link Coming Soon...", price: "$0.00" },
  { store: "Store Name", link: "Link Coming Soon...", price: "$0.00" },
];


////////////////////////////////////////////////
// Props and Types:
////////////////////////////////////////////////
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

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
export const ProductInfo: React.FC<ProductInfoProps> = ({ product, areSectionsOpen }) => {
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  ////////////////////////////////////////////////////
  // Helper Functions:
  ////////////////////////////////////////////////////
  const infoRows = [
    { label: "ITEM ID", value: product.productID || "" },
    { label: "GTIN", value: "coming soon" },
    { label: "UPC", value: product.upc || "" },
    { label: "EAN", value: "coming soon" },
    { label: "Model Number", value: product.modelNumber || "" },
    { label: "Country of Origin", value: "coming soon" },
  ];

  //////////////////////////////////////////////////
  // Event Handlers:
  //////////////////////////////////////////////////
  const toggleOpen = () => setIsOpen(!isOpen);

  const handleCopy = (value: string, index: number) => {
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds for better user experience
  };



  //////////////////////////////////////////////////
  // JSX (Return):
  //////////////////////////////////////////////////

  return (
    <div
      id="ProductInfo"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "🔽  Product Information" : "▶️  Product Information"}
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
                  onClick={() => handleCopy(String(row.value), index)}
                >
                  {copiedIndex === index ? "Copied" : "Copy"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>


      {/* Top Section: EXTERNAL DATA */}
      <div className="flex flex-col w-full mt-2"> {/* Added spacing */}
        <p className="font-extrabold text-base text-center bg-[#d7d7d7] w-full p-2">
          External Data
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

      {/* Top Section: AVG EXTERNAL PRICE */}
      <div className="flex flex-col w-full mt-2"> {/* Added spacing */}
        <p className="font-extrabold text-base text-center bg-[#d7d7d7] w-full p-2">
          Average External Price
        </p>
        <div className="flex justify-center mb-2">
          <div className="text-xs text-center p-3 bg-white text-black border-2 border-black w-auto">
            Coming Soon...
          </div>
        </div>
      </div>





      </div>
    </div>
  );
};
