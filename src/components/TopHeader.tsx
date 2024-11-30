////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import headerImgBase64 from "data-base64:~../assets/headerLogo.png";
import profileIconBase64 from "data-base64:~../assets/profileIcon.png";
import React, { useState } from "react";
import { SettingsModal } from "./Settings";
import { ProfileModal } from "./Profile";

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
        background: 'linear-gradient(145deg, #3a3f47, #2f3238)', // A dark gradient for texture
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)', // Adds depth like a countertop
      }}
    >
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between p-4 pt-5">
        {/* Left Icon with more drastic drop shadow */}
        <div
          className="text-2xs p-0 m-0 hover:text-gray-400 transition duration-300 ease-in-out"
          style={{ filter: 'drop-shadow(8px 8px 15px rgba(0, 0, 0, 1))' }} // Larger offset, darker shadow
        >
          <button onClick={handleSettingsToggle} className="text-white text-2xl">
            ⚙️
          </button>
        </div>

        {/* Center Logo with more drastic drop shadow */}
        <img
          src={headerImgBase64}
          alt="Header Logo"
          className="w-48"
          style={{ filter: 'drop-shadow(8px 8px 20px rgba(0, 0, 0, 1))' }} // Larger offset, darker shadow
        />

        {/* Right Icon with more drastic drop shadow */}
        <button onClick={handleProfileToggle} className="text-white text-2xl">
          <img
            src={profileIconBase64}
            alt="Profile Icon"
            className="w-8 h-8 rounded-full"
            style={{ filter: 'drop-shadow(8px 8px 15px rgba(0, 0, 0, 1))' }} // Larger offset, darker shadow
          />
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
