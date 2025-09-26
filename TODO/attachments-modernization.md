Attachments Modernization Plan (Unified Metadata & Service Layer)

Objectives
- Unify attachment metadata in dedicated collection; deprecate embedded JSON strings in notes.
- Expand permissions (collaborators with write can upload/delete; readers/public can download where allowed).
- Introduce integrity (checksum) and enforce quotas (per-file + per-note + per-user aggregate optional).
- Provide service layer abstraction for future storage backends.
- Improve signed URL flow clarity (explicit enablement, errors, fallback for disabled secret).
- Add orphan cleanup & migration tooling.

Phases
1. Service Layer & Types
2. Permissions & Policy Expansion
3. Migration (dual read / write)
4. UI Enhancements (metadata + permission states)
5. Quotas & Integrity
6. Cleanup & Deprecation

Phase 1: Service Layer
- Create src/lib/attachments/service.ts exporting functions:
  - ensureAttachmentCollection(); (no-op placeholder if using Appwrite dynamic collection) 
  - createAttachment(noteId, userId, file: File | BlobLike, opts)
  - listAttachments(noteId, currentUserId?)
  - deleteAttachment(noteId, attachmentId, currentUserId)
  - getSignedDownload(noteId, attachmentId, currentUserId)
- Internally wrap existing functions in appwrite.ts; centralize sanitize + mime validation.
- Add AttachmentMeta type (id, noteId, ownerId, fileId, filename, sizeBytes, mimetype, checksum?, createdAt, createdBy, deletedAt?)

Phase 2: Permissions
- Determine user capability: owner => full; collaborator.role in {"write","admin"} => upload/delete; collaborator.role in {"read","write","admin"} => list/download; public note => list/download if note.isPublic.
- Add guard helpers (throws structured errors: FORBIDDEN, NOT_FOUND, PLAN_LIMIT, MIME_NOT_ALLOWED).

Phase 3: Migration
- Dual-write: on createAttachment -> embedded (legacy) + collection record (new) + checksum.
- Dual-read: list merges; prefers collection metadata. Add marker once a note fully migrated (e.g., note._attachmentsMigrated = true) then skip legacy parse.
- Add script (scripts/migrate-attachments.ts) to iterate notes: parse embedded, write collection records, set marker, wipe legacy (optional final phase).

Phase 4: UI
- Update AttachmentsManager to fetch new enriched metadata (including uploadedBy user display name if available).
- Disable upload button with tooltip if user lacks write permission.
- Show mimetype icon, size, and relative timestamp.

Phase 5: Quotas & Integrity
- Add checksum (sha256) computed client-side (File) or server-side (stream) for dedupe potential.
- Enforce per-note attachment count limit (policy: e.g. 25 free; 200 pro) and aggregate size per note.
- Add per-user total storage usage check (optional, future; stub now).

Phase 6: Cleanup
- After migration coverage > 99%: stop writing embedded strings; remove legacy parsing code in appwrite.ts.
- Provide orphan cleanup util: list files in bucket, cross-reference attachment records + note.embedded; delete unreferenced older than 24h.

Signed URL Improvements
- If secret absent: return { direct: storage.getFileView(...), signed: null, signing: 'disabled' }.
- If secret present: generate proxy URL as currently, include expiresAt, ttl.
- Add explicit verification result reasons mapped to 4xx codes.

Error Shape (JSON)
{ error: { code: string; message: string; details?: any } }
Codes: UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, PLAN_LIMIT, MIME_NOT_ALLOWED, SIZE_LIMIT, UNSUPPORTED, INTERNAL.

Implementation Order (Actionable)
1. Add service file with scaffolding + wrappers to existing appwrite.ts functions.
2. Refactor existing API routes to use service (non-breaking, legacy path preserved).
3. Enhance permissions logic in service (collaborators + public access).
4. Add checksum support & extended metadata in collection (store checksum field if collection supports extra field; else metadata.checksum).
5. Introduce quota checks (count + size) calling subscription policy (extend enforceAttachmentPlanLimit to include note-level counts & size sums).
6. Add signed URL fallback semantics.
7. Provide migration script (stub placeholder referencing service functions).
8. Update AttachmentsManager UI to use new list shape (add type guard for fallback).

Minimal Initial Code Tasks Now
- Create service file with types, stubs calling existing functions.
- Adjust API listing route to use service.listAttachments (if simple to swap).

Next Steps After Commit
- Expand collaborator permission checks (need collaborator roles source) & public note support.
- Add checksum calculation (browser: digest file arrayBuffer -> sha256).

---
This plan will evolve; iterative commits will execute tasks in order above.
