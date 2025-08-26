import { 
  AIProvider, 
  AIProviderCapabilities, 
  AIProviderConfig, 
  GenerationRequest, 
  GenerationResult,
  GenerationType 
} from '@/types/ai';
import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

export interface GitHubModelsProviderConfig extends AIProviderConfig {
  githubToken: string;
  endpoint?: string;
  model?: string;
}

export class GitHubModelsProvider extends AIProvider {
  readonly id = 'github-models';
  readonly name = 'GitHub Models';
  readonly capabilities: AIProviderCapabilities = {
    name: 'GitHub Models',
    version: '1.0',
    supportedTypes: ['topic', 'brainstorm', 'research', 'custom'],
    maxTokens: 4096,
    hasStreamingSupport: false,
    supportedLanguages: ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh', 'pt', 'it', 'ru'],
    requiresApiKey: true
  };

  private client: any = null;
  private githubConfig: GitHubModelsProviderConfig;

  constructor(config: GitHubModelsProviderConfig) {
    super(config);
    this.githubConfig = config;
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.githubConfig.githubToken || !this.githubConfig.enabled) {
        return false;
      }
      
      // Try to create client and validate config
      if (!this.client) {
        const endpoint = this.githubConfig.endpoint || 'https://models.inference.ai.azure.com';
        this.client = ModelClient(endpoint, new AzureKeyCredential(this.githubConfig.githubToken));
      }
      
      return true;
    } catch (error) {
      console.warn('GitHub Models provider not available:', error);
      return false;
    }
  }

  async generateContent(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    
    try {
      if (!await this.isAvailable()) {
        throw new Error('GitHub Models provider is not available');
      }

      if (!this.client) {
        const endpoint = this.githubConfig.endpoint || 'https://models.inference.ai.azure.com';
        this.client = ModelClient(endpoint, new AzureKeyCredential(this.githubConfig.githubToken));
      }

      // Map generation type to appropriate system instruction
      const systemInstruction = this.getSystemInstructionForType(request.type);
      
      // Prepare GitHub Models request
      const model = this.githubConfig.model || 'gpt-4.1';
      const response = await this.client.path('/chat/completions').post({
        body: {
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: request.prompt }
          ],
          model,
          temperature: request.options?.temperature || 0.7,
          max_tokens: request.options?.maxTokens || 1000,
          top_p: 1
        }
      });

      if (response.status !== '200') {
        throw new Error(`GitHub Models API error: ${response.body?.error || 'Unknown error'}`);
      }

      const content = response.body.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from GitHub Models API');
      }
      
      // Parse and structure the response
      const result = this.parseGitHubModelsResponse(content, request.type, request.prompt);
      
      // Update metrics
      const tokensUsed = response.body.usage?.total_tokens || 0;
      this.updateMetrics(startTime, true, tokensUsed);
      
      return result;
      
    } catch (error) {
      this.updateMetrics(startTime, false);
      console.error('GitHub Models generation failed:', error);
      throw new Error(`GitHub Models generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  validateConfig(config: AIProviderConfig): boolean {
    const githubConfig = config as GitHubModelsProviderConfig;
    return (
      typeof githubConfig === 'object' &&
      githubConfig !== null &&
      typeof githubConfig.githubToken === 'string' &&
      githubConfig.githubToken.length > 0 &&
      typeof githubConfig.enabled === 'boolean'
    );
  }

  async initialize(): Promise<void> {
    try {
      if (this.githubConfig.githubToken && this.githubConfig.enabled) {
        const endpoint = this.githubConfig.endpoint || 'https://models.inference.ai.azure.com';
        this.client = ModelClient(endpoint, new AzureKeyCredential(this.githubConfig.githubToken));
        console.log('GitHub Models AI Provider initialized');
      }
    } catch (error) {
      console.warn('Failed to initialize GitHub Models provider:', error);
    }
  }

  async cleanup(): Promise<void> {
    this.client = null;
    console.log('GitHub Models AI Provider cleaned up');
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

  private parseGitHubModelsResponse(text: string, type: GenerationType, originalPrompt: string): GenerationResult {
    // Try to extract structured content from GitHub Models response
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
    const tags = [type, 'ai-generated', 'github-models'];
    
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

// Factory function for creating GitHub Models provider instances
export function createGitHubModelsProvider(config: GitHubModelsProviderConfig): GitHubModelsProvider {
  return new GitHubModelsProvider(config);
}