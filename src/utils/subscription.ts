/**
 * Subscription and Premium Features Management
 */

export interface SubscriptionTier {
  name: string;
  features: string[];
  requestsPerMinute: number;
  analysisDepth: 'basic' | 'advanced' | 'premium';
}

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

class SubscriptionService {
  private static instance: SubscriptionService;
  private currentTier: string = 'free';

  private constructor() {}

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Get current subscription tier
   */
  async getCurrentTier(): Promise<SubscriptionTier> {
    // Get subscription status from chrome.storage
    const result = await chrome.storage.sync.get(['subscriptionTier']);
    this.currentTier = result.subscriptionTier || 'free';
    return SUBSCRIPTION_TIERS[this.currentTier];
  }

  /**
   * Check if a feature is available in current tier
   */
  async canUseFeature(feature: string): Promise<boolean> {
    const currentTier = await this.getCurrentTier();
    return currentTier.features.includes(feature);
  }

  /**
   * Get rate limit for current tier
   */
  async getRateLimit(): Promise<number> {
    const currentTier = await this.getCurrentTier();
    return currentTier.requestsPerMinute;
  }

  /**
   * Get analysis depth for current tier
   */
  async getAnalysisDepth(): Promise<'basic' | 'advanced' | 'premium'> {
    const currentTier = await this.getCurrentTier();
    return currentTier.analysisDepth;
  }

  /**
   * Update subscription tier
   */
  async updateTier(newTier: string): Promise<void> {
    if (!SUBSCRIPTION_TIERS[newTier]) {
      throw new Error('Invalid subscription tier');
    }
    await chrome.storage.sync.set({ subscriptionTier: newTier });
    this.currentTier = newTier;
  }

  /**
   * Check if user needs to upgrade for a feature
   */
  async checkUpgradeNeeded(feature: string): Promise<boolean> {
    const canUse = await this.canUseFeature(feature);
    return !canUse;
  }
}

export const subscriptionService = SubscriptionService.getInstance();
export default subscriptionService; 