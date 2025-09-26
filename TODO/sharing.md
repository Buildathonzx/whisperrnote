# Sharing & Collaboration Rollout

## 1. Current Gaps
- Public profile/notes toggle not enforcing Appwrite document permissions
- No functional "share with" flow (missing invite -> accept cycle)
- Collaborators array on `notes` collection unused / not normalized
- No read access for invited users (Appwrite permissions remain owner-only)
- Attachments inherit bucket-wide user perms only (no per-file restriction / signed URL gating for collaborators)
- No access control abstraction layer in `src/lib/appwrite` (scattered logic)
- Missing public note retrieval route (SEO / open read) with authorization fallbacks

## 2. Guiding Principles (Phase 1: Simple Sharing)
- Anyone can share a note with any registered user (owner grants access)
- Sharing = adds collaborator record + updates note permissions for read (and optionally write)
- Public notes readable without auth if `isPublic=true`
- Keep Appwrite security: use Document-level ACLs (read: user IDs, write: owner + explicit writers)
- Attachments access mediated via signed URL if note is shared or public

## 3. Data Model Alignment
Collections involved:
- `notes` (has `collaborators` array now — will migrate to dedicated collection)
- `collaborators` (normalized list: noteId, userId, permission[read|write|admin], accepted)
- Future: `activityLog` (log share events)

Changes:
1. Stop relying on `collaborators` array in note document for source of truth (keep for fast denormalized cache optionally)
2. Use `collaborators` collection as canonical; on share event optionally sync list back into note doc (bounded size guard)
3. Add helper to compute effective permissions: owner > admin > write > read

## 4. Permission Strategy (Appwrite)
- When sharing: update note document permissions to include `read("user:{id}")` and (if write) `update/delete("user:{id}")` when using Appwrite SDK (need helper wrapper)
- For collaborators collection entries: maintain default create permissions to users; only owner/admin can modify/remove
- Public note: add `read("any")` to note permissions and mark `isPublic=true`
- Remove stale collaborator permissions when revoked

## 5. Library Abstractions (src/lib/appwrite)
Implement modules:
- `permissions.ts` (pure helpers to build permission arrays)
- `sharing.ts` (or extend `notes` module) with:
  - `shareNote(noteId, targetUserId, permission)`
  - `listCollaborators(noteId)` (joins collaborators collection)
  - `revokeCollaborator(noteId, targetUserId)`
  - `updateCollaboratorPermission(noteId, targetUserId, permission)`
  - `acceptShare(noteId)` (sets accepted=true)
  - `getEffectivePermission(note, userId)`
- `public.ts`:
  - `makeNotePublic(noteId)` / `makeNotePrivate(noteId)`
  - `getPublicNote(noteId)` (no auth required)

Refactor existing note getters to unify permission checks through `getEffectivePermission`.

## 6. API Surface (Next.js Routes)
Routes to add/update under `src/app/api`:
- `POST /api/notes/{noteId}/share` body: { userId, permission }
- `GET /api/notes/{noteId}/collaborators`
- `POST /api/notes/{noteId}/collaborators/{userId}/permission` body: { permission }
- `DELETE /api/notes/{noteId}/collaborators/{userId}`
- `POST /api/notes/{noteId}/accept` (current user accepts invite)
- `POST /api/notes/{noteId}/public` { public: boolean }
- `GET /api/public/notes/{noteId}` (public fetch; includes attachments metadata if allowed)

All API endpoints centralize: fetch current user, fetch note, compute permission, authorize, act.

## 7. Attachments Alignment
- Modify attachment list/get routes to allow:
  - Owner
  - Collaborators with >= read
  - Public if note is public (list & view) but write restricted
- Signed URL generation already in place; update signature validation path to allow collaborator user IDs (fetch collaborator list inside `download` route)

## 8. UI Changes (Phase 1)
Components:
- Add Share UI (modal/panel): input user email/ID, select permission (read/write)
- Show list of collaborators with roles + revoke/change controls
- Public toggle (distinct from existing visibility toggle if present) or reuse `isPublic` switch
- In Create Note modal: add basic Attachment upload (deferred until after note creation)
  - After creating note: show inline dropzone (AttachmentsManager) with noteId

CreateNoteForm modifications:
- Two-step: create note -> if success & user added files queued, loop upload files
- Show file picker and list before creation (store File objects in component state, upload after note exists)

## 9. Activity Logging (Optional Phase 1.5)
- Log events: shared, permission_changed, revoked, accepted, public_enabled, public_disabled
- Use `activityLog` collection

## 10. Phase 2 (Teams & Folders) Placeholder
- Introduce `teams` (Appwrite teams or custom) for group sharing
- Folder hierarchy & inherited permissions
- Per-collaborator granular restrictions (comment-only, no-download)

## 11. Edge Cases
- Sharing with self (ignore)
- Duplicate collaborator invite (idempotent)
- Revoking last admin (disallow unless owner)
- Public + collaborator mismatch (public removes need for read perm but keep write perms intact)
- Large collaborator list (pagination)

## 12. Incremental Implementation Order
1. Lib permission + sharing helpers
2. API routes for share/unshare/list
3. Update existing note read/write flows to enforce helpers
4. Public note fetch endpoint
5. Update attachments access checks
6. UI: share modal + collaborator list
7. CreateNoteForm attachments pre-upload logic
8. Signed URL route enhancement for collaborators
9. Public toggle endpoint & UI
10. Activity logging (optional)

## 13. Definition of Done (Phase 1)
- Owner can share note with another user: collaborator appears & can read note content + attachments
- Permission escalation to write allows editing
- Owner can revoke & collaborator loses access immediately
- Public note accessible via public route without auth (read-only)
- Attachments respect note permissions & public state
- Create Note modal supports adding attachments right after creation

## 14. Follow-Up Metrics / Validation
- Count share actions per day
- Track unauthorized access attempts (future logging)

---
Prepared for implementation. Next: implement permissions & sharing helpers.
