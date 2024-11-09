import React from "react";

interface PricingBlockProps {
  label: string;
  content: string;
  backgroundColor: string;
  textColor: string;
}

const PricingBlock: React.FC<PricingBlockProps> = ({ label, content, backgroundColor, textColor }) => (
  <div className="w-full p-1">
    <p
      className="text-xs text-white text-center border-2 border-black p-1 rounded-t-lg shadow-md shadow-black flex items-center justify-center"
      style={{ backgroundColor, minHeight: "40px" }}
    >
      {label}
    </p>
    <p className={`text-xs text-center bg-white border-2 border-black p-1 w-full rounded-b-lg shadow-md shadow-black flex items-center justify-center ${textColor}`}
      style={{ minHeight: "40px" }} 
    >
      {content}
    </p>
  </div>
);

export default PricingBlock;
