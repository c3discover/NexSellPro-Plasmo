////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { getUsedData } from "~/utils/usedData";
import type { UsedProductData } from "~/utils/usedData";
import getData from "~/utils/getData";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
const LOADING_MESSAGE = "Loading variations...";

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
interface VariationsProps {
  areSectionsOpen: boolean;
}

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

type VariantDataMap = Record<string, VariantData>;
type VariantsMap = Record<string, VariantInfo>;

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const Variations: React.FC<VariationsProps> = ({ areSectionsOpen }) => {

  ////////////////////////////////////////////////
  // State and Hooks:
  ////////////////////////////////////////////////
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [productData, setProductData] = useState<UsedProductData | null>(null);
  const [isVariantTableExpanded, setIsVariantTableExpanded] = useState(true);
  const [sortedVariantIds, setSortedVariantIds] = useState<string[]>([]);
  const [variantData, setVariantData] = useState<VariantDataMap>({});

  // Section open/close effect
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Main data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsedData();
      if (data) {
        setProductData(data);
        if (data.variants.variantsMap) {
          // Step 1: Identify the current variant based on productID
          const currentVariantId = Object.keys(data.variants.variantsMap).find(
            (variantId) => data.variants.variantsMap[variantId].usItemId === data.basic.productID
          );

          // Step 2: Filter and sort variants
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

          // Step 3: Add current variant to front if it exists
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

  ////////////////////////////////////////////////
  // Chrome API Handlers:
  ////////////////////////////////////////////////
  // No Chrome API handlers needed for this component

  ////////////////////////////////////////////////
  // Event Handlers:
  ////////////////////////////////////////////////
  const toggleOpen = () => setIsOpen(!isOpen);
  const toggleVariantTable = () => setIsVariantTableExpanded(!isVariantTableExpanded);

  ////////////////////////////////////////////////
  // Helper Functions:
  ////////////////////////////////////////////////
  // Function to fetch all variant data
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

  // Function to fetch variant data using the product's `usItemId`
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

  // Function to extract and format attribute data from a variant
  const extractAttribute = (variantId: string, variantsMap: VariantsMap) => {
    const variant = variantsMap[variantId];
    if (!variant || !variant.variants) return "";
    return variant.variants
      .map((attr: string) => attr.split("-")[1])
      .join(", ");
  };

  ////////////////////////////////////////////////
  // JSX:
  ////////////////////////////////////////////////
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
              {/* Variant Information Section */}
              <div className="w-full p-2 flex justify-between items-center">
                {/* ===== Variant Count Box ===== */}
                <div className="w-1/2 p-1">
                  <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
                    Number of Variants
                  </p>
                  <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 rounded-b-lg shadow-md shadow-black">
                    {Object.keys(productData?.variants?.variantsMap || {}).length || "-"}
                  </p>
                </div>

                {/* ===== Variant Attributes Box ===== */}
                <div className="w-1/2 p-1">
                  <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
                    Variant Attributes
                  </p>
                  <div className="text-2xs text-black text-center bg-white border-2 border-black p-1 rounded-b-lg shadow-md shadow-black">
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
              <div className="flex items-center">
                <button
                  onClick={toggleVariantTable}
                  className="text-xs font-semibold px-2 py-0.5 ml-2 mb-0 bg-gray-200 rounded shadow hover:bg-gray-300"
                  aria-label="Toggle variant table"
                >
                  {isVariantTableExpanded ? "🔼" : "🔽"}
                </button>
              </div>

              {/* ===== Variant Table Section ===== */}
              {Object.keys(productData?.variants?.variantsMap || {}).length > 0 && (
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
                          Object.keys(productData?.variants?.variantsMap || {}).map((variantId) => (
                            <th
                              key={variantId}
                              className="px-2 py-1 text-2xs bg-[#d7d7d7] tracking-wider border-2 border-black text-center"
                            >
                              {variantId}
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
                          sortedVariantIds.map((variantId) => (
                            <td
                              key={variantId}
                              className="px-2 py-1 text-2xs border-2 border-black text-center"
                            >
                              {variantData[variantId]?.image ? (
                                <img
                                  src={variantData[variantId].image}
                                  alt={`Image for ${variantId}`}
                                  className="w-16 h-16 object-contain mx-auto" // Added mx-auto to center image
                                />
                              ) : (
                                "-" // Show a dash if no image is available
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
                          sortedVariantIds.map((variantId) => (
                            <td
                              key={variantId}
                              className="px-2 py-1 text-2xs border-2 border-black text-center"
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
                          sortedVariantIds.map((variantId) => (
                            <td
                              key={variantId}
                              className="px-2 py-1 text-2xs border-2 border-black text-center"
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
                          sortedVariantIds.map((variantId) => (
                            <td
                              key={variantId}
                              className="px-2 py-1 text-2xs border-2 border-black text-center"
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
                          sortedVariantIds.map((variantId) => (
                            <td
                              key={variantId}
                              className="px-2 py-1 text-2xs border-2 border-black text-center"
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
                          sortedVariantIds.map((variantId) => (
                            <td
                              key={variantId}
                              className="px-2 py-1 text-2xs border-2 border-black text-center"
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
                          sortedVariantIds.map((variantId) => (
                            <td
                              key={variantId}
                              className="px-2 py-1 text-2xs border-2 border-black text-center"
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
                          sortedVariantIds.map((variantId) => (
                            <td
                              key={variantId}
                              className="px-2 py-1 text-2xs border-2 border-black text-center"
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
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default Variations;