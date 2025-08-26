import { aiService } from '@/lib/ai';

export type GenerationType = 'topic' | 'brainstorm' | 'research' | 'custom';

export interface GenerationResult {
  title: string;
  content: string;
  tags: string[];
}

export class AIService {
  async generateContent(
    prompt: string, 
    type: GenerationType
  ): Promise<GenerationResult> {
    return await aiService.generateContent(prompt, type);
  }
}

export const aiServiceInstance = new AIService();