TODO: Attachments (File support for Notes)

Progress (inline status markers)
- [x] Basic backend routes: list/upload/delete (multipart POST implemented; signed URL init/finalize deferred)
- [x] Plan-based per-file size enforcement (policy-driven)
- [x] Attachments collection dual-write & merge logic
- [x] Frontend UI: picker + drag/drop + list + delete + basic progress
- [ ] Signed URL generation helper (short-lived)
- [ ] Download proxy or redirect refinement (currently direct constructed view URL)
- [ ] MIME type whitelist & filename sanitization
- [ ] Quota (aggregate storage) enforcement
- [ ] Backfill script to populate attachments collection from embedded metadata if missing
- [ ] Feature flag / conditional enablement in production
- [ ] Tests (pending framework decision)


Goal
- Add support for attaching files to notes. Attachments should be available to all users.
- Default size limit for attached files: 2 MB (enforced/controlled from the frontend for free/base plans). Server-side checks and policy should be in place as a safeguard.

Constraints & Assumptions
- The frontend will expose the default 2 MB limit for free/base plan users and prevent uploads exceeding it. Administrative/configuration UI may later allow changing limits per plan.
- The backend must ultimately enforce limits and validate uploads even if the frontend enforces them (clients can be modified).
- Storage will use the existing backend storage integration (Appwrite or object store). Implementation should be adapter-friendly.
- Attachments are metadata-linked to notes. The note model must allow zero-or-more attachments.

High-level Steps
1. Data model: add an attachments collection/table and a note->attachment relation.
2. Storage adapter: use existing storage integration (Appwrite/S3 abstraction); add helper for signed uploads and retrieval links.
3. Backend API: add endpoints for upload init, finalize (if chunked), list, download (or proxy), and delete. Ensure auth checks.
4. Frontend UI: file picker, drag-and-drop area, upload progress, list of attachments in the note UI, preview for common types, remove attachment flow.
5. Plan enforcement: frontend shows 2 MB default limit for free/base plans; backend verifies and rejects larger uploads.
6. Security & validation: content-type checks, virus scanning (optional), rate limiting, ACLs for access.
7. Tests & rollout: unit + integration tests, migration scripts, and a staged rollout.

Detailed Tasks

Data Model
- Create an `attachments` collection (or DB table) with fields:
  - `id` (unique)
  - `note_id` (foreign key)
  - `owner_id` (uploader user id)
  - `filename`
  - `mimetype`
  - `size_bytes`
  - `storage_key` (object path or storage id)
  - `created_at`
  - `metadata` (optional JSON: preview data, thumbnail, checksums)
- Add an index on `note_id` to efficiently fetch attachments for a note.
- Optionally add `is_public` or permissions fields depending on sharing features.

Storage Adapter
- Reuse `src/lib/appwrite.ts` or storage adapter layer. Add methods:
  - `createUploadSession(noteId, userId, filename, mimetype, size)` (returns signed upload URL or upload token)
  - `finalizeUpload(sessionId)` (verify and persist metadata)
  - `getAttachmentUrl(storageKey, options)` (signed URL for download; short-lived)
  - `deleteAttachment(storageKey)`
- Support both direct uploads (client -> storage signed URL) and proxied uploads (client -> server -> storage) for environments where direct uploads are not feasible.

Backend API
- Routes to implement (HTTP restful style):
  - `POST /api/notes/{noteId}/attachments/init` — begin upload, validate permission, reply with signed upload URL or session token. Validate size against plan limit and note ownership.
  - `POST /api/notes/{noteId}/attachments/complete` — finalize upload, persist attachment metadata. Accept storage key and metadata.
  - `GET /api/notes/{noteId}/attachments` — list attachments for a note.
  - `GET /api/notes/{noteId}/attachments/{attachmentId}` — either redirect to a signed URL or proxy the file contents (consider access control and range requests).
  - `DELETE /api/notes/{noteId}/attachments/{attachmentId}` — delete the attachment (permission guarded), remove storage object and DB record.
