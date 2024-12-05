////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import getData from "../utils/getData"; // Import the getData function

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants defined at this point

////////////////////////////////////////////////
// Props and Types:
////////////////////////////////////////////////
// Define the type for productDetailsUsed:
interface ProductDetails {
  name: string;
  imageUrl: string;
  images?: string[];
  videos?: string[];
  currentPrice: string;
  numberOfRatings: number;
  sellerName: string;
  badges?: string[];
  brand: string;
  totalSellers?: number;
  categories?: { name: string; url: string }[];
  variantsMap: { [key: string]: { availabilityStatus: string; variants: string[] } };
  variantCriteria?: any; // You can refine the type based on the structure you expect
}

// Define the properties for Variations component
interface VariationsProps {
  variantsMap: { [key: string]: any };
  areSectionsOpen: boolean;
}

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
export const Variations: React.FC<VariationsProps> = ({ areSectionsOpen }) => {
  // States for component visibility and fetched variant data
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [productDetailsUsed, setProductDetailsUsed] = useState<any | null>(null);
  const [isVariantTableExpanded, setIsVariantTableExpanded] = useState(true); // Default to expanded
  const [sortedVariantIds, setSortedVariantIds] = useState<string[]>([]);
  const [variantData, setVariantData] = useState<{ [variantId: string]: any }>({});


  // Sync visibility with the prop `areSectionsOpen`
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Fetch product data on component mount
  useEffect(() => {
    const fetchedProductDetails = getData();
    if (fetchedProductDetails) {
      setProductDetailsUsed(fetchedProductDetails);
    } else {
      console.error("Failed to fetch product details.");
    }
  }, []);

  useEffect(() => {
    const fetchAllVariantData = async () => {
      try {
        if (productDetailsUsed && productDetailsUsed.variantsMap) {
          const variantPromises = Object.keys(productDetailsUsed.variantsMap).map(async (variantId) => {
            // Add logic for fetching the data per variant here
            return {}; // Placeholder for actual data fetching logic
          });

          // Await and store results for each variant
          const variantResults = await Promise.all(variantPromises);

          // Merge the fetched results back into variantData state
          const updatedVariantData = Object.keys(productDetailsUsed.variantsMap).reduce((acc, variantId, index) => {
            acc[variantId] = variantResults[index]; // Store result for each variant
            return acc;
          }, {});

          // Store updated variant data in state (create state variable to store it)
          // setVariantData(updatedVariantData);
        }
      } catch (error) {
        console.error('Failed to fetch variant data:', error);
      }
    };

    fetchAllVariantData();
  }, [productDetailsUsed]);


  ////////////////////////////////////////////////
  // Helper Functions:
  ////////////////////////////////////////////////
  // Function to fetch variant data using the product's `usItemId`
  async function fetchVariantData(usItemID: string) {
    const url = `https://www.walmart.com/ip/${usItemID}`;

    try {
      const response = await fetch(url);
      const text = await response.text();

      // Parse the HTML response
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      // Locate JSON data in the HTML script tag
      const dataScript = doc.querySelector('script[id="__NEXT_DATA__"]');
      if (dataScript) {
        const jsonData = JSON.parse(dataScript.textContent || "{}");

        // Assuming jsonData contains product details
        const product = jsonData.props.pageProps?.initialData?.data?.product;

        // Return specific fields for each variant
        const image = product?.imageInfo?.thumbnailUrl || "-";
        const title = product?.name || "-";
        const ratings = product?.numberOfReviews || 0;
        const sellers = product?.additionalOfferCount != null ? product.additionalOfferCount + 1 : 1;
        const upc = product?.upc || "-";

        return { image, title, ratings, sellers, upc };
      }

      // Fallback if data isn't found
      console.warn("No data found in the HTML response.");
      return { image: "-", title: "-", ratings: "-", sellers: "-", upc: "-" };
    } catch (error) {
      console.error("Error fetching variant data:", error);
      return { image: "-", title: "-", ratings: "-", sellers: "-", upc: "-" };
    }
  }

  // Function to extract and format attribute data from a variant
  const extractAttribute = (variantId: string, variantsMap: { [key: string]: any }) => {
    const variant = variantsMap[variantId];
    if (!variant || !variant.variants) return "";

    // Extract attributes and format them (e.g., "L, Silver")
    return variant.variants
      .map((attr: string) => attr.split("-")[1]) // Get the attribute value (e.g., "Silver")
      .join(", "); // Join with a comma and space
  };

  // Fetch product data on component mount
  useEffect(() => {
    try {
      const fetchedProductDetails = getData();
      if (fetchedProductDetails) {
        setProductDetailsUsed(fetchedProductDetails);
      } else {
        console.error("Failed to fetch product details.");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  }, []);

  useEffect(() => {
    if (productDetailsUsed && productDetailsUsed.variantsMap) {
      // Step 1: Identify the current variant based on productID
      const currentVariantId = Object.keys(productDetailsUsed.variantsMap).find(
        (variantId) =>
          productDetailsUsed.variantsMap[variantId].usItemId === productDetailsUsed.productID
      );

      // Step 2: Filter variants excluding the current variant
      const filteredVariantIds = Object.keys(productDetailsUsed.variantsMap).filter(
        (variantId) => variantId !== currentVariantId
      );

      // Step 3: Sort by availability
      const sortedVariantIds = filteredVariantIds.sort((a, b) => {
        const variantA = productDetailsUsed.variantsMap[a];
        const variantB = productDetailsUsed.variantsMap[b];

        const isInStockA = variantA.availabilityStatus === "IN_STOCK";
        const isInStockB = variantB.availabilityStatus === "IN_STOCK";

        if (isInStockA && !isInStockB) return -1;
        if (!isInStockA && isInStockB) return 1;
        return 0;
      });

      // Step 4: Add the current variant to the front of the list
      if (currentVariantId) {
        sortedVariantIds.unshift(currentVariantId);
      }

      // Set the sorted variant IDs
      setSortedVariantIds(sortedVariantIds);
    }
  }, [productDetailsUsed]);

  // Inside useEffect that fetches data for each variant and update `variantData` state
  useEffect(() => {
    if (productDetailsUsed && productDetailsUsed.variantsMap) {
      const fetchAllVariants = async () => {
        const fetchedData: { [variantId: string]: any } = {};

        // Loop through each variant and fetch its data
        await Promise.all(
          Object.keys(productDetailsUsed.variantsMap).map(async (variantId) => {
            const usItemId = productDetailsUsed.variantsMap[variantId]?.usItemId;
            if (usItemId) {
              const variantInfo = await fetchVariantData(usItemId);
              fetchedData[variantId] = variantInfo;
            }
          })
        );

        // Update the state with fetched variant data
        setVariantData(fetchedData);
      };

      fetchAllVariants();
    }
  }, [productDetailsUsed]);


  ////////////////////////////////////////////////
  // Event Handlers:
  ////////////////////////////////////////////////
  // Toggle function to open/close the component
  const toggleOpen = () => setIsOpen(!isOpen);

  // Toggle the expansion of the variant table
  const toggleVariantTable = () => {
    setIsVariantTableExpanded(!isVariantTableExpanded);
  };


  ////////////////////////////////////////////////
  // JSX (Return):
  ////////////////////////////////////////////////
  return (
    <div
      id="Variations"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}>

      {/* Header for Variations Section */}
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "🔽  Variations" : "▶️  Variations"}
      </h1>

      {/* Conditional Rendering: Only show content if the section is open */}
      {isOpen && (
        <>
          {/* If no variations are available, display a message */}
          {sortedVariantIds.length === 0 ? (
            <div className="w-full h-[100px] flex justify-center items-center py-4">
              <p className="text-gray-600 italic text-center">No variations available.</p>
            </div>
          ) : (
            <>
              {/* Information Above the Variants Table */}
              <div className="w-full p-2 flex justify-between items-center">

                {/* Number of Variants Box */}
                <div className="w-1/2 p-1">
                  {/* Label */}
                  <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
                    Number of Variants
                  </p>
                  {/* Displaying the number of variants */}
                  <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 rounded-b-lg shadow-md shadow-black">
                    {Object.keys(productDetailsUsed?.variantsMap || {}).length || "-"}
                  </p>
                </div>

                {/* Variant Attributes Box */}
                <div className="w-1/2 p-1">
                  {/* Label */}
                  <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
                    Variant Attributes
                  </p>
                  {/* Displaying the variant attributes */}
                  <div className="text-2xs text-black text-center bg-white border-2 border-black p-1 rounded-b-lg shadow-md shadow-black">
                    {(productDetailsUsed?.variantsMap &&
                      Object.values(productDetailsUsed?.variantsMap as { availabilityStatus: string; variants: string[] }[])[0]?.variants?.map((attribute: string) => attribute.split('-')[0]) // Get the attribute name before the dash
                        .filter((value, index, self) => self.indexOf(value) === index) // Removing duplicates
                        .map((attributeType, index) => (
                          <p key={index}>
                            {attributeType
                              .split('_') // Split on underscores
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
                              .join(' ')} {/* Join the words with spaces */}
                          </p>
                        ))) || (
                        <span className="text-gray-600 italic">No variant attributes available.</span>
                      )
                    }
                  </div>
                </div>
              </div>




              {/* Toggle Button for the Variant Table */}
              <div className="flex items-center">
                <button
                  onClick={toggleVariantTable}
                  className="text-xs font-semibold px-2 py-0.5 ml-2 mb-0 bg-gray-200 rounded shadow hover:bg-gray-300"
                  aria-label="Toggle variant table"
                >
                  {isVariantTableExpanded ? "🔼" : "🔽"}
                </button>
              </div>




              {/* Variant Table with Title Column Always Visible */}
              {isOpen && Object.keys(productDetailsUsed?.variantsMap).length > 0 && (
                <div
                  className="overflow-auto w-full"
                  style={{ padding: "0 16px", marginTop: "0px", marginBottom: "10px" }}
                >
                  <table className="table-auto w-full border-collapse">

                    {/* Variant ID Row */}
                    <thead>
                      <tr>
                        <td
                          className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white"
                          style={{ textAlign: "left" }}
                        >
                          Variant ID
                        </td>
                        {isVariantTableExpanded &&
                          Object.keys(productDetailsUsed?.variantsMap ?? {}).map((variantId) => (
                            <th
                              key={variantId}
                              className="px-2 py-1 text-2xs bg-[#d7d7d7] tracking-wider border-2 border-black text-center"
                            >
                              {variantId}
                            </th>
                          ))}
                      </tr>
                    </thead>

                    {/* Image Row */}
                    <tbody className="bg-white divide-y divide-gray-200">
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
                              {productDetailsUsed?.variantsMap?.[variantId]?.variants ? (
                                productDetailsUsed.variantsMap[variantId].variants.map((attribute: string, index: number) => (
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
                              {/* Check if productDetailsUsed and price info is available */}
                              {productDetailsUsed?.variantsMap?.[variantId]?.priceInfo?.currentPrice?.price
                                ? `$${parseFloat(productDetailsUsed?.variantsMap?.[variantId]?.priceInfo?.currentPrice?.price ?? 0).toFixed(2)}`
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
                              {/* Check if productDetailsUsed and usItemId are available */}
                              {productDetailsUsed?.variantsMap?.[variantId]?.usItemId
                                ? productDetailsUsed?.variantsMap?.[variantId]?.usItemId ?? "-"
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
                              {/* Use productDetailsUsed to access availability status */}
                              {productDetailsUsed?.variantsMap?.[variantId]?.availabilityStatus === "IN_STOCK"
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
      )
      }
    </div >
  );
}

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default Variations;