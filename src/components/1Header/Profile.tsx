import React, { useState } from "react";
import { SubscriptionModal } from '../../components/1Header/SubscriptionModal';
import { LuCircleUserRound } from "react-icons/lu";
import { IoStarOutline } from "react-icons/io5";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-lg">
      {/* Profile Header */}
      <div className="flex items-center justify-center mb-6">
        <LuCircleUserRound className="w-16 h-16 text-gray-400" />
      </div>
      
      {/* Profile Status */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Guest User</h2>
        <p className="text-sm text-gray-600 mt-1">Free Plan</p>
      </div>

      {/* Premium Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsSubscriptionModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 shadow-sm"
        >
          <IoStarOutline className="w-5 h-5 text-yellow-300" />
          <span className="font-medium">Upgrade to Premium</span>
          <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Soon</span>
        </button>
      </div>

      {/* Quick Links */}
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

export default ProfileModal;
