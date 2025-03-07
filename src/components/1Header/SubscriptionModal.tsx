import React, { useState } from 'react';
import { SUBSCRIPTION_TIERS } from '../../utils/subscription';
import type { SubscriptionTier } from '../../utils/subscription';
import subscriptionService from '../../utils/subscription';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentTier] = useState<SubscriptionTier>(SUBSCRIPTION_TIERS.free);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Premium Features - Coming Soon!</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-cyan-600 font-semibold text-lg">
            We're currently in beta testing. Premium features will be available soon!
          </p>
          <p className="text-gray-600 mt-2">
            Sign up for our newsletter to be notified when premium features launch.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
            <div
              key={key}
              className={`border rounded-lg p-6 ${
                key === 'free'
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="relative">
                <h3 className="text-xl font-bold mb-4">{tier.name}</h3>
                {key !== 'free' && (
                  <span className="absolute top-0 right-0 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                )}
              </div>
              
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <button
                  disabled={true}
                  className={`w-full py-2 px-4 rounded-lg ${
                    key === 'free'
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white opacity-75'
                  }`}
                >
                  {key === 'free' ? 'Current Plan' : 'Coming Soon'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p className="font-semibold">Beta Testing Phase</p>
          <p className="mt-2">
            Have feedback or feature requests? Contact us at{' '}
            <a
              href="mailto:feedback@nexsellpro.com"
              className="text-cyan-500 hover:text-cyan-600"
            >
              feedback@nexsellpro.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal; 