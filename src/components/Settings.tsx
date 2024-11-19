/////////////////////////////////////////////////
// Imports and Type Definitions
/////////////////////////////////////////////////

import React, { useState, useEffect } from "react";

/////////////////////////////////////////////////
// Component Definition
/////////////////////////////////////////////////

// SettingsModal Component: manages and saves user-defined settings
export const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: () => void; 
}> = ({ isOpen, onClose, onSettingsChange }) => {

  /////////////////////////////////////////////////////
  // State Definitions
  /////////////////////////////////////////////////////

  // User-defined metrics and fee settings
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

  // Prep and additional costs settings
  const [prepCostType, setPrepCostType] = useState("per lb");
  const [prepCostPerLb, setPrepCostPerLb] = useState(0.0);
  const [prepCostEach, setPrepCostEach] = useState(0.0);
  const [additionalCostType, setAdditionalCostType] = useState("per lb");
  const [additionalCostPerLb, setAdditionalCostPerLb] = useState(0.0);
  const [additionalCostEach, setAdditionalCostEach] = useState(0.0);

  // Fulfillment preference settings
  const [defaultFulfillment, setDefaultFulfillment] = useState<string>("Walmart Fulfilled");

  /////////////////////////////////////////////////////
  // Effect Hooks for Loading and Saving Settings
  /////////////////////////////////////////////////////

  // Load values from localStorage when the component mounts
  useEffect(() => {
    const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    if (storedMetrics) setDesiredMetrics(storedMetrics);

    const savedFulfillment = localStorage.getItem("defaultFulfillment");
    if (savedFulfillment) setDefaultFulfillment(savedFulfillment);
  }, []);

  // Save desired metrics and fulfillment preference to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("desiredMetrics", JSON.stringify(desiredMetrics));
    localStorage.setItem("defaultFulfillment", defaultFulfillment);
  }, [desiredMetrics, defaultFulfillment]);

  /////////////////////////////////////////////////////
  // Handler Functions
  /////////////////////////////////////////////////////

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
    setDefaultFulfillment("Walmart Fulfilled");
    onSettingsChange(); // Notify parent component of changes
  };

  // Handle changes in user-defined metrics with proper formatting
  const handleDesiredMetricsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name;
    let input = e.target.value;

    // Format numeric inputs for specific fields
    if (fieldName === "minProfit" || fieldName === "inboundShippingCost") {
      input = input ? (parseFloat(input) / 100).toFixed(2) : "0.00"; // Format to 2 decimal places
    } else if (!isNaN(Number(input))) {
      input = input.startsWith("0") ? input.replace(/^0+/, "") : input || "0"; // Format as an integer
    }

    // Update the state
    setDesiredMetrics((prev) => ({ ...prev, [fieldName]: input }));
  };

  // Handle changes in default fulfillment preference
  const handleFulfillmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDefaultFulfillment(e.target.value);
  };

  // Save all settings and close the modal
  const handleSaveSettings = () => {
    localStorage.setItem("desiredMetrics", JSON.stringify(desiredMetrics));
    localStorage.setItem("prepCostType", prepCostType);
    localStorage.setItem("prepCostPerLb", prepCostPerLb.toString());
    localStorage.setItem("prepCostEach", prepCostEach.toString());
    localStorage.setItem("additionalCostType", additionalCostType);
    localStorage.setItem("additionalCostPerLb", additionalCostPerLb.toString());
    localStorage.setItem("additionalCostEach", additionalCostEach.toString());
    onSettingsChange(); // Notify parent component of changes
    onClose();
  };


  /////////////////////////////////////////////////////
  // Conditional Rendering
  /////////////////////////////////////////////////////

  if (!isOpen) return null; // Do not render if modal is closed




  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-6 rounded-md w-[350px] shadow-lg relative">

        {/* Clear All Button */}
        <button
          onClick={handleClearAll}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded text-xs"
        >
          Clear All
        </button>

        {/* Modal Header */}
        <h2 className="text-lg font-bold">Settings</h2>

        {/* Baseline Metrics Section */}
        <div className="space-y-1">
          <h3 className="text-md font-semibold">Baseline Metrics</h3>
          <p className="italic text-gray-600 mb-2 ml-2">Enter the desired values below</p>

          {/* Baseline Metrics Inputs */}
          <div className="flex flex-col flex-1 space-y-2">
            {/* Minimum Profit */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[170px] whitespace-nowrap">
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

            {/* Minimum Margin */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[170px] whitespace-nowrap">
                Minimum Margin
              </label>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="minMargin"
                  value={desiredMetrics.minMargin}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 pr-3 text-right w-full border rounded-l"
                />
                <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">%</span>
              </div>
            </div>

            {/* Minimum ROI */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[170px] whitespace-nowrap">
                Minimum ROI
              </label>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="minROI"
                  value={desiredMetrics.minROI}
                  onChange={handleDesiredMetricsChange}
                  className="p-1 pr-3 text-right w-full border rounded-l"
                />
                <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">%</span>
              </div>
            </div>

            {/* Minimum Monthly Sales */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[170px]">
                Minimum Monthly Sales
              </label>
              <input
                type="text"
                name="minMonthlySales"
                value={desiredMetrics.minMonthlySales}
                onChange={handleDesiredMetricsChange}
                className="p-1 pr-3 text-right w-full border rounded"
                placeholder="Coming Soon..."
              />
            </div>

            {/* Minimum Total Ratings */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[170px]">
                Minimum Total Ratings
              </label>
              <input
                type="text"
                name="minTotalRatings"
                value={desiredMetrics.minTotalRatings}
                onChange={handleDesiredMetricsChange}
                className="p-1 pr-3 text-right w-full border rounded"
              />
            </div>

            {/* Minimum Ratings in Last 30 Days */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[170px]">
                Minimum Ratings (30 Days)
              </label>
              <input
                type="text"
                name="minRatings30Days"
                value={desiredMetrics.minRatings30Days}
                onChange={handleDesiredMetricsChange}
                className="p-1 pr-3 text-right w-full border rounded"
              />
            </div>

            {/* Maximum Number of Sellers */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[170px]">
                Maximum Sellers
              </label>
              <input
                type="text"
                name="maxSellers"
                value={desiredMetrics.maxSellers}
                onChange={handleDesiredMetricsChange}
                className="p-1 pr-3 text-right w-full border rounded"
              />
            </div>
          </div>
        </div>

        {/* Fee Settings Section */}
        <div className="space-y-1 mt-4">
          <h3 className="text-md font-semibold">Fee Settings</h3>
          <p className="italic text-gray-600 mb-2 ml-2">Enter your estimated values below</p>

          {/* Inbound Shipping Cost */}
          <div className="flex items-center">
            <label className="p-1 mr-2 min-w-[170px] whitespace-nowrap">
              Inbound Shipping Cost
            </label>
            <span className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700">$</span>
            <input
              type="text"
              name="inboundShippingCost"
              value={desiredMetrics.inboundShippingCost}
              onChange={handleDesiredMetricsChange}
              className="p-1 pr-3 text-right w-full border"
            />
            <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">/lb</span>
          </div>

          {/* Storage Length */}
          <div className="flex items-center">
            <label className="p-1 mr-2 min-w-[170px]">
              Storage Length
            </label>
            <input
              type="number"
              name="storageLength"
              value={desiredMetrics.storageLength}
              onChange={handleDesiredMetricsChange}
              className="p-1 text-right w-full border rounded"
            />
            <span className="p-1 inline-block border rounded-r bg-gray-100 text-gray-700">months</span>
          </div>

          {/* Season */}
          <div className="flex items-center mb-2">
            <label className="p-1 mr-2 min-w-[170px]">
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

          {/* Pre Cost */}
          <div className="flex items-center mb-2">
            <label className="p-1 mr-2 min-w-[170px] whitespace-nowrap">
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

          {/* Additional Fees */}
          <div className="flex items-center mb-2">
            <label className="p-1 mr-2 min-w-[170px] whitespace-nowrap">
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


          {/* Fulfillment Method */}
          <div className="flex items-center">
            <label htmlFor="fulfillment-select" className="p-1 mr-2 min-w-[170px] whitespace-nowrap">
              Default Fulfillment
            </label>
            <select
              id="fulfillment-select"
              value={defaultFulfillment}
              onChange={handleFulfillmentChange}
              className="p-2 text-2xs border rounded w-full"
            >
              <option value="Walmart Fulfilled">Walmart Fulfilled</option>
              <option value="Seller Fulfilled">Seller Fulfilled</option>
            </select>
          </div>
        </div>

        {/* Save Settings Button */}
        <button
          onClick={handleSaveSettings}
          className="mt-4 w-full bg-cyan-500 text-white p-2 rounded-lg hover:bg-cyan-600"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

