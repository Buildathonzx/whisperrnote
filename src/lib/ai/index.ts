import { aiProviderRegistry, aiService } from '@/lib/ai/registry';
import { createMockProvider } from '@/lib/ai/providers/mock';
import { createGeminiProvider } from '@/lib/ai/providers/gemini';
import { createGitHubModelsProvider } from '@/lib/ai/providers/github';

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

  // Register GitHub Models provider if GitHub token is available
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    const githubProvider = createGitHubModelsProvider({
      githubToken,
      enabled: true, // Enable GitHub Models by default when token is available
      model: 'gpt-4o-mini', // Default model
    });
    aiProviderRegistry.register(githubProvider);
    console.log('GitHub Models provider registered (enabled)');
  } else {
    console.log('GitHub token not found - GitHub Models provider not registered');
  }

  // Configure AI service with primary provider based on availability
  const primaryProvider = githubToken ? 'github-models' : 'mock';
  const fallbackProviders = [
    ...(githubToken ? ['github-models'] : []),
    ...(geminiApiKey ? ['gemini'] : []),
    'mock'
  ].filter((provider, index, arr) => arr.indexOf(provider) === index && provider !== primaryProvider);

  aiService.updateConfig({
    primaryProvider,
    fallbackProviders,
    retryAttempts: 2,
    timeout: 30000,
    loadBalancing: 'round-robin'
  });

  console.log(`AI provider system initialized with ${primaryProvider} as primary provider`);
}

// Auto-initialize when this module is imported
if (typeof window === 'undefined') {
  // Server-side initialization
  initializeAIProviders();
}

export { aiProviderRegistry, aiService };