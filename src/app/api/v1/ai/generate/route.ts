'use server';

import { NextResponse } from 'next/server';
import { aiService } from '@/lib/ai';
import { GenerationType, AIMode, AI_MODE_CONFIG } from '@/types/ai';

// v1 AI generation endpoint with explicit response schema & API key stub
// Request JSON: { prompt: string; type: GenerationType; mode?: AIMode; providerId?: string; options?: {...} }
// Optional Header: X-API-Key (future validation)
export async function POST(request: Request) {
  const started = Date.now();
  try {
    const body = await request.json();
    const { prompt, type, providerId, options, mode } = body as { prompt: string; type: GenerationType; providerId?: string; options?: any; mode?: AIMode };

    const apiKey = request.headers.get('x-api-key') || request.headers.get('X-API-Key');
    // TODO(api-key): validate apiKey when storage & hashing implemented

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required', code: 'BAD_REQUEST' }, { status: 400 });
    }

    if (!['topic','brainstorm','research','custom'].includes(type)) {
      return NextResponse.json({ error: 'Invalid generation type', code: 'BAD_REQUEST' }, { status: 400 });
    }

    // Resolve AI mode + merge non-overriding options
    let resolvedOptions = { ...(options || {}) };
    let resolvedMode: AIMode | null = null;
    if (mode && AI_MODE_CONFIG[mode]) {
      const cfg = AI_MODE_CONFIG[mode];
      if (resolvedOptions.temperature === undefined && cfg.temperature !== undefined) resolvedOptions.temperature = cfg.temperature;
      if (resolvedOptions.maxTokens === undefined && cfg.maxTokens !== undefined) resolvedOptions.maxTokens = cfg.maxTokens;
      if (resolvedOptions.model === undefined && cfg.model) resolvedOptions.model = cfg.model;
      resolvedMode = mode;
    }

    // Explicit provider path
    let explicitProvider = null as any;
    if (providerId) {
      const provider = aiService.getRegistry().getProvider(providerId);
      if (!provider) {
        return NextResponse.json({ error: 'Requested provider not found', code: 'PROVIDER_NOT_FOUND' }, { status: 404 });
      }
      const available = await provider.isAvailable();
      if (!available) {
        return NextResponse.json({ error: 'Requested provider unavailable', code: 'PROVIDER_UNAVAILABLE' }, { status: 503 });
      }
      explicitProvider = provider;
    }

    const execution = async () => {
      if (explicitProvider) {
        return await explicitProvider.generateContent({ prompt, type, options: resolvedOptions });
      }
      return await (aiService as any).generateContent(prompt, { type, options: resolvedOptions });
    };

    const result = await execution();

    // Normalize tags
    let tags: string[] = Array.isArray(result.tags) ? result.tags : [];
    if (tags.length === 0) {
      const words = prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const stop = new Set(['the','and','for','are','but','not','you','with','this','that']);
      const relevant = words.filter(w => !stop.has(w)).slice(0,3);
      tags = ['ai-generated', type, ...relevant];
    }

    const durationMs = Date.now() - started;

    return NextResponse.json({
      data: {
        title: result.title || `AI ${type}: ${prompt.slice(0,40)}`,
        content: result.content,
        tags: Array.from(new Set(tags)),
      },
      meta: {
        providerId: result.provider || providerId || aiService.getConfig().primaryProvider || null,
        requestedProvider: providerId || null,
        mode: resolvedMode,
        durationMs,
        options: resolvedOptions,
        // placeholder; will be populated when api key tracking added
        apiKeyValid: apiKey ? false : null
      }
    });
  } catch (error) {
    console.error('AI v1 generation failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
