import { getGeminiClient } from './client';
import { AIMode } from '@/types/ai';
import { ContentEnhancementRequest, ContentEnhancementResponse } from './types';
import { CONTENT_ENHANCEMENT_CONFIG } from './config';

export class ContentEnhancementService {
  private client = getGeminiClient();

  async enhanceContent(request: ContentEnhancementRequest): Promise<ContentEnhancementResponse> {
    const { content, type, tone = 'professional', length = 'same' } = request;
    
    const systemPrompt = this.buildSystemPrompt(type, tone, length);
    const prompt = this.buildEnhancementPrompt(content, type, tone, length);

    const response = await this.client.generateText({
      prompt,
      mode: AIMode.STANDARD,
      temperature: CONTENT_ENHANCEMENT_CONFIG.temperature,
      maxTokens: CONTENT_ENHANCEMENT_CONFIG.maxTokens,
      systemInstruction: systemPrompt,
    });

    return {
      originalContent: content,
      enhancedContent: response.text,
      type,
      suggestions: this.extractSuggestions(response.text),
    };
  }

  async summarizeContent(
    content: string,
    length: 'shorter' | 'same' = 'shorter'
  ): Promise<ContentEnhancementResponse> {
    return this.enhanceContent({
      content,
      type: 'summarize',
      length,
    });
  }

  async expandContent(
    content: string,
    tone: 'professional' | 'casual' | 'creative' | 'academic' = 'professional'
  ): Promise<ContentEnhancementResponse> {
    return this.enhanceContent({
      content,
      type: 'expand',
      tone,
      length: 'longer',
    });
  }

  async improveContent(
    content: string,
    tone: 'professional' | 'casual' | 'creative' | 'academic' = 'professional'
  ): Promise<ContentEnhancementResponse> {
    return this.enhanceContent({
      content,
      type: 'improve',
      tone,
    });
  }

  async rewriteContent(
    content: string,
    tone: 'professional' | 'casual' | 'creative' | 'academic' = 'professional'
  ): Promise<ContentEnhancementResponse> {
    return this.enhanceContent({
      content,
      type: 'rewrite',
      tone,
    });
  }

  async generateOutline(
    topic: string,
    mode: AIMode = AIMode.STANDARD
  ): Promise<ContentEnhancementResponse> {
    const systemPrompt = `You are an expert content strategist. Create a detailed, well-structured outline for the given topic.
    Include main sections, subsections, and key points to cover. Format as a hierarchical structure.`;

    const response = await this.client.generateText({
      prompt: `Create a comprehensive outline for: ${topic}`,
      mode,
      systemInstruction: systemPrompt,
    });

    return {
      originalContent: topic,
      enhancedContent: response.text,
      type: 'outline',
    };
  }

  async extractKeyPoints(
    content: string,
    count: number = 5,
    mode: AIMode = AIMode.STANDARD
  ): Promise<ContentEnhancementResponse> {
    const systemPrompt = `You are an expert at identifying key information. Extract the ${count} most important points from the given content.
    Present them as a clear, numbered list with brief explanations.`;

    const response = await this.client.generateText({
      prompt: content,
      mode,
      systemInstruction: systemPrompt,
    });

    return {
      originalContent: content,
      enhancedContent: response.text,
      type: 'key_points',
    };
  }

  private buildSystemPrompt(
    type: string,
    tone: string,
    length: string
  ): string {
    let basePrompt = CONTENT_ENHANCEMENT_CONFIG.systemPrompts[type as keyof typeof CONTENT_ENHANCEMENT_CONFIG.systemPrompts];
    
    if (!basePrompt) {
      basePrompt = 'You are an expert content editor. Enhance the provided content according to the specified requirements.';
    }

    let toneInstruction = '';
    switch (tone) {
      case 'professional':
        toneInstruction = 'Use a professional, formal tone suitable for business or academic contexts.';
        break;
      case 'casual':
        toneInstruction = 'Use a casual, conversational tone that feels natural and approachable.';
        break;
      case 'creative':
        toneInstruction = 'Use a creative, engaging tone with vivid language and interesting expressions.';
        break;
      case 'academic':
        toneInstruction = 'Use an academic tone with precise language and scholarly approach.';
        break;
    }

    let lengthInstruction = '';
    switch (length) {
      case 'shorter':
        lengthInstruction = 'Make the content more concise and to the point.';
        break;
      case 'longer':
        lengthInstruction = 'Expand the content with additional details and explanations.';
        break;
      case 'same':
        lengthInstruction = 'Maintain approximately the same length as the original.';
        break;
    }

    return `${basePrompt}\n\n${toneInstruction}\n${lengthInstruction}`;
  }

  private buildEnhancementPrompt(
    content: string,
    type: string,
    tone: string,
    length: string
  ): string {
    let prompt = `Please ${type} the following content:\n\n${content}\n\n`;
    
    prompt += `Requirements:
    - Tone: ${tone}
    - Length: ${length}
    - Maintain the core message and intent
    - Ensure clarity and readability`;

    if (type === 'improve') {
      prompt += '\n- Fix any grammar, spelling, or structural issues';
    }

    return prompt;
  }

  private extractSuggestions(enhancedContent: string): string[] {
    // Simple extraction of suggestions if the AI provides them
    const lines = enhancedContent.split('\n');
    const suggestions: string[] = [];
    
    let inSuggestionsSection = false;
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.toLowerCase().includes('suggestion') || 
          trimmed.toLowerCase().includes('recommendation')) {
        inSuggestionsSection = true;
        continue;
      }
      
      if (inSuggestionsSection && trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
        suggestions.push(trimmed.replace(/^[-\d.]\s*/, ''));
      }
      
      if (inSuggestionsSection && trimmed === '') {
        break;
      }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }
}

// Export singleton instance
export const contentEnhancementService = new ContentEnhancementService();