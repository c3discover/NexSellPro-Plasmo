import React, { useState, useEffect } from "react";

interface VariationsProps {
  variantsMap: { [key: string]: any };
  areSectionsOpen: boolean;
}

// Function to fetch variant data using the product's `usItemId`
async function fetchVariantData(usItemID: string) {
  const url = `https://www.walmart.com/ip/${usItemID}`;
  console.log(`Fetching URL: ${url}`);

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Parse the HTML response
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    // Look for embedded JSON data (like __NEXT_DATA__ or another JSON object)
    const dataScript = doc.querySelector('script[id="__NEXT_DATA__"]');
    if (dataScript) {
      const jsonData = JSON.parse(dataScript.textContent || "{}");

      // Log the jsonData to inspect its structure
      console.log("Fetched Data:", jsonData);

      // Assuming jsonData contains product details
      const product = jsonData.props.pageProps?.initialData?.data?.product;

      const image = product?.imageInfo?.thumbnailUrl || "-";
      const title = product?.name || "-";
      const ratings = product?.numberOfReviews || "-";
      const sellers = product?.additionalOfferCount != null ? product.additionalOfferCount + 1 : 1;
      const upc = product?.upc || "-";

      return { image, title, ratings, sellers, upc };
    }

    // Fallback if data isn't found
    return { image: "-", title: "-", ratings: "-", sellers: "-", upc: "-" };
  } catch (error) {
    console.error("Error fetching variant data:", error);
    return { image: "-", title: "-", ratings: "-", sellers: "-", upc: "-" };
  }
}

export const Variations: React.FC<VariationsProps> = ({ variantsMap, areSectionsOpen }) => {
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [variantData, setVariantData] = useState<{ [key: string]: any }>({}); // State for fetched variant data

  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  const toggleOpen = () => setIsOpen(!isOpen);

  console.log("Variants Passed to Component:", variantsMap);

  // Sorting logic
  const sortedVariantIds = Object.keys(variantsMap).sort((a, b) => {
    const variantA = variantsMap[a];
    const variantB = variantsMap[b];

    const isInStockA = variantA.availabilityStatus === "IN_STOCK";
    const isInStockB = variantB.availabilityStatus === "IN_STOCK";

    if (isInStockA && !isInStockB) return -1;
    if (!isInStockA && isInStockB) return 1;

    const attrA = variantA.variants?.[0]?.split("-")[1] || "";
    const attrB = variantB.variants?.[0]?.split("-")[1] || "";

    return attrA.localeCompare(attrB);
  });

  // Inside useEffect that fetches variant data
  useEffect(() => {
    const fetchAllVariantData = async () => {
      // Create an array of promises to fetch all variant data concurrently
      const variantPromises = Object.keys(variantsMap).map(async (variantId) => {
        const wpid = variantsMap[variantId]?.usItemId;
        if (wpid) {
          return fetchVariantData(wpid); // Fetch variant data
        }
        return null; // If no WPID, return null
      });

      // Wait for all promises to resolve
      const variantResults = await Promise.all(variantPromises);

      // Merge the fetched results back into variantData state
      const updatedVariantData = Object.keys(variantsMap).reduce((acc, variantId, index) => {
        acc[variantId] = variantResults[index]; // Store result for each variant
        return acc;
      }, {});

      // Set the state with the fetched data
      setVariantData(updatedVariantData);
    };

    fetchAllVariantData(); // Execute the function
  }, [variantsMap]);


  return (
    <div
      id="Variations"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "▼ Variations" : "▶ Variations"}
      </h1>

      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>
        {variantsMap && sortedVariantIds.length > 0 ? (
          <div className="overflow-auto w-full" style={{ padding: "0 16px", marginTop: "10px", marginBottom: "10px" }}>
            <table className="table-auto w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-2xs font-bold text-white bg-[#3a3f47] uppercase tracking-wider border-2 border-black">
                    Attributes
                  </th>
                  {sortedVariantIds.map((variantId) => (
                    <th key={variantId} className="px-2 py-1 text-2xs bg-[#d7d7d7] tracking-wider border-2 border-black text-center">
                      {variantId}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {/* Image Row */}
                <tr>
                  <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white">Image</td>
                  {sortedVariantIds.map((variantId) => (
                    <td key={variantId} className="px-2 py-1 border-2 border-black text-center">
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
                  <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white">Title</td>
                  {sortedVariantIds.map((variantId) => (
                    <td key={variantId} className="px-2 py-1 border-2 border-black text-2xs text-center">
                      {variantData[variantId]?.title || "-"}
                    </td>
                  ))}
                </tr>

                {/* Price Row */}
                <tr>
                  <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white">Price</td>
                  {sortedVariantIds.map((variantId) => (
                    <td key={variantId} className="px-2 py-1 border-2 border-black text-2xs text-center">
                      {variantsMap[variantId].priceInfo?.currentPrice?.price
                        ? `$${variantsMap[variantId].priceInfo.currentPrice.price.toFixed(2)}`
                        : "-"
                      }
                    </td>
                  ))}
                </tr>

                {/* Ratings Row */}
                <tr>
                  <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white">Ratings</td>
                  {sortedVariantIds.map((variantId) => (
                    <td key={variantId} className="px-2 py-1 border-2 border-black text-2xs text-center">
                      {variantData[variantId]?.ratings || "-"}
                    </td>
                  ))}
                </tr>

                {/* Sellers Row */}
                <tr>
                  <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white">Sellers</td>
                  {sortedVariantIds.map((variantId) => {
                    const sellers = variantsMap[variantId].availabilityStatus !== "IN_STOCK" || variantsMap[variantId]?.additionalOfferCount == null
                      ? 0
                      : variantsMap[variantId].additionalOfferCount + 1;

                    return (
                      <td key={variantId} className="px-4 py-1 border-2 border-black text-center">
                        {sellers}
                      </td>
                    );
                  })}
                </tr>


                {/* WPID Row */}
                <tr>
                  <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white">WPID</td>
                  {sortedVariantIds.map((variantId) => (
                    <td key={variantId} className="px-2 py-1 border-2 border-black text-2xs text-center">
                      {variantsMap[variantId].usItemId || "-"}
                    </td>
                  ))}
                </tr>

                {/* UPC Row */}
                <tr>
                  <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white">UPC</td>
                  {sortedVariantIds.map((variantId) => (
                    <td key={variantId} className="px-2 py-1 border-2 border-black text-2xs text-center">
                      {variantData[variantId]?.upc || "-"}
                    </td>
                  ))}
                </tr>

                {/* In Stock Row */}
                <tr>
                  <td className="px-2 py-1 text-2xs font-bold border-2 border-black bg-[#3a3f47] text-white">In Stock</td>
                  {sortedVariantIds.map((variantId) => (
                    <td key={variantId} className="px-4 py-1 border-2 border-black text-center">
                      {variantsMap[variantId].availabilityStatus === "IN_STOCK" ? "✔️" : "❌"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-gray-400 italic">No variations available.</p>
          </div>
        )}
      </div>
    </div>
  );
};
