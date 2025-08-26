"use client";

import { useState } from 'react';
import { XMarkIcon, SparklesIcon, LightBulbIcon, MagnifyingGlassIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface AIGeneratePromptModalProps {
  onClose: () => void;
  onGenerate: (prompt: string, type: 'topic' | 'brainstorm' | 'research' | 'custom') => void;
  isGenerating?: boolean;
  initialPrompt?: string;
}

export function AIGeneratePromptModal({ onClose, onGenerate, isGenerating = false, initialPrompt = '' }: AIGeneratePromptModalProps) {
  const [selectedType, setSelectedType] = useState<'topic' | 'brainstorm' | 'research' | 'custom'>('topic');
  const [customPrompt, setCustomPrompt] = useState(initialPrompt);

  const promptTypes = [
    {
      id: 'topic' as const,
      title: 'Write About Topic',
      description: 'Generate a comprehensive note about a specific subject',
      icon: PencilIcon,
      placeholder: 'e.g., "Machine Learning fundamentals", "Climate change impact"',
      examples: ['Quantum computing basics', 'Mediterranean diet benefits', 'Remote work best practices']
    },
    {
      id: 'brainstorm' as const,
      title: 'Brainstorm Ideas',
      description: 'Generate creative ideas and suggestions for a project or problem',
      icon: LightBulbIcon,
      placeholder: 'e.g., "App features for productivity", "Birthday party themes"',
      examples: ['Startup business ideas', 'Weekend activity suggestions', 'Content creation topics']
    },
    {
      id: 'research' as const,
      title: 'Research & Analysis',
      description: 'Compile research findings and analysis on a topic',
      icon: MagnifyingGlassIcon,
      placeholder: 'e.g., "Electric vehicles market trends", "Ancient Roman architecture"',
      examples: ['Cryptocurrency market analysis', 'Renewable energy solutions', 'Space exploration timeline']
    },
    {
      id: 'custom' as const,
      title: 'Custom Request',
      description: 'Provide your own specific instructions for AI generation',
      icon: SparklesIcon,
      placeholder: 'Describe exactly what you want the AI to create...',
      examples: ['Create a meeting agenda', 'Write a product comparison', 'Draft a project proposal']
    }
  ];

  const selectedTypeData = promptTypes.find(type => type.id === selectedType)!;

  const handleGenerate = () => {
    if (customPrompt.trim()) {
      onGenerate(customPrompt.trim(), selectedType);
    }
  };

  const handleExampleClick = (example: string) => {
    setCustomPrompt(example);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-3d-elevated max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">AI Note Generation</h2>
              <p className="text-sm text-muted">Let AI create a note for you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-background transition-colors"
            disabled={isGenerating}
          >
            <XMarkIcon className="h-6 w-6 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          {/* Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">What would you like to generate?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {promptTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    disabled={isGenerating}
                    className={`
                      p-4 rounded-xl border-2 transition-all duration-200 text-left
                      ${isSelected 
                        ? 'border-accent bg-accent/10 shadow-glow-accent' 
                        : 'border-border hover:border-accent/50 hover:bg-background'
                      }
                      ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'bg-accent text-white' : 'bg-background text-muted'}
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">{type.title}</h4>
                        <p className="text-sm text-muted mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Describe your request</h3>
            <div className="space-y-4">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={selectedTypeData.placeholder}
                disabled={isGenerating}
                className={`
                  w-full h-32 p-4 border border-border rounded-xl resize-none
                  bg-background text-foreground placeholder-muted
                  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                  transition-all duration-200
                  ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              />
              
              {/* Examples */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Example prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTypeData.examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      disabled={isGenerating}
                      className={`
                        px-3 py-1.5 text-sm rounded-lg border border-border
                        hover:border-accent hover:bg-accent/10 transition-colors
                        ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-background/50">
          <div className="text-sm text-muted">
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent"></div>
                Generating your note...
              </div>
            ) : (
              'Your generated content will appear in the note editor'
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!customPrompt.trim() || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  Generate Note
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}