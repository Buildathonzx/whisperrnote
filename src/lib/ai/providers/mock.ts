import { 
  AIProvider, 
  AIProviderCapabilities, 
  AIProviderConfig, 
  GenerationRequest, 
  GenerationResult,
  GenerationType 
} from '@/types/ai';

export class MockAIProvider extends AIProvider {
  readonly id = 'mock';
  readonly name = 'Mock AI Provider';
  readonly capabilities: AIProviderCapabilities = {
    name: 'Mock AI',
    version: '1.0.0',
    supportedTypes: ['topic', 'brainstorm', 'research', 'custom'],
    maxTokens: 4000,
    hasStreamingSupport: false,
    supportedLanguages: ['en', 'es', 'fr', 'de'],
    requiresApiKey: false
  };

  private mockResponses: Record<GenerationType, (prompt: string) => GenerationResult> = {
    topic: (prompt) => ({
      title: `Topic: ${this.extractKeyword(prompt)}`,
      content: `This is a mock topic response for "${prompt}". This would normally contain AI-generated content about the topic you requested.`,
      tags: ['mock', 'topic', this.extractKeyword(prompt).toLowerCase()]
    }),
    
    brainstorm: (prompt) => ({
      title: `Brainstorming: ${this.extractKeyword(prompt)}`,
      content: `Mock brainstorming session for "${prompt}":\n\n• Idea 1: Creative approach to ${prompt}\n• Idea 2: Alternative perspective on ${prompt}\n• Idea 3: Innovative solution for ${prompt}\n\nThis is mock content - real AI would generate actual ideas.`,
      tags: ['mock', 'brainstorm', 'ideas', this.extractKeyword(prompt).toLowerCase()]
    }),
    
    research: (prompt) => ({
      title: `Research: ${this.extractKeyword(prompt)}`,
      content: `Mock research summary for "${prompt}":\n\n**Overview:**\nThis would contain AI-generated research findings.\n\n**Key Points:**\n- Mock finding 1\n- Mock finding 2\n- Mock finding 3\n\n**Conclusion:**\nMock research conclusion for ${prompt}.`,
      tags: ['mock', 'research', 'analysis', this.extractKeyword(prompt).toLowerCase()]
    }),
    
    custom: (prompt) => ({
      title: `Custom Response: ${this.extractKeyword(prompt)}`,
      content: `This is a mock custom response for your prompt: "${prompt}"\n\nThe actual AI provider would process this prompt according to your specific requirements and generate relevant content.`,
      tags: ['mock', 'custom', this.extractKeyword(prompt).toLowerCase()]
    })
  };

  private extractKeyword(prompt: string): string {
    // Simple keyword extraction - take first meaningful word
    const words = prompt.split(' ').filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'about', 'this', 'that'].includes(word.toLowerCase())
    );
    return words[0] || 'Topic';
  }

  async isAvailable(): Promise<boolean> {
    // Mock provider is always available
    return true;
  }

  async generateContent(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      // Validate request
      if (!request.prompt || request.prompt.trim().length === 0) {
        throw new Error('Prompt cannot be empty');
      }
      
      if (!this.capabilities.supportedTypes.includes(request.type)) {
        throw new Error(`Unsupported generation type: ${request.type}`);
      }
      
      // Generate mock response
      const responseGenerator = this.mockResponses[request.type];
      const result = responseGenerator(request.prompt);
      
      // Update metrics
      this.updateMetrics(startTime, true, Math.floor(Math.random() * 500) + 100);
      
      return result;
      
    } catch (error) {
      this.updateMetrics(startTime, false);
      throw error;
    }
  }

  validateConfig(config: AIProviderConfig): boolean {
    // Mock provider doesn't require any specific config
    return typeof config === 'object' && config !== null;
  }

  async initialize(): Promise<void> {
    console.log('Mock AI Provider initialized');
  }

  async cleanup(): Promise<void> {
    console.log('Mock AI Provider cleaned up');
  }
}

// Factory function for creating mock provider instances
export function createMockProvider(config: AIProviderConfig = { enabled: true }): MockAIProvider {
  return new MockAIProvider(config);
}