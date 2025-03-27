/**
 * @fileoverview Compact metric indicator with icon and status
 * @author NexSellPro
 * @created 2024-03-21
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React from 'react';
import { MetricScore, METRIC_LABELS } from './types';
import { BiSolidError } from 'react-icons/bi';
import { FiDollarSign, FiPercent, FiRotateCw, FiStar, FiClock, FiUsers, FiTruck, FiPackage } from "react-icons/fi";

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
interface MetricDotProps {
  icon: string;
  metricKey: string;
  metric: MetricScore;
  size?: 'sm' | 'md' | 'lg';
}

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
const VALUE_FORMATTERS: Record<string, (value: number) => string> = {
  profit: (value) => `$${value.toFixed(2)}`,
  margin: (value) => `${value.toFixed(0)}%`,
  roi: (value) => `${value.toFixed(0)}%`,
  totalRatings: (value) => value.toLocaleString(),
  ratingsLast30Days: (value) => value.toLocaleString(),
  numSellers: String,
  numWfsSellers: String,
  totalStock: String
};

const sizeClasses = {
  sm: {
    container: 'w-10 h-10',
    icon: 'text-xl transform scale-125',
    indicator: 'w-4 h-4',
    warningIcon: 'text-lg'
  },
  md: {
    container: 'w-12 h-12',
    icon: 'text-2xl transform scale-125',
    indicator: 'w-5 h-5',
    warningIcon: 'text-xl'
  },
  lg: {
    container: 'w-14 h-14',
    icon: 'text-3xl transform scale-125',
    indicator: 'w-6 h-6',
    warningIcon: 'text-2xl'
  }
};

const statusColors = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500'
};

const warningIcons = {
  red: '❗',
  yellow: '⚠️'
};

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
const MetricDot: React.FC<MetricDotProps> = ({ 
  icon, 
  metricKey, 
  metric, 
  size = 'md' 
}) => {
  ////////////////////////////////////////////////
  // Helper Functions:
  ////////////////////////////////////////////////
  const formatValue = (value: number) => {
    const formatter = VALUE_FORMATTERS[metricKey] || String;
    return formatter(value);
  };

  const formatDifference = (value: number, baseline: number) => {
    const diff = Math.abs(value - baseline);
    const formatter = VALUE_FORMATTERS[metricKey] || String;
    return formatter(diff);
  };

  const isInverseMetric = (key: string) => {
    return key === 'numSellers' || key === 'numWfsSellers';
  };

  const getDifferenceSymbol = (value: number, baseline: number) => {
    if (isInverseMetric(metricKey)) {
      // For inverse metrics (sellers), lower is better so flip the symbol
      return value < baseline ? '+' : '-';
    }
    // For regular metrics (profit, margin, etc.), higher is better
    return value > baseline ? '+' : '-';
  };

  const getMetricIcon = (metric: string) => {
    return icon; // Use the emoji icon passed as prop
  };

  const getMetricLabel = (metric: string): string => {
    switch (metric) {
      case 'profit':
        return 'Profit';
      case 'margin':
        return 'Margin';
      case 'roi':
        return 'ROI';
      case 'totalRatings':
        return 'Total Ratings';
      case 'ratingsLast30Days':
        return 'Recent Ratings';
      case 'numSellers':
        return 'Sellers';
      case 'numWfsSellers':
        return 'WFS Sellers';
      case 'totalStock':
        return 'Stock';
      default:
        return metric;
    }
  };

  ////////////////////////////////////////////////
  // Render Methods:
  ////////////////////////////////////////////////
  return (
    <div className="relative group">
      {/* Metric Icon with Status Ring */}
      <div 
        className={`
          relative flex items-center justify-center 
          rounded-full bg-gray-100 hover:bg-gray-200
          transition-colors duration-200
          ${sizeClasses[size].container}
        `}
      >
        {/* Background Status Color */}
        <div 
          className={`
            absolute inset-0 rounded-full opacity-20
            ${statusColors[metric.status]}
          `}
        />
        
        {/* Icon */}
        <span className={`
          z-10 
          ${sizeClasses[size].icon}
        `}>
          {getMetricIcon(metricKey)}
        </span>
        
        {/* Status Indicator */}
        <div 
          className={`
            absolute bottom-[-10%] right-[-10%]
            rounded-full border-2 border-white
            z-20
            ${statusColors[metric.status]}
            ${sizeClasses[size].indicator}
            drop-shadow-md
          `}
        />

        {/* Warning Indicator */}
        {metric.warning && (
          <div 
            className={`
              absolute bottom-[-10%] left-[-10%]
              z-20
              ${sizeClasses[size].warningIcon}
              drop-shadow-md
            `}
          >
            {metric.status === 'red' ? warningIcons.red : warningIcons.yellow}
          </div>
        )}
      </div>

      {/* Tooltip */}
      <div className="
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
        hidden group-hover:block z-50
      ">
        <div className="
          bg-gray-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap
          shadow-lg
        ">
          <div className="font-semibold">
            {getMetricLabel(metricKey)}
          </div>
          <div>
            Value: {formatValue(metric.value)}
            {metric.baseline && ` (${getDifferenceSymbol(metric.value, metric.baseline)}${formatDifference(metric.value, metric.baseline)})`}
          </div>
          {metric.warning && (
            <div className="text-yellow-400">
              {metric.warning.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default MetricDot; 