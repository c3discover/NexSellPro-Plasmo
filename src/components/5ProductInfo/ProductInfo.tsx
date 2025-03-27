/**
 * @fileoverview Product Information Component for displaying product identifiers and external data
 * @author NexSellPro
 * @created 2024-03-07
 * @lastModified 2024-03-07
 * @description This component displays product identification details, external data sources,
 *              and average pricing information in a collapsible interface
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { getUsedData } from "../../utils/usedData";
import type { UsedProductData } from "../../utils/usedData";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Placeholder data for external sources (will be replaced with real data)
interface ExternalDataItem {
  store: string;
  link: string;
  price: string;
}

const externalData: ExternalDataItem[] = [
  { store: "Store Name", link: "Link", price: "$0.00" },
  { store: "Store Name", link: "Link", price: "$0.00" },
  { store: "Store Name", link: "Link", price: "$0.00" },
];

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Interface for the component's props
interface Product {
  basic: {
    productID: string;
    upc: string;
    modelNumber: string;
    // Add other product properties
  }
}

interface ProductInfoProps {
  areSectionsOpen: boolean;
  product: Product;  // Replace 'any' with proper type
}

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// Using the ProductInfoProps interface defined above

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const ProductInfo: React.FC<ProductInfoProps> = ({ areSectionsOpen }) => {

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
  // Controls the expanded/collapsed state of the component
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  
  // Tracks which item's "Copy" button was last clicked (-1 means none)
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  
  // Stores the product data fetched from the API
  const [productData, setProductData] = useState<UsedProductData | null>(null);

  // State to control if the seller table is expanded or collapsed
  const [isTableExpanded, setIsTableExpanded] = useState(true);

  // Add error state
  const [error, setError] = useState<string | null>(null);

  // Update component's open state when prop changes
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Update useEffect with error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsedData();
        if (data) {
          setProductData(data);
        }
      } catch (err) {
        setError('Failed to load product data');
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
  // Toggle the expanded/collapsed state of the component
  const toggleOpen = () => setIsOpen(!isOpen);

    /**
   * Event handler to expand or collapse the seller data table.
   */
    const toggleTable = (): void => {
      setIsTableExpanded((prev) => !prev);
    };

    
  // Handle copying text to clipboard and show feedback
  const handleCopy = (value: string, index: number) => {
    navigator.clipboard.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
  };

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
  // Generate rows of product information for display
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

  // Memoize the info rows to prevent unnecessary recalculations
  const infoRows = React.useMemo(() => getInfoRows(), [productData]);

////////////////////////////////////////////////
// Styles:
////////////////////////////////////////////////
// Styles are handled via Tailwind classes in the JSX

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
  // Show loading state if product data isn't available yet
  if (!productData) {
    return <div>Loading product information...</div>;
  }

  // Add proper loading state component
  const LoadingState = () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
    </div>
  );

  // Create separate components for tables
  const ProductIdentifiersTable = ({ rows, onCopy, copiedIndex }) => (
    <table className="table-auto w-full text-black mx-2">
      <tbody>
        {rows.map((row, index) => (
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
              onClick={() => onCopy(String(row.value), index)}
            >
              {copiedIndex === index ? "Copied" : "Copy"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const ExternalDataTable = ({ data }: { data: ExternalDataItem[] }) => (
    <table className="table-auto border-2 border-black mx-2">
      <tbody>
        {data.map((row, index) => (
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
  );

  // Memoize child components
  const MemoizedProductIdentifiersTable = React.memo(ProductIdentifiersTable);
  const MemoizedExternalDataTable = React.memo(ExternalDataTable);

  const COPY_TIMEOUT_MS = 2000;
  const TABLE_WIDTHS = {
    label: 'w-[100px]',
    value: 'w-[150px]',
    action: 'w-[50px]',
  };

  return (
    <div
      id="ProductInfo"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      {/* Header Section with expand/collapse functionality */}
      <h1
   className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
   onClick={toggleOpen}
      >
        {isOpen ? "🔽  Product Information" : "▶️  Product Information"}
      </h1>

      {/* Main Content Section */}
      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>
        {/* Product Identifiers Section */}
        <p className="font-extrabold text-base text-center bg-[#d7d7d7] w-full p-2">
          Product Identifiers
        </p>
        <MemoizedProductIdentifiersTable rows={infoRows} onCopy={handleCopy} copiedIndex={copiedIndex} />

        {/* External Data Section (Future Feature) */}
        <div className="flex flex-col w-full mt-2">
          <p className="font-extrabold text-base text-center bg-[#d7d7d7] w-full p-2">
            External Data (Coming Soon with AI)
          </p>
          <MemoizedExternalDataTable data={externalData} />
        </div>

        {/* Average External Price Section (Future Feature) */}
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
