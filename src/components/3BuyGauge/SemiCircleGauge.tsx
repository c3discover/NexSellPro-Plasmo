import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface SemiCircleGaugeProps {
  score: number;
  label: string;
  color: string;
}

const SemiCircleGauge: React.FC<SemiCircleGaugeProps> = ({ score, label, color }) => {
  // Create a spring animation for the score
  const springScore = useSpring(score, {
    stiffness: 100,
    damping: 20,
    mass: 0.5
  });

  // Update spring when score changes
  useEffect(() => {
    springScore.set(score);
  }, [score, springScore]);

  // Map score (1-10) to degrees (0-180)
  const rotation = useTransform(springScore, [1, 10], [0, 180]);

  return (
    <div className="relative w-64 h-32">
      {/* Gauge Background */}
      <svg
        className="absolute top-0 left-0 w-1/2 h-full"
        viewBox="0 0 200 100"
      >
        {/* Red Section (Skip) */}
        <path
          d="M 20 100 A 80 80 0 0 1 56 28"
          fill="none"
          stroke="#fee2e2"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Yellow Section (Questionable) */}
        <path
          d="M 56 28 A 80 80 0 0 1 144 28"
          fill="none"
          stroke="#fef9c3"
          strokeWidth="20"
          strokeLinecap="round"
        />
        
        {/* Green Section (Buy) */}
        <path
          d="M 144 28 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#dcfce7"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Gauge Needle */}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke="black"
          strokeWidth="2"
          style={{ rotate: rotation, transformOrigin: '100px 100px' }}
        />
        
        {/* Needle Center Point */}
        <circle
          cx="100"
          cy="100"
          r="5"
          fill="black"
        />
      </svg>

      {/* Score Display */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
        <motion.div 
          className="text-2xl font-bold"
          style={{ color }}
        >
          {springScore.get().toFixed(1)}
        </motion.div>
        <div className="text-sm font-medium text-gray-600">
          {label}
        </div>
      </div>
    </div>
  );
};

export default SemiCircleGauge; 