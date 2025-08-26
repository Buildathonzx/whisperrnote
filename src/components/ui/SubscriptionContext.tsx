"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SubscriptionTier, UserSubscription } from '@/types/ai';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  subscription: UserSubscription;
  userTier: SubscriptionTier;
  isLoading: boolean;
  upgradeToTier: (tier: SubscriptionTier) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: SubscriptionTier.FREE,
    features: ['standard']
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      if (isAuthenticated && user) {
        try {
          // TODO: Replace with actual subscription API call
          // For now, check user preferences or a subscription field
          const userTier = user.prefs?.subscriptionTier || SubscriptionTier.FREE;
          const features = getFeaturesByTier(userTier);
          
          setSubscription({
            tier: userTier,
            features,
            expiresAt: user.prefs?.subscriptionExpiresAt
          });
        } catch (error) {
          console.error('Failed to load subscription:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSubscription({
          tier: SubscriptionTier.FREE,
          features: ['standard']
        });
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, [isAuthenticated, user]);

  const upgradeToTier = async (tier: SubscriptionTier) => {
    // TODO: Implement actual subscription upgrade logic
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const features = getFeaturesByTier(tier);
      setSubscription({
        tier,
        features,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      });
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      userTier: subscription.tier,
      isLoading,
      upgradeToTier
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

function getFeaturesByTier(tier: SubscriptionTier): string[] {
  switch (tier) {
    case SubscriptionTier.FREE:
      return ['standard'];
    case SubscriptionTier.PRO:
      return ['standard', 'creative'];
    case SubscriptionTier.PRO_PLUS:
      return ['standard', 'creative', 'ultra'];
    default:
      return ['standard'];
  }
}