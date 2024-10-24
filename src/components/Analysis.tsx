import React, { useState, useEffect } from "react";
import getData from '../utils/getData';  // Import the getData function

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
  totalReviewCount?: number;
  fulfillmentOptions?: number;
}

interface AnalysisProps {
  product: Product;
  areSectionsOpen: boolean;
}

export const Analysis: React.FC<AnalysisProps> = ({ product, areSectionsOpen }) => {  // Correctly typing the props
  const [isOpen, setIsOpen] = useState(areSectionsOpen);  // State for section open/close
  const [productDetails, setProductDetails] = useState(null);

  // Set `isOpen` state when `areSectionsOpen` prop changes
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Fetch product details and set state when component mounts
  useEffect(() => {
    const productData = getData();
    setProductDetails(productData);
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);  // Toggle section open/close

  const [capturedData, setCapturedData] = useState(null);

  useEffect(() => {
    const extractDataFromModal = (modalNode) => {
      const data = [];
      const offers = modalNode.querySelectorAll("[data-testid='allSellersOfferLine']");

      offers.forEach((offer) => {
        const priceElement = offer.querySelector(".b.f4.w-50");
        const price = priceElement ? priceElement.textContent.trim() : null;

        const shippingElement = offer.querySelector("[data-testid='more-seller-options-fulfillment-option']");
        const shipping = shippingElement ? shippingElement.textContent.trim() : null;

        const sellerElement = offer.querySelector("[data-testid='product-seller-info']");
        let seller = sellerElement ? sellerElement.textContent.trim() : null;
        if (seller) {
          seller = seller.replace("Sold and shipped by ", ""); // Remove the "Sold and shipped by" prefix
        }

        data.push({
          priceInfo: {
            currentPrice: {
              price: parseFloat(price.replace('$', '')),
              priceString: price,
            }
          },
          fulfillmentOptions: [
            {
              locationText: shipping,
              availabilityStatus: "IN_STOCK"
            }
          ],
          sellerName: seller,
        });
      });

      return data;
    };

    const observeDomChanges = (targetNode) => {
      if (targetNode) {
        const observer = new MutationObserver((mutationsList) => {
          mutationsList.forEach((mutation) => {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
              const jsonData = extractDataFromModal(targetNode);
              setCapturedData(jsonData);

              // Close the modal after capturing data
              const closeButton = document.querySelector("div > div > div > div > div > button > svg");
              if (closeButton) {
                closeButton.parentElement.click(); // Trigger click on the parent element to close the modal
              }
            }
          });
        });

        observer.observe(targetNode, {
          childList: true,
          subtree: true,
        });

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
        }, 100); // Check every 100ms for the modalNode to appear
      });
    };

    if (product.totalSellers && product.totalSellers > 1) {
      const button = document.querySelector(
        "#maincontent > section > main > div.flex.flex-column.h-100 > div:nth-child(2) > div > div.w_aoqv.w_wRee.w_b_WN > div > div:nth-child(2) > div > div > div.overflow-hidden > section > div > div > div > div > div.mb1.mr2 > span.mb1.ml2 > span > button"
      ) as HTMLButtonElement;

      if (button) {
        button.addEventListener("click", async () => {
          // Wait for the modal to appear after the button click
          const modalNode = await waitForModal();
          const observer = observeDomChanges(modalNode); // Start observing once the modalNode is found

          // Optionally, disconnect the observer after a certain time
          setTimeout(() => {
            if (observer) {
              observer.disconnect();
            }
          }, 5000); // Adjust the timeout as needed based on how long it takes for the data to load
        });
        button.click(); // Optionally, click the button programmatically
      }
    }
  }, [product.totalSellers]);

  // Function to determine the age of the review in days
  const getDaysAgo = (dateString: string) => {
    const today = new Date();
    const reviewDate = new Date(dateString);
    const differenceInTime = today.getTime() - reviewDate.getTime();
    return Math.floor(differenceInTime / (1000 * 3600 * 24)); // Convert milliseconds to days
  };

  
  // Add this line to check the capturedData:
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
            <p className={`text-xs text-center p-1 w-full rounded-b-lg shadow-md shadow-black border-2 border-black font-bold ${product.brand === product.sellerName
              ? "bg-green-100 text-green-700 border-green-500"
              : "bg-red-100 text-red-700 border-red-500"
              }`}>
              {product.brand === product.sellerName ? "YES" : "NO"}
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
                  WFS
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">

            {capturedData && capturedData.length > 0 ? (
  capturedData.map((item, index) => {
    // Log fulfillment options for inspection
    console.log('Fulfillment Options for seller:', item.sellerName, JSON.stringify(item.fulfillmentOptions, null, 2));

    return (
      <tr key={index}>
        <td className="px-1 text-center whitespace-nowrap text-2xs border-2 border-black bg-white">
          {item.sellerName || "-"}
        </td>
        <td className="px-1 text-center whitespace-nowrap text-2xs border-2 border-black bg-white">
          {item.priceInfo?.currentPrice?.price || "-"}
        </td>
        <td className="px-1 text-center whitespace-nowrap text-2xs border-2 border-black bg-white">
          {item.sellerName === "Walmart.com" ? (
            <span className="bg-yellow-100 text-red-700 font-bold border border-red-500 rounded-lg px-1">
              WFS
            </span>
          ) : item.wfsEnabled ? (
            "✔️"
          ) : (
            "❌"
          )}
        </td>
      </tr>
    );
  })
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
    </div>
  );
};

export default Analysis;
