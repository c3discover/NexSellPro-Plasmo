////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
interface BuyGaugeProps {
  areSectionsOpen: boolean;
}

interface GaugeLevel {
  min: number;
  max: number;
  label: string;
  color: string;
}

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////
const GAUGE_LEVELS: GaugeLevel[] = [
  { min: 90, max: 100, label: "Prime Opportunity", color: "#22c55e" },
  { min: 80, max: 89, label: "Strong Buy", color: "#22c55e" },
  { min: 70, max: 79, label: "Confident Buy", color: "#22c55e" },
  { min: 60, max: 69, label: "Promising", color: "#eab308" },
  { min: 50, max: 59, label: "Moderate", color: "#eab308" },
  { min: 40, max: 49, label: "Cautious", color: "#eab308" },
  { min: 30, max: 39, label: "Risky", color: "#eab308" },
  { min: 20, max: 29, label: "Not Recommended", color: "#ef4444" },
  { min: 0, max: 19, label: "Avoid", color: "#ef4444" }
];

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

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const BuyGauge: React.FC<BuyGaugeProps> = ({ areSectionsOpen }) => {
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [currentScore, setCurrentScore] = useState(50);

  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  const getCurrentLevel = (score: number): GaugeLevel => {
    return GAUGE_LEVELS.find(level => score >= level.min && score <= level.max) || GAUGE_LEVELS[1];
  };

  const calculateRotation = (score: number) => {
    return (score * 1.8) - 90;
  };

  const currentLevel = getCurrentLevel(currentScore);
  const rotation = calculateRotation(currentScore);

  return (
    <div
      id="Buy Gauge"
      className={`items-center justify-start bg-[#1a1a1a] m-2 rounded-lg shadow-2xl ${
        isOpen ? "h-auto opacity-100" : "h-12"
      }`}
    >
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-t-lg shadow-xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "🔽  Buy Gauge" : "▶️  Buy Gauge"}
      </h1>

      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>
        <div className="w-full p-6 flex flex-col items-center">
          {/* SVG Gauge */}
          <div className="relative w-80 h-48">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <defs>
                {/* Metallic gradient for the outer ring */}
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
              {[0, 20, 40, 60, 80, 100].map((value) => {
                const angle = value * 1.8;
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
                      fontSize="11"
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
                {/* Needle shadow */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="35"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  transform="translate(1, 1)"
                />
                {/* Needle */}
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="35"
                  stroke="#ffffff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Center circle with metallic effect */}
                <circle
                  cx="100"
                  cy="100"
                  r="8"
                  fill="url(#metallic)"
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 3px rgb(0 0 0 / 0.4))"
                />
              </g>
            </svg>
          </div>

          {/* Score Display */}
          <div className="text-center mt-4 space-y-1">
            <div className="text-xl font-bold" style={{ color: currentLevel.color }}>
              {currentLevel.label}
            </div>
            <div className="text-base font-semibold text-gray-300">
              Score: {currentScore}/100
            </div>
          </div>

          {/* Temporary Score Controls */}
          <div className="flex items-center gap-4 mt-4">
            <button
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow transition-colors"
              onClick={() => setCurrentScore(Math.max(0, currentScore - 5))}
            >
              -
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={currentScore}
              onChange={(e) => setCurrentScore(Number(e.target.value))}
              className="w-40 h-2"
            />
            <button
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow transition-colors"
              onClick={() => setCurrentScore(Math.min(100, currentScore + 5))}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyGauge;