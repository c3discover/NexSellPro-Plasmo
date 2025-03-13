////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import { BuyGaugeProps, MetricScore, MetricScores, ProductMetrics, GaugeSettings } from "./types";
import MetricsBreakdown from "./MetricsBreakdown";

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
interface GaugeLevel {
  score: number;
  label: string;
  color: string;
}

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
const GAUGE_LEVELS: GaugeLevel[] = [
  { score: 10, label: "Prime Opportunity", color: "#22c55e" },
  { score: 9, label: "Strong Buy", color: "#22c55e" },
  { score: 8, label: "Confident Buy", color: "#22c55e" },
  { score: 7, label: "Good Buy", color: "#22c55e" },
  { score: 6, label: "Promising", color: "#eab308" },
  { score: 5, label: "Moderate", color: "#eab308" },
  { score: 4, label: "Cautious", color: "#eab308" },
  { score: 3, label: "Risky", color: "#eab308" },
  { score: 2, label: "Not Recommended", color: "#ef4444" },
  { score: 1, label: "Avoid", color: "#ef4444" }
];

const METRIC_WEIGHTS = {
  profit: 0.20,
  margin: 0.20,
  roi: 0.15,
  totalRatings: 0.125,
  ratingsLast30Days: 0.125,
  numSellers: 0.10,
  numWfsSellers: 0.10
};

const UNUSUAL_THRESHOLDS = {
  profit: 5,
  margin: 5,
  roi: 5,
  totalRatings: 20,
  ratingsLast30Days: 10,
  numSellers: 4,
  numWfsSellers: 4
};

// Main categories for the gauge
const MAIN_CATEGORIES = [
  { label: "BUY", color: "#22c55e", position: 150 },
  { label: "QUESTIONABLE", color: "#eab308", position: 90 },
  { label: "SKIP", color: "#ef4444", position: 30 }
];

// SVG arc drawing helper
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees + 180) * Math.PI / 180.0);
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

const DEFAULT_PRODUCT_DATA: ProductMetrics = {
  profit: 0,
  margin: 0,
  roi: 0,
  totalRatings: 0,
  ratingsLast30Days: 0,
  numSellers: 0,
  numWfsSellers: 0
};

const DEFAULT_SETTINGS: GaugeSettings = {
  minProfit: undefined,
  minMargin: undefined,
  minROI: undefined,
  minTotalRatings: undefined,
  minRatings30Days: undefined,
  maxSellers: undefined,
  maxWfsSellers: undefined
};

////////////////////////////////////////////////
// Utility Functions:
////////////////////////////////////////////////
const calculateMetricScore = (
  value: number,
  baseline: number | undefined,
  isInversed: boolean = false
): MetricScore => {
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

  const ratio = value / baseline;
  const normalizedRatio = isInversed ? (ratio > 1 ? 1/ratio : ratio) : ratio;
  
  // Calculate score (0-1 range)
  let score = Math.min(normalizedRatio, 2) / 2; // Cap at 2x baseline for max score
  
  // Determine status
  let status: 'red' | 'yellow' | 'green';
  if (isInversed) {
    status = ratio > 1.1 ? 'red' : ratio < 0.9 ? 'green' : 'yellow';
  } else {
    status = ratio < 0.9 ? 'red' : ratio > 1.1 ? 'green' : 'yellow';
  }

  // Check for unusual values
  const metricKey = Object.keys(UNUSUAL_THRESHOLDS).find(
    key => UNUSUAL_THRESHOLDS[key as keyof typeof UNUSUAL_THRESHOLDS] === baseline
  ) as keyof typeof UNUSUAL_THRESHOLDS;

  const warning = ratio >= UNUSUAL_THRESHOLDS[metricKey] ? {
    type: 'unusual' as const,
    message: `Value is ${ratio.toFixed(1)}x higher than baseline`
  } : undefined;

  return {
    value,
    baseline,
    score,
    status,
    warning
  };
};

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
    numWfsSellers: calculateMetricScore(productData.numWfsSellers, settings.maxWfsSellers, true)
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

  // Convert to 1-10 scale
  const finalScore = Math.max(1, Math.min(10, Math.round(weightedScore * 10)));

  return {
    score: finalScore,
    metrics: metrics
  };
};

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const BuyGauge: React.FC<BuyGaugeProps> = ({ 
  areSectionsOpen, 
  productData = DEFAULT_PRODUCT_DATA, 
  settings = DEFAULT_SETTINGS 
}) => {
  const [isOpen, setIsOpen] = useState(areSectionsOpen);

  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  // Calculate the actual buy score
  const { score, metrics } = calculateBuyScore(productData, settings);
   
  // Calculate rotation (1-10 scale to 0-180 degrees)
  const calculateRotation = (score: number) => {
    return ((score - 1) * 20) - 90; // Maps 1-10 to 0-180 degrees
  };

  const rotation = calculateRotation(score);
  const currentLevel = GAUGE_LEVELS.find(level => level.score === Math.round(score)) || GAUGE_LEVELS[0];

  return (
    <div
      id="Buy Gauge"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-t-lg shadow-xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "🔽  Buy Gauge" : "▶️  Buy Gauge"}
      </h1>

      <div className={`flex flex-col items-center ${isOpen ? "block" : "hidden"}`}>
        {/* Dark container for gauge and label */}
        <div className="bg-[#3a3f47] rounded-lg p-2 my-4 w-[60%] mx-auto">
          {/* Gauge Section */}
          <div className="w-[100px] h-[60px] relative mb-2 mx-auto">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <defs>
                <linearGradient id="metallic" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#666666' }} />
                  <stop offset="50%" style={{ stopColor: '#999999' }} />
                  <stop offset="100%" style={{ stopColor: '#666666' }} />
                </linearGradient>
              </defs>

              {/* Outer metallic ring */}
              <path
                d={describeArc(100, 100, 75, 0, 180)}
                fill="none"
                stroke="url(#metallic)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Tick Marks */}
              {[1, 3, 5, 7, 9].map((value) => {
                const angle = (value - 1) * 20;
                const point1 = polarToCartesian(100, 100, 70, angle);
                const point2 = polarToCartesian(100, 100, 60, angle);
                const labelPoint = polarToCartesian(100, 100, 45, angle);
                
                return (
                  <g key={value}>
                    <line
                      x1={point1.x}
                      y1={point1.y}
                      x2={point2.x}
                      y2={point2.y}
                      stroke="#666666"
                      strokeWidth="2"
                    />
                    <text
                      x={labelPoint.x}
                      y={labelPoint.y}
                      textAnchor="middle"
                      fill="#999999"
                      fontSize="8"
                      fontWeight="bold"
                      dominantBaseline="middle"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Needle */}
              <g transform={`rotate(${rotation}, 100, 100)`}>
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="35"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="6"
                  fill="url(#metallic)"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              </g>
            </svg>
          </div>

          {/* Score Display */}
          <div className="text-center">
            <div className="text-lg font-bold mb-1" style={{ color: currentLevel.color }}>
              {currentLevel.label}
            </div>
            <div className="text-sm text-gray-300">
              Score: {score}/10
            </div>
          </div>
        </div>

        {/* Metrics Breakdown */}
        <div className="w-[90%] mx-auto">
          <MetricsBreakdown metrics={metrics as unknown as MetricScores} />
        </div>
      </div>
    </div>
  );
};

export default BuyGauge;