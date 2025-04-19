/**
 * @fileoverview Custom hook for managing product pricing state and calculations
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// Import React hooks for state management
import { useState, useEffect, useRef } from 'react';
// Import types and functions for product data
import type { UsedProductData } from '../data/usedData';
import { getUsedData } from '../data/usedData';
// Import pricing calculation functions
import {
  calculateWFSFee,
  calculateCubicFeet,
  calculateFinalShippingWeightForInbound,
  calculateFinalShippingWeightForWFS,
  calculateStartingProductCost,
  calculateTotalProfit,
  calculateROI,
  calculateMargin
} from '../services/pricingService';
// Import secure storage utility
import { secureStorage } from '../utils/secureStorage';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Default values for initial state
const DEFAULT_CONTRACT_CATEGORY = "Everything Else (Most Items)";
const DEFAULT_SEASON = "Jan-Sep";
const DEFAULT_STORAGE_LENGTH = 1;
const DEFAULT_INBOUND_RATE = 0.00;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Interface for general pricing settings
interface PricingGeneralState {
  contractCategory: string;    // Product category for fee calculation
  season: string;             // Current season for storage fees
  storageLength: number;      // Length of storage in months
  inboundShippingRate: number; // Rate for inbound shipping
  isWalmartFulfilled: boolean; // Whether Walmart handles fulfillment
}

// Interface for profit metrics
interface PricingMetricsState {
  totalProfit: number;        // Total profit after all fees
  roi: number;                // Return on Investment percentage
  margin: number;             // Profit margin percentage
  desiredMetrics: {
    minProfit: number;        // Minimum acceptable profit
    minMargin: number;        // Minimum acceptable margin
    minROI: number;          // Minimum acceptable ROI
  };
}

// Interface for cost-related state
interface PricingCostState {
  productCost: number;        // Cost to purchase product
  rawProductCost: string | null; // Raw input value
  salePrice: number;         // Price to sell product
  rawSalePrice: string | null;  // Raw input value
}

// Interface for product dimensions
interface PricingDimensionsState {
  shippingLength: number;     // Product length
  rawLength: string | null;   // Raw input value
  shippingWidth: number;      // Product width
  rawWidth: string | null;    // Raw input value
  shippingHeight: number;     // Product height
  rawHeight: string | null;   // Raw input value
  weight: number;             // Product weight
  rawWeight: string | null;   // Raw input value
}

// Interface for all fees
interface PricingFeesState {
  referralFee: number;        // Walmart's referral fee
  rawReferralFee: string | null; // Raw input value
  inboundShippingFee: number; // Cost to ship to Walmart
  rawInboundShippingFee: string | null; // Raw input value
  storageFee: number;         // Walmart storage fee
  rawStorageFee: string | null; // Raw input value
  prepFee: number;            // Product preparation fee
  rawPrepFee: string | null;  // Raw input value
  additionalFees: number;     // Any other fees
  rawAdditionalFees: string | null; // Raw input value
  wfsFee: number;             // Walmart Fulfillment Service fee
  rawWfsFee: string | null;   // Raw input value
}

// Main state interface combining all state types
interface PricingState {
  general: PricingGeneralState;      // General settings
  metrics: PricingMetricsState;      // Profit metrics
  costs: PricingCostState;           // Cost information
  dimensions: PricingDimensionsState; // Product dimensions
  fees: PricingFeesState;            // All fees
  productData: UsedProductData | null; // Product data from API
  hasEdited: { [key: string]: boolean }; // Track edited fields
}

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed as we're using string literals

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// No additional configuration needed

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// Format number to two decimal places
const formatToTwoDecimalPlaces = (value: number): string => value.toFixed(2);

////////////////////////////////////////////////
// Hook Definition:
////////////////////////////////////////////////
/**
 * Custom hook for managing product pricing state and calculations
 * @returns Object containing state, update functions, and calculations
 */
