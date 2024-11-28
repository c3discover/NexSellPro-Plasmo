import React, { useState, useEffect } from "react";

interface ListingExportProps {
  areSectionsOpen: boolean;  // Add this prop
}

export const ListingExport: React.FC<ListingExportProps> = ({ areSectionsOpen }) => {
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
    useEffect(() => {
      setIsOpen(areSectionsOpen);
    }, [areSectionsOpen]);
  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <div
      id="Listing & Export"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "🔽  Listing & Export" : "▶️  Listing & Export"}
      </h1>

      <div className={`flex flex-wrap ${isOpen ? "block" : "hidden"}`}>
        
        
        <button className="flex items-center justify-center flex-row">
          <span className="text-xl">⬆️</span>
          <span className="bg-[#08a0e6] p-1   w-[200px] block">
            Create Listing on Walmart
          </span>
        </button>
        <button className="flex items-center justify-center flex-row">
          <span className="text-xl">⬆️</span>
          <span className="bg-[#08a0e6] p-1   w-[200px] block">Export All</span>
        </button>
        <button className="flex items-center justify-center flex-row">
          <span className="text-xl">⬆️</span>
          <span className="bg-[#08a0e6] p-1   w-[200px] block">
            Export (Based on settings)
          </span>
        </button>
        <button className="flex items-center justify-center flex-row">
          <span className="text-xl">⬆️</span>
          <span className="bg-[#08a0e6] p-1   w-[200px] block">
            Export to Software
          </span>
        </button>
      </div>
    </div>
  )
}
