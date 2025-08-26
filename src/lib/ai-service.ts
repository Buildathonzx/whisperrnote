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
    console.log('AI temporarily disabled - returning mock content');
    
    // Temporary mock response while AI system is being redesigned
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    return {
      title: `Mock ${type} Title`,
      content: `This is mock content for "${prompt}". AI features are temporarily disabled while we redesign the system.`,
      tags: ['mock', 'temporary', type]
    };
  }
}

export const aiService = new AIService();