- Middleware/guards:
  - Authenticate user; ensure they have access to the note.
  - Enforce attachment size limits server-side: check size in init/metadata or enforce after upload (storage provider may report size).
  - Validate mime types and extension policy (whitelist/blacklist as desired).

Frontend
- UI components:
  - File picker button + drag-and-drop target inside `NoteEditor` and `NoteCard` where appropriate.
  - Attachment list UI: show filename, size, type icon, preview (image/audio/video/pdf text extract), download and delete actions.
  - Upload progress indicator and retry logic for failures and network issues.
- UX rules:
  - For free/base plan users, read the frontend-configured limit and prevent selection of files larger than 2 MB with a friendly message.
  - Show server-side error messages (e.g., violation of policy) if upload is rejected.
  - Lazy-load previews (thumbnails) and only fetch signed URLs when needed.
- Implementation notes:
  - Use existing React contexts/hooks (e.g., `NotesContext`) to store attachment state while editing.
  - Store transient upload progress in component state; only save attachment records after `complete` API returns success.

Plan & Billing Enforcement
- Frontend: default 2 MB client-side limit for free/base plans. Expose plan config in the app settings or via a feature flag.
- Backend: implement a per-user or per-plan upload limit check; do not rely solely on the frontend.
- Database schema should allow storing per-user plan metadata or query the billing system/integration to decide limits at runtime.

Security & Validation
- Always validate and sanitize uploaded filenames.
- Verify content-type vs. file content when possible.
- Enforce server-side size limits and deny or trim oversized uploads.
- Use signed URLs with short expiry for direct downloads.
- Restrict public access to files unless the note is explicitly shared.
- Optional: integrate a virus/malware scanner on uploaded files (e.g., ClamAV) for files that will be served publicly.
- Log file-related operations for audit.

Performance & Scalability
- Prefer direct-to-storage uploads (signed URLs) to offload large file uploads from your servers.
- Implement chunked uploads for files larger than a threshold (optional future improvement).
- Serve thumbnails and previews from CDN-backed storage when possible.

Testing
- Unit tests:
  - Storage adapter: create/delete/get signed URL mocks
  - API validation: size checks, permission checks
- Integration tests:
  - End-to-end upload flow (init -> upload -> complete -> download)
  - Error paths: oversize, unauthorized, invalid mimetype
- UI tests:
  - File picker and drag-drop flows, progress bar, preview rendering

Migration & Backwards Compatibility
- If notes currently store no attachments, migration is additive — create attachments collection only.
- Ensure old notes without attachment lists still work.

Monitoring & Ops
- Track metrics: number of attachments uploaded, total storage used per user, upload errors, average upload size.
- Set alerts for abnormal spikes or storage usage approaching quotas.

Acceptance Criteria
- All users can attach files to notes from the UI.
- Free/base users cannot upload files larger than the default 2 MB via the UI; server refuses oversize uploads too.
- Attachments are persisted in storage and metadata is linked to the note.
- Users can view, download, and delete attachments respecting access control.
- Upload failures show clear messages and retries are possible.

Rollout Recommendation
1. Implement backend APIs and storage adapter.
2. Implement frontend without enabling file selection to production users (feature-flagged behind a toggle).
3. Enable for an internal testing cohort; verify server-side enforcement and monitoring.
4. Gradually roll out to all users and remove feature flag when stable.

Open Questions
- Which storage provider should be preferred in production (Appwrite storage vs. S3/GCS)?
- Should we support per-user quotas beyond per-file limits? If so, design quota tracking and enforcement.
- Do we require virus scanning at launch or as a later improvement?

Estimated Effort (rough)
- Backend + storage adapter: 2-3 days
- Frontend UI and UX: 2-3 days
- Tests & rollout: 1-2 days
- Ops/monitoring and polish: 1-2 days

Notes
- Frontend-only enforcement of 2 MB is requested for the free/base plan, but server-side validation is a must to prevent bypass.
- Keep the implementation adapter-friendly to reuse the project’s existing integrations pattern.
