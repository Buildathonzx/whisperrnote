'use client';

import React, { useState } from 'react';
import { PlusIcon, SparklesIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import { useOverlay } from '@/components/ui/OverlayContext';
import { AIGeneratePromptModal } from '@/components/AIGeneratePromptModal';
import CreateNoteForm from '@/app/(app)/notes/CreateNoteForm';
import { aiService } from '@/lib/ai-service';
import { useOptionalAI } from '@/components/ui/AIContext';

interface MobileFABProps {
  className?: string;
}

export const MobileFAB: React.FC<MobileFABProps> = ({ className = '' }) => {
  const { openOverlay, closeOverlay } = useOverlay();
  // Optional AI usage (AI button independent from core create note)
  const ai = useOptionalAI();
  const isProviderReady = ai?.isProviderReady ?? false;
  const serviceStatus: 'unknown' | 'healthy' | 'degraded' | 'unhealthy' = ai?.serviceStatus ?? 'unknown';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateNoteClick = () => {
    setIsExpanded(false);
    openOverlay(
      <CreateNoteForm 
        onNoteCreated={(newNote) => {
          console.log('Note created:', newNote);
        }} 
      />
    );
  };

  const handleAIGenerateClick = () => {
    setIsExpanded(false);
    openOverlay(
      <AIGeneratePromptModal
        onClose={closeOverlay}
        onGenerate={handleAIGenerate}
        isGenerating={isGenerating}
      />
    );
  };

  const handleAIGenerate = async (prompt: string, type: 'topic' | 'brainstorm' | 'research' | 'custom') => {
    setIsGenerating(true);
    
    try {
      // Use real AI generation with Gemini
      const safeType = type || 'custom';
      const result = await aiService.generateContent(prompt, safeType);
      
      // Close the prompt modal and open create note form with content
      closeOverlay();
      
      // Open the create note form with pre-filled content
      openOverlay(
        <CreateNoteForm 
          initialContent={{
            title: result.title,
            content: result.content,
            tags: result.tags
          }}
          onNoteCreated={(newNote) => {
            console.log('AI-generated note created:', newNote);
            closeOverlay();
          }} 
        />
      );
      
    } catch (error) {
      console.error('AI Generation Failed:', error instanceof Error ? error.message : 'Unable to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`fixed bottom-20 right-6 z-40 md:hidden ${className}`}>
      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
          style={{ zIndex: -1 }}
        />
      )}

      {/* Expanded Action Buttons */}
      {isExpanded && (
        <div className="flex flex-col gap-3 mb-4">
          {/* AI Generate Button (AI independent of core CRUD) */}
          <button
            onClick={isProviderReady ? handleAIGenerateClick : undefined}
            disabled={!isProviderReady}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg transform transition-all duration-200 ${isProviderReady ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-xl hover:-translate-y-1' : 'bg-gray-400/50 text-gray-200 cursor-not-allowed'}`}
            title={isProviderReady ? 'AI Generate' : `AI unavailable (${serviceStatus})`}
          >
            <SparklesIcon className="h-5 w-5" />
            <span className="font-medium text-sm">{isProviderReady ? 'AI Generate' : 'AI Unavailable'}</span>
          </button>

          {/* Create Note Button */}
          <button
            onClick={handleCreateNoteClick}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-1"
          >
            <DocumentPlusIcon className="h-5 w-5" />
            <span className="font-medium text-sm">Create Note</span>
          </button>
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent to-accent/80 text-white rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 ${
          isExpanded ? 'rotate-45' : ''
        }`}
      >
        <PlusIcon className="h-7 w-7" />
      </button>
    </div>
  );
};

export default MobileFAB;