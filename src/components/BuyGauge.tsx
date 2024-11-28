import React, { useState, useEffect } from "react";
import GaugeImgBase64 from "data-base64:~../assets/Gauge.jpg"

interface BuyGaugeProps {
  areSectionsOpen: boolean;  // Add this prop
}

export const BuyGauge: React.FC<BuyGaugeProps> = ({ areSectionsOpen }) => {
  const [isOpen, setIsOpen] = useState(areSectionsOpen);

  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div
      id="Buy Gauge"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "🔽  Buy Gauge" : "▶️  Buy Gauge"}
      </h1>

      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>
        <div id="BuyGauge" className="flex items-center justify-center p-4 w-full">
          <div className="m-4 p-1 pl-8 pr-8 bg-[#3a3f47] flex flex-col items-center justify-center">
            <img src={GaugeImgBase64} alt="Gadgeo" width={180} />
            <p>coming soon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
