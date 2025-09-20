'use server';

import { NextResponse } from 'next/server';
import { aiService } from '@/lib/ai';
import { GenerationType, AIMode, AI_MODE_CONFIG } from '@/types/ai';

// Provider-agnostic AI generation endpoint.
// Accepts JSON: { prompt: string; type: GenerationType; providerId?: string; options?: { temperature?: number; maxTokens?: number; model?: string } }
// If providerId supplied, attempts that provider first; otherwise normal service selection.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, type, providerId, options, mode } = body as { prompt: string; type: GenerationType; providerId?: string; options?: any; mode?: AIMode };

    // Resolve AI mode configuration if provided
    let resolvedOptions = { ...(options || {}) };
    if (mode && AI_MODE_CONFIG[mode]) {
      const cfg = AI_MODE_CONFIG[mode];
      // Do not override if explicitly provided
      if (resolvedOptions.temperature === undefined && cfg.temperature !== undefined) {
        resolvedOptions.temperature = cfg.temperature;
      }
      if (resolvedOptions.maxTokens === undefined && cfg.maxTokens !== undefined) {
        resolvedOptions.maxTokens = cfg.maxTokens;
      }
      if (resolvedOptions.model === undefined && cfg.model) {
        resolvedOptions.model = cfg.model;
      }
      resolvedOptions.mode = mode;
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!['topic','brainstorm','research','custom'].includes(type)) {
      return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
    }

    // If explicit provider requested ensure it exists & is enabled/healthy
    let explicitProvider = null;
    if (providerId) {
      const provider = aiService.getRegistry().getProvider(providerId);
      if (!provider) {
        return NextResponse.json({ error: 'Requested provider not found' }, { status: 404 });
      }
      const available = await provider.isAvailable();
      if (!available) {
        return NextResponse.json({ error: 'Requested provider unavailable' }, { status: 503 });
      }
      explicitProvider = provider;
    }

    // Build a pseudo request for aiService when using explicit provider
    const exec = async () => {
      if (explicitProvider) {
        return await (explicitProvider as any).generateContent({ prompt, type, options: resolvedOptions });
      }
      return await (aiService as any).generateContent(prompt, { type, options: resolvedOptions });
    };

    const result = await exec();

    // Normalize tags if provider omitted them
    let tags: string[] = Array.isArray(result.tags) ? result.tags : [];
    if (tags.length === 0) {
      const words = prompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const stop = new Set(['the','and','for','are','but','not','you','with','this','that']);
      const relevant = words.filter(w => !stop.has(w)).slice(0,3);
      tags = ['ai-generated', type, ...relevant];
    }

    return NextResponse.json({
      title: result.title || `AI ${type}: ${prompt.slice(0,40)}`,
      content: result.content,
      tags: Array.from(new Set(tags)),
      providerId: providerId || aiService.getConfig().primaryProvider,
      metadata: {
        requestedProvider: providerId || null,
         mode: resolvedOptions?.mode || null
      }
    });
  } catch (error) {
    console.error('AI generation failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}