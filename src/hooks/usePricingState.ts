import { useState, useEffect, useRef } from 'react';
import type { UsedProductData } from '../utils/usedData';
import { getUsedData } from '../utils/usedData';
import {
  calculateReferralFee,
  calculateWFSFee,
  calculateStorageFee,
  calculateCubicFeet,
  calculateFinalShippingWeightForInbound,
  calculateFinalShippingWeightForWFS,
  calculateStartingProductCost,
  calculateTotalProfit,
  calculateROI,
  calculateMargin,
  calculateAdditionalFees,
  calculateInboundShipping,
  calculatePrepFee
} from '../services/pricingService';
import type { PricingProduct } from '../services/pricingService';
import { secureStorage } from '../utils/secureStorage';

// Define types for the pricing state
interface PricingGeneralState {
  contractCategory: string;
  season: string;
  storageLength: number;
  inboundShippingRate: number;
  isWalmartFulfilled: boolean;
}

interface PricingMetricsState {
  totalProfit: number;
  roi: number;
  margin: number;
  desiredMetrics: {
    minProfit: number;
    minMargin: number;
    minROI: number;
  };
}

interface PricingCostState {
  productCost: number;
  rawProductCost: string | null;
  salePrice: number;
  rawSalePrice: string | null;
}

interface PricingDimensionsState {
  shippingLength: number;
  rawLength: string | null;
  shippingWidth: number;
  rawWidth: string | null;
  shippingHeight: number;
  rawHeight: string | null;
  weight: number;
  rawWeight: string | null;
}

interface PricingFeesState {
  referralFee: number;
  rawReferralFee: string | null;
  inboundShippingFee: number;
  rawInboundShippingFee: string | null;
  storageFee: number;
  rawStorageFee: string | null;
  prepFee: number;
  rawPrepFee: string | null;
  additionalFees: number;
  rawAdditionalFees: string | null;
  wfsFee: number;
  rawWfsFee: string | null;
}

interface PricingState {
  general: PricingGeneralState;
  metrics: PricingMetricsState;
  costs: PricingCostState;
  dimensions: PricingDimensionsState;
  fees: PricingFeesState;
  productData: UsedProductData | null;
  hasEdited: { [key: string]: boolean };
}

// Default values
const DEFAULT_CONTRACT_CATEGORY = "Everything Else (Most Items)";
const DEFAULT_SEASON = "Jan-Sep";
const DEFAULT_STORAGE_LENGTH = 1;
const DEFAULT_INBOUND_RATE = 0.5;

export function usePricingState() {
  // Initialize state with grouped related variables
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

  // Mutable reference for initialization checks
  const hasInitializedProductCost = useRef(false);

  // Fetch initial data
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

  // Load desired metrics from secureStorage
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

  // Initialize WFS Fee
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

  // Product data for WFS fee calculation
  const productForWFSFee = {
    weight: finalShippingWeightForWFS,
    length: state.dimensions.shippingLength,
    width: state.dimensions.shippingWidth,
    height: state.dimensions.shippingHeight,
    isWalmartFulfilled: state.general.isWalmartFulfilled,
    isApparel: state.productData?.flags?.isApparel || false,
    isHazardousMaterial: state.productData?.flags?.isHazardousMaterial || false,
    retailPrice: state.productData?.pricing?.currentPrice || 0,
  };

  // Recalculate profit, ROI, and margin whenever key pricing variables change
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

  // Helper functions to update state
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

  // Initialize WFS Fee
  const initializeWfsFee = () => {
    const wfsFee = calculateWFSFee(productForWFSFee);
    updateFees({ wfsFee });
  };

  // Reset functions
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
      referralFee: 0,
      inboundShippingFee: 0,
      storageFee: 0,
      prepFee: 0,
      additionalFees: 0,
      wfsFee: 0,
      rawReferralFee: null,
      rawInboundShippingFee: null,
      rawStorageFee: null,
      rawPrepFee: null,
      rawAdditionalFees: null,
      rawWfsFee: null
    });
  };

  // Format helper
  const formatToTwoDecimalPlaces = (value: number): string => value.toFixed(2);

  return {
    state,
    updateGeneral,
    updateMetrics,
    updateCosts,
    updateDimensions,
    updateFees,
    setHasEdited,
    cubicFeet,
    finalShippingWeightForInbound,
    finalShippingWeightForWFS,
    productForWFSFee,
    initializeWfsFee,
    resetShippingDimensions,
    resetPricing,
    resetFees,
    formatToTwoDecimalPlaces
  };
} 