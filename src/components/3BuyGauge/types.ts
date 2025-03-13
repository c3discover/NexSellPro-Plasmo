export interface MetricScore {
  value: number;
  baseline: number | undefined;
  score: number;
  status: 'red' | 'yellow' | 'green';
  warning?: {
    type: 'unedited' | 'unusual';
    message: string;
  };
}

export interface MetricScores {
  profit: MetricScore;
  margin: MetricScore;
  roi: MetricScore;
  totalRatings: MetricScore;
  ratingsLast30Days: MetricScore;
  numSellers: MetricScore;
  numWfsSellers: MetricScore;
}

export interface GaugeLevel {
  label: string;
  color: string;
}

export interface GaugeLevels {
  [key: number]: GaugeLevel;
}

export interface UnusualThresholds {
  profit: number;
  margin: number;
  roi: number;
  totalRatings: number;
  ratingsLast30Days: number;
  numSellers: number;
  numWfsSellers: number;
}

export interface MetricWeights {
  profit: number;
  margin: number;
  roi: number;
  totalRatings: number;
  ratingsLast30Days: number;
  numSellers: number;
  numWfsSellers: number;
}

export interface ProductMetrics {
  profit: number;
  margin: number;
  roi: number;
  totalRatings: number;
  ratingsLast30Days: number;
  numSellers: number;
  numWfsSellers: number;
}

export interface GaugeSettings {
  minProfit?: number;
  minMargin?: number;
  minROI?: number;
  minTotalRatings?: number;
  minRatings30Days?: number;
  maxSellers?: number;
  maxWfsSellers?: number;
}

export interface BuyGaugeProps {
  areSectionsOpen: boolean;
  productData: ProductMetrics;
  settings: GaugeSettings;
} 