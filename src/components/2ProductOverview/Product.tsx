////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import { useState, useEffect } from "react";
import { getUsedData } from "../../utils/usedData";
import type { UsedProductData } from "../../utils/usedData";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////


////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Using UsedProductData from usedData.ts

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const Product = () => {

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
  const [productData, setProductData] = useState<UsedProductData | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsedData();
      if (data) {
        setProductData(data);
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
  const handleCopy = () => {
    if (productData) {
      navigator.clipboard.writeText(productData.basic.name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
  const renderShelvingPath = () => {
    if (!productData?.categories?.categories || productData.categories.categories.length === 0) {
      return <span>No shelving path available</span>;
    }

    return productData.categories.categories.map((category, index) => (
      <span key={index}>
        <a
          href={`https://www.walmart.com${category.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {category.name}
        </a>
        {index < productData.categories.categories.length - 1 && " > "}
      </span>
    ));
  };

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
  if (!productData) {
    return (
      <div className="p-4 w-full text-center">
        <div className="mx-auto w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin"></div>
      </div>
    );
  }

  // Get first category for the main category link
  const firstCategory = productData.categories.categories[0];

  return (
    <div
      id="product"
      key="product"
      className="flex items-center justify-start flex-col bg-[#d7d7d7] max-w-[100%] p-2 gap-2 rounded-lg shadow-2xl"
    >
      {/* Product Name Section */}
      <div id="productName" className="flex items-center justify-between w-full">
        <p className="text-black font-bold text-sm text-center p-1 mb-2 mr-1 ml-2 rounded-lg bg-[#bfbfbf] shadow-black shadow-xl">
          {productData.basic.name}
        </p>

        {/* Copy and Copied Icons */}
        <svg
          onClick={handleCopy}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lucide lucide-copy cursor-pointer w-10 h-10 ${copied ? "hidden" : ""} hover:scale-110 transition-transform duration-200 m-2`}
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>

        {/* Copied Check Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`lucide lucide-copy cursor-pointer w-10 h-10 text-green-500 ${copied ? "" : "hidden"} hover:scale-110 transition-transform duration-200 m-2`}
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      {/* Product General Info */}
      <div id="productGeneralInfo" className="flex flex-col lg:flex-row items-stretch justify-between w-full gap-3">

        {/* Product Image Section */}
        <div id="productImage" className="flex-1 flex flex-col items-center justify-between bg-white p-1 rounded-lg shadow-lg">
          <img
            src={productData.media.imageUrl}
            alt={productData.basic.name}
            className="w-2/3 hover:w-full p-2 rounded-lg" />
          <div>
            <p className="font-bold text-center text-black text-sm">
              Images: <span className="font-normal">{productData.media.images?.length || 0}</span>
            </p>
            <p className="font-bold text-center text-black text-sm p-1">
              Videos: <span className="font-normal">{productData.media.videos?.length || 0}</span>
            </p>
          </div>
        </div>

        {/* Product Details Section */}
        <div id="productDetails" className="flex-1 flex flex-col items-center justify-center bg-white p-1 rounded-lg shadow-lg">
          {/* Quick Stats Section */}
          <div className="w-full px-2">
            <p className="text-black text-sm p-1 flex justify-between items-center">
              <span className="font-bold"> Price </span>
              <span className="px-2 py-1 bg-gray-300 rounded-lg text-black text-sm">
                ${productData.pricing.currentPrice ? productData.pricing.currentPrice.toFixed(2) : '0.00'}
              </span>
            </p>

            <p className="text-black text-sm p-1 flex justify-between items-center">
              <span className="font-bold"> Ratings </span>
              <span className="px-2 py-1 bg-gray-300 rounded-lg text-black text-sm">
                {productData.reviews.numberOfRatings}
              </span>
            </p>

            <p className="text-black text-sm p-1 flex justify-between items-center">
              <span className="font-bold"> Sellers </span>
              <span className="px-2 py-1 bg-gray-300 rounded-lg text-black text-sm">
                {productData.inventory.totalSellers}
              </span>
            </p>

            <p className="text-black text-sm p-1 flex justify-between items-center">
              <span className="font-bold">Walmart Selling? </span>
              {productData.pricing.sellerName === "Walmart.com" ? (
                <span className="px-1 py-1 text-sm bg-red-100 text-red-700 font-bold border border-red-500 rounded-lg shadow-sm">YES</span>
              ) : (
                <span className="px-1 py-1 text-sm bg-green-100 text-green-700 font-bold border border-green-500 rounded-lg shadow-sm">NO</span>
              )}
            </p>

            <p className="text-black text-sm p-1 flex justify-between items-center">
              <span className="font-bold">Variations </span>
              <span className="px-2 py-1 bg-gray-300 rounded-lg text-black text-sm">
                {Object.keys(productData.variants.variantsMap || {}).length || "-"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Brand and Category Info */}
      <div className="flex flex-col items-left px-3 py-1 rounded-lg shadow-2xl bg-white w-full">
        {/* Brand - Link to Walmart search */}
        <p className="text-black font-bold text-start text-md">
          Brand:{" "}
          <a
            href={`https://www.walmart.com/search?q=${productData.basic.brand}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-500 hover:underline"
          >
            {productData.basic.brand}
          </a>
        </p>

        {/* Category - Link to first category */}
        <p className="text-black font-bold text-start text-md">
          Category:{" "}
          {firstCategory ? (
            <a
              href={`https://www.walmart.com${firstCategory.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-500 hover:underline"
            >
              {firstCategory.name}
            </a>
          ) : (
            <span>No Category Available</span>
          )}
        </p>

        {/* Shelving Path */}
        <p className="text-black font-bold text-start text-md">
          Shelving Path: <span className="ml-2 text-sm font-normal align-middle">{renderShelvingPath()}</span>
        </p>
      </div>

      {/* Badges */}
      <div className="text-center p-1 rounded-lg shadow-2xl bg-slate-500">
        {productData.badges.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 p-1 place-items-center">
            {productData.badges.map((badge, index) => {
              const containsNumber = /\d+/.test(badge); // Check if the badge contains a number

              // Style for badge with a number (outline style)
              const outlineStyle = "border border-blue-500 text-blue-500 bg-white";

              // Style for badge without a number (filled style)
              const filledStyle = "bg-blue-100 text-blue-900";

              // If it's the last badge and there's an odd number of badges, make it span both columns (centered)
              const isLastSingleBadge = index === productData.badges.length - 1 && productData.badges.length % 2 !== 0;

              return (
                <div
                  key={index}
                  className={`text-xs px-2 py-1 rounded-lg shadow-md ${containsNumber ? outlineStyle : filledStyle
                    } ${isLastSingleBadge ? 'col-span-2 text-center' : ''}`}
                >
                  {badge}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-300 italic">No badges available.</p>
        )}
      </div>

    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default Product;