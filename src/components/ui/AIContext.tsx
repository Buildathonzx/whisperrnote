'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useOverlay } from './OverlayContext';
import { AIGeneratePromptModal } from '@/components/AIGeneratePromptModal';
import { aiService } from '@/lib/ai';

type AIGenerateHandler = (prompt: string, type: 'topic' | 'brainstorm' | 'research' | 'custom') => void;

interface AIContextType {
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  aiGenerateHandler?: AIGenerateHandler;
  setAIGenerateHandler: (handler?: AIGenerateHandler) => void;
  showAIGenerateModal: (onGenerate?: AIGenerateHandler, initialPrompt?: string) => void;
  serviceStatus: 'unknown' | 'healthy' | 'degraded' | 'unhealthy';
  availableProviders: string[];
  refreshServiceHealth: () => Promise<void>;
  isProviderReady: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerateHandler, setAIGenerateHandler] = useState<AIGenerateHandler | undefined>();
  const { openOverlay, closeOverlay } = useOverlay();
  const [serviceStatus, setServiceStatus] = useState<'unknown' | 'healthy' | 'degraded' | 'unhealthy'>('unknown');
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [isProviderReady, setIsProviderReady] = useState(false);

  const refreshServiceHealth = useCallback(async () => {
    try {
      const health = await aiService.getServiceHealth();
      setServiceStatus(health.status);
      const providers = aiService.getRegistry().getAvailableProviders();
      setAvailableProviders(providers.map(p => p.id));
      setIsProviderReady(health.availableProviders > 0);
    } catch (e) {
      setServiceStatus('unhealthy');
      setIsProviderReady(false);
    }
  }, []);

  useEffect(() => {
    refreshServiceHealth();
  }, [refreshServiceHealth]);

  const showAIGenerateModal = (
    onGenerate?: AIGenerateHandler,
    initialPrompt?: string
  ) => {
    const handler = onGenerate || aiGenerateHandler;
    if (!handler) {
      console.warn('No AI generate handler available');
      return;
    }

    openOverlay(
      <AIGeneratePromptModal
        onClose={closeOverlay}
        onGenerate={(prompt, type) => {
          handler(prompt, type);
          closeOverlay();
        }}
        isGenerating={isGenerating}
        initialPrompt={initialPrompt}
      />
    );
  };

  return (
    <AIContext.Provider value={{
      isGenerating,
      setIsGenerating,
      aiGenerateHandler,
      setAIGenerateHandler,
      showAIGenerateModal,
      serviceStatus,
      availableProviders,
      refreshServiceHealth,
      isProviderReady
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};