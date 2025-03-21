/**
 * @fileoverview Compact circular gauge for displaying buy score
 * @author NexSellPro
 * @created 2024-03-21
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React from 'react';

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
interface CompactGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  hasSettings?: boolean;
}

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
const calculatePathData = (score: number): string => {
  // Convert score (1-10) to percentage
  const percentage = (score - 1) / 9;
  
  // Calculate the angle (0 to 360 degrees)
  const angle = percentage * 360;
  
  // Center point
  const cx = 50;
  const cy = 50;
  const radius = 40;
  
  // Start at top (0 degrees = -90 in SVG)
  const startAngle = -90;
  const endAngle = angle - 90;
  
  // Convert angle to radians
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  
  // Calculate points
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  
  // Determine if we need the large arc flag
  const largeArcFlag = angle > 180 ? 1 : 0;
  
  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
const CompactGauge: React.FC<CompactGaugeProps> = ({ score, size = 'md', hasSettings = false }) => {
  ////////////////////////////////////////////////
  // Constants:
  ////////////////////////////////////////////////
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: '0.75rem',
    md: '1rem',
    lg: '1.25rem'
  };

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 7) return '#22c55e'; // green
    if (score >= 4) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  ////////////////////////////////////////////////
  // Render Methods:
  ////////////////////////////////////////////////
  if (!hasSettings) {
    return (
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        <span 
          className="text-amber-500"
          style={{ 
            fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.5rem' : '2rem'
          }}
        >
          ⚠️
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Background Circle */}
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        
        {/* Score Arc */}
        <path
          d={calculatePathData(score)}
          fill={getColor(score)}
          opacity="0.2"
        />
        
        {/* Score Circle */}
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="4"
          strokeDasharray={`${(score - 1) / 9 * 201} 201`}
        />
      </svg>
      
      {/* Score Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="text-gray-800 font-semibold"
          style={{ fontSize: textSizes[size] }}
        >
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default CompactGauge; 