/**
 * @fileoverview Main Buy Gauge component that displays a product's buy recommendation score
 * @author NexSellPro
 * @created 2024-03-14
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { BuyGaugeProps, MetricScore, MetricScores, ProductMetrics, GaugeSettings, METRIC_ICONS } from "./types";
import MetricsBreakdown from "./MetricsBreakdown";
import CompactGauge from "./CompactGauge";
import MetricDot from "./MetricDot";

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Defines the structure of a gauge level indicator
interface GaugeLevel {
  score: number;
  label: string;
  color: string;
}

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
// Defines the different levels of buy recommendations
const GAUGE_LEVELS: GaugeLevel[] = [
  { score: 10, label: "Prime Opportunity", color: "#22c55e" },
  { score: 9, label: "Strong Buy", color: "#22c55e" },
  { score: 8, label: "Confident Buy", color: "#22c55e" },
  { score: 7, label: "Good Buy", color: "#22c55e" },
  { score: 6, label: "Promising", color: "#eab308" },
  { score: 5, label: "Questionable", color: "#eab308" },
  { score: 4, label: "Cautious", color: "#eab308" },
  { score: 3, label: "Risky", color: "#eab308" },
  { score: 2, label: "Not Recommended", color: "#ef4444" },
  { score: 1, label: "Avoid", color: "#ef4444" }
];

// Weights for each metric in the final score calculation
const METRIC_WEIGHTS = {
  profit: 0.20,          // 25% weight
  margin: 0.15,          // 15% weight
  roi: 0.10,             // 15% weight
  totalRatings: 0.05,   // 10% weight
  ratingsLast30Days: 0.15, // 20% weight
  numSellers: 0.10,      // 5% weight
  numWfsSellers: 0.15,    // 15% weight
  totalStock: 0.10    // 15% weight
};

// Maximum multiplier for each metric to achieve max score (1.0)
const METRIC_MULTIPLIERS = {
  profit: 3.0,           // 3x baseline for max score
  margin: 2.0,           // 2x baseline for max score
  roi: 2.5,             // 2.5x baseline for max score
  totalRatings: 10.0,    // 5x baseline for max score
  ratingsLast30Days: 5.5,// 3x baseline for max score
  numSellers: 0.5,       // 1x baseline (inverse metric)
  numWfsSellers: 0.5,    // 1x baseline (inverse metric)
  totalStock: 0.5        // 1x baseline (inverse metric)
};

// Thresholds for detecting unusual metric values
const UNUSUAL_THRESHOLDS = {
  profit: 10,
  margin: 5,
  roi: 5,
  totalRatings: 50,
  ratingsLast30Days: 10,
  numSellers: 5,
  numWfsSellers: 5,
  totalStock: 5
};

// Main categories displayed on the gauge
const MAIN_CATEGORIES = [
  { label: "BUY", color: "#22c55e", position: 150 },
  { label: "QUESTIONABLE", color: "#eab308", position: 90 },
  { label: "SKIP", color: "#ef4444", position: 30 }
];

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// Converts polar coordinates to cartesian for SVG drawing
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees + 180) * Math.PI / 180.0);
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

// Generates SVG arc path for gauge
const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

// Default values for product metrics
const DEFAULT_PRODUCT_DATA: ProductMetrics = {
  profit: 0,
  margin: 0,
  roi: 0,
  totalRatings: 0,
  ratingsLast30Days: 0,
  numSellers: 0,
  numWfsSellers: 0,
  totalStock: 0  // This will come from inventory.totalStock
};

// Default gauge settings
const DEFAULT_SETTINGS: GaugeSettings = {
  minProfit: undefined,
  minMargin: undefined,
  minROI: undefined,
  minTotalRatings: undefined,
  minRatings30Days: undefined,
  maxSellers: undefined,
  maxWfsSellers: undefined,
  maxStock: undefined
};

// Calculates individual metric scores
const calculateMetricScore = (
  value: number,
  baseline: number | undefined,
  isInversed: boolean = false
): MetricScore => {
  // If no baseline is set, return a warning score
  if (!baseline) {
    return {
      value,
      baseline,
      score: 0,
      status: 'yellow',
      warning: {
        type: 'unedited',
        message: 'Baseline value not set in settings'
      }
    };
  }

  // Calculate ratio and normalize it
  const ratio = value / baseline;
  
  // Get the appropriate multiplier for this metric type
  const metricKey = Object.keys(METRIC_MULTIPLIERS).find(
    key => METRIC_WEIGHTS[key as keyof typeof METRIC_WEIGHTS] !== undefined
  ) as keyof typeof METRIC_MULTIPLIERS;
  const maxMultiplier = METRIC_MULTIPLIERS[metricKey];
  
  let score: number;
  if (isInversed) {
    // For inverse metrics (like sellers):
    // - If value > baseline, score should be failing (< 0.5)
    // - If value = baseline, score should be 0.5 (minimum passing)
    // - If value < baseline, score should scale up to 1.0
    if (value > baseline) {
      // Failing score for exceeding baseline
      score = Math.max(0, 0.5 - (value - baseline) / baseline * 0.5);
    } else {
      // Scale from 0.5 to 1.0 as value goes from baseline to 0
      score = 0.5 + (1 - value / baseline) * 0.5;
    }
  } else {
    // Regular metrics use the normal calculation
    const normalizedRatio = ratio;
    score = Math.min(normalizedRatio, maxMultiplier) / maxMultiplier;
  }
  
  // Determine status based on ratio
  let status: 'red' | 'yellow' | 'green';
  if (isInversed) {
    status = ratio > 1.1 ? 'red' : ratio < 0.9 ? 'green' : 'yellow';
  } else {
    status = ratio < 0.9 ? 'red' : ratio > 1.1 ? 'green' : 'yellow';
  }

  // Check for unusual values
  const unusualWarning = ratio >= UNUSUAL_THRESHOLDS[metricKey as keyof typeof UNUSUAL_THRESHOLDS] ? {
    type: 'unusual' as const,
    message: `Value is ${ratio.toFixed(1)}x higher than baseline`
  } : undefined;

  return { value, baseline, score, status, warning: unusualWarning };
};

// Calculates the overall buy score
const calculateBuyScore = (
  productData: ProductMetrics,
  settings: GaugeSettings
): { score: number; metrics: Record<string, MetricScore> } => {
  // Calculate individual metric scores
  const metrics = {
    profit: calculateMetricScore(productData.profit, settings.minProfit),
    margin: calculateMetricScore(productData.margin, settings.minMargin),
    roi: calculateMetricScore(productData.roi, settings.minROI),
    totalRatings: calculateMetricScore(productData.totalRatings, settings.minTotalRatings),
    ratingsLast30Days: calculateMetricScore(productData.ratingsLast30Days, settings.minRatings30Days),
    numSellers: calculateMetricScore(productData.numSellers, settings.maxSellers, true),
    numWfsSellers: calculateMetricScore(productData.numWfsSellers, settings.maxWfsSellers, true),
    totalStock: calculateMetricScore(productData.totalStock, settings.maxStock, true)  // Using inventory.totalStock
  };

  // Calculate available weights
  let totalWeight = 0;
  let availableMetrics = 0;
  
  Object.entries(metrics).forEach(([key, metric]) => {
    if (metric.baseline !== undefined) {
      totalWeight += METRIC_WEIGHTS[key as keyof typeof METRIC_WEIGHTS];
      availableMetrics++;
    }
  });

  // Calculate final score (1-10 scale)
  let weightedScore = 0;
  Object.entries(metrics).forEach(([key, metric]) => {
    if (metric.baseline !== undefined) {
      const adjustedWeight = METRIC_WEIGHTS[key as keyof typeof METRIC_WEIGHTS] / totalWeight;
      weightedScore += metric.score * adjustedWeight;
    }
  });

  // Convert to 1-10 scale and ensure it's within bounds
  const finalScore = Math.max(1, Math.min(10, Math.round(weightedScore * 10)));

  return { score: finalScore, metrics: metrics };
};

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const BuyGauge: React.FC<BuyGaugeProps> = ({ 
  areSectionsOpen, 
  productData = DEFAULT_PRODUCT_DATA, 
  settings = DEFAULT_SETTINGS
}) => {
  ////////////////////////////////////////////////
  // State and Hooks:
  ////////////////////////////////////////////////
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [viewMode, setViewMode] = useState<'compact' | 'full'>('compact');

  ////////////////////////////////////////////////
  // Effects:
  ////////////////////////////////////////////////
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  ////////////////////////////////////////////////
  // Calculations:
  ////////////////////////////////////////////////
  const { score, metrics } = calculateBuyScore(productData, settings);
  const currentLevel = GAUGE_LEVELS.find(level => level.score === Math.round(score)) || GAUGE_LEVELS[0];
  
  const rotation = ((score - 1) * 20) - 90; // Maps 1-10 to 0-180 degrees

  ////////////////////////////////////////////////
  // Helper Functions:
  ////////////////////////////////////////////////
  const hasConfiguredSettings = () => {
    return Object.values(settings).some(value => value !== undefined);
  };

  ////////////////////////////////////////////////
  // Render Methods:
  ////////////////////////////////////////////////
  const renderCompactView = () => (
    <div className="bg-white rounded-lg shadow-sm p-3">
      {/* Header with Score - Centered */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center gap-3">
          <CompactGauge score={score} hasSettings={hasConfiguredSettings()} />
          <div>
            <div className="font-semibold" style={{ color: currentLevel.color }}>
              {hasConfiguredSettings() ? currentLevel.label : "Configure Settings"}
            </div>
            <div className="text-xs text-gray-500">
              {hasConfiguredSettings() ? "Buy Score" : "Use settings cog to configure baseline metrics"}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Dots Grid - Centered with increased spacing */}
      <div className="flex justify-center mb-3">
        <div className="grid grid-cols-4 gap-6 px-4">
          {Object.entries(metrics).map(([key, metric]) => (
            <div key={key} className="flex justify-center items-center">
              <MetricDot
                icon={METRIC_ICONS[key as keyof typeof METRIC_ICONS]}
                metricKey={key}
                metric={metric}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle Button */}
      <button 
        onClick={() => setViewMode('full')}
        className="w-full mt-2 pt-2 border-t border-gray-200 text-gray-500 hover:text-gray-700 text-sm text-center"
      >
        Show Detailed View ▼
      </button>
    </div>
  );

  const renderFullView = () => (
    <div className="bg-white rounded-lg shadow-sm p-3">
      {/* Header with Score */}
      <div className="flex flex-col items-center mb-4">
      <div className="flex items-center gap-3">
          <CompactGauge score={score} hasSettings={hasConfiguredSettings()} />
          <div>
            <div className="font-semibold" style={{ color: currentLevel.color }}>
              {hasConfiguredSettings() ? currentLevel.label : "Configure Settings"}
            </div>
            <div className="text-xs text-gray-500">
              {hasConfiguredSettings() ? "Buy Score" : "Use settings cog to configure baseline metrics"}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="w-full">
        <MetricsBreakdown metrics={metrics as unknown as MetricScores} />
      </div>

      {/* View Toggle Button */}
      <button 
        onClick={() => setViewMode('compact')}
        className="w-full mt-2 pt-2 border-t border-gray-200 text-gray-500 hover:text-gray-700 text-sm text-center"
      >
        Show Compact View ▲
      </button>
    </div>
  );

  return (
    <div
      id="Buy Gauge"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      {/* Main Header */}
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-t-lg shadow-xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "🔽  Buy Gauge" : "▶️  Buy Gauge"}
      </h1>

      {/* Content Area */}
      <div className={`p-2 ${isOpen ? "block" : "hidden"}`}>
        {viewMode === 'compact' ? renderCompactView() : renderFullView()}
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default BuyGauge;