/**
 * @fileoverview Profile modal component that displays user information and premium upgrade options
 * @author NexSellPro
 * @created 2024-03-21
 * @lastModified 2024-03-21
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useState } from "react";
import { SubscriptionModal } from '../../components/1Header/SubscriptionModal';
import { LuCircleUserRound } from "react-icons/lu";
import { IoStarOutline } from "react-icons/io5";

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// No constants needed for this component

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Separate interface for the premium button props if needed elsewhere
interface PremiumButtonProps {
  onClick: () => void;
}

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// Props interface defined above in Types and Interfaces section

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////

// Internal Premium Button Component
const PremiumButton: React.FC<PremiumButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 shadow-sm"
  >
    <IoStarOutline className="w-5 h-5 text-yellow-300" />
    <span className="font-medium">Upgrade to Premium</span>
    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Soon</span>
  </button>
);

// Main Profile Modal Component
export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  ////////////////////////////////////////////////
  // State and Hooks:
  ////////////////////////////////////////////////
  // State to control the visibility of the subscription modal
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  ////////////////////////////////////////////////
  // Event Handlers:
  ////////////////////////////////////////////////
  // Handler for opening the subscription modal
  const handlePremiumClick = () => {
    setIsSubscriptionModalOpen(true);
  };

  ////////////////////////////////////////////////
  // Helper Functions:
  ////////////////////////////////////////////////
  // Early return if modal is not open
  if (!isOpen) return null;

  ////////////////////////////////////////////////
  // Styles:
  ////////////////////////////////////////////////
  // Styles are handled through Tailwind classes

  ////////////////////////////////////////////////
  // JSX:
  ////////////////////////////////////////////////
  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-lg">
      {/* Profile Header - User Icon */}
      <div className="flex items-center justify-center mb-6">
        <LuCircleUserRound className="w-16 h-16 text-gray-400" />
      </div>
      
      {/* Profile Status - User Type and Plan */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Guest User</h2>
        <p className="text-sm text-gray-600 mt-1">Free Plan</p>
      </div>

      {/* Premium Upgrade Button */}
      <div className="mb-6">
        <PremiumButton onClick={handlePremiumClick} />
      </div>

      {/* Quick Links Section */}
      <div className="space-y-2">
        <a
          href="https://www.nexsellpro.com/contact/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors block"
        >
          📧 Contact Support
        </a>
        <a
          href="mailto:feedback@nexsellpro.com"
          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors block"
        >
          📝 Send Feedback
        </a>
        <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          ❓ Help Center
        </button>
        <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          ⚙️ Settings
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="mt-6 w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-300"
      >
        Close
      </button>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />
    </div>
  );
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default ProfileModal;
