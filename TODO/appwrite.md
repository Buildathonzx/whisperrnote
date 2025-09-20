# Appwrite Backend Revamp TODO (Databases & Storage Only)

Legend: [ ] pending | [x] done | [~] in progress
Scope: Augment ONLY (no destructive edits); preserve all existing collection & attribute IDs. Additive, backward-compatible strategy for scaling notes, tags, collaborations, AI metadata, and future features.

## 1. Data Modeling Improvements
- [ ] Introduce explicit many-to-many join collection `note_tags` (noteId, tagId, userId, createdAt)
- [ ] Keep legacy `notes.tags` & `tags.notes` arrays during transition (dual-write phase)
- [ ] Add collection `note_revisions` (noteId, userId, revisionNumber, diff|hash, createdAt, size, isAI)
- [ ] Add collection `note_shares` (noteId, sharedWithUserId|email, permission enum: read|comment|edit, invitedAt, acceptedAt, token)
- [ ] Add optional AI metadata collection `ai_generations` (noteId, userId, providerId, model, mode, tokensUsed, latencyMs, success, createdAt, sourcePromptHash)
- [ ] Add `notes` new optional attributes: `aiProvider` (string 64), `aiModel` (string 128), `aiMode` (string 32), `tokensUsed` (integer), `generatedAt` (datetime)
- [ ] Add collection `note_index` (noteId, userId, titleTokens, tagTokens, updatedAt) for lightweight search caching
- [ ] Add collection `attachments_meta` (fileId, noteId, userId, kind enum: image|pdf|code|other, sizeBytes, createdAt)

## 2. Backwards Compatibility & Migration
- [ ] Phase 0: Design schemas & IDs (all lowercase, concise) and review before applying
- [ ] Phase 1: Create new collections without altering existing usage
- [ ] Phase 2: Implement dual-write (app code writes arrays + join collections)
- [ ] Phase 3: Backfill join & revision data via script/function
- [ ] Phase 4: Enable read-from new sources (prefer join; fallback arrays)
- [ ] Phase 5: (Optional later) Mark legacy array fields internally deprecated (NO removal until major version)

## 3. Collections - Detailed Schema Tasks
- [ ] `note_tags` indexes: (noteId ASC, tagId ASC unique), (tagId ASC), (userId ASC)
- [ ] `note_revisions` indexes: (noteId DESC, revisionNumber DESC), (userId ASC)
- [ ] `note_shares` indexes: (noteId ASC, sharedWithUserId ASC unique), (noteId ASC), (sharedWithUserId ASC)
- [ ] `ai_generations` indexes: (noteId ASC), (userId ASC, createdAt DESC), (providerId ASC, createdAt DESC)
- [ ] `note_index` indexes: (userId ASC, updatedAt DESC), (titleTokens ASC), (tagTokens ASC)
- [ ] `attachments_meta` indexes: (noteId ASC), (userId ASC), (kind ASC)

## 4. Attribute Design (Appwrite Constraints)
- [ ] Confirm max string sizes (tokens fields use <=1000 chars aggregated)
- [ ] Use `integer` for tokensUsed/latencyMs; avoid float
- [ ] Use standardized datetime fields: createdAt / updatedAt / generatedAt
- [ ] Avoid premature encryption on index/search helper collections (indexing requires plaintext)

## 5. Notes & Tags Improvements
- [ ] Normalized tag frequency: maintain `tags.usageCount` atomically on join insert/delete
- [ ] Enforce case-insensitive unique constraint for tag `name` per user (add deterministic lowercase name attribute `nameLower` + index)
- [ ] Add attribute `nameLower` to `tags` (size 256) + unique index (userId, nameLower)
- [ ] Introduce soft-delete pattern (add optional `deletedAt` to notes, tags) for recovery & indexing hygiene

## 6. AI Metadata Strategy
- [ ] Decide between embedding AI metadata in `notes` vs separate `ai_generations` (final: dual: summary on note, detailed rows separate)
- [ ] Store original prompt hash (SHA-256 hex truncated) not full prompt for privacy & dedupe
- [ ] Add provider health snapshot fields (providerId, latencyMs, success flag)
- [ ] Support regenerations: multiple rows per note -> latest successful updates note summary fields

