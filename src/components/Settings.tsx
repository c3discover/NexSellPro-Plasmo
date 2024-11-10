import React, { useState, useEffect } from "react";

// SettingsModal Component: manages and saves user-defined settings
export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  // Initial State for desired metrics and fees
  const [desiredMetrics, setDesiredMetrics] = useState({
    minProfit: "0.00",
    minMargin: "0",
    minROI: "0",
    minMonthlySales: "Coming Soon...",
    minTotalRatings: "0",
    minRatings30Days: "0",
    maxSellers: "0",
    inboundShippingCost: "0.00",
    storageLength: "1",
    season: "Jan-Sep",
  });

  // State for prep and additional costs, with cost types
  const [prepCostType, setPrepCostType] = useState("per lb");
  const [prepCostPerLb, setPrepCostPerLb] = useState(0.00);
  const [prepCostEach, setPrepCostEach] = useState(0.00);
  const [additionalCostType, setAdditionalCostType] = useState("per lb");
  const [additionalCostPerLb, setAdditionalCostPerLb] = useState(0.00);
  const [additionalCostEach, setAdditionalCostEach] = useState(0.00);

  // Load values from localStorage when component mounts
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics"));
    if (storedMetrics) setDesiredMetrics(storedMetrics);
  }, []);

  // Auto-save desired metrics to localStorage on change
  useEffect(() => {
    localStorage.setItem("desiredMetrics", JSON.stringify(desiredMetrics));
  }, [desiredMetrics]);

  // Reset metrics to default values
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
      storageLength: "1",
      season: "Jan-Sep",
    });
  };

  // Handle input changes with formatting (e.g., decimal or integer)
  const handleDesiredMetricsChange = (e) => {
    let input = e.target.value.replace(/[^0-9]/g, ""); // Remove non-digits
    const fieldName = e.target.name;

    if (fieldName === "minProfit" || fieldName === "inboundShippingCost") {
      input = input ? (parseFloat(input) / 100).toFixed(2) : "0.00"; // Format to 2 decimals
    } else {
      input = input.startsWith("0") ? input.replace(/^0+/, "") : input || "0"; // Format to integer
    }

    // Update state with formatted value
    setDesiredMetrics((prev) => ({ ...prev, [fieldName]: input }));
  };

  // Save settings to localStorage and close modal
  const handleSaveSettings = () => {
    localStorage.setItem("desiredMetrics", JSON.stringify(desiredMetrics));
    localStorage.setItem("prepCostType", prepCostType);
    localStorage.setItem("prepCostPerLb", prepCostPerLb.toString());
    localStorage.setItem("prepCostEach", prepCostEach.toString());
    localStorage.setItem("additionalCostType", additionalCostType);
    localStorage.setItem("additionalCostPerLb", additionalCostPerLb.toString());
    localStorage.setItem("additionalCostEach", additionalCostEach.toString());
    onClose();
  };

  if (!isOpen) return null; // Do not render if modal is closed

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-6 rounded-md w-[300px] shadow-lg relative">
        {/* Button to clear all settings */}
        <button
          onClick={handleClearAll}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded text-xs"
        >
          Clear All
        </button>

        {/* Modal content */}
        <h2 className="text-lg font-bold">Settings</h2>
        <div className="space-y-1">
          <h3 className="text-md font-semibold">Baseline Metrics</h3>
          <p className="italic text-gray-600 mb-2 ml-2">Enter the desired values below</p>

          {/* Additional form fields would go here */}

          <button
            onClick={handleSaveSettings}
            className="mt-4 w-full bg-cyan-500 text-white p-2 rounded-lg hover:bg-cyan-600"
          >
            Save Settings
          </button>
        </div>
      </div>

  

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

            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px] whitespace-nowrap">
                Prep Cost
              </label>
              <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="prepCost"
                  value={prepCostType === "per lb" ? prepCostPerLb : prepCostEach}
                  onChange={(e) =>
                    prepCostType === "per lb"
                      ? setPrepCostPerLb(parseFloat(e.target.value) || 0.00)
                      : setPrepCostEach(parseFloat(e.target.value) || 0.00)
                  }
                  className="p-1 pr-3 text-right w-full border"
                />
                <select
                  value={prepCostType}
                  onChange={(e) => setPrepCostType(e.target.value)}
                  className="p-1 border-l rounded-r bg-gray-100 text-gray-700"
                >
                  <option value="per lb">/lb</option>
                  <option value="per unit">each</option>
                </select>
              </div>
            </div>


            <div className="flex items-center mb-2">
              <label className="p-1 mr-2 min-w-[120px] whitespace-nowrap">
                Additional Fees
              </label>
              <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="aditionalCosts"
                  value={additionalCostType === "per lb" ? additionalCostPerLb : additionalCostEach}
                  onChange={(e) =>
                    additionalCostType === "per lb"
                      ? setAdditionalCostPerLb(parseFloat(e.target.value) || 0.00)
                      : setAdditionalCostEach(parseFloat(e.target.value) || 0.00)
                  }
                  className="p-1 pr-3 text-right w-full border"
                />
                <select
                  value={additionalCostType}
                  onChange={(e) => setAdditionalCostType(e.target.value)}
                  className="p-1 border-l rounded-r bg-gray-100 text-gray-700"
                >
                  <option value="per lb">/lb</option>
                  <option value="per unit">each</option>
                </select>
              </div>
            </div>







          </div>
          <button
            onClick={handleSaveSettings}
            className="mt-4 w-full bg-cyan-500 text-white p-2 rounded-lg hover:bg-cyan-600"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
    </div>
  )
}
