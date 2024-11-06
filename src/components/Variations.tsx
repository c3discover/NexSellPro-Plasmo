import React, { useState, useEffect } from "react";

// Define the properties for Variations component
interface VariationsProps {
  variantsMap: { [key: string]: any };
  areSectionsOpen: boolean;
}

/////////////////////////////////////
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
    return { image: "-", title: "-", ratings: "-", sellers: "-", upc: "-" };
  } catch (error) {
    return { image: "-", title: "-", ratings: "-", sellers: "-", upc: "-" };
  }
}

/////////////////////////////////////
// Main Variations component
export const Variations: React.FC<VariationsProps> = ({ variantsMap, areSectionsOpen }) => {
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [variantData, setVariantData] = useState<{ [key: string]: any }>({}); // State for fetched variant data
  const [isVariantTableExpanded, setIsVariantTableExpanded] = useState(true); // Default to expanded


  // Sync visibility with the prop `areSectionsOpen`
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Toggle function to open/close the component
  const toggleOpen = () => setIsOpen(!isOpen);

  const toggleVariantTable = () => {
    setIsVariantTableExpanded((prev) => !prev);
  };

  // Function to extract and format attribute data from a variant
  const extractAttribute = (variantId: string, variantsMap: { [key: string]: any }) => {
    const variant = variantsMap[variantId];
    if (!variant || !variant.variants) return "";

    // Extract attributes and format them (e.g., "L, Silver")
    return variant.variants
      .map((attr: string) => attr.split("-")[1]) // Get the attribute value (e.g., "Silver")
      .join(", "); // Join with a comma and space
  };

  // Sort the variant IDs based on availability and attribute order
  const sortedVariantIds = Object.keys(variantsMap).sort((a, b) => {
    const variantA = variantsMap[a];
    const variantB = variantsMap[b];

    // Prioritize items in stock
    const isInStockA = variantA.availabilityStatus === "IN_STOCK";
    const isInStockB = variantB.availabilityStatus === "IN_STOCK";

    if (isInStockA && !isInStockB) return -1;
    if (!isInStockA && isInStockB) return 1;

    // Sort by attribute name if both are in stock or out of stock
    const attrA = variantA.variants?.[0]?.split("-")[1] || "";
    const attrB = variantB.variants?.[0]?.split("-")[1] || "";

    return attrA.localeCompare(attrB);
  });


  /////////////////////////////////////
  // Inside useEffect that fetches data for each variant and update `variantData` state
  useEffect(() => {
    const fetchAllVariantData = async () => {
      const variantPromises = Object.keys(variantsMap).map(async (variantId) => {
        const wpid = variantsMap[variantId]?.usItemId;
        if (wpid) {
          return fetchVariantData(wpid); // Fetch variant data
        }
        return null; // If no WPID, return null
      });

      // Await and store results for each variant
      const variantResults = await Promise.all(variantPromises);

      // Merge the fetched results back into variantData state
      const updatedVariantData = Object.keys(variantsMap).reduce((acc, variantId, index) => {
        acc[variantId] = variantResults[index]; // Store result for each variant
        return acc;
      }, {});

      setVariantData(updatedVariantData);
    };

    fetchAllVariantData();
  }, [variantsMap]);





  /////////////////////////////////////
  return (
    <div
      id="Variations"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}>

      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "▼ Variations" : "▶ Variations"}
      </h1>

      {/* Conditional Rendering for No Variations Available */}
      {isOpen && (
        <>
          {/* Render "No variations available" message if no variations */}
          {sortedVariantIds.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center py-4">
              <p className="text-gray-600 italic">No variations available.</p>
            </div>
          ) : (
            <>


              {/* Information above table */}
              <div className="w-full p-2 flex justify-between items-center">

                {/* Number of Variants Box */}
                <div className="w-1/2 p-1">
                  <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
                    Number of Variants
                  </p>
                  <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 rounded-b-lg shadow-md shadow-black">
                    {Object.keys(variantsMap).length || "-"}
                  </p>
                </div>

                {/* Variants Box */}
                <div className="w-1/2 p-1">
                  <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
                    Variant Attributes
                  </p>
                  <div className="text-2xs text-black text-center bg-white border-2 border-black p-1 rounded-b-lg shadow-md shadow-black">
                    {Object.values(variantsMap)[0]?.variants
                      .map((attribute: string) => attribute.split('-')[0]) // Get the attribute name before the dash
                      .filter((value, index, self) => self.indexOf(value) === index) // Removing duplicates
                      .map((attributeType, index) => (
                        <p key={index}>
                          {attributeType
                            .split('_') // Split on underscores
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
                            .join(' ')} {/* Join the words with spaces */}
                        </p>
                      ))}
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
              {isOpen && sortedVariantIds.length > 0 && (
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
  >                          Variant ID
                        </td>
                        {isVariantTableExpanded &&
                          sortedVariantIds.map((variantId) => (
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
                              {variantsMap[variantId]?.variants
                                .map((attribute: string) => attribute.split('-')[1]) // Get the attribute value after the dash
                                .map((attributeValue, index) => (
                                  <div key={index}>
                                    {attributeValue
                                      .split('_') // Split on underscores
                                      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
                                      .join(' ')} {/* Join with spaces for readability */}
                                  </div>
                                )) || <div>-</div>} {/* Display a dash if there are no attributes */}
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
                              {variantsMap[variantId].priceInfo?.currentPrice?.price
                                ? `$${variantsMap[variantId].priceInfo.currentPrice.price.toFixed(2)}`
                                : "-"
                              }
                            </td>
                          ))}
                      </tr>



                      {/* Ratings Row */}
                      <tr>
                        <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white text-left">
                          Ratings
                        </td>
                        {isVariantTableExpanded &&
                          sortedVariantIds.map((variantId) => (
                            <td
                              key={variantId}
                              className="px-2 py-1 text-2xs border-2 border-black text-center"
                            >
                              {variantData[variantId]?.ratings || 0}
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
                              {variantData[variantId]?.sellers || 0}
                            </td>
                          ))}
                      </tr>



                      {/* WPID Row */}
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
                              {variantsMap[variantId].usItemId || "-"}
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
                              {variantsMap[variantId].availabilityStatus === "IN_STOCK" ? "✔️" : "❌"}
                            </td>
                          ))}
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