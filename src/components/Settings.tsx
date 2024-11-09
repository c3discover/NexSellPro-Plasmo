import React, { useState, useEffect } from "react";

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [desiredMetrics, setDesiredMetrics] = useState({
    minProfit: "0.00",
    minMargin: "0",
    minROI: "0",
    minMonthlySales: "Coming Soon...",
    minTotalRatings: "0",
    minRatings30Days: "0",
    maxSellers: "0",
    inboundShippingCost: "0.00",
    storageLength: "0",
    season: "Jan-Sep",
  });


  // Load values from localStorage when the component mounts
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics"));
    if (storedMetrics) {
      setDesiredMetrics(storedMetrics);
    }
  }, []);

  // Update localStorage whenever desiredMetrics changes
  useEffect(() => {
    localStorage.setItem("desiredMetrics", JSON.stringify(desiredMetrics));
  }, [desiredMetrics]);


  // Function to clear all inputs
  const handleClearAll = () => {
    setDesiredMetrics({
      minProfit: "0.00",
      minMargin: "0",
      minROI: "0",
      minMonthlySales: "Coming Soon...",
      minTotalRatings: "0",
      minRatings30Days: "0",
      maxSellers: "0",
      inboundShippingCost: "0.00",
      storageLength: "0",
      season: "Jan-Sep",
    });
  };

  const handleDesiredMetricsChange = (e) => {
    let input = e.target.value;
    const fieldName = e.target.name;

    // Handle money fields with two decimal places
    if (fieldName === "minProfit" || fieldName === "inboundShippingCost") {
      input = input.replace(/[^0-9]/g, ""); // Remove all non-digit characters
      if (input === "") {
        input = "0.00"; // Default value if empty
      } else {
        input = (parseFloat(input) / 100).toFixed(2); // Format with two decimal places
      }
    } else {
      // Handle other numeric fields as integers
      input = input.replace(/[^0-9]/g, ""); // Remove all non-digit characters
      if (input.startsWith("0")) {
        input = input.replace(/^0+/, ""); // Remove leading zeros
      }
      if (input === "") {
        input = "0"; // Default to 0 if empty
      }
    }

    // Update the state with the formatted value
    setDesiredMetrics((prevMetrics) => ({
      ...prevMetrics,
      [fieldName]: input,
    }));
  };


  if (!isOpen) return null;




  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-6 rounded-md w-[300px] shadow-lg relative">
        
        
        {/* Clear All Button positioned in the top-right */}
        <button
          onClick={handleClearAll}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded text-xs"
        >
          Clear All
        </button>



        <h2 className="text-lg font-bold">Settings</h2>
        <div className="space-y-1">
          <h3 className="text-md font-semibold">Baseline Metrics</h3>
          <p className="italic text-gray-600 mb-2 ml-2">Enter the desired values below</p>
          <div className="flex flex-col flex-1 space-y-1/2">






            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px] whitespace-nowrap">
                Minimum Profit
              </label>
              <div className="flex items-center w-full">
                <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
                <input
                  type="text"
                  name="minProfit"
                  value={desiredMetrics.minProfit}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 pr-3 text-right w-full border rounded-r"
                />
              </div>
            </div>

            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px] whitespace-nowrap">
                Minimum Margin
              </label>
              <div className="flex items-center w-full">
                <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">%</span>
                <input
                  type="text"
                  name="minMargin"
                  value={desiredMetrics.minMargin}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 pr-3 text-right w-full border rounded-r"
                />
              </div>
            </div>

            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px] whitespace-nowrap">
                Minimum ROI
              </label>
              <div className="flex items-center w-full">
                <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">%</span>
                <input
                  type="text"
                  name="minROI"
                  value={desiredMetrics.minROI}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 pr-3 text-right w-full border rounded-r"
                />
              </div>
            </div>


            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px]">
                Minimum Monthly Sales
              </label>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="minMonthlySales"
                  value={desiredMetrics.minMonthlySales}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 pr-3 text-right w-full border rounded"
                  placeholder="Coming Soon..."
                />
              </div>
            </div>

            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px]">
                Minimum Total Ratings
              </label>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="minTotalRatings"
                  value={desiredMetrics.minTotalRatings}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 pr-3 text-right w-full border rounded"
                />
              </div>
            </div>

            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px]">
                Minimum Ratings in the Last 30 Days
              </label>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="minRatings30Days"
                  value={desiredMetrics.minRatings30Days}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 pr-3 text-right w-full border rounded"
                />
              </div>
            </div>

            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px]">
                Maximum Number of Sellers
              </label>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="maxSellers"
                  value={desiredMetrics.maxSellers}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 pr-3 text-right w-full border rounded"
                />
              </div>
            </div>





            <h3 className="text-md font-semibold">Fee Settings</h3>
            <p className="italic text-gray-600 mb-2 ml-2">Enter your estimated values below</p>


            <div className="flex flex-col flex-1 space-y-1/2"></div>


            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px] whitespace-nowrap">
                Inbound Shipping Cost
              </label>
              <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="inboundShippingCost"
                  value={desiredMetrics.inboundShippingCost}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 pr-3 text-right w-full border"
                />
                <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">/lb</span>
              </div>
            </div>

            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px] whitespace-nowrap">
                Storage Length
              </label>
              <div className="flex items-center w-full">
                <input
                  type="number"
                  name="storageLength"
                  value={desiredMetrics.storageLength}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 tracking-wide text-right rounded-l w-full border"
                />
                <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">months</span>
              </div>
            </div>

            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px]">
                Season
              </label>
              <div className="flex items-center w-full">
                <select
                  name="season"
                  value={desiredMetrics.season}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 text-right w-full border rounded"
                >
                  <option value="Jan-Sep">Jan-Sep</option>
                  <option value="Oct-Dec">Oct-Dec</option>
                </select>
              </div>
            </div>

          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-cyan-500 text-white p-2 rounded-lg hover:bg-cyan-600"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
