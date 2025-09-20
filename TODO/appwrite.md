# Appwrite Backend Refined TODO (Databases & Storage)

Legend: [ ] pending | [x] done | [~] in progress
Scope: Backward-compatible, additive changes only. Avoid destructive schema edits; prefer application guards before unique index migrations.

## 0. Current State Snapshot (2025-09-20)
- [x] Collections present: notes, tags, note_tags (pivot), note_revisions, ai_generations, comments, collaborators, reactions, activityLog, settings, apiKeys, walletMap, extensions.
- [x] Pivot in use: note_tags (dual-write implemented); legacy notes.tags & tags.notes arrays still exist (read fallback / migration safety).
- [x] Revisions: note_revisions storing full snapshots (title, content) + revision integer; diffing not yet implemented.
- [x] AI generations logging present; basic indexes (user+createdAt, promptHash, user+mode).
- [ ] No enforced uniqueness on composite logical keys (reactions, note_tags, collaborators) -> risk of duplicate rows.
- [ ] Aggregated counters (reaction counts, view counts, tag usage maintenance) not yet automated.
- [ ] Search layer (full text / token index) not yet implemented; only basic attribute filters.
- [ ] Arrays in notes (comments, collaborators, attachments, extensions) partly redundant with dedicated collections (bloat risk) but retained for compatibility.

## 1. Integrity & Uniqueness
- [ ] Application-level guard: prevent duplicate reaction (userId,targetType,targetId,emoji) before insert (pre-index uniqueness step).
- [ ] Application-level guard: prevent duplicate note_tags (noteId,tagId) and collaborators (noteId,userId) before insert.
- [ ] Data hygiene script: scan & soft-dedupe existing duplicates (log only, no deletion yet).
- [ ] Plan & schedule unique index rollout (staged): reactions composite, note_tags noteId+tagId, collaborators noteId+userId (ensure zero dupes first).

## 2. Counters & Aggregates
- [ ] Implement atomic tag usageCount updates on pivot add/remove (fallback reconciliation job).
- [ ] Introduce note_metrics (noteId, reactionsCount, commentsCount, viewsCount, lastActivityAt) – optional, only if dashboard requires fast aggregates.
- [ ] Write periodic consolidation function (idempotent) to recompute note_metrics & repair tag usageCount.
- [ ] Add lightweight reaction count cache into note.metadata (JSON) (increment/decrement with guard) – evaluate vs separate collection.

## 3. Revision Optimization
- [ ] Decide diff strategy: JSON Patch vs minimal text diff vs hash-only (add revision.diff + revision.diffFormat fields if chosen).
- [ ] Snapshot policy: fullSnapshot boolean every N (configurable, e.g. every 10 revisions) to bound replay cost.
- [ ] Retention policy: keep last N (e.g. 50) + milestone snapshots; trimming script respecting recent activity.
- [ ] Add revision provenance flag (cause: manual|ai|collab) for analytics.

## 4. Collaboration & Sharing
- [ ] Evaluate need for separate note_shares vs reusing collaborators collection (current model sufficient -> defer new collection to avoid bloat).
- [ ] Add permission change audit: log in activityLog with details (old->new, actor, target user).
- [ ] Add optional invite token flow (email pre-user) using collaborators (allow null userId + email attribute) instead of creating new note_shares collection.

## 5. Search & Indexing
- [ ] Defer dedicated note_index collection until usage justifies (avoid premature index bloat).
- [ ] Prototype external search (e.g. Meilisearch) using note id, title, tags; fall back to Appwrite queries if service unavailable.
- [ ] If internal only: add on-demand derived tokens (not stored persistently) for simple substring/tag filtering first.
- [ ] Prepare abstraction layer so search backend can swap without schema churn.

