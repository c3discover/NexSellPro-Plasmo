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
import { SortableContainer, SortableElement, SortableHandle, SortableElementProps, SortableContainerProps } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import { exportToGoogleSheets, ProductData } from '../../services/googleSheetsService';

/////////////////////////////////////////////////
// Component Definition
/////////////////////////////////////////////////

// Add Export Settings interfaces
interface ExportField {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

interface ExportSettings {
  fields: ExportField[];
}

interface SortableItemProps extends SortableElementProps {
  field: ExportField;
  onToggle: (id: string) => void;
}

interface SortableListProps extends SortableContainerProps {
  items: ExportField[];
  onToggle: (id: string) => void;
}

// Update categories for export fields
const exportFieldCategories = {
  // System
  timestamp: 'System',

  // Product Details
  mainImage: 'Product Details',
  numberOfImages: 'Product Details',
  numberOfVideos: 'Product Details',
  brand: 'Product Details',
  category: 'Product Details',
  shelvingPath: 'Product Details',
  badges: 'Product Details',
  contractCategory: 'Product Details',
  itemId: 'Product Details',
  gtin: 'Product Details',
  upc: 'Product Details',
  ean: 'Product Details',
  modelNumber: 'Product Details',
  countryOfOrigin: 'Product Details',
  numberOfVariants: 'Product Details',
  variationAttributes: 'Product Details',
  variations: 'Product Details',
  variantsInStock: 'Product Details',

  // Dimensions
  length: 'Dimensions',
  width: 'Dimensions',
  height: 'Dimensions',
  weight: 'Dimensions',

  // Pricing
  salePrice: 'Pricing',
  estMonthlySales: 'Pricing',
  totalProfit: 'Pricing',
  margin: 'Pricing',
  roi: 'Pricing',
  productCost: 'Pricing',
  referralFee: 'Pricing',
  wfsFee: 'Pricing',
  wfsInboundShipping: 'Pricing',
  sfShipping: 'Pricing',
  storageFee: 'Pricing',
  prepFee: 'Pricing',
  additionalFees: 'Pricing',

  // Competition
  store1Name: 'Competition',
  store1Link: 'Competition',
  store1Price: 'Competition',
  store2Name: 'Competition',
  store2Link: 'Competition',
  store2Price: 'Competition',
  store3Name: 'Competition',
  store3Link: 'Competition',
  store3Price: 'Competition',
  averageExternalPrice: 'Competition',

  // Reviews
  totalRatings: 'Reviews',
  totalReviews: 'Reviews',
  overallRating: 'Reviews',
  reviews30Days: 'Reviews',
  reviews90Days: 'Reviews',
  reviews1Year: 'Reviews',

  // Sellers
  totalSellers: 'Sellers',
  wfsSellers: 'Sellers',
  walmartSells: 'Sellers',
  brandSells: 'Sellers',
  isWalmartSelling: 'Sellers',
  isBrandSelling: 'Sellers',
  totalStock: 'Sellers',

  // Additional Fields
  notes: 'Additional Fields',
  blankColumn1: 'Additional Fields',
  blankColumn2: 'Additional Fields',
  blankColumn3: 'Additional Fields',
  blankColumn4: 'Additional Fields'
};

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

  // Add new state for active tab
  const [activeTab, setActiveTab] = useState<'baseline' | 'fees' | 'export' | 'integrations'>('baseline');

