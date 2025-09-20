# AI Notes System TODO

Legend: [ ] pending | [x] done | [~] in progress

## Immediate Fixes
- [ ] Unify duplicate `GenerationType` / `GenerationResult` definitions (remove or refactor `src/lib/ai-service.ts` to use `types/ai.ts`)
- [ ] Remove redundant AIService wrapper (`src/lib/ai-service.ts`) or convert to simple re-export to avoid confusion with registry service
- [ ] Ensure provider initialization on both server & client (explicit init hook for client if needed)
- [ ] Normalize error objects & messages returned from providers

## Feature Gaps
- [ ] Connect `AIMode` (temperature/model/maxTokens) to generation requests (currently unused downstream)
- [ ] Provider selection UI + surface provider health/metrics
- [ ] Streaming generation support (capability flag + incremental UI render)
- [ ] Abort / cancel generation (wire `AbortController` through context & UI button)
- [ ] System prompt templating per (Mode × GenerationType) with extensible template layer
- [ ] User-defined custom prompt templates save & reuse

## Reliability & Resilience
- [ ] Retry strategy (exponential backoff + jitter) across fallback providers (currently sequential single attempt)
- [ ] Health check API route exposing `aiService.getServiceHealth()`
- [ ] Configurable timeouts via env (replace hardcoded 30000ms)
- [ ] Structured logging (provider id, latency, tokens, error code) instead of raw `console.*`
- [ ] Circuit breaker / temporary disable failing provider after threshold

## Data & Note Integration
- [ ] Auto-create & persist generated note with title, content, tags immediately after success
- [ ] Refine tag extraction (limit count, filter stopwords, unify case)
- [ ] Merge user-specified tags (avoid duplicates)
- [ ] Add provenance metadata (`aiProvider`, `model`, `mode`, `tokensUsed`) to note schema

## Subscription & Access Control
- [ ] Server-side enforcement of `AIMode` by subscription tier (currently only client gating)
- [ ] Rate limiting per user (requests / minute + daily cap)
- [ ] Quota tracking (tokens per period) & graceful over-quota messaging
- [ ] Audit log of generations (user id, provider, mode, timestamp)

## Testing & Quality
- [ ] Unit tests for load balancing strategies (`round-robin`, `random`, `performance`, `least-used`)
- [ ] Fallback path test: primary failure -> secondary success -> metrics update
- [ ] Tag extraction algorithm tests (edge cases, empty prompt)
- [ ] Snapshot tests for system prompt templates
- [ ] Mock provider latency & failure injection harness

## Observability & Metrics
- [ ] Aggregate provider metrics dashboard component (success %, avg latency, token usage)
- [ ] Alerting thresholds (e.g., success rate < 80%)
- [ ] Daily metrics rollup job (persist aggregates)

## Documentation
- [ ] Update `AI_INTEGRATION.md` with architecture diagram (registry, service, providers, UI flow)
- [ ] Add provider integration checklist (capabilities, config, metrics, health)
- [ ] Document required env vars (`GITHUB_TOKEN`, optional others) in README
- [ ] Describe subscription enforcement & rate limit model

## Refactors
- [ ] Consolidate AI service single source (eliminate duplicate service definition)
- [ ] Extract tag generation & title parsing into pure utility module with tests
- [ ] Introduce typed error classes (`ProviderTimeoutError`, `ProviderUnavailableError`, etc.)
- [ ] Replace ad-hoc string parsing in GitHub provider with structured markdown parser (optional)

## Stretch / Future
- [ ] Multi-step chained generation (research -> brainstorm -> outline)
- [ ] Embeddings / semantic search integration for context injection
- [ ] Local/offline lightweight model fallback (stub or wasm) for no-network mode
- [ ] Prompt caching / deduplication (hash of normalized prompt)
- [ ] User feedback loop (thumbs up/down to refine prompts & ranking)
- [ ] Tool/function calling capability for research mode (web fetch, summarize)

## Cleanup / Hygiene
- [ ] Guard against empty prompt earlier in UI (disable Generate)
- [ ] Consistent naming: use `aiProviderRegistry` & `aiService` only (remove legacy wrappers)
- [ ] Remove unused console logs in production build (flag-based)

---
Last Updated: INITIAL DRAFT
