////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import headerImgBase64 from "data-base64:../../../assets/headerLogo.png";
import React, { useState } from "react";
import { SettingsModal } from "../../components/1Header/Settings";
import { ProfileModal } from "../../components/1Header/Profile";
import { FeedbackForm } from "../../components/xBetaTesting/FeedbackForm";
import { LuCircleUserRound } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { MdFeedback } from "react-icons/md";

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
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);

  //////////////////////////////////////////////////
  // Helper Functions:
  //////////////////////////////////////////////////
  const handleSettingsToggle = (): void => {
    setIsSettingsOpen((prev) => !prev);
    if (isProfileOpen) setIsProfileOpen(false);
    if (isFeedbackOpen) setIsFeedbackOpen(false);
  };

  const handleProfileToggle = (): void => {
    setIsProfileOpen((prev) => !prev);
    if (isSettingsOpen) setIsSettingsOpen(false);
    if (isFeedbackOpen) setIsFeedbackOpen(false);
  };

  const handleFeedbackToggle = (): void => {
    setIsFeedbackOpen((prev) => !prev);
    if (isSettingsOpen) setIsSettingsOpen(false);
    if (isProfileOpen) setIsProfileOpen(false);
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

      {/* Beta Feedback Button */}
      <div className="w-full flex justify-center -mt-1 mb-1">
        <button
          onClick={handleFeedbackToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-3 rounded-full flex items-center gap-1 transform transition-transform duration-200 hover:scale-105 shadow-lg"
          style={{ 
            background: 'linear-gradient(45deg, #4f46e5, #3b82f6)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <MdFeedback size={14} />
          <span>Beta Feedback</span>
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

      {/* Feedback Form */}
      {isFeedbackOpen && (
        <FeedbackForm
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
        />
      )}
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default TopHeader;
