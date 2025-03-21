/**
 * @fileoverview Type definitions for the Buy Gauge component system
 * @author NexSellPro
 * @created 2024-03-14
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No imports needed

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Icons for each metric type
export const METRIC_ICONS = {
  profit: '💰',
  margin: '📊',
  roi: '📈',
  totalRatings: '⭐',
  ratingsLast30Days: '🌟',
  numSellers: '👥',
  numWfsSellers: '🏢'
} as const;

// Maps metric keys to their display names
export const METRIC_LABELS = {
  profit: 'Profit',
  margin: 'Margin',
  roi: 'ROI',
  totalRatings: 'Total Ratings',
  ratingsLast30Days: '30-Day Ratings',
  numSellers: 'Sellers',
  numWfsSellers: 'WFS Sellers'
} as const;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Represents the score and status of an individual metric
export interface MetricScore {
  value: number;                   // The actual value of the metric
  baseline: number | undefined;    // The target/comparison value
  score: number;                   // Normalized score (0-1)
  status: 'red' | 'yellow' | 'green';  // Visual indicator of performance
  warning?: {                      // Optional warning for unusual values
    type: 'unedited' | 'unusual';
    message: string;
  };
}

// Collection of all metric scores for a product
export interface MetricScores {
  profit: MetricScore;
  margin: MetricScore;
  roi: MetricScore;
  totalRatings: MetricScore;
  ratingsLast30Days: MetricScore;
  numSellers: MetricScore;
  numWfsSellers: MetricScore;
}

// Defines the appearance of a gauge level
export interface GaugeLevel {
  label: string;    // Display text for the level
  color: string;    // Color code for visual representation
}

// Maps score values to gauge levels
export interface GaugeLevels {
  [key: number]: GaugeLevel;
}

// Thresholds for detecting unusual metric values
export interface UnusualThresholds {
  profit: number;
  margin: number;
  roi: number;
  totalRatings: number;
  ratingsLast30Days: number;
  numSellers: number;
  numWfsSellers: number;
}

// Weights used in calculating the overall buy score
export interface MetricWeights {
  profit: number;
  margin: number;
  roi: number;
  totalRatings: number;
  ratingsLast30Days: number;
  numSellers: number;
  numWfsSellers: number;
}

// Raw metric data for a product
export interface ProductMetrics {
  profit: number;
  margin: number;
  roi: number;
  totalRatings: number;
  ratingsLast30Days: number;
  numSellers: number;
  numWfsSellers: number;
}

// Configuration settings for the gauge
export interface GaugeSettings {
  minProfit?: number;
  minMargin?: number;
  minROI?: number;
  minTotalRatings?: number;
  minRatings30Days?: number;
  maxSellers?: number;
  maxWfsSellers?: number;
}

// Props for the BuyGauge component
export interface BuyGaugeProps {
  areSectionsOpen: boolean;    // Controls component expansion
  productData: ProductMetrics;  // Raw metric data
  settings: GaugeSettings;      // Configuration settings
}

// Type for metric icons mapping
export type MetricIconType = typeof METRIC_ICONS;
export type MetricKey = keyof MetricIconType;

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// No enums needed

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// No configuration needed

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// No helper functions needed

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// All exports are inline with their definitions 