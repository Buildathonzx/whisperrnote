'use client';

import React, { useState } from 'react';
import { PlusIcon, SparklesIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import { useOverlay } from '@/components/ui/OverlayContext';
import { AIGeneratePromptModal } from '@/components/AIGeneratePromptModal';
import CreateNoteForm from '@/app/(app)/notes/CreateNoteForm';

interface MobileFABProps {
  className?: string;
}

export const MobileFAB: React.FC<MobileFABProps> = ({ className = '' }) => {
  const { openOverlay, closeOverlay } = useOverlay();
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
          {/* AI Generate Button */}
          <button
            onClick={handleAIGenerateClick}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:-translate-y-1"
          >
            <SparklesIcon className="h-5 w-5" />
            <span className="font-medium text-sm">AI Generate</span>
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