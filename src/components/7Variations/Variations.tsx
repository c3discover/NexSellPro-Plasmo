/**
 * @fileoverview Component for displaying product variations in a table format
 * @author NexSellPro
 * @created 2024-03-07
 * @lastModified 2024-03-07
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { getUsedData } from "../../utils/usedData";
import type { UsedProductData } from "../../utils/usedData";
import getData from "../../utils/getData";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Message shown while variations data is loading
const LOADING_MESSAGE = "Loading variations...";

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Props interface for the Variations component
interface VariationsProps {
  areSectionsOpen: boolean;  // Controls if the section is expanded/collapsed
  variantsMap: any; // TODO: Replace with proper type when available
}

// Structure for variant information
interface VariantInfo {
  name: string;
  usItemId: string;
  availabilityStatus: string;
  variants: string[];
  priceInfo?: {
    currentPrice?: {
      price: number;
      priceString: string;
    };
  };
}

// Structure for variant data fetched from product pages
interface VariantData {
  image: string;
  title: string;
  ratings: number | string;
  sellers: number | string;
  upc: string;
  price?: string;
  stock?: number;
  inStock?: boolean;
  deliveryDate?: string;
  availabilityStatus?: string;
  usItemId?: string;
  variants?: string[];
  priceInfo?: {
    currentPrice?: {
      price: number;
      priceString: string;
    };
  };
}

// Type for mapping variant IDs to their data
type VariantDataMap = Record<string, VariantData>;
type VariantsMap = Record<string, VariantInfo>;

// Sorting options type
type SortField = 'in_stock' | 'price' | string; // string for dynamic variant attributes

interface SortConfig {
  field: SortField;
  direction: 'asc' | 'desc';
}

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// Using VariationsProps defined above

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const Variations: React.FC<VariationsProps> = ({ areSectionsOpen, variantsMap }) => {

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
  // Controls section expansion/collapse
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  // Stores the product data including variations
  const [productData, setProductData] = useState<UsedProductData | null>(null);
  // Controls variant table visibility
  const [isVariantTableExpanded, setIsVariantTableExpanded] = useState(true);
  // Stores sorted variant IDs for consistent display order
  const [sortedVariantIds, setSortedVariantIds] = useState<string[]>([]);
  // Stores fetched data for each variant
  const [variantData, setVariantData] = useState<VariantDataMap>({});

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'in_stock', direction: 'asc' });
  const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);

  // Effect to sync section open state with prop
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Effect to fetch and process variation data
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsedData();
      if (data) {
        setProductData(data);
        if (data.variants.variantsMap) {
          // Find current variant based on productID
          const currentVariantId = Object.keys(data.variants.variantsMap).find(
            (variantId) => data.variants.variantsMap[variantId].usItemId === data.basic.productID
          );

          // Sort variants with in-stock items first
          const filteredVariantIds = Object.keys(data.variants.variantsMap)
            .filter(variantId => variantId !== currentVariantId)
            .sort((a, b) => {
              const variantA = data.variants.variantsMap[a];
              const variantB = data.variants.variantsMap[b];
              const isInStockA = variantA.availabilityStatus === "IN_STOCK";
              const isInStockB = variantB.availabilityStatus === "IN_STOCK";
              if (isInStockA && !isInStockB) return -1;
              if (!isInStockA && isInStockB) return 1;
              return 0;
            });

          // Put current variant at the start of the list
          const sortedIds = currentVariantId 
            ? [currentVariantId, ...filteredVariantIds]
            : filteredVariantIds;

          setSortedVariantIds(sortedIds);
          await fetchAllVariantData(sortedIds, data.variants.variantsMap);
        }
      }
    };
    fetchData();
  }, []);

  // Effect to extract available attributes
  useEffect(() => {
    if (productData?.variants?.variantsMap) {
      const firstVariant = Object.values(productData.variants.variantsMap)[0];
      if (firstVariant?.variants) {
        const attributes = firstVariant.variants
          .map(attr => attr.split('-')[0])
          .filter((value, index, self) => self.indexOf(value) === index)
          .map(attr => attr.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
          );
        setAvailableAttributes(attributes);
      }
    }
  }, [productData]);

////////////////////////////////////////////////
// Chrome API Handlers:
////////////////////////////////////////////////
// No Chrome API handlers needed for this component

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////
  // Toggle section expansion
  const toggleOpen = () => setIsOpen(!isOpen);
  // Toggle variant table visibility
  const toggleVariantTable = () => setIsVariantTableExpanded(!isVariantTableExpanded);

  // Handle sort change
  const handleSortChange = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field ? (prev.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
  // Fetches data for all variants
  const fetchAllVariantData = async (variantIds: string[], variantsMap: VariantsMap) => {
    const fetchedData: VariantDataMap = {};
    await Promise.all(
      variantIds.map(async (variantId) => {
        const usItemId = variantsMap[variantId]?.usItemId;
        if (usItemId) {
          const variantInfo = await fetchVariantData(usItemId);
          fetchedData[variantId] = variantInfo;
        }
      })
    );
    setVariantData(fetchedData);
  };

  // Fetches data for a single variant using its Walmart item ID
  async function fetchVariantData(usItemID: string) {
    const url = `https://www.walmart.com/ip/${usItemID}`;
    try {
      const response = await fetch(url);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const dataScript = doc.querySelector('script[id="__NEXT_DATA__"]');

      if (dataScript) {
        const jsonData = JSON.parse(dataScript.textContent || "{}");
        const product = jsonData.props.pageProps?.initialData?.data?.product;
        return {
          image: product?.imageInfo?.thumbnailUrl || "-",
          title: product?.name || "-",
          ratings: product?.numberOfReviews || 0,
          sellers: product?.additionalOfferCount != null ? product.additionalOfferCount + 1 : 1,
          upc: product?.upc || "-"
        };
      }
      return { image: "-", title: "-", ratings: "-", sellers: "-", upc: "-" };
    } catch (error) {
      console.error("Error fetching variant data:", error);
      return { image: "-", title: "-", ratings: "-", sellers: "-", upc: "-" };
    }
  }

  // Extracts and formats attribute data from a variant
  const extractAttribute = (variantId: string, variantsMap: VariantsMap) => {
    const variant = variantsMap[variantId];
    if (!variant || !variant.variants) return "";
    return variant.variants
      .map((attr: string) => attr.split("-")[1])
      .join(", ");
  };

  // Sort variants based on current configuration
  const getSortedVariants = (variants: string[]) => {
    const currentVariantId = variants[0]; // Store current variant
    const otherVariants = variants.slice(1); // Get other variants

    return [
      currentVariantId,
      ...otherVariants.sort((a, b) => {
        const variantA = productData?.variants?.variantsMap?.[a];
        const variantB = productData?.variants?.variantsMap?.[b];

        if (!variantA || !variantB) return 0;

        let comparison = 0;
        
        switch (sortConfig.field) {
          case 'in_stock':
            const isInStockA = variantA.availabilityStatus === "IN_STOCK";
            const isInStockB = variantB.availabilityStatus === "IN_STOCK";
            comparison = isInStockA === isInStockB ? 0 : isInStockA ? -1 : 1;
            break;

          case 'price':
            const priceA = variantA.priceInfo?.currentPrice?.price ?? 0;
            const priceB = variantB.priceInfo?.currentPrice?.price ?? 0;
            comparison = priceA - priceB;
            break;

          default:
            // Handle variant attribute sorting
            const attrA = variantA.variants?.find(attr => 
              attr.split('-')[0].split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ') === sortConfig.field
            )?.split('-')[1] ?? '';
            const attrB = variantB.variants?.find(attr => 
              attr.split('-')[0].split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ') === sortConfig.field
            )?.split('-')[1] ?? '';
            comparison = attrA.localeCompare(attrB);
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      })
    ];
  };

////////////////////////////////////////////////
// Styles:
////////////////////////////////////////////////
// Styles are handled via Tailwind CSS classes in the JSX

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
  // Show loading state if data isn't ready
  if (!productData) {
    return <div>{LOADING_MESSAGE}</div>;
  }

  return (
    <div
      id="Variations"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      {/* Header Section */}
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "🔽  Variations" : "▶️  Variations"}
      </h1>

      {/* Main Content Section */}
      {isOpen && (
        <>
          {sortedVariantIds.length === 0 ? (
            // Empty State Message
            <div className="w-full h-[100px] flex justify-center items-center py-4">
              <p className="text-gray-600 italic text-center">No variations available.</p>
            </div>
          ) : (
            <>
              {/* Sorting Controls */}
              <div className="w-full px-4 py-2 flex flex-wrap gap-2 items-center bg-gray-100 rounded-md mx-2 my-1">
                <span className="text-xs font-semibold text-gray-700">Sort by:</span>
                <div className="flex flex-wrap gap-2">
                  {/* Stock Status Radio */}
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-3 w-3 text-blue-600"
                      checked={sortConfig.field === 'in_stock'}
                      onChange={() => handleSortChange('in_stock')}
                    />
                    <span className="ml-1 text-xs">Stock Status</span>
                    {sortConfig.field === 'in_stock' && (
                      <button 
                        onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                        className="ml-1 text-xs"
                      >
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </button>
                    )}
                  </label>

                  {/* Price Radio */}
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-3 w-3 text-blue-600"
                      checked={sortConfig.field === 'price'}
                      onChange={() => handleSortChange('price')}
                    />
                    <span className="ml-1 text-xs">Price</span>
                    {sortConfig.field === 'price' && (
                      <button 
                        onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                        className="ml-1 text-xs"
                      >
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </button>
                    )}
                  </label>

                  {/* Dynamic Attribute Radios */}
                  {availableAttributes.map((attr) => (
                    <label key={attr} className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-3 w-3 text-blue-600"
                        checked={sortConfig.field === attr}
                        onChange={() => handleSortChange(attr)}
                      />
                      <span className="ml-1 text-xs">{attr}</span>
                      {sortConfig.field === attr && (
                        <button 
                          onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                          className="ml-1 text-xs"
                        >
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </button>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Variant Information Section */}
              <div className="w-full p-2 pb-4 flex justify-between items-center">
                {/* ===== Variant Count Box ===== */}
                <div className="w-1/2 p-1">
                  <p className="bg-[#3a3f47] text-xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
                    Number of Variants
                  </p>
                  <p className="text-xs text-black text-center bg-white border-2 border-black p-1 rounded-b-lg shadow-md shadow-black">
                    {Object.keys(productData?.variants?.variantsMap || {}).length || "-"}
                  </p>
                </div>

                {/* ===== Variant Attributes Box ===== */}
                <div className="w-1/2 p-1">
                  <p className="bg-[#3a3f47] text-xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
                    Variant Attributes
                  </p>
                  <div className="text-xs text-black text-center bg-white border-2 border-black p-1 rounded-b-lg shadow-md shadow-black">
                    {(productData?.variants?.variantsMap &&
                      Object.values(productData.variants.variantsMap)[0]?.variants
                      ?.map((attribute: string) => attribute.split('-')[0])
                      .filter((value, index, self) => self.indexOf(value) === index)
                      .map((attributeType, index) => (
                        <p key={index}>
                          {attributeType
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        </p>
                      ))) || (
                      <span className="text-gray-600 italic">No variant attributes available.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== Toggle Button Section ===== */}
              <div className="flex justify-end mx-2 mb-1">
                <button
                  onClick={toggleVariantTable}
                  className="text-xs font-semibold px-2 py-0.5 bg-gray-200 rounded shadow hover:bg-gray-300"
                  aria-label="Toggle variant table"
                >
                  {isVariantTableExpanded ? "Hide Table" : "Show Table"}
                </button>
              </div>

              {/* ===== Variant Table Section ===== */}
              {Object.keys(productData?.variants?.variantsMap || {}).length > 0 && isVariantTableExpanded && (
                <div className="overflow-auto w-full" style={{ padding: "0 16px", marginTop: "0px", marginBottom: "10px" }}>
                  <table className="table-auto w-full border-collapse">
                    {/* ----- Table Header ----- */}
                    <thead>
                      <tr>
                        <td
                          className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white"
                          style={{ textAlign: "left" }}
                        >
                          Variant ID
                        </td>
                        {isVariantTableExpanded &&
                          getSortedVariants(sortedVariantIds).map((variantId, index) => (
                            <th
                              key={variantId}
                              className={`px-2 py-1 text-2xs tracking-wider border-2 border-black text-center ${
                                index === 0 
                                  ? 'bg-amber-50' 
                                  : 'bg-[#d7d7d7]'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-0.5">
                                <span>{variantId}</span>
                                {index === 0 && (
                                  <span className="text-[9px] font-medium bg-amber-200 px-1.5 rounded">
                                    current
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                      </tr>
                    </thead>

                    {/* ----- Table Body ----- */}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Image Row */}
                      <tr>
                        <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white text-left">
                          Image
                        </td>
                        {isVariantTableExpanded &&
                          getSortedVariants(sortedVariantIds).map((variantId, index) => (
                            <td
                              key={variantId}
                              className={`px-2 py-1 text-2xs border-2 border-black text-center ${
                                index === 0 ? 'bg-amber-50' : ''
                              }`}
                            >
                              {variantData[variantId]?.image ? (
                                <img
                                  src={variantData[variantId].image}
                                  alt={`Image for ${variantId}`}
                                  className={`w-16 h-16 object-contain mx-auto ${
                                    index === 0 ? 'ring-2 ring-amber-200 rounded-md' : ''
                                  }`}
                                />
                              ) : (
                                "-"
                              )}
                            </td>
                          ))}
                      </tr>

                      {/* Title Row */}
                      <tr>
                        <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white text-left">
                          Title
                        </td>
                        {isVariantTableExpanded &&
                          getSortedVariants(sortedVariantIds).map((variantId, index) => (
                            <td
                              key={variantId}
                              className={`px-2 py-1 text-2xs border-2 border-black text-center ${
                                index === 0 ? 'bg-amber-50' : ''
                              }`}
                            >
                              {/* Check if variant title if available on product page*/}
                              {variantData[variantId]?.title || "-"}
                            </td>
                          ))}
                      </tr>

                      {/* Attributes Row */}
                      <tr>
                        <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white text-left">
                          Attributes
                        </td>
                        {isVariantTableExpanded &&
                          getSortedVariants(sortedVariantIds).map((variantId, index) => (
                            <td
                              key={variantId}
                              className={`px-2 py-1 text-2xs border-2 border-black text-center ${
                                index === 0 ? 'bg-amber-50' : ''
                              }`}
                            >
                              {/* Render attributes if available, otherwise show "-" */}
                              {productData?.variants?.variantsMap?.[variantId]?.variants ? (
                                productData.variants.variantsMap[variantId].variants.map((attribute: string, index: number) => (
                                  <div key={index}>
                                    {attribute
                                      .split('-')[1] // Extract the attribute value after the dash
                                      .split('_') // Split on underscores
                                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
                                      .join(' ')} {/* Join with spaces for readability */}
                                  </div>
                                ))
                              ) : (
                                <div>-</div> // Display a dash if there are no attributes
                              )}
                            </td>
                          ))}
                      </tr>

                      {/* Price Row */}
                      <tr>
                        <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white text-left">
                          Price
                        </td>
                        {isVariantTableExpanded &&
                          getSortedVariants(sortedVariantIds).map((variantId, index) => (
                            <td
                              key={variantId}
                              className={`px-2 py-1 text-2xs border-2 border-black text-center ${
                                index === 0 ? 'bg-amber-50' : ''
                              }`}
                            >
                              {/* Check if productData and price info is available */}
                              {productData?.variants?.variantsMap?.[variantId]?.priceInfo?.currentPrice?.price
                                ? `$${parseFloat(productData?.variants?.variantsMap?.[variantId]?.priceInfo?.currentPrice?.price ?? 0).toFixed(2)}`
                                : "-"
                              }
                            </td>
                          ))}
                      </tr>

                      {/* Sellers Row */}
                      <tr>
                        <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white text-left">
                          Sellers
                        </td>
                        {isVariantTableExpanded &&
                          getSortedVariants(sortedVariantIds).map((variantId, index) => (
                            <td
                              key={variantId}
                              className={`px-2 py-1 text-2xs border-2 border-black text-center ${
                                index === 0 ? 'bg-amber-50' : ''
                              }`}
                            >
                              {/* Check if sellers info is available on product page */}
                              {variantData[variantId]?.sellers || 0}
                            </td>
                          ))}
                      </tr>

                      {/* Walmart Product ID (WPID) Row */}
                      <tr>
                        <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white text-left">
                          WPID
                        </td>
                        {isVariantTableExpanded &&
                          getSortedVariants(sortedVariantIds).map((variantId, index) => (
                            <td
                              key={variantId}
                              className={`px-2 py-1 text-2xs border-2 border-black text-center ${
                                index === 0 ? 'bg-amber-50' : ''
                              }`}
                            >
                              {/* Check if productData and usItemId are available */}
                              {productData?.variants?.variantsMap?.[variantId]?.usItemId
                                ? productData?.variants?.variantsMap?.[variantId]?.usItemId ?? "-"
                                : "-"
                              }
                            </td>
                          ))}
                      </tr>

                      {/* UPC Row */}
                      <tr>
                        <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white text-left">
                          UPC
                        </td>
                        {isVariantTableExpanded &&
                          getSortedVariants(sortedVariantIds).map((variantId, index) => (
                            <td
                              key={variantId}
                              className={`px-2 py-1 text-2xs border-2 border-black text-center ${
                                index === 0 ? 'bg-amber-50' : ''
                              }`}
                            >
                              {/* Check if upc are available on product page */}
                              {variantData[variantId]?.upc || "-"}
                            </td>
                          ))}
                      </tr>

                      {/* In Stock Row */}
                      <tr>
                        <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white text-left">
                          In Stock
                        </td>
                        {isVariantTableExpanded &&
                          getSortedVariants(sortedVariantIds).map((variantId, index) => (
                            <td
                              key={variantId}
                              className={`px-2 py-1 text-2xs border-2 border-black text-center ${
                                index === 0 ? 'bg-amber-50' : ''
                              }`}
                            >
                              {/* Use productData to access availability status */}
                              {productData?.variants?.variantsMap?.[variantId]?.availabilityStatus === "IN_STOCK"
                                ? "✔️"
                                : "❌"}
                            </td>))}
                      </tr>

                    </tbody>

                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default Variations;