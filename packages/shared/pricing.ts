// Subscription Plans & Pricing Configuration
// Centralized pricing logic for all services

export type PlanTier = 'free' | 'pro' | 'enterprise';
export type BillingInterval = 'month' | 'year';

export interface PlanFeatures {
  // Storage & Limits
  maxNotes: number;
  maxAnnotationsPerNote: number;
  maxStorageGB: number;
  maxTeamMembers: number;
  maxOrganizations: number;

  // Features
  advancedSearch: boolean;
  customTags: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  sso: boolean;
  auditLogs: boolean;
  prioritySupport: boolean;
  customBranding: boolean;

  // Collaboration
  realtimeCollaboration: boolean;
  sharedWorkspaces: boolean;
  commentThreads: boolean;
  versionHistory: boolean;

  // AI & Analytics
  aiSummaries: boolean;
  smartSuggestions: boolean;
  analyticsReports: boolean;
  exportFormats: string[];

  // Technical
  uptime: string;
  rateLimit: number; // requests per minute
  dataRetention: number; // days
}

export interface PlanPrice {
  monthly: number; // USD
  yearly: number; // USD
  yearlyMonthly: number; // Monthly equivalent when billed yearly
  yearlySavings: number; // Percentage saved
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
}

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  description: string;
  tagline: string;
  popular: boolean;
  price: PlanPrice;
  features: PlanFeatures;
  trialDays: number;
}

// Stripe Product and Price IDs (replace with your actual IDs)
export const STRIPE_PRODUCT_IDS = {
  free: process.env.STRIPE_PRODUCT_FREE || 'prod_free',
  pro: process.env.STRIPE_PRODUCT_PRO || 'prod_pro',
  enterprise: process.env.STRIPE_PRODUCT_ENTERPRISE || 'prod_enterprise',
} as const;

export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || 'price_pro_yearly',
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
  enterprise_yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
} as const;

// Subscription Plans
export const PLANS: Record<PlanTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for individual note-takers getting started',
    tagline: 'Start organizing your notes',
    popular: false,
    price: {
      monthly: 0,
      yearly: 0,
      yearlyMonthly: 0,
      yearlySavings: 0,
      stripePriceIdMonthly: '',
      stripePriceIdYearly: '',
    },
    features: {
      maxNotes: 100,
      maxAnnotationsPerNote: 50,
      maxStorageGB: 1,
      maxTeamMembers: 1,
      maxOrganizations: 1,

      advancedSearch: false,
      customTags: true,
      apiAccess: false,
      webhooks: false,
      sso: false,
      auditLogs: false,
      prioritySupport: false,
      customBranding: false,

      realtimeCollaboration: false,
      sharedWorkspaces: false,
      commentThreads: true,
      versionHistory: false,

      aiSummaries: false,
      smartSuggestions: false,
      analyticsReports: false,
      exportFormats: ['markdown', 'txt'],

      uptime: '99%',
      rateLimit: 60,
      dataRetention: 30,
    },
    trialDays: 0,
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and small teams who need more power',
    tagline: 'Unlock advanced features',
    popular: true,
    price: {
      monthly: 12,
      yearly: 120,
      yearlyMonthly: 10,
      yearlySavings: 17, // (144-120)/144 * 100
      stripePriceIdMonthly: STRIPE_PRICE_IDS.pro_monthly,
      stripePriceIdYearly: STRIPE_PRICE_IDS.pro_yearly,
    },
    features: {
      maxNotes: 10000,
      maxAnnotationsPerNote: 500,
      maxStorageGB: 50,
      maxTeamMembers: 10,
      maxOrganizations: 3,

      advancedSearch: true,
      customTags: true,
      apiAccess: true,
      webhooks: true,
      sso: false,
      auditLogs: false,
      prioritySupport: true,
      customBranding: false,

      realtimeCollaboration: true,
      sharedWorkspaces: true,
      commentThreads: true,
      versionHistory: true,

      aiSummaries: true,
      smartSuggestions: true,
      analyticsReports: true,
      exportFormats: ['markdown', 'txt', 'pdf', 'docx', 'html'],

      uptime: '99.9%',
      rateLimit: 300,
      dataRetention: 365,
    },
    trialDays: 14,
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    tagline: 'Maximum power and control',
    popular: false,
    price: {
      monthly: 49,
      yearly: 490,
      yearlyMonthly: 41,
      yearlySavings: 17, // (588-490)/588 * 100
      stripePriceIdMonthly: STRIPE_PRICE_IDS.enterprise_monthly,
      stripePriceIdYearly: STRIPE_PRICE_IDS.enterprise_yearly,
    },
    features: {
      maxNotes: -1, // Unlimited
      maxAnnotationsPerNote: -1, // Unlimited
      maxStorageGB: -1, // Unlimited
      maxTeamMembers: -1, // Unlimited
      maxOrganizations: -1, // Unlimited

      advancedSearch: true,
      customTags: true,
      apiAccess: true,
      webhooks: true,
      sso: true,
      auditLogs: true,
      prioritySupport: true,
      customBranding: true,

      realtimeCollaboration: true,
      sharedWorkspaces: true,
      commentThreads: true,
      versionHistory: true,

      aiSummaries: true,
      smartSuggestions: true,
      analyticsReports: true,
      exportFormats: ['markdown', 'txt', 'pdf', 'docx', 'html', 'json', 'xml'],

      uptime: '99.99%',
      rateLimit: 1000,
      dataRetention: -1, // Unlimited
    },
    trialDays: 30,
  },
};

