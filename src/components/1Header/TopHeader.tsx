/**
 * @fileoverview Main header component that manages the top navigation and modals
 * @author NexSellPro
 * @created 2024-03-21
 * @lastModified 2024-03-21
 */

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
// No constants needed for this component

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// No additional types or interfaces needed for this component

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// No props needed for this component as it's self-contained

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const TopHeader: React.FC = () => {
  ////////////////////////////////////////////////
  // State and Hooks:
  ////////////////////////////////////////////////
  // State to control visibility of various modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);

  ////////////////////////////////////////////////
  // Event Handlers:
  ////////////////////////////////////////////////
  // Toggle settings modal and close other modals
  const handleSettingsToggle = (): void => {
    setIsSettingsOpen((prev) => !prev);
    if (isProfileOpen) setIsProfileOpen(false);
    if (isFeedbackOpen) setIsFeedbackOpen(false);
  };

  // Toggle profile modal and close other modals
  const handleProfileToggle = (): void => {
    setIsProfileOpen((prev) => !prev);
    if (isSettingsOpen) setIsSettingsOpen(false);
    if (isFeedbackOpen) setIsFeedbackOpen(false);
  };

  // Toggle feedback modal and close other modals
  const handleFeedbackToggle = (): void => {
    setIsFeedbackOpen((prev) => !prev);
    if (isSettingsOpen) setIsSettingsOpen(false);
    if (isProfileOpen) setIsProfileOpen(false);
  };

  ////////////////////////////////////////////////
  // Helper Functions:
  ////////////////////////////////////////////////
  // No helper functions needed for this component

  ////////////////////////////////////////////////
  // Styles:
  ////////////////////////////////////////////////
  // Header background and shadow styles
  const headerStyle = {
    background: 'linear-gradient(45deg, #2E2E2E, #212121)',
    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
  };

  // Logo shadow style
  const logoStyle = {
    filter: 'drop-shadow(8px 8px 20px rgba(0, 0, 0, 1))'
  };

  // Beta feedback button style
  const feedbackButtonStyle = { 
    background: 'linear-gradient(45deg, #4f46e5, #3b82f6)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  ////////////////////////////////////////////////
  // JSX:
  ////////////////////////////////////////////////
  return (
    <div
      id="header"
      className="flex flex-col text-white shadow-xl rounded-lg"
      style={headerStyle}
    >
      {/* Header Bar with Logo and Navigation Icons */}
      <div className="w-full flex items-center justify-between p-1">
        {/* Settings Button */}
        <button onClick={handleSettingsToggle} className="text-white pl-3">
          <IoSettingsOutline style={{ fontSize: "30px" }} />
        </button>

        {/* Center Logo */}
        <img
          src={headerImgBase64}
          alt="Header Logo"
          className="w-64"
          style={logoStyle}
        />

        {/* Profile Button */}
        <button onClick={handleProfileToggle} className="text-white pr-3">
          <LuCircleUserRound style={{ fontSize: "30px" }} />
        </button>
      </div>

      {/* Beta Feedback Button */}
      <div className="w-full flex justify-center -mt-1 mb-1">
        <button
          onClick={handleFeedbackToggle}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1 px-3 rounded-full flex items-center gap-1 transform transition-transform duration-200 hover:scale-105 shadow-lg"
          style={feedbackButtonStyle}
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

      {/* Feedback Form Modal */}
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
