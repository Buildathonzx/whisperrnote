// Re-export AI types for convenience
import { AIMode } from '@/types/ai';

// Core client and configuration
export { GeminiClient, getGeminiClient, resetGeminiClient } from './client';
export { 
  GEMINI_MODEL_CONFIG, 
  DEFAULT_CONFIG,
  SEARCH_SUGGESTION_CONFIG,
  CONTENT_ENHANCEMENT_CONFIG,
  validateApiKey,
  getModelForMode,
  getConfigForMode 
} from './config';

// Services
export { TextGenerationService, textGenerationService } from './text-generation';
export { SearchSuggestionService, searchSuggestionService } from './search-suggestions';
export { ContentEnhancementService, contentEnhancementService } from './content-enhancement';

// Error handling
export { 
  GeminiErrorHandler, 
  GeminiRetryError, 
  withRetry, 
  createUserFriendlyErrorMessage,
  DEFAULT_RETRY_CONFIG 
} from './error-handling';

// Types
export type {
  GeminiConfig,
  GeminiGenerateRequest,
  GeminiGenerateResponse,
  GeminiStreamChunk,
  GeminiError,
  GeminiModelConfig,
  SearchSuggestionRequest,
  SearchSuggestion,
  ContentEnhancementRequest,
  ContentEnhancementResponse,
} from './types';

export type { RetryConfig } from './error-handling';

// Re-export AI types for convenience
export { AIMode };

// Import services for convenience functions
import { textGenerationService } from './text-generation';
import { searchSuggestionService } from './search-suggestions';
import { contentEnhancementService } from './content-enhancement';
import { getConfigForMode, validateApiKey } from './config';

// Convenience functions
export async function generateText(
  prompt: string,
  options?: {
    mode?: AIMode;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
    context?: string;
  }
) {
  return textGenerationService.generateText(prompt, options);
}

export async function* generateTextStream(
  prompt: string,
  options?: {
    mode?: AIMode;
    temperature?: number;
    maxTokens?: number;
    systemInstruction?: string;
    context?: string;
  }
) {
  yield* textGenerationService.generateTextStream(prompt, options);
}

export async function getSearchSuggestions(
  query: string,
  options?: {
    context?: string;
    limit?: number;
    userHistory?: string[];
  }
) {
  return searchSuggestionService.generateSearchSuggestions({
    query,
    ...options,
  });
}

export async function enhanceContent(
  content: string,
  type: 'summarize' | 'expand' | 'improve' | 'rewrite',
  options?: {
    tone?: 'professional' | 'casual' | 'creative' | 'academic';
    length?: 'shorter' | 'same' | 'longer';
  }
) {
  return contentEnhancementService.enhanceContent({
    content,
    type,
    ...options,
  });
}

// Integration with existing AI mode system
export function getGeminiConfigForAIMode(mode: AIMode) {
  return getConfigForMode(mode);
}

// Validation utilities
export function isGeminiConfigured(): boolean {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    return validateApiKey(apiKey);
  } catch {
    return false;
  }
}