// Usage-based add-ons (optional)
export interface UsageAddon {
  id: string;
  name: string;
  description: string;
  unit: string;
  unitPrice: number; // USD
  includedInPro: number;
  includedInEnterprise: number;
  stripePriceId: string;
}

export const USAGE_ADDONS: Record<string, UsageAddon> = {
  extra_storage: {
    id: 'extra_storage',
    name: 'Extra Storage',
    description: 'Additional storage beyond plan limits',
    unit: 'GB',
    unitPrice: 0.1,
    includedInPro: 50,
    includedInEnterprise: -1,
    stripePriceId: process.env.STRIPE_PRICE_EXTRA_STORAGE || 'price_storage',
  },
  extra_team_members: {
    id: 'extra_team_members',
    name: 'Extra Team Members',
    description: 'Additional team seats',
    unit: 'user',
    unitPrice: 5,
    includedInPro: 10,
    includedInEnterprise: -1,
    stripePriceId: process.env.STRIPE_PRICE_EXTRA_USERS || 'price_users',
  },
  ai_requests: {
    id: 'ai_requests',
    name: 'AI Requests',
    description: 'Additional AI summary/suggestion requests',
    unit: 'request',
    unitPrice: 0.01,
    includedInPro: 1000,
    includedInEnterprise: -1,
    stripePriceId: process.env.STRIPE_PRICE_AI_REQUESTS || 'price_ai',
  },
};

// Helper functions
export function getPlan(tier: PlanTier): SubscriptionPlan {
  return PLANS[tier];
}

export function getPlanPrice(tier: PlanTier, interval: BillingInterval): number {
  const plan = PLANS[tier];
  return interval === 'month' ? plan.price.monthly : plan.price.yearly;
}

export function getStripePriceId(tier: PlanTier, interval: BillingInterval): string {
  const plan = PLANS[tier];
  return interval === 'month' ? plan.price.stripePriceIdMonthly : plan.price.stripePriceIdYearly;
}

export function canAccessFeature(userPlan: PlanTier, feature: keyof PlanFeatures): boolean {
  const plan = PLANS[userPlan];
  const featureValue = plan.features[feature];

  // Handle boolean features
  if (typeof featureValue === 'boolean') {
    return featureValue;
  }

  // Handle numeric limits (-1 means unlimited)
  if (typeof featureValue === 'number') {
    return featureValue === -1 || featureValue > 0;
  }

  // Handle arrays (export formats, etc.)
  if (Array.isArray(featureValue)) {
    return featureValue.length > 0;
  }

  return true;
}

