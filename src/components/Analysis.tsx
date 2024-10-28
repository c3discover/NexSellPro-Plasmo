import React, { useState, useEffect } from "react";
import getData from '../utils/getData';

// Product interface definitions
interface Product {
  shippingLength?: number;
  shippingWidth?: number;
  shippingHeight?: number;
  weight?: number;
  currentPrice?: number;
  totalSellers?: number;
  stock?: number;
  brand?: string;
  sellerName?: string;
  sellerDisplayName?: string;
  totalReviewCount?: number;
  fulfillmentOptions?: number;
}

interface AnalysisProps {
  product: Product;
  areSectionsOpen: boolean;
}

export const Analysis: React.FC<AnalysisProps> = ({ product, areSectionsOpen }) => {
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [productDetails, setProductDetails] = useState(null);
  const [capturedData, setCapturedData] = useState(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const getDaysAgo = (dateString) => {
    const today = new Date();
    const reviewDate = new Date(dateString);
    const differenceInTime = today.getTime() - reviewDate.getTime();
    return Math.floor(differenceInTime / (1000 * 3600 * 24));
  };

  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  useEffect(() => {
    const productData = getData();
    setProductDetails(productData);
  }, []);

  const observeDomChanges = (targetNode) => {
    if (targetNode) {
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            setTimeout(() => {
              const jsonData = extractDataFromModal(targetNode);
              setCapturedData(jsonData);
            }, 500);
          }
        });
      });

      observer.observe(targetNode, { childList: true, subtree: true });
      return observer;
    }
    return null;
  };

  const waitForModal = () => {
    return new Promise((resolve) => {
      const checkExist = setInterval(() => {
        const modalNode = document.querySelector(".w_g1_b");
        if (modalNode) {
          clearInterval(checkExist);
          resolve(modalNode);
        }
      }, 100);
    });
  };

  const extractDataFromModal = (modalNode) => {
    const data = [];
    const offers = modalNode.querySelectorAll("[data-testid='allSellersOfferLine']");

    offers.forEach((offer) => {
      const priceElement = offer.querySelector(".b.f4.w-50");
      const price = priceElement ? parseFloat(priceElement.textContent.replace(/[^0-9.]/g, '')) : null;
    
      const sellerElement = offer.querySelector("[data-testid='product-seller-info']");
      let seller = sellerElement ? sellerElement.textContent.trim() : null;
      if (seller) {
          seller = seller.replace("Sold and shipped by ", "");
      }
    
      const walmartFulfilled = offer.querySelector("[data-automation-id='Walmart-delivery']");
    
      const brandMatchesSeller = product.brand && seller &&
          product.brand.toLowerCase().split(' ').some(brandPart => 
              seller.toLowerCase().includes(brandPart)
          );
    
      let fulfillmentStatus;
      if (seller === "Walmart.com") {
          fulfillmentStatus = "WMT";
      } else if (brandMatchesSeller) {
          if (walmartFulfilled) {
              fulfillmentStatus = "Brand-WFS";
          } else if (sellerElement && sellerElement.textContent.toLowerCase().startsWith("sold and shipped by")) {
              fulfillmentStatus = "Brand-SF";
          } else {
              fulfillmentStatus = "Brand";
          }
      } else if (walmartFulfilled) {
          fulfillmentStatus = "WFS";
      } else if (sellerElement && sellerElement.textContent.toLowerCase().startsWith("sold and shipped by")) {
          fulfillmentStatus = "SF";
      } else {
          fulfillmentStatus = "?";
      }
    
      data.push({
          priceInfo: {
              currentPrice: {
                  price: price,
                  priceString: price !== null ? `$${price.toFixed(2)}` : "-",
              }
          },
          sellerName: seller,
          fulfillmentStatus: fulfillmentStatus,
      });
    });

    console.log("Extracted Data:", data);
    return data;
  };

  // Function for handling single-seller data extraction using API data
  const extractSingleSellerData = () => {
    const data = [];

    // Use API data for price and seller
    const price = product.currentPrice || null;
    let seller = product.sellerDisplayName || null;

    // Fallback to DOM scraping if necessary
    const sellerElement = document.querySelector("[data-testid='product-seller-info']");
    if (!seller && sellerElement) {
        // Find the nested anchor element that contains the seller name within the span
        const sellerLink = sellerElement.querySelector("a[data-testid='seller-name-link']");
        if (sellerLink) {
            seller = sellerLink.textContent.trim();
        } else {
            // If the anchor link is not found, attempt to extract directly from the span's aria-label attribute
            seller = sellerElement.getAttribute('aria-label')?.replace("Sold and shipped by ", "").trim();
        }
    }

    const walmartFulfilled = document.querySelector("[data-automation-id='Walmart-delivery']");

    const brandMatchesSeller = product.brand && seller &&
        product.brand.toLowerCase().split(' ').some(brandPart => 
            seller.toLowerCase().includes(brandPart)
        );

    let fulfillmentStatus;
    if (seller === "Walmart.com") {
        fulfillmentStatus = "WMT";
    } else if (brandMatchesSeller) {
        if (walmartFulfilled) {
            fulfillmentStatus = "Brand-WFS";
        } else if (sellerElement && sellerElement.textContent.toLowerCase().startsWith("sold and shipped by")) {
            fulfillmentStatus = "Brand-SF";
        } else {
            fulfillmentStatus = "Brand";
        }
    } else if (walmartFulfilled) {
        fulfillmentStatus = "WFS";
    } else if (sellerElement && sellerElement.textContent.toLowerCase().startsWith("sold and shipped by")) {
        fulfillmentStatus = "SF";
    } else {
        fulfillmentStatus = "?";
    }

    data.push({
        priceInfo: {
            currentPrice: {
                price: price,
                priceString: price !== null ? `$${price.toFixed(2)}` : "-",
            }
        },
        sellerName: seller,
        fulfillmentStatus: fulfillmentStatus,
    });

    setCapturedData(data);
};

