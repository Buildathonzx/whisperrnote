# API Platform TODO

Legend: [ ] pending | [x] done | [~] in progress

## Foundations
- [x] Convert `/api/ai/generate` to provider-agnostic (remove hardcoded Gemini impl)
- [x] Support explicit `providerId` request param; fallback to auto selection via service
- [ ] Establish versioned API namespace (`/api/v1/...`) with migration plan
- [ ] Define unified error envelope `{ error: { code, message, details? } }`
- [ ] Create shared response helpers (success/error) module
- [ ] Introduce strict schema validation (Zod) for all request bodies & query params
- [ ] Add OpenAPI (Swagger) spec generation from schemas

## Authentication & API Keys
- [ ] DB schema: `api_keys(id, user_id, name, hash, prefix, last_used_at, created_at, revoked_at)`
- [ ] Key format: `<prefix>_<randomBase62>`; store only bcrypt/argon2 hash
- [ ] Endpoint: POST `/api/v1/auth/api-keys` (create key, return plaintext once)
- [ ] Endpoint: GET `/api/v1/auth/api-keys` (list masked keys + usage)
- [ ] Endpoint: DELETE `/api/v1/auth/api-keys/:id` (revoke)
- [ ] Middleware: extract `x-api-key` header -> validate prefix -> hash compare -> attach `authContext`
- [ ] Rate limit brute force on invalid key attempts
- [ ] Rotate key flow (create new, revoke old) guidance
- [ ] UI: Settings page section for API key management (create, copy, revoke)

## Authorization / Access Control
- [ ] Associate key scopes (e.g. `notes:read`, `notes:write`, `ai:generate`, `metrics:read`)
- [ ] Scope claim embedding in DB; enforce per route
- [ ] Tier-based generation limits (integrate subscription tier logic server-side)

## AI Provider Integration
- [x] Provider-agnostic generation route (auto or explicit provider selection)
- [ ] Route: `GET /api/v1/ai/providers` (list enabled + health)
- [ ] Route: `GET /api/v1/ai/providers/:id/health`
- [ ] Route: `POST /api/v1/ai/generate` (accept: prompt, type, providerId?, options, mode?)
- [ ] Support `mode` -> map to temperature/maxTokens/model override
- [ ] Add `providerId` & `mode` to response metadata
- [ ] Implement streaming endpoint (`/api/v1/ai/generate/stream`) for providers supporting it
- [ ] Abort support via `signal` / server-sent events close

## Security
- [ ] Middleware ordering: logging -> rateLimit -> apiKeyAuth -> bodyLimiter -> handler
- [ ] Body size limiting for generation requests
- [ ] IP-based heuristic throttling (progressive backoff)
- [ ] Structured error codes (`PROVIDER_NOT_AVAILABLE`, `RATE_LIMITED`, `INVALID_SCOPE`, etc.)
- [ ] Prevent prompt injection logging sensitive data

## Rate Limiting & Quotas
- [ ] Implement sliding window or token bucket per (api_key, route)
- [ ] Daily token usage counter (persist provider tokensUsed)
- [ ] Return `X-RateLimit-*` and `X-Usage-*` headers
- [ ] Graceful over-quota response with reset timestamp

## Observability & Logging
- [ ] Central logger (pino/winston) with requestId correlation
- [ ] Access log (method, path, status, duration, apiKeyPrefix, providerId)
- [ ] Error log with stack + code + provider metrics
- [ ] Metrics route (internal) summarizing per-provider success %, latency, tokens
- [ ] Optional OTEL tracing hooks

## Versioning Strategy
- [ ] Document breaking change policy
- [ ] Add `X-API-Version` negotiation header (default latest stable)
- [ ] Deprecation headers (`Sunset`, `Deprecation`) for legacy versions

## Developer Experience
- [ ] Publish OpenAPI JSON at `/api/v1/openapi.json`
- [ ] Provide Postman / Hoppscotch collection generator script
- [ ] Example cURL & JS client snippets in docs
- [ ] Generate lightweight TypeScript client from OpenAPI

## Testing
- [ ] Unit tests for auth middleware (valid/invalid/revoked keys)
- [ ] Load tests for rate limit boundaries
- [ ] Integration tests: provider fallback, explicit provider selection, error paths
- [ ] Fuzz tests for prompt field (length, unicode)

## Migration / Cleanup
- [ ] Remove legacy Gemini-specific code & dependency if unused
- [ ] Consolidate duplicate AI service definitions (single authoritative one)
- [ ] Replace ad-hoc console logs with structured logger

## Future / Stretch
- [ ] OAuth2 client credential flow alternative to API keys
- [ ] Fine-grained per-key model restrictions
- [ ] Billing integration (usage-based) hooks
- [ ] Webhook callbacks for long-running AI jobs
- [ ] Bulk generation batch endpoint (async job queue)

---
Last Updated: INITIAL DRAFT
