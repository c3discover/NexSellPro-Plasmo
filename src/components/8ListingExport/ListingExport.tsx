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
  "Export (Based on settings)",
  "Export All",
  "Create Listing on Walmart"
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
  const [isClicked, setIsClicked] = useState<boolean[]>([false, false, false]);

  // Add new state for the info message
  const [showWalmartMessage, setShowWalmartMessage] = useState(false);

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

  // Add handler for Walmart button click
  const handleWalmartClick = () => {
    console.log('Walmart button clicked');
    setShowWalmartMessage(true);
    console.log('Message state set to true');
    setTimeout(() => {
      console.log('Timeout triggered, setting message to false');
      setShowWalmartMessage(false);
    }, 3000);
  };

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
      className={`bg-[#d7d7d7] m-1 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isOpen ? "h-auto opacity-100" : "h-9"
      }`}
    >
      {/* Section Header with expand/collapse functionality */}
      <h1
        className="font-medium text-[12px] text-black text-start cursor-pointer w-full px-2 py-1 bg-cyan-500 flex items-center justify-between group hover:bg-cyan-600 transition-colors"
        onClick={toggleOpen}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{isOpen ? "▾" : "▸"}</span>
          Listing & Export (Coming Soon)
        </div>
      </h1>

      {/* Container for export option buttons */}
      <div className={`flex flex-col items-center gap-3 p-1 ${isOpen ? "block" : "hidden"}`}>
        {/* Map over export options to create buttons */}
        {EXPORT_OPTIONS.map((label, index) => (
          <div key={index} className="w-full">
            <button
              className={`bg-white border-4 border-black rounded-lg text-black py-2 px-4 w-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                label === "Create Listing on Walmart" 
                  ? "opacity-50 cursor-not-allowed hover:scale-100" 
                  : ""
              }`}
              onClick={() => {
                console.log('Button clicked:', label);
                if (label === "Create Listing on Walmart") {
                  handleWalmartClick();
                } else {
                  handleButtonClick(index);
                }
              }}
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
            {/* Show message for Walmart button */}
            {showWalmartMessage && label === "Create Listing on Walmart" && (
              <div className="mt-2 p-2 bg-cyan-50 border border-cyan-200 rounded-lg text-xs text-cyan-800">
                This feature will be available when you connect your Walmart API credentials. Coming soon to NexSellPro!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default ListingExport;