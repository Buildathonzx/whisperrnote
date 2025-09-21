// Lazy AI initialization and dynamic imports
// Ensures no AI code is loaded until explicitly requested.

let _loading: Promise<LazyAI> | null = null;
let _loaded: LazyAI | null = null;

export interface LazyAI {
  service: typeof import('./index');
  openGenerateModal: (options?: { initialPrompt?: string; onGenerated?: (result: any) => void }) => Promise<void>;
}

export function isAILoaded() {
  return !!_loaded;
}

export async function ensureAI(): Promise<LazyAI> {
  if (_loaded) return _loaded;
  if (_loading) return _loading;
  _loading = (async () => {
    // Dynamically import needed modules only on demand
    const [aiModule, modalModule, overlayModule, React] = await Promise.all([
      import('./index'),
      import('@/components/AIGeneratePromptModal'),
      import('@/components/ui/OverlayContext'),
      import('react')
    ]);

    const { aiService } = aiModule;
    const { AIGeneratePromptModal } = modalModule;
    const { openOverlay, closeOverlay } = overlayModule.useOverlay();

    const openGenerateModal = async (options?: { initialPrompt?: string; onGenerated?: (result: any) => void }) => {
      const initialPrompt = options?.initialPrompt;
      const onGenerated = options?.onGenerated;
      // Mount modal directly; no provider dependency
      openOverlay(
        React.createElement(AIGeneratePromptModal, {
          onClose: closeOverlay,
          initialPrompt,
          isGenerating: false,
          onGenerate: async (prompt: string, type: 'topic' | 'brainstorm' | 'research' | 'custom') => {
            try {
              const safeType = type || 'custom';
              const result = await aiService.generateContent(prompt, safeType);
              onGenerated?.(result);
              closeOverlay();
            } catch (e) {
              console.error('AI generation failed', e);
            }
          }
        })
      );
    };

    _loaded = { service: aiModule, openGenerateModal } as LazyAI;
    return _loaded;
  })();
  try {
    return await _loading;
  } finally {
    _loading = null;
  }
}

// Provide a no-op placeholder for accidental calls before loading
export const aiNoop = {
  async generateContent() {
    throw new Error('AI not initialized');
  }
};
