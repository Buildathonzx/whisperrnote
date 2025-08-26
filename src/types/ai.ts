export enum AIMode {
  STANDARD = "standard",
  CREATIVE = "creative", 
  ULTRA = "ultra"
}

export enum SubscriptionTier {
  FREE = "free",
  PRO = "pro",
  PRO_PLUS = "pro+"
}

export interface AIConfig {
  mode: AIMode;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  expiresAt?: string;
  features: string[];
}

export const AI_MODE_CONFIG: Record<AIMode, AIConfig> = {
  [AIMode.STANDARD]: {
    mode: AIMode.STANDARD,
    temperature: 0.3,
    maxTokens: 1000,
    model: "gpt-3.5-turbo"
  },
  [AIMode.CREATIVE]: {
    mode: AIMode.CREATIVE,
    temperature: 0.8,
    maxTokens: 2000,
    model: "gpt-4"
  },
  [AIMode.ULTRA]: {
    mode: AIMode.ULTRA,
    temperature: 0.9,
    maxTokens: 4000,
    model: "gpt-4-turbo"
  }
};

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, string[]> = {
  [SubscriptionTier.FREE]: [
    AIMode.STANDARD
  ],
  [SubscriptionTier.PRO]: [
    AIMode.STANDARD,
    AIMode.CREATIVE
  ],
  [SubscriptionTier.PRO_PLUS]: [
    AIMode.STANDARD,
    AIMode.CREATIVE,
    AIMode.ULTRA
  ]
};

export function canUseAIMode(userTier: SubscriptionTier, mode: AIMode): boolean {
  return SUBSCRIPTION_FEATURES[userTier].includes(mode);
}

export function getAIModeDisplayName(mode: AIMode): string {
  switch (mode) {
    case AIMode.STANDARD:
      return "Standard";
    case AIMode.CREATIVE:
      return "Creative";
    case AIMode.ULTRA:
      return "Ultra";
    default:
      return "Standard";
  }
}

export function getAIModeDescription(mode: AIMode): string {
  switch (mode) {
    case AIMode.STANDARD:
      return "Balanced AI responses for everyday use";
    case AIMode.CREATIVE:
      return "More creative and varied AI responses";
    case AIMode.ULTRA:
      return "Most advanced AI with highest creativity";
    default:
      return "Balanced AI responses for everyday use";
  }
}