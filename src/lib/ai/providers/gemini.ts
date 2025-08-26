import { 
  AIProvider, 
  AIProviderCapabilities, 
  AIProviderConfig, 
  GenerationRequest, 
  GenerationResult,
  GenerationType 
} from '@/types/ai';
import { GeminiClient } from '@/integrations/gemini/client';
import { AIMode } from '@/types/ai';

export interface GeminiProviderConfig extends AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  defaultMode?: AIMode;
}

export class GeminiProvider extends AIProvider {
  readonly id = 'gemini';
  readonly name = 'Google Gemini';
  readonly capabilities: AIProviderCapabilities = {
    name: 'Google Gemini',
    version: '2.5',
    supportedTypes: ['topic', 'brainstorm', 'research', 'custom'],
    maxTokens: 8192,
    hasStreamingSupport: true,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'pt', 'it', 'ru'],
    requiresApiKey: true
  };

  private client: GeminiClient | null = null;
  private geminiConfig: GeminiProviderConfig;

  constructor(config: GeminiProviderConfig) {
    super(config);
    this.geminiConfig = config;
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.geminiConfig.apiKey || !this.geminiConfig.enabled) {
        return false;
      }
      
      // Try to create client and validate config
      if (!this.client) {
        this.client = new GeminiClient({ apiKey: this.geminiConfig.apiKey });
      }
      
      return true;
    } catch (error) {
      console.warn('Gemini provider not available:', error);
      return false;
    }
  }

  async generateContent(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      if (!await this.isAvailable()) {
        throw new Error('Gemini provider is not available');
      }

      if (!this.client) {
        this.client = new GeminiClient({ apiKey: this.geminiConfig.apiKey });
      }

      // Map generation type to appropriate system instruction
      const systemInstruction = this.getSystemInstructionForType(request.type);
      
      // Prepare Gemini request
      const geminiRequest = {
        prompt: request.prompt,
        mode: this.geminiConfig.defaultMode || AIMode.STANDARD,
        systemInstruction,
        temperature: request.options?.temperature,
        maxTokens: request.options?.maxTokens,
      };

      // Generate content using Gemini
      const response = await this.client.generateText(geminiRequest);
      
      // Parse and structure the response
      const result = this.parseGeminiResponse(response.text, request.type, request.prompt);
      
      // Update metrics
      const tokensUsed = response.usage?.totalTokens || 0;
      this.updateMetrics(startTime, true, tokensUsed);
      
      return result;
      
    } catch (error) {
      this.updateMetrics(startTime, false);
      console.error('Gemini generation failed:', error);
      throw new Error(`Gemini generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateConfig(config: AIProviderConfig): boolean {
    const geminiConfig = config as GeminiProviderConfig;
    return (
      typeof geminiConfig === 'object' &&
      geminiConfig !== null &&
      typeof geminiConfig.apiKey === 'string' &&
      geminiConfig.apiKey.length > 0 &&
      typeof geminiConfig.enabled === 'boolean'
    );
  }

  async initialize(): Promise<void> {
    try {
      if (this.geminiConfig.apiKey && this.geminiConfig.enabled) {
        this.client = new GeminiClient({ apiKey: this.geminiConfig.apiKey });
        console.log('Gemini AI Provider initialized');
      }
    } catch (error) {
      console.warn('Failed to initialize Gemini provider:', error);
    }
  }

  async cleanup(): Promise<void> {
    this.client = null;
    console.log('Gemini AI Provider cleaned up');
  }

  private getSystemInstructionForType(type: GenerationType): string {
    const instructions = {
      topic: `You are an expert content creator. Generate a comprehensive topic outline with a clear title, detailed content, and relevant tags. Structure your response in a way that provides valuable information about the topic.`,
      
      brainstorm: `You are a creative brainstorming assistant. Generate innovative ideas, suggestions, and approaches for the given topic. Provide a title that captures the brainstorming session, detailed bullet points with creative ideas, and relevant tags.`,
      
      research: `You are a research assistant. Provide a well-structured research summary with key findings, insights, and analysis. Include a descriptive title, comprehensive content with main points, and relevant research tags.`,
      
      custom: `You are a helpful AI assistant. Respond to the user's request thoughtfully and comprehensively. Provide a relevant title, detailed content addressing their needs, and appropriate tags.`
    };
    
    return instructions[type] || instructions.custom;
  }

  private parseGeminiResponse(text: string, type: GenerationType, originalPrompt: string): GenerationResult {
    // Try to extract structured content from Gemini response
    const lines = text.split('\n').filter(line => line.trim());
    
    // Look for a title in the first few lines
    let title = '';
    let content = text;
    
    // Try to find a title pattern
    const titlePatterns = [
      /^#\s+(.+)$/,           // Markdown heading
      /^Title:\s*(.+)$/i,     // "Title: ..."
      /^(.+):$/,              // "Something:"
    ];
    
    for (const line of lines.slice(0, 3)) {
      for (const pattern of titlePatterns) {
        const match = line.match(pattern);
        if (match) {
          title = match[1].trim();
          // Remove title from content
          content = text.replace(line, '').trim();
          break;
        }
      }
      if (title) break;
    }
    
    // Fallback title generation
    if (!title) {
      const firstSentence = lines[0]?.substring(0, 50) || '';
      title = firstSentence.length < 50 ? firstSentence : `${firstSentence}...`;
      
      // If still no good title, generate based on type and prompt
      if (!title || title.length < 10) {
        title = this.generateFallbackTitle(type, originalPrompt);
      }
    }
    
    // Generate tags based on content and type
    const tags = this.generateTags(content, type, originalPrompt);
    
    return {
      title: title || this.generateFallbackTitle(type, originalPrompt),
      content: content || text,
      tags
    };
  }

  private generateFallbackTitle(type: GenerationType, prompt: string): string {
    const keyword = prompt.split(' ').find(word => word.length > 3) || 'Content';
    const typeLabels = {
      topic: 'Topic',
      brainstorm: 'Brainstorming',
      research: 'Research',
      custom: 'Analysis'
    };
    
    return `${typeLabels[type]}: ${keyword}`;
  }

  private generateTags(content: string, type: GenerationType, prompt: string): string[] {
    const tags = [type, 'ai-generated'];
    
    // Extract key words from prompt and content
    const words = [...prompt.split(' '), ...content.split(' ')]
      .map(word => word.toLowerCase().replace(/[^a-z]/g, ''))
      .filter(word => word.length > 3 && word.length < 20)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word));
    
    // Get most common words
    const wordCounts = words.reduce((counts, word) => {
      counts[word] = (counts[word] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const topWords = Object.entries(wordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);
    
    tags.push(...topWords);
    
    return [...new Set(tags)]; // Remove duplicates
  }
}

// Factory function for creating Gemini provider instances
export function createGeminiProvider(config: GeminiProviderConfig): GeminiProvider {
  return new GeminiProvider(config);
}