## 6. Attachments Handling
- [ ] Decide if attachments_meta needed (filtering by type/size). If yes, create minimal collection (fileId, noteId, kind, sizeBytes, createdAt) – defer until feature requires.
- [ ] Or store essential metadata in note.metadata.attachments[] (bounded) and rely on bucket listing for details.
- [ ] Orphan cleanup job for buckets (files without linkage > 24h) – leverage temp_uploads purge first.

## 7. Migration & Deprecation Roadmap
- [ ] Mark legacy arrays (notes.tags, tags.notes) as deprecated in code comments once read path confirmed stable via pivot.
- [ ] Phase out notes.comments & notes.collaborators arrays (ensure no code depends) – keep ONLY collections.
- [ ] Provide feature flag to disable writing to legacy arrays after confidence period.
- [ ] Document rollback (reenable dual-write + ignore pivot) before cutting arrays from write path.

## 8. Metrics & Instrumentation
- [ ] Implement activity ingestion pipeline: when reactions/comments created, bump note_metrics lastActivityAt.
- [ ] Add simple per-user quota counters (notesCreated, apiCalls) in activityLog or a new user_usage collection (defer schema until requirement firm).
- [ ] Expose instrumentation endpoints (internal) for health of counters vs raw tallies.

## 9. Security & Permissions
- [ ] Ensure internal helper collections (note_revisions, ai_generations, future note_metrics) not directly exposed to untrusted clients (API layer only).
- [ ] Add ownership assertion utility reused across CRUD functions (single source).
- [ ] Redact encrypted fields before logging (content, title) in revision diff logs.

## 10. Performance Tuning
- [ ] Validate existing indexes meet primary dashboard queries; add (userId DESC, updatedAt DESC) variant ONLY if query analyzer shows benefit (avoid duplicate direction indexes prematurely).
- [ ] Consider partial caching for recent N noteIds per user in memory (edge function / KV) before adding more DB indexes.
- [ ] Batch fetch tags for lists (already implemented) – monitor latency & adjust page size.

## 11. Consistency Jobs
- [ ] Duplicate detector (dry-run) for reactions / note_tags / collaborators (see Section 1) and emit report.
- [ ] Tag usage reconciliation (compute pivot counts vs stored usageCount).
- [ ] Revision trim executor respecting policy (Section 3).
- [ ] Orphan file scanner (Section 6).

## 12. Deferred / Dropped (To Reduce Bloat)
- [x] Separate note_shares collection (reused collaborators instead) – revisit only if email invite model diverges.
- [x] note_index collection (deferred; external search or lightweight dynamic approach first).
- [x] attachments_meta collection (defer until filtering/reporting use-cases emerge).
- [x] Embedding AI summary fields directly on notes (avoid widening hot document; keep detailed rows in ai_generations).

## 13. Open Decisions
- [ ] Diff format selection & tooling.
- [ ] Unique index timing (after zero-duplicate validation window length?).
- [ ] External vs internal search MVP scope.
- [ ] Metrics aggregation cadence (cron frequency vs event-driven only).

## 14. Execution Order (Revised Minimal Path)
1. Integrity guards in application layer (prevent new dupes).
2. Duplicate audit + cleanup plan (no deletes yet, just inventory).
3. Counters: implement tag usage & reaction counts (in metadata or metrics collection).
4. Revision diff & retention strategy.
5. Permission/invite enhancements (email invites via collaborators).
6. Search prototype (external or dynamic tokens) – decision gate.
7. Metrics aggregation & note_metrics (if still needed post-search decisions).
8. Unique index rollout (post-validation) & array deprecation flags.
9. Optional attachment metadata if feature demand arises.

## 15. Completed (Historical)
- [x] Create note_tags pivot & batch hydration logic.
- [x] Implement note_revisions collection & initial revision logging.
- [x] Add ai_generations collection & indexes.
- [x] Add tags.nameLower attribute + index (case-insensitive tag uniqueness basis).
- [x] Shrink reactions.userId size to satisfy composite index limits.

---
Last Updated: 2025-09-20
