////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState, useEffect } from "react";
import importIcon from "data-base64:~../assets/importIcon.png";
import SuccessGif from "data-base64:~../assets/greenTick.gif";


////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants or variables defined at this point

////////////////////////////////////////////////
// Props and Types:
////////////////////////////////////////////////
interface ListingExportProps {
  areSectionsOpen: boolean;  // Add this prop
}

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
export const ListingExport: React.FC<ListingExportProps> = ({ areSectionsOpen }) => {
  // States for section visibility
  const [isOpen, setIsOpen] = useState(areSectionsOpen);
  const [isClicked, setIsClicked] = useState<boolean[]>([false, false, false, false]);

  // Sync visibility with the prop `areSectionsOpen`
  useEffect(() => {
    setIsOpen(areSectionsOpen);
  }, [areSectionsOpen]);

  //////////////////////////////////////////////////
  // Helper Functions:
  //////////////////////////////////////////////////
  // Handle button click actions (e.g., logging or adding temporary effects)
  const handleClick = (buttonLabel: string) => {
    console.log(`${buttonLabel} clicked`);
    // Any additional effect can be added here
  };

  //////////////////////////////////////////////////
  // Event Handlers:
  //////////////////////////////////////////////////
  const handleButtonClick = (index: number) => {
    const newIsClicked = [...isClicked];
    newIsClicked[index] = true;
    setIsClicked(newIsClicked);

    setTimeout(() => {
      newIsClicked[index] = false;
      setIsClicked([...newIsClicked]);
    }, 2000); // Revert after 2 seconds
  };

  // Toggle section visibility
  const toggleOpen = () => setIsOpen(!isOpen);


  //////////////////////////////////////////////////
  // JSX (Return):
  //////////////////////////////////////////////////

  return (
    <div
      id="Listing & Export"
      className={`items-center justify-start bg-[#d7d7d7] m-2 rounded-lg shadow-2xl ${isOpen ? "h-auto opacity-100" : "h-12"}`}
    >
      {/* Section Header */}
      <h1
        className="font-semibold text-black text-start !text-base cursor-pointer w-full px-2 py-1 bg-cyan-500 rounded-md shadow-xl"
        onClick={toggleOpen}
      >
        {isOpen ? "🔽  Listing & Export" : "▶️  Listing & Export"}
      </h1>

      <div className={`flex flex-col items-center gap-3 p-4 ${isOpen ? "block" : "hidden"}`}>

        {/* Button for each listing option */}
        {["Create Listing on Walmart", "Export All", "Export (Based on settings)", "Export to Software"].map((label, index) => (
          <button
            key={index}
            className="bg-white border-4 border-black rounded-lg text-black py-2 px-4 w-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            onClick={() => handleButtonClick(index)}
          >
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