export function isWithinLimit(
  userPlan: PlanTier,
  limitKey: keyof PlanFeatures,
  currentValue: number
): boolean {
  const plan = PLANS[userPlan];
  const limit = plan.features[limitKey];

  if (typeof limit !== 'number') return true;
  if (limit === -1) return true; // Unlimited

  return currentValue < limit;
}

export function getRemainingQuota(
  userPlan: PlanTier,
  limitKey: keyof PlanFeatures,
  currentValue: number
): number {
  const plan = PLANS[userPlan];
  const limit = plan.features[limitKey];

  if (typeof limit !== 'number') return -1;
  if (limit === -1) return -1; // Unlimited

  return Math.max(0, limit - currentValue);
}

export function getUpgradePath(currentTier: PlanTier): PlanTier[] {
  const tiers: PlanTier[] = ['free', 'pro', 'enterprise'];
  const currentIndex = tiers.indexOf(currentTier);
  return tiers.slice(currentIndex + 1);
}

export function getDowngradePath(currentTier: PlanTier): PlanTier[] {
  const tiers: PlanTier[] = ['free', 'pro', 'enterprise'];
  const currentIndex = tiers.indexOf(currentTier);
  return tiers.slice(0, currentIndex).reverse();
}

export function calculateProration(
  currentTier: PlanTier,
  newTier: PlanTier,
  interval: BillingInterval,
  daysRemaining: number
): number {
  const currentPrice = getPlanPrice(currentTier, interval);
  const newPrice = getPlanPrice(newTier, interval);
  const totalDays = interval === 'month' ? 30 : 365;

  const unusedCredit = (currentPrice / totalDays) * daysRemaining;
  const newCharge = (newPrice / totalDays) * daysRemaining;

  return newCharge - unusedCredit;
}

// Feature comparison matrix for UI
export interface FeatureComparison {
  category: string;
  features: {
    name: string;
    free: string | boolean;
    pro: string | boolean;
    enterprise: string | boolean;
    tooltip?: string;
  }[];
}

export const FEATURE_COMPARISON: FeatureComparison[] = [
  {
    category: 'Storage & Limits',
    features: [
      {
        name: 'Notes',
        free: '100',
        pro: '10,000',
        enterprise: 'Unlimited',
        tooltip: 'Maximum number of notes you can create',
      },
      {
        name: 'Annotations per Note',
        free: '50',
        pro: '500',
        enterprise: 'Unlimited',
      },
      {
        name: 'Storage',
        free: '1 GB',
        pro: '50 GB',
        enterprise: 'Unlimited',
      },
      {
        name: 'Team Members',
        free: '1',
        pro: '10',
        enterprise: 'Unlimited',
      },
    ],
  },
  {
    category: 'Core Features',
    features: [
      { name: 'Advanced Search', free: false, pro: true, enterprise: true },
      { name: 'API Access', free: false, pro: true, enterprise: true },
      { name: 'Webhooks', free: false, pro: true, enterprise: true },
      { name: 'Custom Branding', free: false, pro: false, enterprise: true },
      { name: 'SSO', free: false, pro: false, enterprise: true },
      { name: 'Audit Logs', free: false, pro: false, enterprise: true },
    ],
  },
  {
    category: 'Collaboration',
    features: [
      { name: 'Real-time Collaboration', free: false, pro: true, enterprise: true },
      { name: 'Shared Workspaces', free: false, pro: true, enterprise: true },
      { name: 'Version History', free: false, pro: true, enterprise: true },
      { name: 'Comment Threads', free: true, pro: true, enterprise: true },
    ],
  },
  {
    category: 'AI & Analytics',
    features: [
      { name: 'AI Summaries', free: false, pro: true, enterprise: true },
      { name: 'Smart Suggestions', free: false, pro: true, enterprise: true },
      { name: 'Analytics Reports', free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Email Support', free: true, pro: true, enterprise: true },
      { name: 'Priority Support', free: false, pro: true, enterprise: true },
      { name: 'Uptime SLA', free: '99%', pro: '99.9%', enterprise: '99.99%' },
    ],
  },
];

// Export all for external use
export default PLANS;
