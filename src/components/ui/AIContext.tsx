'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useOverlay } from './OverlayContext';
import { AIGeneratePromptModal } from '@/components/AIGeneratePromptModal';

type AIGenerateHandler = (prompt: string, type: 'topic' | 'brainstorm' | 'research' | 'custom') => void;

interface AIContextType {
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  aiGenerateHandler?: AIGenerateHandler;
  setAIGenerateHandler: (handler?: AIGenerateHandler) => void;
  showAIGenerateModal: (onGenerate?: AIGenerateHandler, initialPrompt?: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider: React.FC<AIProviderProps> = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerateHandler, setAIGenerateHandler] = useState<AIGenerateHandler | undefined>();
  const { openOverlay, closeOverlay } = useOverlay();

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
      showAIGenerateModal
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