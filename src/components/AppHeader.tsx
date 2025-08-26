"use client";

import { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/components/ui/AuthContext';
import { useSubscription } from '@/components/ui/SubscriptionContext';
import { useOverlay } from '@/components/ui/OverlayContext';
import AIModeSelect from '@/components/AIModeSelect';
import { TopBarSearch } from '@/components/TopBarSearch';
import { AIGeneratePromptModal } from '@/components/AIGeneratePromptModal';
import CreateNoteForm from '@/app/(app)/notes/CreateNoteForm';
import { AIMode } from '@/types/ai';
import { updateAIMode, getAIMode } from '@/lib/appwrite';

interface AppHeaderProps {
  className?: string;
}

export default function AppHeader({ className = '' }: AppHeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const { userTier } = useSubscription();
  const { openOverlay, closeOverlay } = useOverlay();
  const [currentAIMode, setCurrentAIMode] = useState<AIMode>(AIMode.STANDARD);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadAIMode = async () => {
      if (isAuthenticated && user) {
        try {
          const mode = await getAIMode(user.$id);
          setCurrentAIMode((mode as AIMode) || AIMode.STANDARD);
        } catch (error) {
          console.error('Failed to load AI mode:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadAIMode();
  }, [isAuthenticated, user]);

  const handleAIModeChange = async (mode: AIMode) => {
    if (user) {
      try {
        await updateAIMode(user.$id, mode);
        setCurrentAIMode(mode);
      } catch (error) {
        console.error('Failed to update AI mode:', error);
      }
    }
  };

  const handleAIGenerateClick = () => {
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
      // Simulate AI generation for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let generatedContent = '';
      switch (type) {
        case 'topic':
          generatedContent = `# ${prompt}\n\nThis is a comprehensive note about ${prompt}.\n\n## Key Points\n\n- Important concept 1\n- Important concept 2\n- Important concept 3\n\n## Details\n\nDetailed information about ${prompt} will be generated here. This content will include relevant examples, explanations, and insights.\n\n## Conclusion\n\nSummary of the main points covered.`;
          break;
        case 'brainstorm':
          generatedContent = `# Ideas for: ${prompt}\n\n## Creative Suggestions\n\n1. **Innovative Approach**: A fresh perspective on ${prompt}\n2. **Traditional Method**: Time-tested strategies for ${prompt}\n3. **Technology Integration**: How to leverage technology for ${prompt}\n4. **Collaborative Solution**: Team-based approaches to ${prompt}\n5. **Cost-Effective Option**: Budget-friendly ways to tackle ${prompt}\n\n## Next Steps\n\n- Evaluate each idea\n- Choose the most promising approaches\n- Create an action plan`;
          break;
        case 'research':
          generatedContent = `# Research on: ${prompt}\n\n## Overview\n\nComprehensive research findings on ${prompt}.\n\n## Key Findings\n\n- Finding 1: Important discovery about ${prompt}\n- Finding 2: Statistical data related to ${prompt}\n- Finding 3: Expert opinions on ${prompt}\n\n## Analysis\n\nDetailed analysis of the research data and trends.\n\n## Sources\n\n- Academic papers\n- Industry reports\n- Expert interviews`;
          break;
        case 'custom':
          generatedContent = `# Generated Content\n\n${prompt}\n\n## AI Response\n\nThis content has been generated based on your specific request. The AI has processed your instructions and created relevant information.\n\n## Additional Information\n\nSupplementary details and context have been added to provide a comprehensive response.`;
          break;
      }
      
      // Close the prompt modal and open create note form with content
      closeOverlay();
      
      // Open the create note form with pre-filled content
      openOverlay(
        <CreateNoteForm 
          initialContent={{
            title: `AI Generated: ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            content: generatedContent,
            tags: [`ai-generated`, type]
          }}
          onNoteCreated={(newNote) => {
            console.log('AI-generated note created:', newNote);
            closeOverlay();
          }} 
        />
      );
      
    } catch (error) {
      console.error('Failed to generate content:', error);
      // TODO: Show error toast
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  return (
    <header className={`fixed top-0 right-0 left-0 md:left-72 z-30 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm border-b border-light-border dark:border-dark-border ${className}`}>
      <div className="flex items-center justify-between px-6 py-3 gap-4">
        {/* Left: Search Bar */}
        <div className="flex-1 max-w-md">
          <TopBarSearch />
        </div>
        
        {/* Right: AI Controls */}
        <div className="flex items-center gap-3">
          {/* AI Generate Button */}
          <button
            onClick={handleAIGenerateClick}
            disabled={isGenerating}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-accent
              bg-gradient-to-r from-accent/10 to-accent/5 text-accent
              hover:from-accent/20 hover:to-accent/10 hover:shadow-glow-accent
              transition-all duration-200 font-medium text-sm
              ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title="Generate AI Note"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent"></div>
            ) : (
              <SparklesIcon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Generate</span>
          </button>
          
          {/* AI Mode Select */}
          <AIModeSelect
            currentMode={currentAIMode}
            userTier={userTier}
            onModeChangeAction={handleAIModeChange}
          />
        </div>
      </div>
    </header>
  );
}