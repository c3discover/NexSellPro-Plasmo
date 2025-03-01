////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import headerImgBase64 from "data-base64:~../assets/headerLogo.png";
import React, { useState } from "react";
import { SettingsModal } from "./Settings";
import { ProfileModal } from "./Profile";
import { LuCircleUserRound } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants or variables defined here.

////////////////////////////////////////////////
// Props and Types:
////////////////////////////////////////////////
// No props or types defined here.

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////

export const TopHeader: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  //////////////////////////////////////////////////
  // Helper Functions:
  //////////////////////////////////////////////////
  const handleSettingsToggle = (): void => {
    setIsSettingsOpen((prev) => !prev);
  };

  const handleProfileToggle = (): void => {
    setIsProfileOpen((prev) => !prev);
  };

  //////////////////////////////////////////////////
  // JSX (Return):
  //////////////////////////////////////////////////
  return (
    <div
      id="header"
      className="flex flex-col text-white shadow-xl rounded-lg"
      style={{
        background: 'linear-gradient(45deg, #2E2E2E, #212121)', // A dark gradient for texture
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)', // Adds depth like a countertop
      }}
    >
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between p-1">
        {/* Left Icon with more drastic drop shadow */}
        <button onClick={handleSettingsToggle} className="text-white pl-3">
          <IoSettingsOutline style={{ fontSize: "30px" }} />
        </button>

        {/* Center Logo with more drastic drop shadow */}
        <img
          src={headerImgBase64}
          alt="Header Logo"
          className="w-64"
          style={{ filter: 'drop-shadow(8px 8px 20px rgba(0, 0, 0, 1))' }} // Larger offset, darker shadow
        />

        {/* Right Icon with more drastic drop shadow */}
        <button onClick={handleProfileToggle} className="text-white pr-3">
          <LuCircleUserRound style={{ fontSize: "30px" }} />
        </button>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div
          className="w-full bg-white text-black p-4 mt-2 shadow-md rounded-b-lg"
          style={{
            fontSize: "12px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            position: "relative",
          }}
        >
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onSettingsChange={() => {
            }}
          />
        </div>
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <div
          className="w-full bg-white text-black p-4 mt-2 shadow-md rounded-b-lg"
          style={{
            fontSize: "12px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            position: "relative",
          }}
        >
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default TopHeader;
