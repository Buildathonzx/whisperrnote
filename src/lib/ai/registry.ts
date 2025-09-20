import { AIProvider, AIProviderRegistry, AIServiceConfig } from '@/types/ai';

export class DefaultAIProviderRegistry implements AIProviderRegistry {
  private providers = new Map<string, AIProvider>();
  private enabledProviders = new Set<string>();

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
    
    // Initialize the provider
    provider.initialize().catch(error => {
      console.warn(`Failed to initialize AI provider ${provider.id}:`, error);
    });
    
    // Enable by default if config allows
    if (provider.getConfig().enabled) {
      this.enabledProviders.add(provider.id);
    }
    
    console.log(`Registered AI provider: ${provider.name} (${provider.id})`);
  }

  unregister(providerId: string): void {
    const provider = this.providers.get(providerId);
    if (provider) {
      // Cleanup the provider
      provider.cleanup().catch(error => {
        console.warn(`Failed to cleanup AI provider ${providerId}:`, error);
      });
      
      this.providers.delete(providerId);
      this.enabledProviders.delete(providerId);
      console.log(`Unregistered AI provider: ${providerId}`);
    }
  }

  getProvider(providerId: string): AIProvider | null {
    return this.providers.get(providerId) || null;
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  getEnabledProviders(): AIProvider[] {
    return Array.from(this.providers.values()).filter(provider => 
      this.enabledProviders.has(provider.id)
    );
  }

  setProviderEnabled(providerId: string, enabled: boolean): void {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`AI provider ${providerId} not found`);
    }

    if (enabled) {
      this.enabledProviders.add(providerId);
      provider.updateConfig({ ...provider.getConfig(), enabled: true });
    } else {
      this.enabledProviders.delete(providerId);
      provider.updateConfig({ ...provider.getConfig(), enabled: false });
    }
    
    console.log(`AI provider ${providerId} ${enabled ? 'enabled' : 'disabled'}`);
  }

  async getHealthyProviders(): Promise<AIProvider[]> {
    const enabledProviders = this.getEnabledProviders();
    const healthyProviders: AIProvider[] = [];

    for (const provider of enabledProviders) {
      try {
        const isAvailable = await provider.isAvailable();
        if (isAvailable) {
          healthyProviders.push(provider);
        }
      } catch (error) {
        console.warn(`AI provider ${provider.id} health check failed:`, error);
      }
    }

    return healthyProviders;
  }

  getProviderMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    for (const [providerId, provider] of this.providers) {
      metrics[providerId] = {
        ...provider.getMetrics(),
        capabilities: provider.capabilities,
        enabled: this.enabledProviders.has(providerId)
      };
    }
    
    return metrics;
  }
}

export class AIService {
  private registry: AIProviderRegistry;
  private config: AIServiceConfig;
  private currentProviderIndex = 0;

  constructor(
    registry: AIProviderRegistry,
    config: AIServiceConfig = {
      retryAttempts: 2,
      timeout: 30000,
      loadBalancing: 'round-robin'
    }
  ) {
    this.registry = registry;
    this.config = config;
  }

  async generateContent(
    prompt: string,
    typeOrRequest: any,
    genOptions: any = {}
  ): Promise<any> {
    // Backward compatibility: allow (prompt, type, options) or (prompt, { type, options })
    let type: any;
    let options: any;
    if (typeof typeOrRequest === 'string') {
      type = typeOrRequest;
      options = genOptions || {};
    } else if (typeOrRequest && typeof typeOrRequest === 'object') {
      type = typeOrRequest.type;
      options = { ...(typeOrRequest.options || {}), ...(genOptions || {}) };
    } else {
      throw new Error('Invalid generation request arguments');
    }

    const healthyProviders = await this.registry.getHealthyProviders();
    if (healthyProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    let lastError: Error | null = null;

    // Try primary provider first if configured
    if (this.config.primaryProvider) {
      const primaryProvider = this.registry.getProvider(this.config.primaryProvider);
      if (primaryProvider && healthyProviders.includes(primaryProvider)) {
        try {
          return await this.tryGenerateWithProvider(primaryProvider, { prompt, type, options });
        } catch (error) {
          console.warn(`Primary provider ${this.config.primaryProvider} failed:`, error);
          lastError = error as Error;
        }
      }
    }

    // Try other providers based on load balancing strategy
    const providersToTry = this.selectProvidersForLoadBalancing(healthyProviders);
    for (const provider of providersToTry) {
      if (provider.id === this.config.primaryProvider) continue; // Already tried primary provider
      try {
        return await this.tryGenerateWithProvider(provider, { prompt, type, options });
      } catch (error) {
        console.warn(`Provider ${provider.id} failed:`, error);
        lastError = error as Error;
      }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  private async tryGenerateWithProvider(provider: AIProvider, request: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const result = await provider.generateContent(request);
      clearTimeout(timeoutId);
      return {
        ...result,
        provider: provider.id
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === 'AbortError') {
        throw new Error(`Provider ${provider.id} timed out after ${this.config.timeout}ms`);
      }
      const message = error?.message || 'Unknown AI provider error';
      throw new Error(`${provider.id} error: ${message}`);
    }
  }

  private selectProvidersForLoadBalancing(providers: AIProvider[]): AIProvider[] {
    switch (this.config.loadBalancing) {
      case 'round-robin':
        // Rotate through providers
        const reorderedProviders = [
          ...providers.slice(this.currentProviderIndex),
          ...providers.slice(0, this.currentProviderIndex)
        ];
        this.currentProviderIndex = (this.currentProviderIndex + 1) % providers.length;
        return reorderedProviders;
        
      case 'random':
        return [...providers].sort(() => Math.random() - 0.5);
        
      case 'performance':
        // Sort by average response time (ascending)
        return [...providers].sort((a, b) => 
          a.getMetrics().averageResponseTime - b.getMetrics().averageResponseTime
        );
        
      case 'least-used':
        // Sort by total requests (ascending)
        return [...providers].sort((a, b) => 
          a.getMetrics().totalRequests - b.getMetrics().totalRequests
        );
        
      default:
        return providers;
    }
  }

  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AIServiceConfig {
    return { ...this.config };
  }

  getRegistry(): AIProviderRegistry {
    return this.registry;
  }

  async getServiceHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    availableProviders: number;
    totalProviders: number;
    metrics: Record<string, any>;
  }> {
    const allProviders = this.registry.getAvailableProviders();
    const healthyProviders = await this.registry.getHealthyProviders();
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';
    
    if (healthyProviders.length === allProviders.length && allProviders.length > 0) {
      status = 'healthy';
    } else if (healthyProviders.length > 0) {
      status = 'degraded';
    }
    
    return {
      status,
      availableProviders: healthyProviders.length,
      totalProviders: allProviders.length,
      metrics: this.registry.getProviderMetrics()
    };
  }
}

// Global registry instance
export const aiProviderRegistry = new DefaultAIProviderRegistry();

// Global AI service instance
export const aiService = new AIService(aiProviderRegistry);