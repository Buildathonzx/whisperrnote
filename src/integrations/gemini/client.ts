import { GoogleGenAI } from '@google/genai';
import { AIMode } from '@/types/ai';
import { 
  GeminiConfig, 
  GeminiError, 
  GeminiGenerateRequest, 
  GeminiGenerateResponse,
  GeminiStreamChunk
} from './types';
import { getConfigForMode, validateApiKey } from './config';

export class GeminiClient {
  private client: GoogleGenAI;

  constructor(config: GeminiConfig) {
    if (!validateApiKey(config.apiKey)) {
      throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.');
    }

    this.client = new GoogleGenAI({ apiKey: config.apiKey });
  }

  static createFromEnv(): GeminiClient {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    return new GeminiClient({ apiKey });
  }

  async generateText(request: GeminiGenerateRequest): Promise<GeminiGenerateResponse> {
    try {
      const modeConfig = getConfigForMode(request.mode || AIMode.STANDARD);
      
      const response = await this.client.models.generateContent({
        model: modeConfig.model,
        contents: this.buildPrompt(request),
        config: {
          temperature: request.temperature ?? modeConfig.temperature,
          maxOutputTokens: request.maxTokens ?? modeConfig.maxTokens,
          topP: modeConfig.topP,
          topK: modeConfig.topK,
        },
      });

      return {
        text: response.text || '',
        finishReason: this.mapFinishReason(response.candidates?.[0]?.finishReason),
        usage: response.usageMetadata ? {
          inputTokens: response.usageMetadata.promptTokenCount || 0,
          outputTokens: response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata.totalTokenCount || 0,
        } : undefined,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async* generateTextStream(request: GeminiGenerateRequest): AsyncGenerator<GeminiStreamChunk> {
    try {
      const modeConfig = getConfigForMode(request.mode || AIMode.STANDARD);
      
      const response = await this.client.models.generateContentStream({
        model: modeConfig.model,
        contents: this.buildPrompt(request),
        config: {
          temperature: request.temperature ?? modeConfig.temperature,
          maxOutputTokens: request.maxTokens ?? modeConfig.maxTokens,
          topP: modeConfig.topP,
          topK: modeConfig.topK,
        },
      });

      for await (const chunk of response) {
        const text = chunk.text || '';
        const isComplete = chunk.candidates?.[0]?.finishReason !== undefined;
        const finishReason = isComplete 
          ? this.mapFinishReason(chunk.candidates?.[0]?.finishReason)
          : undefined;

        yield {
          text,
          isComplete,
          finishReason,
        };
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private buildPrompt(request: GeminiGenerateRequest): string {
    let prompt = '';
    
    if (request.systemInstruction) {
      prompt += `System: ${request.systemInstruction}\n\n`;
    }
    
    if (request.context) {
      prompt += `Context: ${request.context}\n\n`;
    }
    
    prompt += `User: ${request.prompt}`;
    
    return prompt;
  }

  private mapFinishReason(reason?: string): 'stop' | 'length' | 'safety' | 'other' {
    switch (reason) {
      case 'STOP':
        return 'stop';
      case 'MAX_TOKENS':
        return 'length';
      case 'SAFETY':
        return 'safety';
      default:
        return 'other';
    }
  }

  private handleError(error: unknown): GeminiError {
    if (error instanceof Error) {
      // Handle API-specific errors
      if (error.message.includes('API_KEY')) {
        return {
          code: 'INVALID_API_KEY',
          message: 'Invalid API key provided',
          details: error,
        };
      }
      
      if (error.message.includes('quota')) {
        return {
          code: 'QUOTA_EXCEEDED',
          message: 'API quota exceeded',
          details: error,
        };
      }
      
      if (error.message.includes('rate limit')) {
        return {
          code: 'RATE_LIMITED',
          message: 'Rate limit exceeded',
          details: error,
        };
      }

      return {
        code: 'API_ERROR',
        message: error.message,
        details: error,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: error,
    };
  }
}

// Singleton instance for app-wide use
let geminiClient: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    geminiClient = GeminiClient.createFromEnv();
  }
  return geminiClient;
}

export function resetGeminiClient(): void {
  geminiClient = null;
}