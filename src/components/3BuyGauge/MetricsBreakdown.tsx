/**
 * @fileoverview Component that displays detailed breakdown of product metrics
 * @author NexSellPro
 * @created 2024-03-14
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React from 'react';
import { MetricScore } from './types';

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Props for the metrics breakdown component
interface MetricsBreakdownProps {
  metrics: {
    profit: MetricScore;
    margin: MetricScore;
    roi: MetricScore;
    totalRatings: MetricScore;
    ratingsLast30Days: MetricScore;
    numSellers: MetricScore;
    numWfsSellers: MetricScore;
    totalStock: MetricScore;
  };
}

////////////////////////////////////////////////
// Helper Components:
////////////////////////////////////////////////
// Component to display a single metric row
const MetricRow: React.FC<{ 
  label: string;
  metric: MetricScore;
  formatValue?: (value: number) => string;
}> = ({ label, metric, formatValue }) => {
  // Convert status to appropriate color
  const getStatusColor = (status: 'red' | 'yellow' | 'green') => {
    switch (status) {
      case 'red': return '#ef4444';
      case 'yellow': return '#eab308';
      case 'green': return '#22c55e';
    }
  };

  // Format the display value using provided formatter or default to string
  const displayValue = formatValue ? formatValue(metric.value) : metric.value.toString();
  
  // Calculate and format the difference from baseline
  const getDifferenceDisplay = () => {
    if (!metric.baseline) return '';
    const diff = metric.value - metric.baseline;
    const formattedDiff = formatValue ? formatValue(Math.abs(diff)) : Math.abs(diff).toString();
    return diff >= 0 ? `(+${formattedDiff})` : `(-${formattedDiff})`;
  };

  // Special display handling for metrics
  const getMetricDisplay = () => {
    return (
      <div className="flex items-center gap-2">
        <div className="relative group">
          <span className={`text-sm ${metric.baseline ? 'cursor-help' : ''}`}>
            {displayValue}
            {/* Special indicator for high ROI values */}
            {label === 'ROI' && metric.baseline && (metric.value / metric.baseline) > 5 && (
              <span className="ml-2 bg-[#1a1a1a] text-white text-xs px-3 py-1 rounded">
                {(metric.value / metric.baseline).toFixed(1)}x higher than baseline
              </span>
            )}
          </span>
          {/* Tooltip with detailed metric information */}
          {metric.baseline && (
            <div className="absolute z-50 left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-[300px] hidden group-hover:block bg-cyan-900 text-white p-6 rounded text-xs whitespace-pre font-mono shadow-lg">
              {`Baseline: ${formatValue ? formatValue(metric.baseline) : metric.baseline}
Current: ${displayValue}
Difference: ${getDifferenceDisplay()}`}
            </div>
          )}
        </div>
        {/* Difference indicator */}
        {metric.baseline && (
          <span className="text-xs" style={{ color: getStatusColor(metric.status) }}>
            {getDifferenceDisplay()}
          </span>
        )}
        {/* Status indicator dot */}
        {metric.baseline && (
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: getStatusColor(metric.status) }}
          />
        )}
        {/* Warning indicator */}
        {metric.warning && (
          <div className="relative group">
            {metric.warning.type === 'unedited' ? (
              <span className="text-yellow-500 cursor-help">⚠️</span>
            ) : (
              <span className="text-red-500 cursor-help">❗</span>
            )}
            <div className="absolute z-50 bottom-full left-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded hidden group-hover:block whitespace-nowrap">
              {metric.warning.message}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between py-1">
      {/* Metric label and warning */}
      <div className="flex items-center gap-2">
        <span className="text-sm w-28">{label}</span>
        {metric.warning && (
          <div className="relative group">
            {metric.warning.type === 'unedited' ? (
              <span className="text-yellow-500 cursor-help">⚠️</span>
            ) : (
              <span className="text-red-500 cursor-help">❗</span>
            )}
            <div className="absolute z-50 bottom-full left-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded hidden group-hover:block whitespace-nowrap">
              {metric.warning.message}
            </div>
          </div>
        )}
      </div>
      {/* Metric value and indicators */}
      <div className="flex items-center gap-2">
        <span className={`text-sm ${metric.baseline ? 'cursor-help' : ''}`}>
          {displayValue}
        </span>
        {metric.baseline && (
          <span className="text-xs" style={{ color: getStatusColor(metric.status) }}>
            {getDifferenceDisplay()}
          </span>
        )}
        {metric.baseline && (
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: getStatusColor(metric.status) }}
          />
        )}
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
const MetricsBreakdown: React.FC<MetricsBreakdownProps> = ({ metrics }) => {
  return (
    <div className="w-full bg-[#ffffff] rounded-lg shadow-sm p-3 mb-4">
      {/* Financial metrics */}
      <MetricRow 
        label="Profit" 
        metric={metrics.profit}
        formatValue={(v) => `$${v.toFixed(2)}`}
      />
      <MetricRow 
        label="Margin" 
        metric={metrics.margin}
        formatValue={(v) => `${v.toFixed(0)}%`}
      />
      <MetricRow 
        label="ROI" 
        metric={metrics.roi}
        formatValue={(v) => `${v.toFixed(0)}%`}
      />
      
      {/* Rating metrics */}
      <MetricRow 
        label="Total Ratings" 
        metric={metrics.totalRatings}
        formatValue={(v) => v.toLocaleString()}
      />
      <MetricRow 
        label="30-Day Ratings" 
        metric={metrics.ratingsLast30Days}
        formatValue={(v) => v.toLocaleString()}
      />
      
      {/* Seller metrics */}
      <MetricRow 
        label="Sellers" 
        metric={metrics.numSellers}
      />
      <MetricRow 
        label="WFS Sellers" 
        metric={metrics.numWfsSellers}
      />
      <MetricRow 
        label="Stock" 
        metric={metrics.totalStock}
      />
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default MetricsBreakdown; 