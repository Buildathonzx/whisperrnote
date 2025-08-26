import { AIMode } from '@/types/ai';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GeminiGenerateRequest {
  prompt: string;
  mode?: AIMode;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
  context?: string;
}

export interface GeminiGenerateResponse {
  text: string;
  finishReason: 'stop' | 'length' | 'safety' | 'other';
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface GeminiStreamChunk {
  text: string;
  isComplete: boolean;
  finishReason?: 'stop' | 'length' | 'safety' | 'other';
}

export interface SearchSuggestionRequest {
  query: string;
  context?: string;
  limit?: number;
  userHistory?: string[];
}

export interface SearchSuggestion {
  text: string;
  score: number;
  type: 'completion' | 'related' | 'contextual';
}

export interface ContentEnhancementRequest {
  content: string;
  type: 'summarize' | 'expand' | 'improve' | 'rewrite';
  tone?: 'professional' | 'casual' | 'creative' | 'academic';
  length?: 'shorter' | 'same' | 'longer';
}

export interface ContentEnhancementResponse {
  originalContent: string;
  enhancedContent: string;
  type: string;
  suggestions?: string[];
}

export interface GeminiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface GeminiModelConfig {
  [AIMode.STANDARD]: {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
  };
  [AIMode.CREATIVE]: {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
  };
  [AIMode.ULTRA]: {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
  };
}