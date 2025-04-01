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

  // Cache for variant data
  const variantCache: { [key: string]: { data: any, timestamp: number } } = {};
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests

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
      className={`bg-[#d7d7d7] m-1 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isOpen ? "h-auto opacity-100" : "h-9"
      }`}
    >
      {/* Header Section */}
      <h1
        className="font-medium text-black text-start text-[12px] cursor-pointer w-full px-2.5 py-1 bg-cyan-500 flex items-center justify-between group hover:bg-cyan-600 transition-colors"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{isOpen ? "▾" : "▸"}</span>
          Variations
        </div>
      </h1>

      {/* Main Content Section */}
      <div className={`${isOpen ? "block" : "hidden"} p-1 space-y-2`}>
        {sortedVariantIds.length === 0 ? (
          <div className="w-full h-[100px] flex justify-center items-center">
            <div className="text-gray-600 bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-sm font-medium">No variations available</p>
              <p className="text-xs text-gray-500 mt-1">This product doesn't have any variants</p>
            </div>
          </div>
        ) : (
          <>
            {/* Variant Summary Cards */}
            <div className="grid grid-cols-3 gap-2">
              {/* Total Variants Card */}
              <div className="text-xs font-medium bg-white text-center p-2 rounded-lg shadow-sm">
                <div className="text-[10px] text-gray-600 mb-1">Total Variants</div>
                <div className="text-base font-semibold">
                  {Object.keys(productData?.variants?.variantsMap || {}).length || "0"}
                </div>
              </div>

              {/* Variant Types Card */}
              <div className="col-span-2 text-xs font-medium bg-white text-center p-2 rounded-lg shadow-sm">
                <div className="text-[10px] text-gray-600 mb-1">Variant Types</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {availableAttributes.map((attr) => (
                    <span
                      key={attr}
                      className="px-1.5 py-0.5 bg-gray-100 rounded-full text-[9px] font-medium text-gray-700"
                    >
                      {attr}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="bg-white rounded-lg shadow-md p-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-700">Sort by:</span>
                <div className="flex flex-wrap gap-1.5">
                  {/* Stock Status Button */}
                  <button
                    onClick={() => handleSortChange('in_stock')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1
                      ${sortConfig.field === 'in_stock' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Stock
                    {sortConfig.field === 'in_stock' && (
                      <span className="text-[14px] font-bold ml-0.5 text-blue-700">
                        {sortConfig.direction === 'asc' ? '⬆' : '⬇'}
                      </span>
                    )}
                  </button>

                  {/* Price Button */}
                  <button
                    onClick={() => handleSortChange('price')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1
                      ${sortConfig.field === 'price' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Price
                    {sortConfig.field === 'price' && (
                      <span className="text-[14px] font-bold ml-0.5 text-blue-700">
                        {sortConfig.direction === 'asc' ? '⬆' : '⬇'}
                      </span>
                    )}
                  </button>

                  {/* Attribute Buttons */}
                  {availableAttributes.map((attr) => (
                    <button
                      key={attr}
                      onClick={() => handleSortChange(attr)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1
                        ${sortConfig.field === attr 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {attr}
                      {sortConfig.field === attr && (
                        <span className="text-[14px] font-bold ml-0.5 text-blue-700">
                          {sortConfig.direction === 'asc' ? '⬆' : '⬇'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Variants Table Section */}
            <div className="mx-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-medium text-gray-700">Variant Details</h3>
                <button
                  onClick={toggleVariantTable}
                  className="px-2 py-1 text-[10px] font-medium bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {isVariantTableExpanded ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {isVariantTableExpanded && (
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#3a3f47] text-white">
                        <th className="px-3 py-2 text-left text-[11px] font-medium">Property</th>
                        {getSortedVariants(sortedVariantIds).map((variantId, index) => (
                          <th
                            key={variantId}
                            className={`px-3 py-2 text-center text-[11px] font-medium
                              ${index === 0 ? 'bg-amber-500/10' : ''}`}
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="truncate max-w-[120px]">{variantId}</span>
                              {index === 0 && (
                                <span className="text-[9px] bg-amber-400/20 px-1.5 rounded">
                                  current
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Image Row */}
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 text-[11px] font-medium bg-gray-50">Image</td>
                        {getSortedVariants(sortedVariantIds).map((variantId, index) => (
                          <td
                            key={variantId}
                            className={`px-3 py-2 text-center ${index === 0 ? 'bg-amber-50' : ''}`}
                          >
                            {variantData[variantId]?.image ? (
                              <div className="relative group">
                                <img
                                  src={variantData[variantId].image}
                                  alt={`Variant ${variantId}`}
                                  className="w-12 h-12 object-contain mx-auto rounded-md hover:scale-150 transition-transform duration-200"
                                />
                              </div>
                            ) : "-"}
                          </td>
                        ))}
                      </tr>

                      {/* Title Row */}
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 text-[11px] font-medium bg-gray-50">Title</td>
                        {getSortedVariants(sortedVariantIds).map((variantId, index) => (
                          <td
                            key={variantId}
                            className={`px-3 py-2 text-[11px] text-center ${index === 0 ? 'bg-amber-50' : ''}`}
                          >
                            {variantData[variantId]?.title || "-"}
                          </td>
                        ))}
                      </tr>

                      {/* Attributes Row */}
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 text-[11px] font-medium bg-gray-50">Attributes</td>
                        {getSortedVariants(sortedVariantIds).map((variantId, index) => (
                          <td
                            key={variantId}
                            className={`px-3 py-2 text-center ${index === 0 ? 'bg-amber-50' : ''}`}
                          >
                            <div className="flex flex-col gap-0.5">
                              {productData?.variants?.variantsMap?.[variantId]?.variants?.map((attribute: string, attrIndex: number) => (
                                <span
                                  key={attrIndex}
                                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded"
                                >
                                  {attribute
                                    .split('-')[1]
                                    .split('_')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}
                                </span>
                              )) || "-"}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Price Row */}
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 text-[11px] font-medium bg-gray-50">Price</td>
                        {getSortedVariants(sortedVariantIds).map((variantId, index) => (
                          <td
                            key={variantId}
                            className={`px-3 py-2 text-[11px] text-center ${index === 0 ? 'bg-amber-50' : ''}`}
                          >
                            <span className="font-medium">
                              {productData?.variants?.variantsMap?.[variantId]?.priceInfo?.currentPrice?.price
                                ? `$${parseFloat(productData?.variants?.variantsMap?.[variantId]?.priceInfo?.currentPrice?.price ?? 0).toFixed(2)}`
                                : "-"}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Sellers Row */}
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 text-[11px] font-medium bg-gray-50">Sellers</td>
                        {getSortedVariants(sortedVariantIds).map((variantId, index) => (
                          <td
                            key={variantId}
                            className={`px-3 py-2 text-[11px] text-center ${index === 0 ? 'bg-amber-50' : ''}`}
                          >
                            <span className="font-medium">{variantData[variantId]?.sellers || "0"}</span>
                          </td>
                        ))}
                      </tr>

                      {/* WPID Row */}
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 text-[11px] font-medium bg-gray-50">WPID</td>
                        {getSortedVariants(sortedVariantIds).map((variantId, index) => (
                          <td
                            key={variantId}
                            className={`px-3 py-2 text-[11px] text-center ${index === 0 ? 'bg-amber-50' : ''}`}
                          >
                            {productData?.variants?.variantsMap?.[variantId]?.usItemId || "-"}
                          </td>
                        ))}
                      </tr>

                      {/* UPC Row */}
                      <tr className="border-b border-gray-200">
                        <td className="px-3 py-2 text-[11px] font-medium bg-gray-50">UPC</td>
                        {getSortedVariants(sortedVariantIds).map((variantId, index) => (
                          <td
                            key={variantId}
                            className={`px-3 py-2 text-[11px] text-center ${index === 0 ? 'bg-amber-50' : ''}`}
                          >
                            {variantData[variantId]?.upc || "-"}
                          </td>
                        ))}
                      </tr>

                      {/* Stock Status Row */}
                      <tr>
                        <td className="px-3 py-2 text-[11px] font-medium bg-gray-50">Stock Status</td>
                        {getSortedVariants(sortedVariantIds).map((variantId, index) => (
                          <td
                            key={variantId}
                            className={`px-3 py-2 text-center ${index === 0 ? 'bg-amber-50' : ''}`}
                          >
                            {productData?.variants?.variantsMap?.[variantId]?.availabilityStatus === "IN_STOCK" ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-800">
                                <span className="mr-1">●</span>
                                In Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-800">
                                <span className="mr-1">●</span>
                                Out of Stock
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default Variations;