export function usePricingState() {
  // Initialize state with default values
  const [state, setState] = useState<PricingState>({
    general: {
      contractCategory: DEFAULT_CONTRACT_CATEGORY,
      season: DEFAULT_SEASON,
      storageLength: DEFAULT_STORAGE_LENGTH,
      inboundShippingRate: DEFAULT_INBOUND_RATE,
      isWalmartFulfilled: secureStorage.get('isWalmartFulfilled', true)
    },
    metrics: {
      totalProfit: 0,
      roi: 0,
      margin: 0,
      desiredMetrics: {
        minProfit: 0,
        minMargin: 0,
        minROI: 0
      }
    },
    costs: {
      productCost: 0,
      rawProductCost: null,
      salePrice: 0,
      rawSalePrice: null
    },
    dimensions: {
      shippingLength: 0,
      rawLength: null,
      shippingWidth: 0,
      rawWidth: null,
      shippingHeight: 0,
      rawHeight: null,
      weight: 0,
      rawWeight: null
    },
    fees: {
      referralFee: 0,
      rawReferralFee: null,
      inboundShippingFee: 0,
      rawInboundShippingFee: null,
      storageFee: 0,
      rawStorageFee: null,
      prepFee: 0,
      rawPrepFee: null,
      additionalFees: 0,
      rawAdditionalFees: null,
      wfsFee: 0,
      rawWfsFee: null
    },
    productData: null,
    hasEdited: {}
  });

  // Track if product cost has been initialized
  const hasInitializedProductCost = useRef(false);

  // Fetch initial product data
  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsedData();
      if (data) {
        setState(prevState => ({
          ...prevState,
          productData: data,
          costs: {
            ...prevState.costs,
            salePrice: data.pricing.currentPrice || 0,
            productCost: calculateStartingProductCost(data.pricing.currentPrice || 0)
          }
        }));
      }
    };
    fetchData();
  }, []);

  // Load desired metrics from storage
  useEffect(() => {
    interface StoredMetrics {
      minProfit?: string;
      minMargin?: string;
      minROI?: string;
    }
    
    const storedMetrics = secureStorage.get<StoredMetrics>('desiredMetrics', {});
    setState(prevState => ({
      ...prevState,
      metrics: {
        ...prevState.metrics,
        desiredMetrics: {
          minProfit: parseFloat(storedMetrics.minProfit || '0'),
          minMargin: parseFloat(storedMetrics.minMargin || '0'),
          minROI: parseFloat(storedMetrics.minROI || '0')
        }
      }
    }));
  }, []);

  // Initialize WFS Fee when product cost is set
  useEffect(() => {
    if (!hasInitializedProductCost.current && state.costs.salePrice > 0) {
      const initialProductCost = calculateStartingProductCost(state.costs.salePrice);
      setState(prevState => ({
        ...prevState,
        costs: {
          ...prevState.costs,
          productCost: initialProductCost
        }
      }));
      initializeWfsFee();
      hasInitializedProductCost.current = true;
    }
  }, [state.costs.salePrice]);

  // Calculate derived values
  const cubicFeet = calculateCubicFeet(
    state.dimensions.shippingLength,
    state.dimensions.shippingWidth,
    state.dimensions.shippingHeight
  );

  const finalShippingWeightForInbound = calculateFinalShippingWeightForInbound(
    state.dimensions.weight,
    state.dimensions.shippingLength,
    state.dimensions.shippingWidth,
    state.dimensions.shippingHeight
  );

  const finalShippingWeightForWFS = calculateFinalShippingWeightForWFS(
    state.dimensions.weight,
    state.dimensions.shippingLength,
    state.dimensions.shippingWidth,
    state.dimensions.shippingHeight
  );

  // Prepare product data for WFS fee calculation
  const productForWFSFee = {
    weight: finalShippingWeightForWFS,
    length: state.dimensions.shippingLength,
    width: state.dimensions.shippingWidth,
    height: state.dimensions.shippingHeight,
    isWalmartFulfilled: state.general.isWalmartFulfilled,
    isApparel: state.productData?.flags?.isApparel || false,
    isHazardousMaterial: state.productData?.flags?.isHazardousMaterial || false,
    retailPrice: state.productData?.pricing?.currentPrice || 0.00,
  };

  // Update metrics when key values change
  useEffect(() => {
    const updatedTotalProfit = calculateTotalProfit(
      state.costs.salePrice,
      state.costs.productCost,
      state.fees.referralFee,
      state.fees.wfsFee,
      state.fees.inboundShippingFee,
      state.fees.storageFee,
      state.fees.prepFee,
      state.fees.additionalFees
    );

    const updatedROI = parseFloat(calculateROI(updatedTotalProfit, state.costs.productCost));
    const updatedMargin = parseFloat(calculateMargin(updatedTotalProfit, state.costs.salePrice));

    setState(prevState => ({
      ...prevState,
      metrics: {
        ...prevState.metrics,
        totalProfit: updatedTotalProfit,
        roi: updatedROI,
        margin: updatedMargin
      }
    }));
  }, [
    state.costs.salePrice,
    state.costs.productCost,
    state.fees.referralFee,
    state.fees.wfsFee,
    state.fees.inboundShippingFee,
    state.fees.storageFee,
    state.fees.prepFee,
    state.fees.additionalFees
  ]);

  // State update helper functions
  const updateGeneral = (updates: Partial<PricingGeneralState>) => {
    setState(prevState => ({
      ...prevState,
      general: {
        ...prevState.general,
        ...updates
      }
    }));
  };

  const updateMetrics = (updates: Partial<PricingMetricsState>) => {
    setState(prevState => ({
      ...prevState,
      metrics: {
        ...prevState.metrics,
        ...updates
      }
    }));
  };

  const updateCosts = (updates: Partial<PricingCostState>) => {
    setState(prevState => ({
      ...prevState,
      costs: {
        ...prevState.costs,
        ...updates
      }
    }));
  };

  const updateDimensions = (updates: Partial<PricingDimensionsState>) => {
    setState(prevState => ({
      ...prevState,
      dimensions: {
        ...prevState.dimensions,
        ...updates
      }
    }));
  };

  const updateFees = (updates: Partial<PricingFeesState>) => {
    setState(prevState => ({
      ...prevState,
      fees: {
        ...prevState.fees,
        ...updates
      }
    }));
  };

  const setHasEdited = (key: string, value: boolean) => {
    setState(prevState => ({
      ...prevState,
      hasEdited: {
        ...prevState.hasEdited,
        [key]: value
      }
    }));
  };

  // Initialize WFS Fee calculation
  const initializeWfsFee = () => {
    const wfsFee = calculateWFSFee(productForWFSFee);
    updateFees({ wfsFee });
  };

  // Reset functions for different aspects of the state
  const resetShippingDimensions = () => {
    if (state.productData) {
      updateDimensions({
        shippingLength: parseFloat(state.productData.dimensions.shippingLength) || 0,
        shippingWidth: parseFloat(state.productData.dimensions.shippingWidth) || 0,
        shippingHeight: parseFloat(state.productData.dimensions.shippingHeight) || 0,
        weight: parseFloat(state.productData.dimensions.weight) || 0,
        rawLength: null,
        rawWidth: null,
        rawHeight: null,
        rawWeight: null
      });
    }
  };

  const resetPricing = () => {
    if (state.productData) {
      updateCosts({
        salePrice: state.productData.pricing.currentPrice || 0,
        productCost: calculateStartingProductCost(state.productData.pricing.currentPrice || 0),
        rawSalePrice: null,
        rawProductCost: null
      });
    }
  };

  const resetFees = () => {
    updateFees({
      referralFee: 0.00,
      inboundShippingFee: 0.00,
      storageFee: 0.00,
      prepFee: 0.00,
      additionalFees: 0.00,
      wfsFee: 0.00,
      rawReferralFee: null,
      rawInboundShippingFee: null,
      rawStorageFee: null,
      rawPrepFee: null,
      rawAdditionalFees: null,
      rawWfsFee: null
    });
  };

  // Return state and functions
  return {
    state,                    // Current state object
    updateGeneral,            // Update general settings
    updateMetrics,            // Update profit metrics
    updateCosts,              // Update cost information
    updateDimensions,         // Update product dimensions
    updateFees,               // Update fee information
    setHasEdited,             // Mark fields as edited
    cubicFeet,                // Calculated cubic feet
    finalShippingWeightForInbound, // Calculated inbound shipping weight
    finalShippingWeightForWFS,     // Calculated WFS shipping weight
    productForWFSFee,         // Product data for WFS calculations
    initializeWfsFee,         // Initialize WFS fee
    resetShippingDimensions,  // Reset dimension values
    resetPricing,             // Reset pricing values
    resetFees,                // Reset fee values
    formatToTwoDecimalPlaces  // Format numbers
  };
} 