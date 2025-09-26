# Ephemeral / Auto-Expiring Notes Proposal

## Goals
- Allow users to create notes that automatically expire (soft delete) after a configurable duration.
- Provide optional irreversible auto-destruction for sensitive content.
- Preserve existing note model compatibility with minimal schema changes.

## Use Cases
- Temporary scratchpads for brainstorming.
- One-time secret sharing (password fragments, tokens, instructions) with limited lifetime.
- Auto-cleanup of transient working notes to reduce clutter.

## Scope (Phase 1)
- Add `expiresAt` (datetime, nullable) attribute to Notes collection.
- Add `ephemeral` (boolean, default false) attribute to distinguish behavior/UX.
- Prevent viewing/editing after expiration; display a "Expired" placeholder with option to duplicate (if not hard-destroyed).
- Exclude expired notes from standard list/search queries.

## Optional (Phase 2)
- Hard destruction mode: `destructionMode: 'soft' | 'hard'` (or boolean `hardDestroy`). Hard destroy removes content & attachments immediately at or shortly after expiry.
- One-view notes: mark as expired after first successful load.
- Notifications: pre-expiry reminder (e.g., 24h before) if duration > 24h.

## Schema Changes (Appwrite Notes Collection)
- `expiresAt`: DateTime (ISO) nullable.
- `ephemeral`: Boolean default false.
- (Phase 2) `hardDestroy`: Boolean default false.
- (Phase 2) `oneView`: Boolean default false.

Indexes:
- Composite index on (`userId`, `expiresAt`) for cleanup queries.
- (Optional) Index on `expiresAt` alone for global cron clean sweep.

## Client UX
Creation:
- In note creation modal / header actions: Ephemeral toggle reveals duration presets:
  - 10 minutes, 1 hour, 24 hours, 7 days, Custom...
- Selecting preset sets `expiresAt = now + duration` and sets `ephemeral=true`.

Display:
- Badge next to title: "Expires in Xh Ym" (auto-updates every minute).
- If expired: disable editor, show callout: "This note expired <relative time>. Duplicate to restore contents." (if still soft-retained).

Editing:
- Changing duration updates `expiresAt` (cannot extend after hard expiration if hardDestroy already processed).

## API Adjustments
- Extend note create/update endpoints to accept `expiresAt` & `ephemeral` (validate: future time, reasonable max e.g. 30 days for ephemeral notes).
- Central note fetch util filters out expired unless `includeExpired` flag used (admin or direct ID fetch returns placeholder metadata with `expired=true`).
- Search/list functions add condition `expiresAt == null OR expiresAt > now`.

## Cleanup Strategy
Strategy A (Preferred): Scheduled function every 5-10 minutes:
1. Query notes where `expiresAt <= now` and `ephemeral=true` and not yet flagged `expiredProcessed`.
2. For soft mode: mark `expiredProcessed=true` and optionally redact body (Phase 2).
3. For hardDestroy: delete note document + related attachments (list attachments by noteId field) then record minimal tombstone if auditing required.

Strategy B: On-access lazy enforcement:
- When fetching a note, if expired, perform expiration workflow inline.
- Reduces scheduled infra but adds latency spikes on first post-expiry access.

Hybrid: Use lazy + daily sweep fallback.

## Data Retention / Security
- For sensitive content, recommend Phase 2 hard destruction which:
  - Deletes attachments (blob/files) first
  - Overwrites note content with a constant string before deletion (defense-in-depth vs forensic recovery in storage layers if any).

## Backward Compatibility
- Existing notes remain unaffected (`expiresAt = null`).
- Clients that ignore new fields simply see normal behavior.

## Edge Cases
- User changes system clock (client-side) – server authoritative timestamp used.
- Rapid creation with very short expiry (<1m) – UI should show "Expires soon" instead of flickering countdown.
- One-view + attachments: downloading counts as view? (Define view = initial note content fetch only; attachments remain accessible until note expiry.)

## Incremental Rollout Plan
1. Add schema fields + minimal API filtering (feature flagged).
2. Add creation UI + badge countdown.
3. Implement scheduled cleanup (soft first).
4. Add hard destruction + one-view modes.
5. Add reminders & notifications.

## Open Questions
- Should expired soft notes be recoverable? (Need `deletedAt` style retention window.)
- Should attachments have independent expiry? (Out of scope initially.)
- Need audit log of destruction events? (Optional table/log.)

## Success Metrics
- % of ephemeral notes auto-cleaned without user complaints.
- Reduction in average note clutter (notes not modified > N days) after adoption.
- No unauthorized access to expired content (security verification tests).

## Implementation Notes
- Central helper: `isNoteExpired(note)` using server `Date.now()`.
- Avoid client trusting its own clock for destructive actions.
- Add small server-side grace window (e.g., 2s) to avoid race conditions at exact expiry moment.
