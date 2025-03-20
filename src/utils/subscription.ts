/**
 * @fileoverview Subscription and Premium Features Management
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No external imports needed

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Interface defining a subscription tier's properties
 */
export interface SubscriptionTier {
  name: string;                    // Display name of the tier
  features: string[];             // List of features available in this tier
  requestsPerMinute: number;      // API rate limit for this tier
  analysisDepth: 'basic' | 'advanced' | 'premium';  // Level of analysis available
}

////////////////////////////////////////////////
// Constants:
////////////////////////////////////////////////

/**
 * Available subscription tiers and their features
 */
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    name: 'Free',
    features: [
      'Basic profit calculations',
      'Simple product analysis',
      'Limited daily searches',
      'Basic buy/skip recommendations'
    ],
    requestsPerMinute: 10,
    analysisDepth: 'basic'
  },
  pro: {
    name: 'Pro',
    features: [
      'Advanced profit calculations',
      'Detailed market analysis',
      'Unlimited searches',
      'Advanced buy/skip recommendations',
      'Variant analysis',
      'Data export',
      'Priority support'
    ],
    requestsPerMinute: 30,
    analysisDepth: 'advanced'
  },
  enterprise: {
    name: 'Enterprise',
    features: [
      'All Pro features',
      'Bulk analysis',
      'Custom metrics',
      'API access',
      'Team management',
      'White-label options',
      'Dedicated support'
    ],
    requestsPerMinute: 60,
    analysisDepth: 'premium'
  }
};

////////////////////////////////////////////////
// Main Class:
////////////////////////////////////////////////

/**
 * Singleton service for managing subscription features and tiers
 */
class SubscriptionService {
  private static instance: SubscriptionService;
  private currentTier: string = 'free';

  private constructor() {}

  /**
   * Get the singleton instance of SubscriptionService
   * @returns The singleton instance
   */
  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Get the current subscription tier details
   * @returns Promise resolving to the current subscription tier
   */
  async getCurrentTier(): Promise<SubscriptionTier> {
    // Get subscription status from chrome.storage
    const result = await chrome.storage.sync.get(['subscriptionTier']);
    this.currentTier = result.subscriptionTier || 'free';
    return SUBSCRIPTION_TIERS[this.currentTier];
  }

  /**
   * Check if a specific feature is available in the current tier
   * @param feature - The feature to check
   * @returns Promise resolving to whether the feature is available
   */
  async canUseFeature(feature: string): Promise<boolean> {
    const currentTier = await this.getCurrentTier();
    return currentTier.features.includes(feature);
  }

  /**
   * Get the rate limit for the current tier
   * @returns Promise resolving to the rate limit (requests per minute)
   */
  async getRateLimit(): Promise<number> {
    const currentTier = await this.getCurrentTier();
    return currentTier.requestsPerMinute;
  }

  /**
   * Get the analysis depth level for the current tier
   * @returns Promise resolving to the analysis depth level
   */
  async getAnalysisDepth(): Promise<'basic' | 'advanced' | 'premium'> {
    const currentTier = await this.getCurrentTier();
    return currentTier.analysisDepth;
  }

  /**
   * Update the user's subscription tier
   * @param newTier - The new tier to set
   * @throws Error if the tier is invalid
   */
  async updateTier(newTier: string): Promise<void> {
    if (!SUBSCRIPTION_TIERS[newTier]) {
      throw new Error('Invalid subscription tier');
    }
    await chrome.storage.sync.set({ subscriptionTier: newTier });
    this.currentTier = newTier;
  }

  /**
   * Check if the user needs to upgrade to use a specific feature
   * @param feature - The feature to check
   * @returns Promise resolving to whether an upgrade is needed
   */
  async checkUpgradeNeeded(feature: string): Promise<boolean> {
    const canUse = await this.canUseFeature(feature);
    return !canUse;
  }
}

////////////////////////////////////////////////
// Exports:
////////////////////////////////////////////////
export const subscriptionService = SubscriptionService.getInstance();
export default subscriptionService; 