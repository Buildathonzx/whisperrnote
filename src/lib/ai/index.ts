import { aiProviderRegistry, aiService } from '@/lib/ai/registry';
import { createMockProvider } from '@/lib/ai/providers/mock';
import { createGitHubModelsProvider } from '@/lib/ai/providers/github';

// Initialize AI providers based on environment and configuration
export function initializeAIProviders() {
  console.log('Initializing AI provider system...');

  // Always register mock provider for development and fallback
  const mockProvider = createMockProvider({
    enabled: true
  });
  aiProviderRegistry.register(mockProvider);

  // Gemini provider disabled - using GitHub Models only
  console.log('Gemini provider disabled by configuration');

  // Register GitHub Models provider if GitHub token is available
  const githubToken = process.env.GITHUB_TOKEN;
  if (githubToken) {
    const githubProvider = createGitHubModelsProvider({
      githubToken,
      enabled: true, // Enable GitHub Models by default when token is available
      model: 'gpt-4.1', // Default model
    });
    aiProviderRegistry.register(githubProvider);
    console.log('GitHub Models provider registered (enabled)');
  } else {
    console.log('GitHub token not found - GitHub Models provider not registered');
  }

  // Configure AI service with primary provider (GitHub Models only)
  const primaryProvider = githubToken ? 'github-models' : 'mock';
  const fallbackProviders = [
    ...(githubToken ? ['github-models'] : []),
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
// Prevent duplicate initialization (especially in hot reload / edge environments)
const globalAny: any = globalThis as any;
if (!globalAny.__AI_PROVIDERS_INITIALIZED__) {
  if (typeof window === 'undefined') {
    initializeAIProviders();
  }
  globalAny.__AI_PROVIDERS_INITIALIZED__ = true;
}

export { aiProviderRegistry, aiService };