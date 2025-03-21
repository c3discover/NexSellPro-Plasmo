/**
 * @fileoverview Component for handling product listing creation and data export functionality
 * @author NexSellPro
 * @created 2024-03-07
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
// Import icons and animations for the buttons
import importIcon from "data-base64:../../../assets/importIcon.png";
import SuccessGif from "data-base64:../../../assets/greenTick.gif";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Array of button labels for the export options
const EXPORT_OPTIONS = [
  "Create Listing on Walmart",
  "Export All",
  "Export (Based on settings)",
  "Export to Software"
];

// Animation duration in milliseconds
const SUCCESS_ANIMATION_DURATION = 2000;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Props interface for the ListingExport component
interface ListingExportProps {
  areSectionsOpen: boolean;  // Controls whether all sections are expanded/collapsed
}

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// Using ListingExportProps defined above

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const ListingExport: React.FC<ListingExportProps> = ({ areSectionsOpen }) => {

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
  // Controls the expansion/collapse state of this section
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  
  // Tracks which buttons have been clicked for showing success animation
  // Array of booleans corresponding to each export option button
  const [isClicked, setIsClicked] = useState<boolean[]>([false, false, false, false]);

  // Effect to sync the section's open state with the global sections state
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

////////////////////////////////////////////////
// Chrome API Handlers:
////////////////////////////////////////////////
// No Chrome API handlers needed for this component yet

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////
  // Handles the click event for each export option button
  const handleButtonClick = (index: number) => {
    // Create a copy of the click states array
    const newIsClicked = [...isClicked];
    // Set the clicked button's state to true
    newIsClicked[index] = true;
    setIsClicked(newIsClicked);

    // Reset the button's state after animation completes
    setTimeout(() => {
      newIsClicked[index] = false;
      setIsClicked([...newIsClicked]);
    }, SUCCESS_ANIMATION_DURATION);
  };

  // Toggles the section's expanded/collapsed state
  const toggleOpen = () => setIsOpen(!isOpen);

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
  // Placeholder for future implementation of export/listing functionality
  const handleClick = (buttonLabel: string) => {
    // Future implementation will go here
    // Could include:
    // - API calls to Walmart
    // - Data export logic
    // - Integration with other software
  };

////////////////////////////////////////////////
// Styles:
////////////////////////////////////////////////
// Styles are handled via Tailwind CSS classes in the JSX

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
  return (
    <div
      id="Listing & Export"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      {/* Section Header with expand/collapse functionality */}
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "🔽  Listing & Export (Coming Soon)" : "▶️  Listing & Export (Coming Soon)"}
      </h1>

      {/* Container for export option buttons */}
      <div className={`flex flex-col items-center gap-3 p-4 ${isOpen ? "block" : "hidden"}`}>
        {/* Map over export options to create buttons */}
        {EXPORT_OPTIONS.map((label, index) => (
          <button
            key={index}
            className="bg-white border-4 border-black rounded-lg text-black py-2 px-4 w-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            onClick={() => handleButtonClick(index)}
          >
            {/* Show success animation when clicked, otherwise show normal button state */}
            {isClicked[index] ? (
              <img src={SuccessGif} alt="Success" className="w-6 h-6" />
            ) : (
              <>
                <img src={importIcon} alt="Import Icon" width={20} className="mr-2" />
                {label}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default ListingExport;