import { getGeminiClient } from './client';
import { AIMode } from '@/types/ai';
import { SearchSuggestionRequest, SearchSuggestion } from './types';
import { SEARCH_SUGGESTION_CONFIG } from './config';

export class SearchSuggestionService {
  private client = getGeminiClient();
  private cache = new Map<string, SearchSuggestion[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async generateSearchSuggestions(request: SearchSuggestionRequest): Promise<SearchSuggestion[]> {
    const { query, context, limit = SEARCH_SUGGESTION_CONFIG.maxSuggestions, userHistory } = request;

    // Return empty if query is too short
    if (query.length < SEARCH_SUGGESTION_CONFIG.minQueryLength) {
      return [];
    }

    // Check cache first
    const cacheKey = this.getCacheKey(query, context);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached.slice(0, limit);
    }

    try {
      const suggestions = await this.generateSuggestions(query, context, userHistory, limit);
      this.setCache(cacheKey, suggestions);
      return suggestions;
    } catch (error) {
      console.error('Error generating search suggestions:', error);
      return this.getFallbackSuggestions(query, limit);
    }
  }

  private async generateSuggestions(
    query: string,
    context?: string,
    userHistory?: string[],
    limit: number = 5
  ): Promise<SearchSuggestion[]> {
    const prompt = this.buildSuggestionPrompt(query, context, userHistory, limit);

    const response = await this.client.generateText({
      prompt,
      mode: AIMode.STANDARD,
      temperature: SEARCH_SUGGESTION_CONFIG.temperature,
      maxTokens: 500,
      systemInstruction: SEARCH_SUGGESTION_CONFIG.systemPrompt,
    });

    return this.parseSuggestions(response.text, query);
  }

  private buildSuggestionPrompt(
    query: string,
    context?: string,
    userHistory?: string[],
    limit: number = 5
  ): string {
    let prompt = `Generate ${limit} smart search suggestions for the query: "${query}"\n\n`;

    if (context) {
      prompt += `Context: ${context}\n\n`;
    }

    if (userHistory && userHistory.length > 0) {
      prompt += `User's recent searches: ${userHistory.slice(-5).join(', ')}\n\n`;
    }

    prompt += `Provide suggestions that include:
    1. Query completions (completing the current input)
    2. Related searches (related topics and concepts)
    3. Contextual suggestions (based on the context provided)

    Return only the suggestions, one per line, without numbers or additional formatting.`;

    return prompt;
  }

  private parseSuggestions(responseText: string, originalQuery: string): SearchSuggestion[] {
    const lines = responseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.match(/^\d+\.?\s*/)); // Remove numbered lists

    const suggestions: SearchSuggestion[] = [];

    for (const line of lines) {
      if (suggestions.length >= SEARCH_SUGGESTION_CONFIG.maxSuggestions) break;

      const suggestion: SearchSuggestion = {
        text: line,
        score: this.calculateRelevanceScore(line, originalQuery),
        type: this.categorizesSuggestion(line, originalQuery),
      };

      suggestions.push(suggestion);
    }

    // Sort by relevance score
    return suggestions.sort((a, b) => b.score - a.score);
  }

  private calculateRelevanceScore(suggestion: string, originalQuery: string): number {
    const queryWords = originalQuery.toLowerCase().split(/\s+/);
    const suggestionWords = suggestion.toLowerCase().split(/\s+/);
    
    let score = 0;
    
    // Exact query inclusion
    if (suggestion.toLowerCase().includes(originalQuery.toLowerCase())) {
      score += 10;
    }
    
    // Word overlap
    const overlap = queryWords.filter(word => suggestionWords.includes(word)).length;
    score += overlap * 5;
    
    // Starts with query
    if (suggestion.toLowerCase().startsWith(originalQuery.toLowerCase())) {
      score += 15;
    }
    
    // Length penalty for very long suggestions
    if (suggestion.length > 100) {
      score -= 5;
    }
    
    return score;
  }

  private categorizesSuggestion(suggestion: string, originalQuery: string): 'completion' | 'related' | 'contextual' {
    const suggestionLower = suggestion.toLowerCase();
    const queryLower = originalQuery.toLowerCase();
    
    // If suggestion starts with the query, it's likely a completion
    if (suggestionLower.startsWith(queryLower)) {
      return 'completion';
    }
    
    // If suggestion contains query words, it's likely related
    const queryWords = queryLower.split(/\s+/);
    const hasQueryWords = queryWords.some(word => suggestionLower.includes(word));
    
    if (hasQueryWords) {
      return 'related';
    }
    
    // Otherwise, it's contextual
    return 'contextual';
  }

  private getFallbackSuggestions(query: string, limit: number): SearchSuggestion[] {
    const fallbacks = [
      `${query} tutorial`,
      `${query} examples`,
      `${query} guide`,
      `how to ${query}`,
      `${query} best practices`,
    ];

    return fallbacks.slice(0, limit).map((text, index) => ({
      text,
      score: 10 - index,
      type: 'completion' as const,
    }));
  }

  private getCacheKey(query: string, context?: string): string {
    return `${query.toLowerCase()}_${context || ''}`;
  }

  private getFromCache(key: string): SearchSuggestion[] | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  private setCache(key: string, suggestions: SearchSuggestion[]): void {
    this.cache.set(key, suggestions);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

// Export singleton instance
export const searchSuggestionService = new SearchSuggestionService();