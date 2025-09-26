# Admin Framework Overhaul

Goal: Design and implement a robust, auditable, least-privilege admin & privileged-operations framework replacing the current ad-hoc preference/label checks.

## Guiding Principles
- Single Source of Truth: Central role & permission registry (code + Appwrite collections) – no scattered label/prefs heuristics.
- Principle of Least Privilege: Narrow-scoped capability grants; avoid broad implicit superuser where not required.
- Defense in Depth: Multi-layer checks (session -> role -> capability -> resource scope -> rate/abuse guard).
- Deterministic Authorization: Pure, testable functions; no hidden side-effects or fallback heuristics.
- Auditable Actions: Every privileged mutation & sensitive read emits structured ActivityLog event (userId, action, targetType, targetId, status, metadata hash).
- Revocation Speed: Capability changes propagate immediately (cache-invalidation <= 60s; consider no-cache for critical paths).
- Environment Awareness: Admin logic cleanly separates local/dev conveniences from production hardening.
- Zero Trust on Client: Never trust client-supplied role flags; always server-resolve effective permissions.

## Current Pain Points
- Admin defined implicitly via `prefs.admin` or labels – fragile & spoofable if future code misuses user-provided data.
- SSR user resolution unreliable (cookie forwarding hack) – leads to false negatives.
- No granular capabilities (binary admin/not-admin only).
- Missing audit trail for admin activities (deletes, role changes, moderation, key issuance).
- No emergency break-glass / just-in-time elevation flow.
- No central permission evaluation helper re-used by API routes & server components.

## Target Data Model
Introduce dedicated collection `roles` + `user_roles` + optional `role_capabilities` (flexible RBAC → capability-based blend):

1. roles (id, name, description, system, createdAt)
2. user_roles (userId, roleId, assignedBy, assignedAt, expiresAt?, reason)
3. capabilities (id, key, description, critical:boolean)
4. role_capabilities (roleId, capabilityKey)
5. (Optional) user_capabilities_override (userId, capabilityKey, grant:boolean, expiresAt?)

Alternatively, if minimizing collections: single `authorization` collection storing documents: { userId, roles:[...], grants:[capabilityKey], revokes:[capabilityKey], updatedAt }. (Choose based on expected scale & query patterns; normalized is clearer, denormalized fewer round trips.)

For now propose normalized for clarity & future analytics.

## Core Capability Set (Initial)
- system.read.metrics
- system.manage.users
- system.manage.roles
- notes.moderate
- notes.read.any (bypass ownership for investigations)
- extensions.manage
- ai.providers.manage
- billing.subscriptions.manage
- api.keys.issue.any (issue keys for other users)
- security.audit.read
- security.impersonate (HIGH RISK – gated & logged)

Map roles → capabilities:
- superadmin: all capabilities
- admin: subset (no security.impersonate, maybe no direct billing)
- moderator: notes.moderate + notes.read.any + limited audit read
- support: security.audit.read (filtered), billing.subscriptions.manage (read/update), notes.read.any (read-only)

