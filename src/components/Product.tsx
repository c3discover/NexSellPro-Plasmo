import { useState, useEffect } from "react";
import getData from "../utils/getData"; // Import your getData function to retrieve product details

export const Product = ({ product }: any) => {
  const [copied, setCopied] = useState(false);
  const [badges, setBadges] = useState([]);
  const [categories, setCategories] = useState([]); // Add state to store categories
  const [totalSellers, setTotalSellers] = useState(0);


  // Fetch badges and categories when the component mounts
  useEffect(() => {
    const productDetails = getData();
    console.log("Product Details:", productDetails);

    setBadges(productDetails.badges || []);
    setCategories(productDetails.categories || []); // Fetch categories from product details
    setTotalSellers(productDetails.totalSellers || 0);
  }, []);

  // Helper function to render shelving path as links
  const renderShelvingPath = () => {
    if (categories.length === 0) {
      return <span>No shelving path available</span>;
    }

    return categories.map((category: any, index: number) => (
      <span key={index}>
        <a
          href={`https://www.walmart.com${category.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {category.name}
        </a>
        {index < categories.length - 1 && " > "} {/* Add '>' between links */}
      </span>
    ));
  };

  // Extract the first category from the path
  const firstCategory = categories.length > 0 ? categories[0] : null;

  return (
    <div
      id="product"
      key="product"
      className="font-montserrat flex items-center justify-start flex-col bg-[#d7d7d7] max-w-[100%] p-2 gap-2 rounded-lg shadow-2xl"
    >


      {/* Product Name Section */}
      <div id="productName" className="flex items-center justify-between w-full">
        <p className="text-black font-bold text-xs text-center p-1 mb-2 mr-1 ml-2 rounded-lg bg-[#bfbfbf] shadow-black shadow-xl">{product.name}</p>

        {/* Copy and Copied Icons */}
        <svg
          onClick={() => {
            navigator.clipboard.writeText(product.name);
            setCopied(!copied);
          }}
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

        <svg
          onClick={() => {
            navigator.clipboard.writeText(product.name);
            setCopied(!copied);
          }}
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
      <div id="productGeneralInfo" className="flex flex-col lg:flex-row items-stretch items-center justify-between w-full gap-3">

        {/* Product Image Section */}
        <div id="productImage" className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white p-1 rounded-lg shadow-lg">
          <img src={product.imageUrl} alt={product.name} className="w-1/2 hover:w-full p-2 rounded-lg" />
          <p className="font-bold text-center text-black text-sm">
            Images: <span className="font-normal">{product?.images?.length || 0}</span>
          </p>
          <p className="font-bold text-center text-black text-sm p-1">
            Videos: <span className="font-normal">{product?.videos?.length || 0}</span>
          </p>
        </div>

        {/* Product Details Section */}
        <div id="productDetails" className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white p-1 rounded-lg shadow-lg">
          {/* Quick Stats Section */}
            <p className="text-black text-xs p-1">
              <span className="font-bold">Current Price </span>
            </p>
            <p>
              <span className="px-2 py-1 bg-gray-200 rounded-lg text-black text-xs p-1">${product.currentPrice ? parseFloat(product.currentPrice).toFixed(2) : '0.00'}</span>
            </p>
            <p className="text-black text-xs p-1 mt-2">
              <span className="font-bold mt-2">Total Ratings </span>
            </p>
            <p>
              <span className="px-2 py-1 bg-gray-200 rounded-lg text-black text-xs p-1">{product.numberOfRatings} ⭐ </span>
            </p>
            <p className="text-black text-xs p-1 mt-2">
              <span className="font-bold mt-2">Total Sellers </span>
              <span className="px-2 py-1 bg-gray-200 rounded-lg text-black text-xs p-1">{totalSellers} </span>
            </p>
            <p className="text-black text-xs p-1 mt-2">
              <span className="font-bold mt-2">Walmart Selling? </span>
              {product.sellerName === "Walmart.com" ? (
                <span className="px-1 py-1 text-xs bg-green-100 text-green-700 font-bold border border-green-500 rounded-lg shadow-sm">YES</span>
              ) : (
                <span className="px-1 py-1 text-xs bg-red-100 text-red-700 font-bold border border-red-500 rounded-lg shadow-sm">NO</span>
              )}
            </p>
          </div>
        </div>








      <div className="flex flex-col items-left px-3 py-1 rounded-lg shadow-2xl bg-white w-full">
        {/* Brand - Link to Walmart search */}
        <p className="text-black font-bold text-start text-md">
          Brand:{" "}
          <a
            href={`https://www.walmart.com/search?q=${product.brand}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-500 hover:underline"
          >
            {product.brand}
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
            <span>No category available</span>
          )}
        </p>

        {/* Shelving Path */}
        <p className="text-black font-bold text-start text-md">
          Shelving Path: <span className="ml-2 text-2xs font-normal align-middle">{renderShelvingPath()}</span>
        </p>
      </div>




      {/* Badges */}
      <div className="text-center p-1 rounded-lg shadow-2xl shadow-lg bg-slate-500">
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 p-1 place-items-center">
            {badges.map((badge, index) => {
              const containsNumber = /\d+/.test(badge); // Check if the badge contains a number

              // Style for badge with a number (outline style)
              const outlineStyle = "border border-blue-500 text-blue-500 bg-white";

              // Style for badge without a number (filled style)
              const filledStyle = "bg-blue-100 text-blue-900";

              // If it's the last badge and there's an odd number of badges, make it span both columns (centered)
              const isLastSingleBadge = index === badges.length - 1 && badges.length % 2 !== 0;

              return (
                <div
                  key={index}
                  className={`text-2xs px-2 py-1 rounded-lg shadow-md ${containsNumber ? outlineStyle : filledStyle
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