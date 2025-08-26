import { getGeminiClient } from './client';
import { AIMode } from '@/types/ai';
import { 
  GeminiGenerateRequest, 
  GeminiGenerateResponse, 
  GeminiStreamChunk 
} from './types';

export class TextGenerationService {
  private client = getGeminiClient();

  async generateText(
    prompt: string,
    options?: {
      mode?: AIMode;
      temperature?: number;
      maxTokens?: number;
      systemInstruction?: string;
      context?: string;
    }
  ): Promise<GeminiGenerateResponse> {
    const request: GeminiGenerateRequest = {
      prompt,
      mode: options?.mode || AIMode.STANDARD,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      systemInstruction: options?.systemInstruction,
      context: options?.context,
    };

    return await this.client.generateText(request);
  }

  async* generateTextStream(
    prompt: string,
    options?: {
      mode?: AIMode;
      temperature?: number;
      maxTokens?: number;
      systemInstruction?: string;
      context?: string;
    }
  ): AsyncGenerator<GeminiStreamChunk> {
    const request: GeminiGenerateRequest = {
      prompt,
      mode: options?.mode || AIMode.STANDARD,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      systemInstruction: options?.systemInstruction,
      context: options?.context,
    };

    yield* this.client.generateTextStream(request);
  }

  async improveWriting(
    text: string,
    mode: AIMode = AIMode.STANDARD
  ): Promise<GeminiGenerateResponse> {
    const systemInstruction = `You are an expert writing assistant. Improve the following text by:
    - Enhancing clarity and readability
    - Fixing grammar and spelling errors
    - Improving sentence structure and flow
    - Maintaining the original meaning and tone
    Return only the improved text without additional comments.`;

    return await this.generateText(text, {
      mode,
      systemInstruction,
    });
  }

  async generateSummary(
    text: string,
    length: 'short' | 'medium' | 'long' = 'medium',
    mode: AIMode = AIMode.STANDARD
  ): Promise<GeminiGenerateResponse> {
    const lengthInstructions = {
      short: 'in 1-2 sentences',
      medium: 'in 3-5 sentences',
      long: 'in 1-2 paragraphs'
    };

    const systemInstruction = `You are an expert at creating concise, comprehensive summaries. 
    Summarize the following text ${lengthInstructions[length]}, capturing the key points and main ideas.
    Focus on the most important information and maintain clarity.`;

    return await this.generateText(text, {
      mode,
      systemInstruction,
    });
  }

  async expandContent(
    text: string,
    mode: AIMode = AIMode.CREATIVE
  ): Promise<GeminiGenerateResponse> {
    const systemInstruction = `You are an expert content writer. Expand on the following text by:
    - Adding relevant details and context
    - Providing examples where appropriate
    - Maintaining the original tone and intent
    - Creating a more comprehensive and engaging version
    Return the expanded content.`;

    return await this.generateText(text, {
      mode,
      systemInstruction,
    });
  }

  async brainstormIdeas(
    topic: string,
    count: number = 5,
    mode: AIMode = AIMode.CREATIVE
  ): Promise<GeminiGenerateResponse> {
    const systemInstruction = `You are a creative brainstorming assistant. Generate ${count} unique, interesting ideas related to the given topic.
    Format the response as a numbered list with brief explanations for each idea.
    Be creative and think outside the box while keeping ideas practical and actionable.`;

    return await this.generateText(topic, {
      mode,
      systemInstruction,
    });
  }

  async answerQuestion(
    question: string,
    context?: string,
    mode: AIMode = AIMode.STANDARD
  ): Promise<GeminiGenerateResponse> {
    const systemInstruction = `You are a knowledgeable assistant. Provide a clear, accurate, and helpful answer to the user's question.
    Use the provided context if available. Be concise but thorough, and acknowledge if you're unsure about anything.`;

    return await this.generateText(question, {
      mode,
      systemInstruction,
      context,
    });
  }
}

// Export singleton instance
export const textGenerationService = new TextGenerationService();