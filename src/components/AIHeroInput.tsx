"use client";

import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface AIHeroInputProps {
  onPromptSelectAction: (prompt: string) => void;
  className?: string;
}

const PROMPT_SUGGESTIONS = [
  "Brainstorm creative marketing ideas for a web3 startup",
  "Write me a blog about the future of AI powered note taking"
];

export function AIHeroInput({ onPromptSelectAction, className = '' }: AIHeroInputProps) {
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);

  // Auto-typing animation effect
  useEffect(() => {
    if (isActive) return;

    const typeText = async () => {
      const targetText = PROMPT_SUGGESTIONS[currentSuggestionIndex];
      
      // Typing effect
      for (let i = 0; i <= targetText.length; i++) {
        setDisplayText(targetText.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Pause at full text
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Deleting effect
      for (let i = targetText.length; i >= 0; i--) {
        setDisplayText(targetText.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 30));
      }
      
      setCurrentSuggestionIndex((prev) => (prev + 1) % PROMPT_SUGGESTIONS.length);
    };

    typeText();
  }, [currentSuggestionIndex, isActive]);

  const handleInputFocus = () => {
    setIsActive(true);
  };

  const handleInputBlur = () => {
    if (!inputValue) {
      setIsActive(false);
      setDisplayText('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setIsActive(true);
    onPromptSelectAction(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onPromptSelectAction(inputValue.trim());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Main Input */}
      <form onSubmit={handleSubmit} className="relative mb-8">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={isActive || inputValue ? '' : displayText}
            className={`
              w-full px-6 py-4 pr-16 text-lg rounded-2xl border-2
              bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm
              border-accent/30 text-light-fg dark:text-dark-fg
              placeholder:text-light-fg/50 dark:placeholder:text-dark-fg/50
              transition-all duration-300 outline-none
              ${inputValue ? 'border-accent shadow-glow-accent' : 'border-accent/30'}
              ${!isActive ? 'animate-pulse-glow' : ''}
            `}
          />
          
          {/* Generate Button */}
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2
              p-3 rounded-xl transition-all duration-300
              ${inputValue.trim() 
                ? 'bg-accent text-white shadow-glow-accent animate-pulse-glow' 
                : 'bg-accent/20 text-accent/50'
              }
            `}
          >
            <SparklesIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Typing Cursor */}
        {!isActive && !inputValue && (
          <div className="absolute right-16 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent animate-pulse" />
        )}
      </form>

      {/* Quick Suggestions */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-light-fg/70 dark:text-dark-fg/70 text-center">
          Try these prompts:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PROMPT_SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="
                text-left p-4 rounded-xl border border-accent/20
                bg-light-card/30 dark:bg-dark-card/30 backdrop-blur-sm
                hover:border-accent/50 hover:bg-accent/5 
                transition-all duration-200 group
                text-sm text-light-fg/80 dark:text-dark-fg/80
              "
            >
              <div className="flex items-center gap-3">
                <SparklesIcon className="h-4 w-4 text-accent flex-shrink-0 group-hover:animate-pulse" />
                <span className="line-clamp-1">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}