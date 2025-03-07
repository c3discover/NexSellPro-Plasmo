import React, { useState } from 'react';
import { SubscriptionModal } from '../../components/1Header/SubscriptionModal';

export const PremiumButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all duration-200 shadow-sm"
      >
        <span className="text-yellow-300">★</span>
        <span className="font-medium">Premium</span>
        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">Soon</span>
      </button>

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default PremiumButton; 