## Authorization Flow
1. Session Resolve: authenticate user (Appwrite Account.get via secure SSR client or JWT endpoint).
2. Fetch Role Bindings (cache 30–60s in memory / edge KV keyed by userId+version hash).
3. Derive Effective Capabilities (role_capabilities union + user overrides).
4. Evaluate Request: route metadata declares required capability(s) OR dynamic policy function (resource owner + capability OR explicit admin privilege).
5. Emit Audit Event if privileged route (capabilities with critical=true or action mutating another user's resources).
6. Return explicit denial error structure: { error: { code: 'FORBIDDEN', required: ['system.manage.users'], have: [...] } }.

## SSR & API Integration
- Create server utility: `resolveSession(request)` → { user, sessionId } (throws UNAUTHENTICATED) using header cookie pass-through or explicit server-side Appwrite JWT (preferred: short-lived JWT minted client-side & rotated).
- Add module `src/lib/authz/`:
  - `types.ts` (Role, Capability, EffectiveAuthContext)
  - `capabilities.ts` (static registry + helper to list)
  - `resolver.ts` (fetch roles/capabilities for user)
  - `policy.ts` (helpers: requireCapability, requireAny, requireAll, requireNoteAccess(noteId, minPermission), etc.)
  - `cache.ts` (in-memory Map with TTL + version key env var to force flush on deploy)
- Middleware (Next.js) for API routes reading required capability metadata exported from handler (e.g., handler.attachCapabilities = ['system.manage.users']). Fallback explicit checks inside handler for dynamic conditions.

## Appwrite Configuration Adjustments (Proposed – NOT yet implemented)
- Create new collections: roles, user_roles, capabilities, role_capabilities (or consolidated authorization) with documentSecurity true.
- Permissions: Only superadmin IDs can write capabilities & roles; regular admins can assign user_roles except superadmin.
- Add Function (Appwrite cloud function) for break-glass elevation requests (manual approval path writing user_roles with limited TTL).
- Enforce per-document ACL so only authorized assignment function/service account can mutate.

## Caching & Invalidation Strategy
- Cache key: `authz:${userId}:v${ENV_AUTHZ_SCHEMA_VERSION}`.
- Store { roles:[...], caps:[...] , fetchedAt }.
- Invalidate on role assignment mutation (emit Pub/Sub or write bump to `authz_version` KV entry). Simpler initial approach: bump `updatedAt` field & have resolver watch a lightweight `user_authz_version` collection (fast single doc fetch) – if timestamp changes → refetch full graph.

## Auditing & Logging
- Use existing `activityLog` collection; add actions: role.assign, role.revoke, capability.override.grant, capability.override.revoke, impersonation.start, impersonation.end, moderation.action.
- Standard schema: { userId, action, targetType, targetId, timestamp, details(JSON), ipHash }.
- Provide `logAdminEvent(context, action, targetType, targetId, details)` helper.

## Impersonation (Optional Phase 2)
- Capability: security.impersonate
- Flow: POST /api/admin/impersonate { targetUserId } → issues short-lived impersonation JWT w/ parentSessionId; UI banner "Impersonating X" + stop button.
- All actions while impersonating log parent admin userId.

## Security Hardening
- Rate limit admin-sensitive routes (separate lower thresholds for critical capabilities). Consider token bucket keyed by userId + capability.
- Require re-auth (recent password/passkey assertion) before high-risk actions (assign superadmin, impersonate, delete user) – store recentAuthAt in session claim.
- Add integrity hash for capability registry (SHA256 of sorted capability keys) – include in responses for monitoring drift.
- Deny admin auth from outdated clients (optional: include minClientVersion in capability resolve response).

## Migration Plan
1. Scaffold authz module with static in-code capability registry + mock data provider.
2. Introduce capability checks in existing admin pages (parallel path; old admin gating remains until parity).
3. Create collections & seed roles/capabilities (manual migration script – not committed until approved).
4. Build role assignment APIs (protected by superadmin initial allowlist env var `INITIAL_SUPERADMINS`).
5. Replace old `prefs.admin` checks with `requireCapability('system.manage.users')` etc.
6. Add auditing for new admin APIs.
7. Remove legacy admin gating helpers & cookie-forwarding hack (move to JWT-based session resolution).
8. Optional: implement impersonation & break-glass workflows.

## API Endpoints (Planned)
- GET /api/admin/authz/me  -> returns { roles, capabilities, integrityHash }
- POST /api/admin/roles/assign { userId, roleId }
- POST /api/admin/roles/revoke { userId, roleId }
- GET /api/admin/roles       -> list roles + capabilities
- POST /api/admin/roles      -> create (superadmin only)
- GET /api/admin/capabilities -> static list from registry
- POST /api/admin/override/grant { userId, capabilityKey }
- POST /api/admin/override/revoke { userId, capabilityKey }
- POST /api/admin/impersonate { targetUserId } (phase 2)

## Frontend Integration
- Add hook `useAuthz()` that fetches `/api/admin/authz/me` and provides booleans like `can(cap)`, `hasRole(roleId)`.
- Replace scattered admin conditionals with `can('notes.moderate')` etc.
- Provide `<RequireCapability cap="system.manage.users">...</RequireCapability>` component for UI gating.
- Admin navigation builds dynamically from capability set.

## Testing Strategy (Later)
- Unit: policy evaluation (union, overrides, expiration, revokes precedence).
- Integration: assign/revoke flows modify effective set & reflect within cache TTL.
- Security: attempt unauthorized access to each admin endpoint.
- Regression: ensure non-admin users unaffected by authz module overhead.

## Open Questions
- Do we need per-resource capability scoping (e.g., notes.moderate:{tag}) now? (Not initially.)
- Should capability registry be runtime editable or code-fixed requiring deploy? (Start code-fixed; move to dynamic later.)
- Multi-tenant/org support on horizon? Might add orgId dimension to user_roles later.

## Success Criteria
- No reliance on `prefs.admin` / labels anywhere in code.
- Adding/removing a role updates access within 60s worst-case.
- All admin pages/API routes declare required capability keys.
- Complete audit trail for privileged actions with <1% missing logs in test.
- Clear developer documentation for adding a new capability.

## Implementation Order (Condensed)
1. Capabilities registry + resolver scaffold (in code) & hook.
2. Admin API: authz/me + roles list (static initial seed objects).
3. Replace page gating with capability checks (dual-run period).
4. Collections + seeding scripts (post-approval).
5. Role assignment & override endpoints + auditing.
6. Full cutover & removal of legacy gating.
7. Optional advanced features (impersonation, break-glass, re-auth for critical actions).

---
Draft ready for review. Approve to proceed with scaffold implementation.
