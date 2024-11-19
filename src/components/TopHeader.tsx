import headerImgBase64 from "data-base64:~../assets/headerLogo.png";
import React, { useState } from "react";
import { SettingsModal } from "./Settings";

export const TopHeader: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const handleSettingsToggle = (): void => {
    setIsSettingsOpen((prev) => !prev);
  };

  return (
    <div
      id="header"
      className="flex flex-col text-white shadow-xl rounded-b-lg"
      style={{
        background: 'linear-gradient(145deg, #3a3f47, #2f3238)', // A dark gradient for texture
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)', // Adds depth like a countertop
      }}
    >
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between p-4">
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
        <div
          className="text-4xl p-0 m-0 hover:text-gray-400 transition duration-300 ease-in-out"
          style={{ filter: 'drop-shadow(8px 8px 15px rgba(0, 0, 0, 1))' }} // Larger offset, darker shadow
        >
          Ⓜ️
        </div>
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
    </div>
  );
};

export default TopHeader;