  // Update the initial export settings (remove currentPrice and reorder fields by category)
  const defaultExportFields = [
    // System
    { id: 'timestamp', label: 'Timestamp', enabled: true, order: 1 },

    // Product Details
    { id: 'mainImage', label: 'Main Image', enabled: true, order: 2 },
    { id: 'numberOfImages', label: 'Number of Images', enabled: true, order: 3 },
    { id: 'numberOfVideos', label: 'Number of Videos', enabled: true, order: 4 },
    { id: 'brand', label: 'Brand', enabled: true, order: 5 },
    { id: 'category', label: 'Category', enabled: true, order: 6 },
    { id: 'shelvingPath', label: 'Shelving Path', enabled: true, order: 7 },
    { id: 'badges', label: 'Badges', enabled: true, order: 8 },
    { id: 'contractCategory', label: 'Contract Category', enabled: true, order: 9 },
    { id: 'itemId', label: 'Item ID', enabled: true, order: 10 },
    { id: 'gtin', label: 'GTIN', enabled: true, order: 11 },
    { id: 'upc', label: 'UPC', enabled: true, order: 12 },
    { id: 'ean', label: 'EAN', enabled: true, order: 13 },
    { id: 'modelNumber', label: 'Model Number', enabled: true, order: 14 },
    { id: 'countryOfOrigin', label: 'Country of Origin', enabled: true, order: 15 },
    { id: 'variations', label: 'Variations', enabled: true, order: 16 },
    { id: 'numberOfVariants', label: 'Number of Variants', enabled: true, order: 17 },
    { id: 'variationAttributes', label: 'Variation Attributes', enabled: true, order: 18 },

    // Dimensions
    { id: 'length', label: 'Length', enabled: true, order: 19 },
    { id: 'width', label: 'Width', enabled: true, order: 20 },
    { id: 'height', label: 'Height', enabled: true, order: 21 },
    { id: 'weight', label: 'Weight', enabled: true, order: 22 },

    // Financial
    { id: 'salePrice', label: 'Sale Price', enabled: true, order: 23 },
    { id: 'estMonthlySales', label: 'Est Monthly Sales', enabled: true, order: 24 },
    { id: 'totalProfit', label: 'Total Profit', enabled: true, order: 25 },
    { id: 'margin', label: 'Margin', enabled: true, order: 26 },
    { id: 'roi', label: 'ROI', enabled: true, order: 27 },
    { id: 'productCost', label: 'Product Cost', enabled: true, order: 28 },
    { id: 'referralFee', label: 'Referral Fee', enabled: true, order: 29 },
    { id: 'wfsFee', label: 'WFS Fee', enabled: true, order: 30 },
    { id: 'wfsInboundShipping', label: 'WFS Inbound Shipping', enabled: true, order: 31 },
    { id: 'sfShipping', label: 'SF Shipping', enabled: true, order: 32 },
    { id: 'storageFee', label: 'Storage Fee', enabled: true, order: 33 },
    { id: 'prepFee', label: 'Prep Fee', enabled: true, order: 34 },
    { id: 'additionalFees', label: 'Additional Fees', enabled: true, order: 35 },

    // Competitive Analysis
    { id: 'store1Name', label: 'Store 1 - Name', enabled: false, order: 36 },
    { id: 'store1Link', label: 'Store 1 - Link', enabled: false, order: 37 },
    { id: 'store1Price', label: 'Store 1 - Price', enabled: false, order: 38 },
    { id: 'store2Name', label: 'Store 2 - Name', enabled: false, order: 39 },
    { id: 'store2Link', label: 'Store 2 - Link', enabled: false, order: 40 },
    { id: 'store2Price', label: 'Store 2 - Price', enabled: false, order: 41 },
    { id: 'store3Name', label: 'Store 3 - Name', enabled: false, order: 42 },
    { id: 'store3Link', label: 'Store 3 - Link', enabled: false, order: 43 },
    { id: 'store3Price', label: 'Store 3 - Price', enabled: false, order: 44 },
    { id: 'averageExternalPrice', label: 'Average External Price', enabled: true, order: 45 },

    // Review Data
    { id: 'totalRatings', label: 'Total Ratings', enabled: true, order: 46 },
    { id: 'totalReviews', label: 'Total Reviews', enabled: true, order: 47 },
    { id: 'overallRating', label: 'Overall Rating', enabled: true, order: 48 },
    { id: 'reviews30Days', label: 'Total Reviews (30 days)', enabled: true, order: 49 },
    { id: 'reviews90Days', label: 'Total Reviews (90 days)', enabled: true, order: 50 },
    { id: 'reviews1Year', label: 'Total Reviews (1 year)', enabled: true, order: 51 },

    // Seller Data
    { id: 'totalSellers', label: 'Total Sellers', enabled: true, order: 52 },
    { id: 'wfsSellers', label: 'WFS Sellers', enabled: true, order: 53 },
    { id: 'walmartSells', label: 'Walmart Sells?', enabled: true, order: 54 },
    { id: 'brandSells', label: 'Brand Sells?', enabled: true, order: 55 },
    { id: 'isWalmartSelling', label: 'Is Walmart Selling', enabled: true, order: 56 },
    { id: 'isBrandSelling', label: 'Is Brand Selling', enabled: true, order: 57 },

    // Inventory Data
    { id: 'totalStock', label: 'Total Stock', enabled: true, order: 58 },
    { id: 'variantsInStock', label: 'Number of Variants in Stock', enabled: true, order: 59 },

    // Additional Fields
    { id: 'notes', label: 'Notes', enabled: false, order: 60 },
    { id: 'blankColumn1', label: 'Blank Column 1', enabled: false, order: 61 },
    { id: 'blankColumn2', label: 'Blank Column 2', enabled: false, order: 62 },
    { id: 'blankColumn3', label: 'Blank Column 3', enabled: false, order: 63 },
    { id: 'blankColumn4', label: 'Blank Column 4', enabled: false, order: 64 }
  ];

