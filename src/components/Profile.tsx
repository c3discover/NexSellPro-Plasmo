import React from "react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-lg text-center">
      <h2 className="text-xl font-bold mb-4">Profile</h2>
      <p>Coming Soon...</p>
      <button
        onClick={onClose}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
      >
        Close
      </button>
    </div>
  );
};

export default ProfileModal;
