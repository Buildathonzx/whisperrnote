# Appwrite Library Refactor & Plan Limits TODO

Status legend: [ ] pending  [~] in progress  [x] done

High Priority
- [~] Add structured refactor task list to TODO/todo.md (this file)
- [ ] Create core client module (src/lib/appwrite/core/client.ts) exporting client, account, databases, storage, functions, ID, Query, Permission, Role, env IDs
- [ ] Usage metrics utilities (src/lib/appwrite/usage/metrics.ts): countUserNotes, countUserApiKeys, countNoteCollaborators, getMonthlyAIGenerationCount (stub), approximateUserStorageUsage (best-effort)
- [ ] Integrate plan limit check in note creation (enforcePlanLimit: notes)
- [ ] Extract note CRUD + tagging logic to src/lib/appwrite/notes/index.ts

Medium Priority
- [ ] Barrel export file at src/lib/appwrite/index.ts re-exporting modules
- [ ] Update imports across project to consume new notes module & barrel
- [ ] Add plan limit to API key creation (apiKeys)
- [ ] Add per-note collaborator count check (collaboratorsPerNote)
- [ ] Enforce attachment size and (optional) aggregate storage usage (storageMB + attachmentSizeMB)
- [ ] Track AI generations + enforce monthly limit (aiGenerationsPerMonth)
- [ ] Refactor legacy appwrite.ts to delegate to modules (preserve backward compatibility)

Low Priority
- [ ] Documentation: Add section to README (or new doc) describing new modular Appwrite structure & plan limits integration

Deferred / Future
- [ ] Teams / org-level sharing scaffolding (teams/index.ts)
- [ ] Seats/role enforcement (org plans)
- [ ] Improved storage accounting job / aggregation
- [ ] AI token-based quota (vs simple count)

Notes
- Keep appwrite.ts operational until all imports migrated
- Do not modify appwrite.json or src/types/appwrite.d.ts
- Plan limit checks should return structured error objects where feasible for UI handling (e.g. { code: 'PLAN_LIMIT_REACHED', resource, limit })
