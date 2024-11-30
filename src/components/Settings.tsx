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
  const [desiredMetrics, setDesiredMetrics] = useState<{
    minProfit: string;
    minMargin: string;
    minROI: string;
    minMonthlySales: string;
    minTotalRatings: string;
    minRatings30Days: string;
    maxSellers: string;
    inboundShippingCost: string;
    storageLength: string;
    season: string;
    prepCost: string;
    additionalCosts: string;
  }>({
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
    prepCost: "0.00",
    additionalCosts: "0.00"
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

  // New state to handle the raw values for all metrics
  const [rawMetrics, setRawMetrics] = useState<Partial<typeof desiredMetrics>>({});


  // New state to handle the raw value
  const [rawMinProfit, setRawMinProfit] = useState<string | null>(null);
  const [rawMinMargin, setRawMinMargin] = useState<string | null>(null);
  const [rawMinROI, setRawMinROI] = useState<string | null>(null);
  const [rawMinMonthlySales, setRawMinMonthlySales] = useState<string | null>(null);
  const [rawMinTotalRatings, setRawMinTotalRatings] = useState<string | null>(null);
  const [rawMinRatings30Days, setRawMinRatings30Days] = useState<string | null>(null);
  const [rawMaxSellers, setRawMaxSellers] = useState<string | null>(null);
  const [rawInboundShippingCost, setRawInboundShippingCost] = useState<string | null>(null);
  const [rawStorageLength, setRawStorageLength] = useState<string | null>(null);
  const [rawSeason, setRawSeason] = useState<string | null>(null);
  const [rawPrepCost, setRawPrepCost] = useState<string | null>(null);
  const [rawAdditionalCosts, setRawAdditionalCosts] = useState<string | null>(null);

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
      prepCost: "0.00",
      additionalCosts: "0.00"
    });
    setDefaultFulfillment("Walmart Fulfilled");
    onSettingsChange(); // Notify parent component of changes
  };

  // Handle changes in user-defined metrics with proper formatting
  const handleDesiredMetricsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name;
    const input = e.target.value;

    // Update rawMetrics to keep the bold text while editing
    setRawMetrics((prev: Record<string, string | null>) => ({
      ...prev,
      [fieldName]: input,
    }));
  };

  // Handle changes in default fulfillment preference
  const handleFulfillmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDefaultFulfillment(e.target.value);
  };

  // Handle changes when user stops editing
  const handleBlur = (fieldName: string) => {
    setRawMetrics((prev: Record<string, string | null>) => {
      const updated = { ...prev };
      delete updated[fieldName]; // Remove the field from rawMetrics
      return updated;
    });

    setDesiredMetrics((prev: typeof desiredMetrics) => {
      let formattedValue = prev[fieldName];
      if (["minProfit", "inboundShippingCost", "prepCost", "additionalCosts"].includes(fieldName)) {
        // Format monetary values to 2 decimal places
        formattedValue = parseFloat(rawMetrics[fieldName] ?? "0").toFixed(2);
      } else {
        // Format other fields as integers
        formattedValue = Math.round(parseFloat(rawMetrics[fieldName] ?? "0")).toString();
      }
      return {
        ...prev,
        [fieldName]: formattedValue,
      };
    });
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

  /////////////////////////////////////////////////////
  // JSX (Return)
  /////////////////////////////////////////////////////

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
          <h3 className="text-base font-semibold">Baseline Metrics</h3>
          <p className="italic text-gray-600 mb-2 ml-2">Enter the desired values below</p>

          {/* Baseline Metrics Inputs */}
          <div className="flex flex-col flex-1 space-y-2">

            {/* Minimum Profit */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[160px] whitespace-nowrap">
                Minimum Profit
              </label>
              <div className="flex items-center w-full">
                <span
                  className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700"
                  style={{ fontSize: "14px", height: "28px" }}
                >$</span>
                <input
                  type="text"
                  name="minProfit"
                  value={rawMetrics.minProfit !== undefined ? rawMetrics.minProfit : desiredMetrics.minProfit}
                  onChange={handleDesiredMetricsChange}
                  onBlur={() => handleBlur("minProfit")}
                  className={`p-1 pr-3 text-right w-full border rounded-r ${rawMetrics.minProfit !== undefined ? "font-bold" : ""}`}
                  style={{ fontSize: "14px", height: "28px" }} // Adjust the height and font size as needed
                />
              </div>
            </div>

            {/* Minimum Margin */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[160px] whitespace-nowrap">
                Minimum Margin
              </label>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="minMargin"
                  value={rawMetrics.minMargin !== undefined ? rawMetrics.minMargin : desiredMetrics.minMargin}
                  onChange={handleDesiredMetricsChange}
                  onBlur={() => handleBlur("minMargin")}
                  className={`p-1 pr-3 text-right w-full border rounded-l ${rawMetrics.minMargin !== undefined ? "font-bold" : ""}`}
                  style={{ fontSize: "14px", height: "28px" }} // Adjust height and font size
                />
                <span
                  className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700"
                  style={{ fontSize: "14px", height: "28px" }}
                >%</span>
              </div>
            </div>

            {/* Minimum ROI */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[160px] whitespace-nowrap">
                Minimum ROI
              </label>
              <div className="flex items-center w-full">
                <input
                  type="text"
                  name="minROI"
                  value={rawMetrics.minROI !== undefined ? rawMetrics.minROI : desiredMetrics.minROI}
                  onChange={handleDesiredMetricsChange}
                  onBlur={() => handleBlur("minROI")}
                  className={`p-1 pr-3 text-right w-full border rounded-l ${rawMetrics.minROI !== undefined ? "font-bold" : ""}`}
                  style={{ fontSize: "14px", height: "28px" }}
                />
                <span
                  className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700"
                  style={{ fontSize: "14px", height: "28px" }}
                >%</span>
              </div>
            </div>

            {/* Minimum Monthly Sales */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[160px]">
                Minimum Monthly Sales
              </label>
              <input
                type="text"
                name="minMonthlySales"
                value={desiredMetrics.minMonthlySales}
                onChange={handleDesiredMetricsChange}
                className="p-1 pr-3 text-right w-full border rounded"
                placeholder="Coming Soon..."
                style={{ fontSize: "14px", height: "28px" }}
              />
            </div>

            {/* Minimum Total Ratings */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[160px]">
                Minimum Total Ratings
              </label>
              <input
                type="text"
                name="minTotalRatings"
                value={rawMetrics.minTotalRatings !== undefined ? rawMetrics.minTotalRatings : desiredMetrics.minTotalRatings}
                onChange={handleDesiredMetricsChange}
                onBlur={() => handleBlur("minTotalRatings")}
                className={`p-1 pr-3 text-right w-full border rounded ${rawMetrics.minTotalRatings !== undefined ? "font-bold" : ""}`}
                style={{ fontSize: "14px", height: "28px" }}
              />
            </div>

            {/* Minimum Ratings in Last 30 Days */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[160px]">
                Minimum Ratings (30 Days)
              </label>
              <input
                type="text"
                name="minRatings30Days"
                value={rawMetrics.minRatings30Days !== undefined ? rawMetrics.minRatings30Days : desiredMetrics.minRatings30Days}
                onChange={handleDesiredMetricsChange}
                onBlur={() => handleBlur("minRatings30Days")}
                className={`p-1 pr-3 text-right w-full border rounded ${rawMetrics.minRatings30Days !== undefined ? "font-bold" : ""}`}
                style={{ fontSize: "14px", height: "28px" }}
              />
            </div>

            {/* Maximum Number of Sellers */}
            <div className="flex items-center">
              <label className="p-1 mr-2 min-w-[160px]">
                Maximum Sellers
              </label>
              <input
                type="text"
                name="maxSellers"
                value={rawMetrics.maxSellers !== undefined ? rawMetrics.maxSellers : desiredMetrics.maxSellers}
                onChange={handleDesiredMetricsChange}
                onBlur={() => handleBlur("maxSellers")}
                className={`p-1 pr-3 text-right w-full border rounded ${rawMetrics.maxSellers !== undefined ? "font-bold" : ""}`}
                style={{ fontSize: "14px", height: "28px" }}
              />
            </div>
          </div>
        </div>

        {/* Fee Settings Section */}
        <div className="space-y-1 mt-4">
          <h3 className="text-base font-semibold">Fee Settings</h3>
          <p className="italic text-gray-600 mb-2 ml-2">Enter your estimated values below</p>

          {/* Inbound Shipping Cost */}
          <div className="flex items-center">
            <label className="p-1 mr-2 min-w-[160px] whitespace-nowrap">
              Inbound Shipping Cost
            </label>
            <span
              className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700"
              style={{ fontSize: "14px", height: "28px" }}
            >$</span>
            <input
              type="text"
              name="inboundShippingCost"
              value={rawMetrics.inboundShippingCost !== undefined ? rawMetrics.inboundShippingCost : desiredMetrics.inboundShippingCost}
              onChange={handleDesiredMetricsChange}
              onBlur={() => handleBlur("inboundShippingCost")}
              className={`p-1 pr-3 text-right w-full border ${rawMetrics.inboundShippingCost !== undefined ? "font-bold" : ""}`}
              style={{ fontSize: "14px", height: "28px" }}
            />
            <span
              className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700"
              style={{ fontSize: "14px", height: "28px" }}
            >/lb</span>
          </div>

          {/* Storage Length */}
          <div className="flex items-center">
            <label className="p-1 mr-2 min-w-[160px]">
              Storage Length
            </label>
            <input
              type="number"
              name="storageLength"
              value={rawMetrics.storageLength !== undefined ? rawMetrics.storageLength : desiredMetrics.storageLength}
              onChange={handleDesiredMetricsChange}
              onBlur={() => handleBlur("storageLength")}
              className={`p-1 text-right w-full border rounded-l ${rawMetrics.storageLength !== undefined ? "font-bold" : ""}`}
              style={{ fontSize: "14px", height: "28px" }}
            />
            <span
              className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700"
              style={{ fontSize: "14px", height: "28px" }}
            >months</span>
          </div>

          {/* Season */}
          <div className="flex items-center mb-2">
            <label className="p-1 mr-2 min-w-[160px]">
              Season
            </label>
            <div className="flex items-center w-full">
              <select
                name="season"
                value={desiredMetrics.season}
                onChange={(e) => {
                  setDesiredMetrics({ ...desiredMetrics, season: e.target.value });
                }}
                className="p-1 text-right w-full border rounded"
                style={{ fontSize: "14px", height: "28px", lineHeight: "14px", paddingRight: "2rem" }}
              >
                <option value="Jan-Sep">Jan-Sep</option>
                <option value="Oct-Dec">Oct-Dec</option>
              </select>
            </div>
          </div>

          {/* Prep Cost */}
          <div className="flex items-center mb-2">
            <label className="p-1 mr-2 min-w-[160px] whitespace-nowrap">
              Prep Cost
            </label>
            <span
              className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700"
              style={{ fontSize: "14px", height: "28px" }}
            >$</span>
            <div className="flex items-center w-full">
              <input
                type="text"
                name="prepCost"
                value={rawMetrics.prepCost !== undefined ? rawMetrics.prepCost : (prepCostType === "per lb" ? prepCostPerLb : prepCostEach)}
                onChange={(e) =>
                  prepCostType === "per lb"
                    ? setPrepCostPerLb(parseFloat(e.target.value) || 0.00)
                    : setPrepCostEach(parseFloat(e.target.value) || 0.00)
                }
                onBlur={() => handleBlur("prepCost")}
                className={`p-1 pr-3 text-right w-full border ${rawMetrics.prepCost !== undefined ? "font-bold" : ""}`}
                style={{ fontSize: "14px", height: "28px" }}
              />
              <select
                value={prepCostType}
                onChange={(e) => setPrepCostType(e.target.value)}
                className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700"
                style={{ fontSize: "14px", height: "28px", paddingRight: "1rem" }}
              >
                <option value="per lb">/lb</option>
                <option value="per unit">each</option>
              </select>
            </div>
          </div>

          {/* Additional Costs */}
          <div className="flex items-center mb-2">
            <label className="p-1 mr-2 min-w-[160px] whitespace-nowrap">
              Additional Costs
            </label>
            <span
              className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700"
              style={{ fontSize: "14px", height: "28px" }}
            >$</span>
            <div className="flex items-center w-full">
              <input
                type="text"
                name="additionalCosts"
                value={rawMetrics.additionalCosts !== undefined ? rawMetrics.additionalCosts : (additionalCostType === "per lb" ? additionalCostPerLb : additionalCostEach)}
                onChange={(e) =>
                  additionalCostType === "per lb"
                    ? setAdditionalCostPerLb(parseFloat(e.target.value) || 0.0)
                    : setAdditionalCostEach(parseFloat(e.target.value) || 0.0)
                }
                onBlur={() => handleBlur("additionalCosts")}
                className={`text-sm p-1 pr-3 text-right w-full border ${rawMetrics.additionalCosts !== undefined ? "font-bold" : ""}`}
                style={{ fontSize: "14px", height: "30px" }}
              />
              <select
                value={additionalCostType}
                onChange={(e) => setAdditionalCostType(e.target.value)}
                className="p-1 inline-block border rounded-l bg-gray-100 text-gray-700"
                style={{ fontSize: "14px", height: "28px", paddingRight: "1rem" }}

              >
                <option value="per lb">/lb</option>
                <option value="per unit">each</option>
              </select>
            </div>
          </div>


          {/* Fulfillment Method */}
          <div className="flex items-center">
            <label htmlFor="fulfillment-select" className="p-1 mr-2 min-w-[160px] whitespace-nowrap">
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