useEffect(() => {
  const handleDataCapture = async () => {
      const compareSellersButton = document.querySelector("[aria-label='Compare all sellers']") as HTMLButtonElement;

      if (compareSellersButton) {
          // Multiple sellers exist, handle multi-seller scenario
          compareSellersButton.click();
          const modalNode = await waitForModal();
          const observer = observeDomChanges(modalNode);

          setTimeout(() => {
              if (observer) {
                  observer.disconnect();
              }
          }, 5000);
      } else {
          // Single seller scenario
          extractSingleSellerData();
      }
  };

  handleDataCapture();
}, [product.totalSellers]);

  console.log('Captured Data:', capturedData);

  return (
    <div
      id="Analysis"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "▼ Analysis" : "▶ Analysis"}
      </h1>

      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>
        {/* Your other JSX and data mappings */}
      </div>

      {/* Top Section: Total Reviews and Date of Last Review */}
      <div className="w-full p-2 flex justify-between items-center">
        <div className="w-1/3 p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Total Ratings
          </p>
          <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
            {productDetails ? productDetails.numberOfRatings : "-"} {/* Display total ratings */}
          </p>
        </div>

        <div className="w-1/3 p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Total Reviews
          </p>
          <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
            {productDetails ? productDetails.numberOfReviews : "-"} {/* Display total reviews */}
          </p>
        </div>

        <div className="w-1/3 p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Verified Reviews
          </p>
          <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
            {productDetails ? productDetails.overallRating : "-"} {/* Display overall rating */}
          </p>
        </div>
      </div>



      {/* Middle Section: New Reviews */}
      <div className="w-[95%] mx-auto px-2 pb-4 flex justify-between items-center">
        <div className="w-full p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Date of Most Recent Reviews
          </p>
          <div className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
            {productDetails && productDetails.reviewDates && productDetails.reviewDates.length > 0
              ? (
                <div className="grid grid-cols-1 md:grid-cols-2 mx-10 justify-center"> {/* Use grid layout for 3 columns */}
                  {productDetails.reviewDates
                    .map(dateString => new Date(dateString)) // Convert strings to Date objects
                    .sort((a, b) => b.getTime() - a.getTime()) // Sort by time (newest to oldest)
                    .map((date, index) => {
                      const daysAgo = getDaysAgo(date.toISOString()); // Get how many days ago the review was
                      let circleLabel = null;
                      let circleStyle = {};

                      // Determine which label to show based on how many days ago the review was submitted
                      if (daysAgo <= 30) {
                        circleLabel = '30';
                        circleStyle = { backgroundColor: 'green', color: 'white' };
                      } else if (daysAgo <= 60) {
                        circleLabel = '60';
                        circleStyle = { backgroundColor: 'purple', color: 'white' };
                      } else if (daysAgo <= 90) {
                        circleLabel = '90';
                        circleStyle = { backgroundColor: 'orange', color: 'white' };
                      } else {
                        circleLabel = '  ';
                      }

                      return (
                        <div key={index} className="flex items-center justify-center mb-1">
                          <p>{date.toLocaleDateString()}</p>
                          {circleLabel && (
                            <span
                              style={{
                                ...circleStyle,
                                display: 'inline-block',
                                width: '15px',
                                height: '15px',
                                lineHeight: '15px',
                                borderRadius: '50%',
                                textAlign: 'center',
                                marginLeft: '10px',
                                fontWeight: 'bold',
                              }}
                            >
                              {circleLabel}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : "No reviews available"}
          </div>
        </div>
      </div>







      {/* Middle Section: Seller Information */}
      <div className="w-full p-2 flex justify-between items-center">
        <div className="w-full p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Total Sellers
          </p>
          <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
            {product.totalSellers || "-"}
          </p>
        </div>
      </div>

      <div className="w-[95%] mx-auto px-2 pb-4 flex justify-between items-center">
        <div className="w-1/3 p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            WFS Sellers
          </p>
          <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
            -
          </p>
        </div>

        <div className="w-1/3 p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Walmart Selling?
          </p>
          <p className={`text-xs text-center p-1 w-full rounded-b-lg shadow-md shadow-black border-2 border-black font-bold ${product.sellerName === "Walmart.com"
            ? "bg-green-100 text-green-700 border-green-500"
            : "bg-red-100 text-red-700 border-red-500"
            }`}>
            {product.sellerName === "Walmart.com" ? "YES" : "NO"}
          </p>
        </div>

        <div className="w-1/3 p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Brand Selling?
          </p>
          <p className={`text-xs text-center p-1 w-full rounded-b-lg shadow-md shadow-black border-2 border-black font-bold ${product.brand && (product.sellerDisplayName || product.sellerName) &&
            ((product.brand.toLowerCase().includes((product.sellerDisplayName || product.sellerName).toLowerCase())) ||
              ((product.sellerDisplayName || product.sellerName).toLowerCase().includes(product.brand.toLowerCase())))
            ? "bg-green-100 text-green-700 border-green-500"
            : "bg-red-100 text-red-700 border-red-500"
            }`}>
            {product.brand && (product.sellerDisplayName || product.sellerName) &&
              ((product.brand.toLowerCase().includes((product.sellerDisplayName || product.sellerName).toLowerCase())) ||
                ((product.sellerDisplayName || product.sellerName).toLowerCase().includes(product.brand.toLowerCase())))
              ? "YES" : "NO"}
          </p>
        </div>

      </div>








      {/* Middle Section: Stock Information */}
      <div className="w-full p-2 flex justify-between items-center">
        <div className="w-full p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Total Stock
          </p>
          <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
            {product.stock || "-"}
          </p>
        </div>
      </div>


      <div className="w-[95%] mx-auto px-2 pb-4 flex justify-between items-center">
        <div className="w-1/3 p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Shipping Stock
          </p>
          <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
            {product.fulfillmentOptions?.[0]?.availableQuantity || 0}
          </p>
        </div>

        <div className="w-1/3 p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Pickup Stock
          </p>
          <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
            {product.fulfillmentOptions?.[1]?.availableQuantity || 0}
          </p>
        </div>

        <div className="w-1/3 p-1">
          <p className="bg-[#3a3f47] text-2xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black">
            Delivery Stock
          </p>
          <p className="text-2xs text-black text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black">
            {product.fulfillmentOptions?.[2]?.availableQuantity || 0}
          </p>
        </div>
      </div>




      {/* Bottom Section: Seller Table */}
      <div className="w-full p-2">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 text-2xs text-white bg-[#3a3f47] uppercase border-2 border-black">
                Seller Name
              </th>
              <th className="px-4 py-2 text-2xs text-white bg-[#3a3f47] uppercase border-2 border-black">
                Price
              </th>
              <th className="px-4 py-2 text-2xs text-white bg-[#3a3f47] uppercase border-2 border-black">
                Fulfillment
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {capturedData && capturedData.length > 0 ? (
              capturedData.map((item, index) => (
                <tr key={index}>
                  <td className="px-1 text-center whitespace-nowrap text-2xs border-2 border-black bg-white">
                    {item.sellerName || "-"}
                  </td>
                  <td className="px-1 text-center whitespace-nowrap text-2xs border-2 border-black bg-white">
                    {item.priceInfo?.currentPrice?.priceString || "-"}
                  </td>

                  <td className="px-1 text-center whitespace-nowrap text-2xs border-2 border-black bg-white">
                    {item.fulfillmentStatus === "WMT" ? (
                      <span className="bg-blue-100 border-blue-500 text-blue-700 font-bold border rounded-lg px-1">
                        WMT
                      </span>
                    ) : item.fulfillmentStatus === "Brand-WFS" ? (
                      <span className="bg-purple-100 border-purple-500 text-purple-700 font-bold border rounded-lg px-1">
                        Brand-WFS
                      </span>
                    ) : item.fulfillmentStatus === "Brand-SF" ? (
                      <span className="bg-purple-100 border-purple-500 text-purple-700 font-bold border rounded-lg px-1">
                        Brand-SF
                      </span>
                    ) : item.fulfillmentStatus === "Brand" ? (
                      <span className="bg-purple-100 border-purple-500 text-purple-700 font-bold border rounded-lg px-1">
                        Brand
                      </span>
                    ) : item.fulfillmentStatus === "WFS" ? (
                      <span className="bg-red-100 border-red-500 text-red-700 font-bold border rounded-lg px-1">
                        WFS
                      </span>
                    ) : item.fulfillmentStatus === "SF" ? (
                      <span className="bg-green-100 border-green-500 text-green-700 font-bold border rounded-lg px-1">
                        SF
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-black-700 font-bold border border-red-500 rounded-lg px-1">
                        ?
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-2 py-2 text-center text-xs border-2 border-black bg-white">
                  No data available
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>


    </div>
  );
};

export default Analysis;
