# AI Decoupling Plan

Goal: Make AI 100% non-blocking, opt-in, and lazily initialized only after explicit user intent (clicking an AI action). Core CRUD (create/update/delete/list notes) must never import or wait on AI modules.

## Current Problems
- AIContext mounts eagerly (in global tree) causing service health calls at load.
- Pages (e.g. notes) import `aiService` and AI modal components directly — bundles AI code into initial JS payload.
- MobileFAB shows AI button state ("AI Unavailable") creating perception/blocking when AI not ready.
- URL param `ai-prompt` triggers AI modal even if user did not ask yet.

## Target Architecture
1. Core app loads with zero AI code (tree-shaken) unless user triggers AI.
2. A thin AI bootstrap utility dynamically imports:
   - `aiService`
   - `AIGeneratePromptModal`
   - `AIProvider` (context)
3. An `AIManager` singleton handles on-demand initialization; returns a promise that resolves when provider + services are ready.
4. UI entry points (AI button, future slash commands) call `AIManager.ensureReady()` before opening modal.
5. No AI context hook on core pages; instead a transient ephemeral invocation pipeline.
6. If user never clicks AI, no network calls / no extra JS.

## Implementation Steps
1. Create `src/lib/ai/lazy.ts` exporting:
   - `ensureAI(): Promise<LazyAI>` which dynamic imports needed modules.
   - Provide a lightweight state to prevent duplicate loads.
2. Replace all direct `import { aiService }` in UI with `ensureAI().then(ai => ai.service.generateContent(...))`.
3. Remove AI handler registration logic from `notes/page.tsx`.
4. Modify `MobileFAB`:
   - Render a generic "Spark" button (label: "AI") only.
   - On click: start spinner, call `ensureAI()`, then open modal.
   - Until loaded, no disabled/unavailable messaging; just lazy load.
5. Delete/useOptionalAI logic if provider no longer required globally; provider mounted ad-hoc:
   - On first AI usage, open an overlay that internally wraps modal with `AIProvider`.
6. Refactor `AIGeneratePromptModal` to accept `generate(prompt,type)` function prop so it does not depend on context.
7. Provide a no-op shim so any accidental `useAI` call fails fast in dev (console.warn) but does not crash prod.
8. Remove `ai-prompt` URL auto-trigger; store it and only offer a one-time toast: "Generate note from saved prompt?" requiring click.
9. Add type-safe result contract for generation to avoid `any` creep.
10. Add defensive abort controller & timeout inside generation wrapper to prevent UI freeze.

## Non-Goals (Now)
- Improving underlying AI provider registry logic.
- Adding retries/backoff (can be future enhancement).
- Persisting AI generation history.

## Risk Mitigations
- All dynamic imports behind feature-detected environment (guard SSR with `typeof window`).
- If dynamic import fails, show toast: "AI failed to load" and continue normal operation.
- Gracefully scope CSS (modal) so code-splitting does not cause FOUC.

## Acceptance Criteria
- Fresh load: network panel shows 0 AI-related JS until AI button clicked.
- Disabling network after load but before AI click: note CRUD still functional.
- AI click with failing load: user sees error toast; app remains interactive.
- No console errors from missing AI provider if never used.

## Follow-Up (Optional)
- Preload AI bundle after idle (requestIdleCallback) if user frequently uses AI.
- Add AI usage metrics gating future prefetch heuristics.

---
Meta: Implement in small commits; first introduce lazy loader & migrate MobileFAB, then strip context usage from notes page.
