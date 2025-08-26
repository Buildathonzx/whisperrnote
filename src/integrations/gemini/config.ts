import { AIMode } from '@/types/ai';
import { GeminiModelConfig } from './types';

export const GEMINI_MODEL_CONFIG: GeminiModelConfig = {
  [AIMode.STANDARD]: {
    model: 'gemini-2.5-flash',
    temperature: 0.3,
    maxTokens: 1000,
    topP: 0.8,
    topK: 20,
  },
  [AIMode.CREATIVE]: {
    model: 'gemini-2.5-flash',
    temperature: 0.8,
    maxTokens: 2000,
    topP: 0.9,
    topK: 40,
  },
  [AIMode.ULTRA]: {
    model: 'gemini-2.5-flash',
    temperature: 0.9,
    maxTokens: 4000,
    topP: 0.95,
    topK: 50,
  },
};

export const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  safetyThreshold: 'BLOCK_MEDIUM_AND_ABOVE',
};

export const SEARCH_SUGGESTION_CONFIG = {
  maxSuggestions: 5,
  minQueryLength: 2,
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  systemPrompt: `You are an AI assistant helping with search suggestions. 
  Generate helpful, relevant search suggestions based on the user's query and context. 
  Focus on completions and related topics that would be useful for note-taking and research.
  Return suggestions as a simple array of strings, no extra formatting.`,
};

export const CONTENT_ENHANCEMENT_CONFIG = {
  model: 'gemini-2.5-flash',
  maxTokens: 3000,
  temperature: 0.6,
  systemPrompts: {
    summarize: 'You are an expert at creating concise, comprehensive summaries. Extract the key points and main ideas while preserving the essential meaning.',
    expand: 'You are an expert at expanding and elaborating on content. Add relevant details, examples, and context while maintaining the original tone and intent.',
    improve: 'You are an expert editor. Improve the clarity, flow, and overall quality of the content while preserving the original meaning and intent.',
    rewrite: 'You are an expert writer. Rewrite the content to improve readability and engagement while maintaining the core message.',
  },
};

export function validateApiKey(apiKey?: string): boolean {
  if (!apiKey) {
    return false;
  }
  
  // Gemini API keys start with 'AIza' and are typically 39 characters long
  return apiKey.startsWith('AIza') && apiKey.length >= 35;
}

export function getModelForMode(mode: AIMode): string {
  return GEMINI_MODEL_CONFIG[mode].model;
}

export function getConfigForMode(mode: AIMode) {
  return GEMINI_MODEL_CONFIG[mode];
}