## 7. Revisions & Auditability
- [ ] Capture revision on: create, manual save, AI generation, collaborator save
- [ ] Store diff (JSON patch or semantic hash) vs full to reduce storage (decide format field `diffFormat`)
- [ ] Add optional `fullSnapshot` boolean (true every N revisions for restore speed)
- [ ] Link to ActivityLog by storing revision id in activity details

## 8. Collaboration & Sharing
- [ ] Move ephemeral `collaborators` array logic toward authoritative `note_shares`
- [ ] Support external email invites (email stored; userId null until acceptance)
- [ ] Add `permission` escalation logging to ActivityLog

## 9. Search & Indexing
- [ ] Populate `note_index` asynchronously (function trigger after note write)
- [ ] Tokenization: lowercase, strip punctuation, limit tokens count
- [ ] Provide lightweight search API using `note_index` + secondary filtering by tags via `note_tags`
- [ ] (Future) Evaluate vector/embedding store (separate system) for semantic search—keep placeholder attribute `embeddingRef` in `note_index`

## 10. Attachments & Storage
- [ ] Enforce attachment metadata row for each stored file (consistency check job)
- [ ] Add cleanup job for orphan files (no `attachments_meta` row & older than grace period)
- [ ] Add `temp_uploads` lifecycle: auto-purge unlinked >24h (scheduled function)

## 11. Performance & Index Tuning
- [ ] Add composite index for common dashboard query: (userId ASC, updatedAt DESC) on notes
- [ ] Add index (userId ASC, createdAt DESC) on notes for chronological fetch
- [ ] Add index (noteId ASC, createdAt DESC) on comments for pagination (currently missing)
- [ ] Evaluate reaction summary caching (aggregate counts per note into `metadata` or separate `note_metrics` collection)

## 12. Metrics & Instrumentation
- [ ] Add `note_metrics` collection (noteId, viewsCount, reactionsCount, commentsCount, lastActivityAt)
- [ ] Write consolidation function: periodic recompute from raw collections
- [ ] Protect heavy analytics queries (pre-aggregated access only)

## 13. Consistency & Integrity Jobs
- [ ] Backfill job: arrays -> join table (`notes.tags` & `tags.notes` -> `note_tags`)
- [ ] Referential check: remove dangling join rows where note/tag missing
- [ ] Revision trim policy (keep last N + milestones)
- [ ] Metrics rebuild script (idempotent)

## 14. Security & Permissions (Within DB Scope)
- [ ] Ensure all new collections mirror existing permission model (create users; doc-level security ON where needed)
- [ ] Add per-row ownership enforcement (store userId; validate in API layer)
- [ ] Avoid exposing internal helper collections (`note_index`, `ai_generations`) directly to client—access through API only

## 15. Migration Plan (Execution Order)
1. Define & review new schemas (PR + signoff)
2. Create new collections & attributes (no code changes yet)
3. Implement dual-write in service layer (notes/tags updates also write note_tags)
4. Backfill historical data
5. Deploy read-path changes (prefer joins)
6. Introduce revisions & AI metadata writes
7. Add indexes after data volume estimation (avoid premature index bloat)
8. Activate search/index function
9. Add metrics aggregation
10. Optimize & prune unused legacy array reads (final sweep)

## 16. Risk Mitigation
- [ ] Feature flag dual-write & read-switch
- [ ] Dry-run validation script before each batch (counts, null anomalies)
- [ ] Rollback plan: keep legacy arrays pristine until completion

## 17. Open Questions
- [ ] Diff format decision: JSON Patch vs line-based vs hash-only
- [ ] Frequency of full revision snapshots
- [ ] AI token usage billing integration (future external system?)
- [ ] Tag global vs per-user namespace option

## 18. Immediate Next Actions
- [ ] Approve proposed new collection IDs & schema list
- [ ] Implement schema creation in staging (DO NOT touch production yet)
- [ ] Add planning doc section referencing this TODO in README or ARCHITECTURE.md

---
Last Updated: INITIAL DRAFT