  // Update the initial state to use the new defaultExportFields
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    fields: defaultExportFields
  });

  // Add state for initial values
  const [initialState, setInitialState] = useState<{
    desiredMetrics: typeof desiredMetrics;
    defaultFulfillment: string;
    prepCostType: string;
    additionalCostType: string;
    exportSettings: ExportSettings;
  } | null>(null);

  // Update the DEFAULT_VALUES constant to include all possible default values
  const DEFAULT_VALUES = {
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
    additionalCosts: "0.00",
    defaultFulfillment: "Walmart Fulfilled",
    prepCostType: "per lb",
    additionalCostType: "per lb",
    prepCostPerLb: 0,
    prepCostEach: 0,
    additionalCostPerLb: 0,
    additionalCostEach: 0
  };

  // Inside the Settings component, add a new state variable for Google connection status
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Update the useEffect hook to check the initial Google connection status
  useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        
        // Check if we're in a Chrome extension context
        if (typeof chrome === 'undefined' || !chrome.runtime) {
          console.error('Not in a Chrome extension context');
          return;
        }
        
        const response = await new Promise<{ success: boolean; isConnected: boolean; error?: string }>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Request timed out'));
          }, 10000); // 10 second timeout

          chrome.runtime.sendMessage({ type: 'GOOGLE_CHECK_CONNECTION' }, (result) => {
            clearTimeout(timeoutId);
            if (chrome.runtime.lastError) {
              console.error('Chrome runtime error:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(result || { success: false, isConnected: false, error: 'No response from background script' });
            }
          });
        });
        
        
        if (response.success) {
          setIsGoogleConnected(response.isConnected);
        } else {
          console.error('Failed to check Google connection:', response.error);
          // Don't show an alert for connection check failures
        }
      } catch (error) {
        console.error('Error checking Google connection:', error);
        // Don't show an alert for connection check failures
      }
    };
    
    checkGoogleConnection();
  }, []);

  // Update handler for Google connection
  const handleGoogleConnection = async () => {
    try {
      
      // Check if we're in a Chrome extension context
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        console.error('Not in a Chrome extension context');
        alert('Extension context not available. Please reload the extension.');
        return;
      }
      
      if (isGoogleConnected) {
        // Use message passing to disconnect
        const response = await new Promise<{ success: boolean; error?: string }>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Request timed out'));
          }, 30000); // 30 second timeout

          chrome.runtime.sendMessage({ type: 'GOOGLE_DISCONNECT' }, (result) => {
            clearTimeout(timeoutId);
            if (chrome.runtime.lastError) {
              console.error('Chrome runtime error:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(result || { success: false, error: 'No response from background script' });
            }
          });
        });
        
        if (response.success) {
          setIsGoogleConnected(false);
        } else {
          console.error('Failed to disconnect from Google:', response.error);
          alert(`Failed to disconnect from Google: ${response.error || 'Unknown error'}`);
        }
      } else {
        // Use message passing to connect
        const response = await new Promise<{ success: boolean; error?: string }>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Request timed out'));
          }, 30000); // 30 second timeout

          chrome.runtime.sendMessage({ type: 'GOOGLE_CONNECT' }, (result) => {
            clearTimeout(timeoutId);
            if (chrome.runtime.lastError) {
              console.error('Chrome runtime error:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(result || { success: false, error: 'No response from background script' });
            }
          });
        });
        
        if (response.success) {
          setIsGoogleConnected(true);
        } else {
          console.error('Failed to connect to Google:', response.error);
          alert(`Failed to connect to Google: ${response.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error handling Google connection:', error);
      alert(`Error handling Google connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /////////////////////////////////////////////////////
  // Effect Hooks for Loading and Saving Settings
  /////////////////////////////////////////////////////

  // Update the useEffect hook to properly handle initial state
  useEffect(() => {
    try {
      // Load metrics
      const storedMetrics = JSON.parse(localStorage.getItem("desiredMetrics") || "{}");
      if (Object.keys(storedMetrics).length > 0) {
        setDesiredMetrics(prev => ({
          ...prev,
          ...storedMetrics
        }));
        setEditedFields(new Set(Object.keys(storedMetrics)));
      }

      // Load export settings
      const storedExportSettings = localStorage.getItem("exportSettings");
      if (storedExportSettings) {
        const parsed = JSON.parse(storedExportSettings);
        // Filter out currentPrice if it exists in stored settings
        const filteredFields = parsed.fields.filter((field: ExportField) => field.id !== 'currentPrice');
        // Reorder the fields to ensure continuous ordering
        const reorderedFields = filteredFields.map((field: ExportField, index: number) => ({
          ...field,
          order: index + 1
        }));
        setExportSettings({ fields: reorderedFields });
        // Save the filtered settings back to localStorage
        localStorage.setItem("exportSettings", JSON.stringify({ fields: reorderedFields }));
      } else {
        // If no stored settings, initialize with default values
        const defaultExportSettings = {
          fields: defaultExportFields
        };
        setExportSettings(defaultExportSettings);
        localStorage.setItem("exportSettings", JSON.stringify(defaultExportSettings));
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

  // Update useEffect to store initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setInitialState({
        desiredMetrics: { ...desiredMetrics },
        defaultFulfillment,
        prepCostType,
        additionalCostType,
        exportSettings: { ...exportSettings }
      });
    }
  }, [isOpen]);

  /////////////////////////////////////////////////////
  // Handler Functions
  /////////////////////////////////////////////////////

  // Add handler for Clear All
  const handleClearAll = () => {
    // Reset all metrics to default
    setDesiredMetrics({
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

    // Reset default fulfillment
    setDefaultFulfillment("Walmart Fulfilled");

    // Reset cost types
    setPrepCostType("per lb");
    setAdditionalCostType("per lb");

    // Reset export settings
    setExportSettings({
      fields: defaultExportFields
    });

    // Clear all bold styling
    setEditedFields(new Set());

    // Clear all raw metrics
    setRawMetrics({});
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

  // Update the handleSaveAllAndClose function
  const handleSaveAllAndClose = () => {
    // Create a new Set for edited fields
    const newEditedFields = new Set<string>();
    const metricsToSave: Record<string, string> = {};

    // Compare each metric against its default value
    Object.entries(desiredMetrics).forEach(([key, value]) => {
      const defaultValue = DEFAULT_VALUES[key as keyof typeof DEFAULT_VALUES];
      if (value !== defaultValue) {
        newEditedFields.add(key);
        metricsToSave[key] = value;
      }
    });

    // Only save metrics if there are changes
    if (Object.keys(metricsToSave).length > 0) {
      localStorage.setItem("desiredMetrics", JSON.stringify(metricsToSave));
    } else {
      localStorage.removeItem("desiredMetrics");
    }

    // Check fulfillment type
    if (defaultFulfillment !== DEFAULT_VALUES.defaultFulfillment) {
      newEditedFields.add('defaultFulfillment');
      localStorage.setItem("defaultFulfillment", defaultFulfillment);
    } else {
      localStorage.removeItem("defaultFulfillment");
    }

    // Check prep costs
    const prepCostChanged = 
      prepCostType !== DEFAULT_VALUES.prepCostType ||
      prepCostPerLb !== DEFAULT_VALUES.prepCostPerLb ||
      prepCostEach !== DEFAULT_VALUES.prepCostEach;

    if (prepCostChanged) {
      newEditedFields.add('prepCost');
      if (prepCostType !== DEFAULT_VALUES.prepCostType) {
        localStorage.setItem("prepCostType", prepCostType);
      }
      if (prepCostPerLb !== DEFAULT_VALUES.prepCostPerLb) {
        localStorage.setItem("prepCostPerLb", prepCostPerLb.toString());
      }
      if (prepCostEach !== DEFAULT_VALUES.prepCostEach) {
        localStorage.setItem("prepCostEach", prepCostEach.toString());
      }
    } else {
      localStorage.removeItem("prepCostType");
      localStorage.removeItem("prepCostPerLb");
      localStorage.removeItem("prepCostEach");
    }

    // Check additional costs
    const additionalCostChanged = 
      additionalCostType !== DEFAULT_VALUES.additionalCostType ||
      additionalCostPerLb !== DEFAULT_VALUES.additionalCostPerLb ||
      additionalCostEach !== DEFAULT_VALUES.additionalCostEach;

    if (additionalCostChanged) {
      newEditedFields.add('additionalCosts');
      if (additionalCostType !== DEFAULT_VALUES.additionalCostType) {
        localStorage.setItem("additionalCostType", additionalCostType);
      }
      if (additionalCostPerLb !== DEFAULT_VALUES.additionalCostPerLb) {
        localStorage.setItem("additionalCostPerLb", additionalCostPerLb.toString());
      }
      if (additionalCostEach !== DEFAULT_VALUES.additionalCostEach) {
        localStorage.setItem("additionalCostEach", additionalCostEach.toString());
      }
    } else {
      localStorage.removeItem("additionalCostType");
      localStorage.removeItem("additionalCostPerLb");
      localStorage.removeItem("additionalCostEach");
    }

    // Save export settings only if they differ from default
    const isExportDefault = JSON.stringify(exportSettings) === JSON.stringify({ fields: defaultExportFields });
    if (!isExportDefault) {
      localStorage.setItem("exportSettings", JSON.stringify(exportSettings));
    } else {
      localStorage.removeItem("exportSettings");
    }

    // Update edited fields state
    setEditedFields(newEditedFields);

    // Notify parent of changes
    onSettingsChange();

    // Close the modal
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

  // Add handlers for export settings
  const handleExportFieldToggle = (fieldId: string) => {
    setExportSettings(prev => ({
      fields: prev.fields.map(field =>
        field.id === fieldId
          ? { ...field, enabled: !field.enabled }
          : field
      )
    }));
  };

  // Update the DragHandle component to be more compact
  const DragHandle = SortableHandle(() => (
    <div className="text-gray-400 cursor-grab active:cursor-grabbing select-none hover:text-gray-600">
      ⋮⋮
    </div>
  ));

  // Update the SortableItem component with adjusted spacing
  const SortableItem = SortableElement<SortableItemProps>(({ field, onToggle }: SortableItemProps) => (
    <div className="grid grid-cols-[24px_60px_1fr_40px] items-center gap-2 py-[2px] px-2 bg-white rounded border mb-[2px]">
      <div className="flex justify-center">
        <DragHandle />
      </div>
      <div className="text-[10px] text-gray-500 truncate">
        {exportFieldCategories[field.id as keyof typeof exportFieldCategories]}
      </div>
      <div className="text-xs font-medium truncate">
        {field.label}
      </div>
      <div className="flex justify-end">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={field.enabled}
            onChange={() => onToggle(field.id)}
          />
          <div className="w-7 h-3.5 bg-gray-200 rounded-full peer 
          peer-focus:ring-2 peer-focus:ring-cyan-300 
          peer-checked:bg-cyan-500
          after:content-[''] 
          after:absolute 
          after:top-0 
          after:left-0 
          after:bg-white 
          after:border-gray-300 
          after:border 
          after:rounded-full 
          after:h-3.5 
          after:w-3.5 
          after:transition-all
          after:shadow-sm
          peer-checked:after:translate-x-full 
          peer-checked:after:border-white">
          </div>
        </label>
      </div>
    </div>
  ));

  // Update the SortableList component with increased padding
  const SortableList = SortableContainer<SortableListProps>(({ items, onToggle }: SortableListProps) => (
    <div className="space-y-0.5 px-12">
      <div className="grid grid-cols-[24px_60px_1fr_40px] items-center gap-2 px-2 py-1 text-[10px] font-medium text-gray-500 border-b">
        <div className="flex justify-center">Sort</div>
        <div>Category</div>
        <div>Field</div>
        <div className="flex justify-end">Enable</div>
      </div>
      {items.map((field, index) => (
        <SortableItem
          key={field.id}
          index={index}
          field={field}
          onToggle={onToggle}
        />
      ))}
    </div>
  ));

  // Update the handleExportFieldReorder function
  const handleExportFieldReorder = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    setExportSettings(prev => {
      const newFields = arrayMoveImmutable(prev.fields, oldIndex, newIndex).map((field, index) => ({
        ...field,
        order: index + 1
      }));

      // Save to localStorage immediately
      const newSettings = {
        ...prev,
        fields: newFields
      };
      localStorage.setItem("exportSettings", JSON.stringify(newSettings));

      return newSettings;
    });
  };

  // Add handler for Clear Tab
  const handleClearTab = () => {
    // Get the default values for the current tab
    const defaultValues = {
      baseline: {
        minProfit: "0.00",
        minMargin: "0",
        minROI: "0",
        minMonthlySales: "Coming Soon...",
        minTotalRatings: "0",
        minOverallRating: "0.0",
        minRatings30Days: "0",
        maxSellers: "0",
        maxWfsSellers: "0",
        maxStock: "0"
      },
      fees: {
        inboundShippingCost: "0.00",
        sfShippingCost: "0.00",
        storageLength: "1",
        season: "Jan-Sep",
        prepCost: "0.00",
        additionalCosts: "0.00"
      },
      export: {
        fields: defaultExportFields
      }
    };

    // Reset values for current tab
    const currentTabDefaults = defaultValues[activeTab as keyof typeof defaultValues];
    
    if (activeTab === 'export') {
      // Handle export settings reset
      setExportSettings({
        fields: defaultExportFields
      });
    } else {
      // Handle metrics reset
      setDesiredMetrics(prev => ({
        ...prev,
        ...currentTabDefaults
      }));

      // Remove bold styling for current tab's fields
      const currentTabFields = Object.keys(currentTabDefaults);
      setEditedFields(prev => {
        const newSet = new Set(prev);
        currentTabFields.forEach(field => newSet.delete(field));
        return newSet;
      });

      // Reset raw metrics for current tab
      setRawMetrics(prev => {
        const newMetrics = { ...prev };
        currentTabFields.forEach(field => delete newMetrics[field]);
        return newMetrics;
      });
    }
  };

  // Add handler for Cancel
  const handleCancel = () => {
    if (initialState) {
      // Restore all state to initial values
      setDesiredMetrics({ ...initialState.desiredMetrics });
      setDefaultFulfillment(initialState.defaultFulfillment);
      setPrepCostType(initialState.prepCostType);
      setAdditionalCostType(initialState.additionalCostType);
      setExportSettings({ ...initialState.exportSettings });
      setEditedFields(new Set());
      setRawMetrics({});
    }
    onClose();
  };

  // Inside the Settings component, add a function to handle exporting to Google Sheets
  const handleExportToGoogleSheets = async () => {
    if (!isGoogleConnected) {
      // Show a message to the user that they need to connect to Google first
      alert('Please connect to Google first to export data to Google Sheets.');
      return;
    }

    try {
      setIsExporting(true);
      
      // Get product data from your state or context
      // For now, we'll use placeholder data
      const products: ProductData[] = [
        {
          id: '123',
          name: 'Sample Product',
          price: 29.99,
          cost: 15.00,
          profit: 14.99,
          margin: 50,
          category: 'Electronics',
          brand: 'Sample Brand',
          url: 'https://www.walmart.com/sample-product'
        }
        // Add more products as needed
      ];

      
      const spreadsheetId = await exportToGoogleSheets(products, {
        title: `NexSellPro Export ${new Date().toLocaleDateString()}`
      });
    
      // Open the spreadsheet in a new tab
      window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank');
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      alert(`An error occurred while exporting to Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  /////////////////////////////////////////////////////
  // Conditional Rendering
  /////////////////////////////////////////////////////

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-lg font-bold text-gray-800">Settings</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 text-lg font-medium"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('baseline')}
            className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'baseline'
                ? 'bg-cyan-500 text-white border-b-2 border-cyan-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>📊</span> Baseline Metrics
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'fees'
                ? 'bg-cyan-500 text-white border-b-2 border-cyan-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>💰</span> Fees
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'export'
                ? 'bg-cyan-500 text-white border-b-2 border-cyan-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>📤</span> Export Settings
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
              activeTab === 'integrations'
                ? 'bg-cyan-500 text-white border-b-2 border-cyan-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>🔌</span> Integrations
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'baseline' && (
            <div className="space-y-4">
              {/* Baseline Metrics Explanation */}
              <div className="bg-cyan-50 border border-cyan-200 p-2 rounded">
                <h3 className="font-medium text-cyan-800 text-xs mb-0.5">Baseline Metrics</h3>
                <p className="text-xs text-cyan-700">
                  Set your requirements for product analysis. Products meeting these criteria will be highlighted as potential opportunities.
                </p>
              </div>

              {/* Default Fulfillment */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] text-gray-600 mb-0.5">
                    Default Fulfillment
                  </label>
                  <select
                    value={defaultFulfillment}
                    onChange={handleFulfillmentChange}
                    className="w-full p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                  >
                    <option value="Walmart Fulfilled">Walmart Fulfilled</option>
                    <option value="Seller Fulfilled">Seller Fulfilled</option>
                  </select>
                </div>
                <div className="col-span-2"></div>
              </div>

              {/* Profit Metrics */}
              <div className="grid grid-cols-4 gap-3">
                {['minProfit', 'minMargin', 'minROI', 'minMonthlySales'].map((key) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-[11px] text-gray-600 mb-0.5">
                      {formatLabel(key)}
                    </label>
                    <div className="relative">
                      {key === 'minProfit' && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                      )}
                      {(key === 'minMargin' || key === 'minROI') && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
                      )}
                      <input
                        type="text"
                        name={key}
                        value={rawMetrics[key] ?? desiredMetrics[key as keyof typeof desiredMetrics]}
                        onChange={handleDesiredMetricsChange}
                        onBlur={() => handleBlur(key)}
                        className={getInputClassName(key, `p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full ${key === 'minProfit' ? 'pl-5' : ''
                          } ${(key === 'minMargin' || key === 'minROI') ? 'pr-5' : ''}`)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Rating Metrics */}
              <div className="grid grid-cols-4 gap-3">
                {['minTotalRatings', 'minRatings30Days', 'minOverallRating'].map((key) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-[11px] text-gray-600 mb-0.5">
                      {formatLabel(key)}
                    </label>
                    <div className="relative">
                      {key === 'minOverallRating' && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">★</span>
                      )}
                      <input
                        type="text"
                        name={key}
                        value={rawMetrics[key] ?? desiredMetrics[key as keyof typeof desiredMetrics]}
                        onChange={handleDesiredMetricsChange}
                        onBlur={() => handleBlur(key)}
                        className={getInputClassName(key, `p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full ${key === 'minOverallRating' ? 'pr-5' : ''
                          }`)}
                      />
                    </div>
                  </div>
                ))}
                <div></div>
              </div>

              {/* Seller Metrics */}
              <div className="grid grid-cols-4 gap-3">
                {['maxSellers', 'maxWfsSellers', 'maxStock'].map((key) => (
                  <div key={key} className="flex flex-col">
                    <label className="text-[11px] text-gray-600 mb-0.5">
                      {formatLabel(key)}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={rawMetrics[key] ?? desiredMetrics[key as keyof typeof desiredMetrics]}
                      onChange={handleDesiredMetricsChange}
                      onBlur={() => handleBlur(key)}
                      className={getInputClassName(key, 'p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full')}
                    />
                  </div>
                ))}
                <div></div>
              </div>
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-4">
              {/* Fees Explanation */}
              <div className="bg-cyan-50 border border-cyan-200 p-2 rounded">
                <h3 className="font-medium text-cyan-800 text-xs mb-0.5">Fees Settings</h3>
                <p className="text-xs text-cyan-700">
                  Configure your shipping, storage, and additional fees to accurately calculate product costs.
                </p>
              </div>

              {/* Fees Content - 3 Column Layout */}
              <div className="grid grid-cols-3 gap-3">
                {/* Shipping Costs */}
                <div className="bg-gray-50 p-2 rounded">
                  <h3 className="text-xs font-medium text-gray-800 mb-2">Shipping Costs</h3>
                  <div className="space-y-2">
                    {['inboundShippingCost', 'sfShippingCost'].map((key) => (
                      <div key={key} className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-0.5">
                          {formatLabel(key)}
                        </label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                          <input
                            type="text"
                            name={key}
                            value={rawMetrics[key] ?? desiredMetrics[key as keyof typeof desiredMetrics]}
                            onChange={handleDesiredMetricsChange}
                            onBlur={() => handleBlur(key)}
                            className={getInputClassName(key, 'p-1 pl-5 pr-14 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full')}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">
                            per pound
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Storage Settings */}
                <div className="bg-gray-50 p-2 rounded">
                  <h3 className="text-xs font-medium text-gray-800 mb-2">Storage Settings</h3>
                  <div className="space-y-2">
                    {['storageLength', 'season'].map((key) => (
                      <div key={key} className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-0.5">
                          {formatLabel(key)}
                        </label>
                        {key === 'season' ? (
                          <select
                            name={key}
                            value={desiredMetrics[key as keyof typeof desiredMetrics]}
                            onChange={handleDesiredMetricsChange}
                            className="w-full p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white pr-6"
                          >
                            <option value="Jan-Sep">Jan-Sep</option>
                            <option value="Oct-Dec">Oct-Dec</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            name={key}
                            value={rawMetrics[key] ?? desiredMetrics[key as keyof typeof desiredMetrics]}
                            onChange={handleDesiredMetricsChange}
                            onBlur={() => handleBlur(key)}
                            className={getInputClassName(key, 'p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full')}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Costs */}
                <div className="bg-gray-50 p-2 rounded">
                  <h3 className="text-xs font-medium text-gray-800 mb-2">Additional Costs</h3>
                  <div className="space-y-2">
                    {/* Prep Cost */}
                    <div className="flex flex-col">
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
                            className={getInputClassName('prepCost', 'p-1 pl-5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full')}
                          />
                        </div>
                        <select
                          value={prepCostType}
                          onChange={handlePrepCostTypeChange}
                          className="p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white pr-6"
                        >
                          <option value="per lb">Per Pound</option>
                          <option value="each">Each</option>
                        </select>
                      </div>
                    </div>

                    {/* Additional Costs */}
                    <div className="flex flex-col">
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
                            className={getInputClassName('additionalCosts', 'p-1 pl-5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 w-full')}
                          />
                        </div>
                        <select
                          value={additionalCostType}
                          onChange={handleAdditionalCostTypeChange}
                          className="p-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 bg-white pr-6"
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
          )}

          {activeTab === 'export' && (
            <div className="space-y-3">
              {/* Export Settings Explanation */}
              <div className="bg-cyan-50 border border-cyan-200 p-2 rounded">
                <h3 className="font-medium text-cyan-800 text-xs mb-0.5">Export Settings</h3>
                <p className="text-xs text-cyan-700">
                  Configure which fields to include in your exports and their order. Drag and drop fields to reorder them.
                </p>
              </div>

              <div className="max-h-[65vh] overflow-y-auto px-1">
                <SortableList
                  items={exportSettings.fields}
                  onToggle={handleExportFieldToggle}
                  onSortEnd={handleExportFieldReorder}
                  useDragHandle
                  lockAxis="y"
                  distance={1}
                />
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-4">
              {/* Integrations Explanation */}
              <div className="bg-cyan-50 border border-cyan-200 p-2 rounded">
                <h3 className="font-medium text-cyan-800 text-xs mb-0.5">Integrations</h3>
                <p className="text-xs text-cyan-700">
                  Connect your external services to enhance NexSellPro's functionality. Currently supporting Google Sheets integration for data export.
                </p>
              </div>

              {/* Google Sheets Section */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Integration Header */}
                <div className="bg-gradient-to-r from-[#0F9D58] to-[#188038] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M19.5 3H4.5C3.67157 3 3 3.67157 3 4.5V19.5C3 20.3284 3.67157 21 4.5 21H19.5C20.3284 21 21 20.3284 21 19.5V4.5C21 3.67157 20.3284 3 19.5 3Z" fill="#0F9D58"/>
                          <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H13V17H7V15Z" fill="white"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Google Sheets</h3>
                        <p className="text-[11px] text-green-100">Export your product data seamlessly</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-[10px] font-medium bg-yellow-100 text-yellow-800 rounded shadow-sm">
                      {isGoogleConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>

                {/* Integration Content */}
                <div className="p-4 space-y-4">
                  {/* Features List */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-cyan-500">✓</div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-900">Automated Export</h4>
                        <p className="text-[11px] text-gray-500">Export data with one click</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-cyan-500">✓</div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-900">Custom Fields</h4>
                        <p className="text-[11px] text-gray-500">Choose what data to export</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-cyan-500">✓</div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-900">Multiple Sheets</h4>
                        <p className="text-[11px] text-gray-500">Export to different sheets</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 text-cyan-500">✓</div>
                      <div>
                        <h4 className="text-xs font-medium text-gray-900">Secure Access</h4>
                        <p className="text-[11px] text-gray-500">OAuth 2.0 authentication</p>
                      </div>
                    </div>
                  </div>

                  {/* Connection Button */}
                  <button
                    onClick={handleGoogleConnection}
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isGoogleConnected ? 'Disconnect from Google' : 'Connect with Google'}
                  </button>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[11px] text-gray-500">
                      By connecting, you'll be able to export your product data directly to Google Sheets. You can disconnect at any time.
                    </p>
                  </div>

                  {/* Export to Google Sheets Button */}
                  {isGoogleConnected && (
                    <button
                      onClick={handleExportToGoogleSheets}
                      disabled={isExporting}
                      className={`flex items-center justify-center w-full px-4 py-2 mt-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isExporting ? 'Exporting...' : 'Export to Google Sheets'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            {/* Left Group - Clear Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleClearTab}
                className="px-4 py-1.5 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-all duration-200 shadow-sm font-medium text-xs flex items-center gap-1.5"
              >
                <span>🗑️</span> Clear Tab
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-1.5 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-all duration-200 shadow-sm font-medium text-xs flex items-center gap-1.5"
              >
                <span>🗑️🗑️</span> Clear All
              </button>
            </div>

            {/* Right Group - Save/Cancel Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-all duration-200 shadow-sm font-medium text-xs flex items-center gap-1.5"
              >
                <span>❌</span> Cancel
              </button>
              <button
                onClick={handleSaveAllAndClose}
                className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 shadow-sm font-medium text-xs flex items-center gap-1.5"
              >
                <span>💾</span> Save All & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;

