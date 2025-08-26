import { aiProviderRegistry, aiService } from '@/lib/ai/registry';
import { createMockProvider } from '@/lib/ai/providers/mock';
import { createGeminiProvider } from '@/lib/ai/providers/gemini';

// Initialize AI providers based on environment and configuration
export function initializeAIProviders() {
  console.log('Initializing AI provider system...');

  // Always register mock provider for development and fallback
  const mockProvider = createMockProvider({
    enabled: true
  });
  aiProviderRegistry.register(mockProvider);

  // Register Gemini provider if API key is available (but disabled by default)
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    const geminiProvider = createGeminiProvider({
      apiKey: geminiApiKey,
      enabled: false, // Temporarily disabled
      defaultMode: 'STANDARD' as any,
    });
    aiProviderRegistry.register(geminiProvider);
    console.log('Gemini provider registered (disabled)');
  } else {
    console.log('Gemini API key not found - provider not registered');
  }

  // Configure AI service to use mock provider as primary for now
  aiService.updateConfig({
    primaryProvider: 'mock',
    fallbackProviders: geminiApiKey ? ['gemini'] : [],
    retryAttempts: 2,
    timeout: 30000,
    loadBalancing: 'round-robin'
  });

  console.log('AI provider system initialized with mock provider as primary');
}

// Auto-initialize when this module is imported
if (typeof window === 'undefined') {
  // Server-side initialization
  initializeAIProviders();
}

export { aiProviderRegistry, aiService };