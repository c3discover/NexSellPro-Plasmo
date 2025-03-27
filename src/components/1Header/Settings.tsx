/**
 * @fileoverview Settings modal component for managing user preferences and metrics
 * @author NexSellPro
 * @created 2024-03-21
 * @lastModified 2024-03-21
 */

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
    minOverallRating: string;
    minRatings30Days: string;
    maxSellers: string;
    maxWfsSellers: string;
    maxStock: string;
    inboundShippingCost: string;
    sfShippingCost: string;
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
    minOverallRating: "0.0",
    minRatings30Days: "0",
    maxSellers: "0",
    maxWfsSellers: "0",
    maxStock: "0",
    inboundShippingCost: "0.00",
    sfShippingCost: "0.00",
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
  const [rawMinOverallRating, setRawMinOverallRating] = useState<string | null>(null);
  const [rawMinRatings30Days, setRawMinRatings30Days] = useState<string | null>(null);
  const [rawMaxSellers, setRawMaxSellers] = useState<string | null>(null);
  const [rawMaxWfsSellers, setRawMaxWfsSellers] = useState<string | null>(null);
  const [rawInboundShippingCost, setRawInboundShippingCost] = useState<string | null>(null);
  const [rawStorageLength, setRawStorageLength] = useState<string | null>(null);
  const [rawSeason, setRawSeason] = useState<string | null>(null);
  const [rawPrepCost, setRawPrepCost] = useState<string | null>(null);
  const [rawAdditionalCosts, setRawAdditionalCosts] = useState<string | null>(null);
  const [rawSfShippingCost, setRawSfShippingCost] = useState<string | null>(null);

  // Add new state for tracking edited fields
  const [editedFields, setEditedFields] = useState<Set<string>>(new Set());

  /////////////////////////////////////////////////////
  // Effect Hooks for Loading and Saving Settings
  /////////////////////////////////////////////////////

  // Load values from localStorage when the component mounts
  useEffect(() => {
    try {
      // Load metrics
      const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
      if (Object.keys(storedMetrics).length > 0) {
        setDesiredMetrics(prev => ({
          ...prev,
          ...storedMetrics
        }));
        // Mark stored fields as edited
        setEditedFields(new Set(Object.keys(storedMetrics)));
      }

      // Load fulfillment preference
      const savedFulfillment = localStorage.getItem("defaultFulfillment");
      if (savedFulfillment) {
        setDefaultFulfillment(savedFulfillment);
        setEditedFields(prev => new Set([...prev, 'defaultFulfillment']));
      }

      // Load prep costs
      const savedPrepCostType = localStorage.getItem("prepCostType");
      if (savedPrepCostType) {
        setPrepCostType(savedPrepCostType);
        setEditedFields(prev => new Set([...prev, 'prepCostType']));
      }
      
      const savedPrepCostPerLb = localStorage.getItem("prepCostPerLb");
      if (savedPrepCostPerLb) {
        setPrepCostPerLb(parseFloat(savedPrepCostPerLb));
        setEditedFields(prev => new Set([...prev, 'prepCostPerLb']));
      }
      
      const savedPrepCostEach = localStorage.getItem("prepCostEach");
      if (savedPrepCostEach) {
        setPrepCostEach(parseFloat(savedPrepCostEach));
        setEditedFields(prev => new Set([...prev, 'prepCostEach']));
      }

      // Load additional costs
      const savedAdditionalCostType = localStorage.getItem("additionalCostType");
      if (savedAdditionalCostType) {
        setAdditionalCostType(savedAdditionalCostType);
        setEditedFields(prev => new Set([...prev, 'additionalCostType']));
      }
      
      const savedAdditionalCostPerLb = localStorage.getItem("additionalCostPerLb");
      if (savedAdditionalCostPerLb) {
        setAdditionalCostPerLb(parseFloat(savedAdditionalCostPerLb));
        setEditedFields(prev => new Set([...prev, 'additionalCostPerLb']));
      }
      
      const savedAdditionalCostEach = localStorage.getItem("additionalCostEach");
      if (savedAdditionalCostEach) {
        setAdditionalCostEach(parseFloat(savedAdditionalCostEach));
        setEditedFields(prev => new Set([...prev, 'additionalCostEach']));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  /////////////////////////////////////////////////////
  // Handler Functions
  /////////////////////////////////////////////////////

  // Reset metrics to default values
  const handleClearAll = () => {
    const defaultMetrics = {
      minProfit: "0.00",
      minMargin: "0",
      minROI: "0",
      minMonthlySales: "Coming Soon...",
      minTotalRatings: "0",
      minOverallRating: "0.0",
      minRatings30Days: "0",
      maxSellers: "0",
      maxWfsSellers: "0",
      maxStock: "0",
      inboundShippingCost: "0.00",
      sfShippingCost: "0.00",
      storageLength: "1",
      season: "Jan-Sep",
      prepCost: "0.00",
      additionalCosts: "0.00"
    };

    setDesiredMetrics(defaultMetrics);
    setDefaultFulfillment("Walmart Fulfilled");
    setEditedFields(new Set());
    setRawMetrics({});

    // Clear localStorage
    localStorage.removeItem("desiredMetrics");
    localStorage.removeItem("defaultFulfillment");
    localStorage.removeItem("prepCostType");
    localStorage.removeItem("prepCostPerLb");
    localStorage.removeItem("prepCostEach");
    localStorage.removeItem("additionalCostType");
    localStorage.removeItem("additionalCostPerLb");
    localStorage.removeItem("additionalCostEach");

    onSettingsChange();
  };

  // Handle changes in user-defined metrics with proper formatting
  const handleDesiredMetricsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name;
    const input = e.target.value;

    // Update rawMetrics to keep the bold text while editing
    setRawMetrics((prev) => ({
      ...prev,
      [fieldName]: input,
    }));

    // Mark field as edited
    setEditedFields(prev => new Set([...prev, fieldName]));

    // Handle prep cost and additional cost changes
    if (fieldName === "prepCost") {
      const value = parseFloat(input) || 0;
      if (prepCostType === "per lb") {
        setPrepCostPerLb(value);
        localStorage.setItem("prepCostPerLb", value.toString());
      } else {
        setPrepCostEach(value);
        localStorage.setItem("prepCostEach", value.toString());
      }
      setDesiredMetrics(prev => ({
        ...prev,
        prepCost: value.toFixed(2)
      }));
    } else if (fieldName === "additionalCosts") {
      const value = parseFloat(input) || 0;
      if (additionalCostType === "per lb") {
        setAdditionalCostPerLb(value);
        localStorage.setItem("additionalCostPerLb", value.toString());
      } else {
        setAdditionalCostEach(value);
        localStorage.setItem("additionalCostEach", value.toString());
      }
      setDesiredMetrics(prev => ({
        ...prev,
        additionalCosts: value.toFixed(2)
      }));
    }

    // Update localStorage immediately for the changed field
    const currentMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    localStorage.setItem("desiredMetrics", JSON.stringify({
      ...currentMetrics,
      [fieldName]: input
    }));
  };

  // Handle changes in default fulfillment preference
  const handleFulfillmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDefaultFulfillment(e.target.value);
  };

  // Handle changes when user stops editing
  const handleBlur = (fieldName: string) => {
    const rawValue = rawMetrics[fieldName];
    if (rawValue === undefined) return; // Don't process if no raw value exists

    setRawMetrics((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });

    let formattedValue = rawValue;

    // Format the value based on field type
    if (["minProfit", "inboundShippingCost", "sfShippingCost", "prepCost", "additionalCosts"].includes(fieldName)) {
      formattedValue = parseFloat(rawValue || "0").toFixed(2);
    } else if (["minMargin", "minROI"].includes(fieldName)) {
      formattedValue = Math.max(0, parseInt(rawValue || "0", 10)).toString();
    } else if (fieldName === "minOverallRating") {
      formattedValue = Math.max(0, parseFloat(rawValue || "0")).toFixed(1);
    } else if (fieldName !== "season") {
      formattedValue = Math.max(0, parseInt(rawValue || "0", 10)).toString();
    }

    // Update the metrics state
    setDesiredMetrics((prev) => ({
      ...prev,
      [fieldName]: formattedValue
    }));

    // Update localStorage
    const currentMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
    localStorage.setItem("desiredMetrics", JSON.stringify({
      ...currentMetrics,
      [fieldName]: formattedValue
    }));
  };

  // Handle changes in prep cost type
  const handlePrepCostTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setPrepCostType(newType);
    localStorage.setItem("prepCostType", newType);
    
    // Update the displayed value based on the selected type
    const currentValue = newType === "per lb" ? prepCostPerLb : prepCostEach;
    setDesiredMetrics(prev => ({
      ...prev,
      prepCost: currentValue.toFixed(2)
    }));
  };

  // Handle changes in additional cost type
  const handleAdditionalCostTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setAdditionalCostType(newType);
    localStorage.setItem("additionalCostType", newType);
    
    // Update the displayed value based on the selected type
    const currentValue = newType === "per lb" ? additionalCostPerLb : additionalCostEach;
    setDesiredMetrics(prev => ({
      ...prev,
      additionalCosts: currentValue.toFixed(2)
    }));
  };

  // Helper function to format label
  const formatLabel = (key: string): string => {
    const labelMap: { [key: string]: string } = {
      minROI: "Minimum ROI",
      minProfit: "Minimum Profit",
      minMargin: "Minimum Margin",
      minMonthlySales: "Minimum Monthly Sales",
      minTotalRatings: "Minimum Total Ratings",
      minOverallRating: "Minimum Overall Rating",
      minRatings30Days: "Minimum Ratings (30 days)",
      maxSellers: "Maximum Sellers",
      maxWfsSellers: "Maximum WFS Sellers",
      maxStock: "Maximum Stock",
      sfShippingCost: "SF Shipping Cost",
      inboundShippingCost: "WFS Inbound Shipping Cost",
      // Add other special cases here if needed
    };
    
    return labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Helper function to get input prefix/suffix
  const getInputAffix = (key: string): { prefix?: string; suffix?: string; rightText?: string } => {
    if (['minProfit', 'inboundShippingCost', 'sfShippingCost', 'prepCost', 'additionalCosts'].includes(key)) {
      return { 
        prefix: '$',
        ...(key === 'inboundShippingCost' || key === 'sfShippingCost' ? { rightText: 'per pound' } : {})
      };
    }
    if (['minMargin', 'minROI'].includes(key)) {
      return { suffix: '%' };
    }
    return {};
  };

  // Save all settings and close the modal
  const handleSaveSettings = () => {
    // First save the current prep and additional costs based on their types
    if (prepCostType === "per lb") {
      localStorage.setItem("prepCostPerLb", prepCostPerLb.toString());
      localStorage.setItem("prepCostEach", "0");
    } else {
      localStorage.setItem("prepCostEach", prepCostEach.toString());
      localStorage.setItem("prepCostPerLb", "0");
    }

    if (additionalCostType === "per lb") {
      localStorage.setItem("additionalCostPerLb", additionalCostPerLb.toString());
      localStorage.setItem("additionalCostEach", "0");
    } else {
      localStorage.setItem("additionalCostEach", additionalCostEach.toString());
      localStorage.setItem("additionalCostPerLb", "0");
    }

    // Save all settings to localStorage
    localStorage.setItem("desiredMetrics", JSON.stringify(desiredMetrics));
    localStorage.setItem("defaultFulfillment", defaultFulfillment);
    localStorage.setItem("prepCostType", prepCostType);
    localStorage.setItem("additionalCostType", additionalCostType);

    // Notify parent of changes and close modal
    onSettingsChange();
    onClose();

    // Refresh the extension
    if (chrome.runtime && chrome.runtime.reload) {
      chrome.runtime.reload();
    } else {
      window.location.reload();
    }
  };

  // Update input className to include bold when edited
  const getInputClassName = (fieldName: string, baseClassName: string) => {
    return `${baseClassName} ${editedFields.has(fieldName) ? "font-bold" : ""}`;
  };

  /////////////////////////////////////////////////////
  // Conditional Rendering
  /////////////////////////////////////////////////////

  if (!isOpen) return null; // Do not render if modal is closed

  /////////////////////////////////////////////////////
  // JSX (Return)
  /////////////////////////////////////////////////////

  return (
    <div className="w-full bg-white p-3 rounded-lg shadow-lg">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">Settings</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg font-medium"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Baseline Metrics Explanation */}
      <div className="bg-cyan-50 border border-cyan-200 p-2 rounded-lg mb-3">
        <h3 className="font-medium text-cyan-800 text-xs mb-0.5">Baseline Metrics</h3>
        <p className="text-xs text-cyan-700">
          Set your requirements for product analysis. Products meeting these criteria will be highlighted as potential opportunities.
        </p>
      </div>

      {/* Settings Form - More Condensed */}
      <div className="space-y-3">
        {/* Fulfillment Section */}
        <div className="bg-gray-50 p-2 rounded-lg">
          <h3 className="text-xs font-medium text-gray-800 mb-1">Default Fulfillment</h3>
          <div className="relative">
            <select
              value={defaultFulfillment}
              onChange={handleFulfillmentChange}
              className="w-full p-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white pr-8"
            >
              <option value="Walmart Fulfilled">Walmart Fulfilled</option>
              <option value="Seller Fulfilled">Seller Fulfilled</option>
            </select>
          </div>
        </div>

        {/* Metrics Section - Grid Layout */}
        <div className="bg-gray-50 p-2 rounded-lg">
          <h3 className="text-xs font-medium text-gray-800 mb-1">Requirements</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {/* First Row: Profit and Monthly Sales */}
            {['minProfit', 'minMonthlySales'].map((key) => {
              const value = desiredMetrics[key as keyof typeof desiredMetrics];
              const { prefix, suffix } = getInputAffix(key);
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-[11px] text-gray-600 mb-0.5">
                    {formatLabel(key)}
                  </label>
                  <div className="relative">
                    {prefix && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                        {prefix}
                      </span>
                    )}
                    <input
                      type="text"
                      name={key}
                      value={rawMetrics[key] ?? value}
                      onChange={handleDesiredMetricsChange}
                      onBlur={() => handleBlur(key)}
                      className={getInputClassName(key, `p-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full ${
                        prefix ? 'pl-5' : ''
                      } ${suffix ? 'pr-5' : ''}`)}
                    />
                    {suffix && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                        {suffix}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Second Row: Margin and ROI */}
            {['minMargin', 'minROI'].map((key) => {
              const value = desiredMetrics[key as keyof typeof desiredMetrics];
              const { prefix, suffix } = getInputAffix(key);
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-[11px] text-gray-600 mb-0.5">
                    {formatLabel(key)}
                  </label>
                  <div className="relative">
                    {prefix && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                        {prefix}
                      </span>
                    )}
                    <input
                      type="text"
                      name={key}
                      value={rawMetrics[key] ?? value}
                      onChange={handleDesiredMetricsChange}
                      onBlur={() => handleBlur(key)}
                      className={getInputClassName(key, `p-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full ${
                        prefix ? 'pl-5' : ''
                      } ${suffix ? 'pr-5' : ''}`)}
                    />
                    {suffix && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                        {suffix}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Third Row: Total Ratings and Ratings 30 Days */}
            {['minTotalRatings', 'minRatings30Days'].map((key) => {
              const value = desiredMetrics[key as keyof typeof desiredMetrics];
              const { prefix, suffix } = getInputAffix(key);
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-[11px] text-gray-600 mb-0.5">
                    {formatLabel(key)}
                  </label>
                  <div className="relative">
                    {prefix && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                        {prefix}
                      </span>
                    )}
                    <input
                      type="text"
                      name={key}
                      value={rawMetrics[key] ?? value}
                      onChange={handleDesiredMetricsChange}
                      onBlur={() => handleBlur(key)}
                      className={getInputClassName(key, `p-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full ${
                        prefix ? 'pl-5' : ''
                      } ${suffix ? 'pr-5' : ''}`)}
                    />
                    {suffix && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                        {suffix}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Fourth Row: Overall Rating and Max Stock */}
            {['minOverallRating', 'maxStock'].map((key) => {
              const value = desiredMetrics[key as keyof typeof desiredMetrics];
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-[11px] text-gray-600 mb-0.5">
                    {formatLabel(key)}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name={key}
                      value={rawMetrics[key] ?? value}
                      onChange={handleDesiredMetricsChange}
                      onBlur={() => handleBlur(key)}
                      className={getInputClassName(key, 'p-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full')}
                    />
                  </div>
                </div>
              );
            })}


            {/* Fifth Row: Sellers and WFS Sellers */}
            {['maxSellers', 'maxWfsSellers'].map((key) => {
              const value = desiredMetrics[key as keyof typeof desiredMetrics];
              const { prefix, suffix } = getInputAffix(key);
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-[11px] text-gray-600 mb-0.5">
                    {formatLabel(key)}
                  </label>
                  <div className="relative">
                    {prefix && (
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                        {prefix}
                      </span>
                    )}
                    <input
                      type="text"
                      name={key}
                      value={rawMetrics[key] ?? value}
                      onChange={handleDesiredMetricsChange}
                      onBlur={() => handleBlur(key)}
                      className={getInputClassName(key, `p-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full ${
                        prefix ? 'pl-5' : ''
                      } ${suffix ? 'pr-5' : ''}`)}
                    />
                    {suffix && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                        {suffix}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Sixth Row: Shipping Costs */}
            {['inboundShippingCost', 'sfShippingCost'].map((key) => {
              const value = desiredMetrics[key as keyof typeof desiredMetrics];
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-[11px] text-gray-600 mb-0.5">
                    {formatLabel(key)}
                  </label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                    <input
                      type="text"
                      name={key}
                      value={rawMetrics[key] ?? value}
                      onChange={handleDesiredMetricsChange}
                      onBlur={() => handleBlur(key)}
                      className={getInputClassName(key, 'p-1 pl-5 pr-14 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full')}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">
                      per pound
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Storage Length and Season Row */}
            {['storageLength', 'season'].map((key) => {
              const value = desiredMetrics[key as keyof typeof desiredMetrics];
              if (key === 'season') {
                return (
                  <div key={key} className="flex flex-col">
                    <label className="text-[11px] text-gray-600 mb-0.5">Season</label>
                    <div className="relative">
                      <select
                        name={key}
                        value={value}
                        onChange={handleDesiredMetricsChange}
                        className="w-full p-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white pr-8"
                      >
                        <option value="Jan-Sep">Jan-Sep</option>
                        <option value="Oct-Dec">Oct-Dec</option>
                      </select>
                    </div>
                  </div>
                );
              }
              return (
                <div key={key} className="flex flex-col">
                  <label className="text-[11px] text-gray-600 mb-0.5">
                    {formatLabel(key)}
                  </label>
                  <input
                    type="text"
                    name={key}
                    value={rawMetrics[key] ?? value}
                    onChange={handleDesiredMetricsChange}
                    onBlur={() => handleBlur(key)}
                    className={getInputClassName(key, 'p-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full')}
                  />
                </div>
              );
            })}

            {/* Prep Cost Row */}
            <div className="flex flex-col col-span-2">
              <label className="text-[11px] text-gray-600 mb-0.5">{formatLabel('prepCost')}</label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                  <input
                    type="text"
                    name="prepCost"
                    value={rawMetrics['prepCost'] ?? desiredMetrics.prepCost}
                    onChange={handleDesiredMetricsChange}
                    onBlur={() => handleBlur('prepCost')}
                    className={getInputClassName('prepCost', 'p-1 pl-5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full')}
                  />
                </div>
                <div className="relative">
                  <select
                    value={prepCostType}
                    onChange={handlePrepCostTypeChange}
                    className="p-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white pr-8"
                  >
                    <option value="per lb">Per Pound</option>
                    <option value="each">Each</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Costs Row */}
            <div className="flex flex-col col-span-2">
              <label className="text-[11px] text-gray-600 mb-0.5">{formatLabel('additionalCosts')}</label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                  <input
                    type="text"
                    name="additionalCosts"
                    value={rawMetrics['additionalCosts'] ?? desiredMetrics.additionalCosts}
                    onChange={handleDesiredMetricsChange}
                    onBlur={() => handleBlur('additionalCosts')}
                    className={getInputClassName('additionalCosts', 'p-1 pl-5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full')}
                  />
                </div>
                <div className="relative">
                  <select
                    value={additionalCostType}
                    onChange={handleAdditionalCostTypeChange}
                    className="p-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white pr-8"
                  >
                    <option value="per lb">Per Pound</option>
                    <option value="each">Each</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 space-y-1.5">
        <button
          onClick={handleSaveSettings}
          className="w-full py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 shadow-sm font-medium text-xs"
        >
          Save Changes
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-1 text-gray-600 hover:text-gray-800 transition duration-300 text-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;

