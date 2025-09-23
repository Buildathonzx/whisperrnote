# Auth System Improvements (Passkey & Wallet)

Goal: Unify and harden sign-in / sign-up flows for passkey and wallet authentication, support seamless linking/unlinking from settings, reduce reliance on legacy `prefs.*`, and ensure intelligent detection of existing accounts to prevent accidental duplicates.

## Guiding Principles
- Prefer top-level user fields: `authMethods[]`, `primaryAuth`, `walletAddress`, `passkeyCredentialId`, `publicProfile`, etc.
- Backward compatible: fall back to legacy `prefs.*` during transition.
- Idempotent operations: repeating register/verify should not corrupt state.
- Clear separation of concerns: generation (challenge/options) vs verification (assertion/registration) vs linking.
- Security logging: structured events for auditing (success, failure reasons).

## Current Pain Points
- Mixing sign-in and sign-up logic (passkey & wallet) in single verify endpoints makes branches complex.
- Reliance on `prefs` for wallet/passkey metadata; no standardized top-level representation beyond partial mirrors.
- Settings page can connect wallet but lacks unified "Add Auth Method" abstraction (future passkey linking from settings?).
- Duplicate prevention logic scattered (e.g., wallet map + legacy prefs scan) — needs consolidation.
- No generalized helper to merge new auth method into a normalized `authMethods` array.

## Proposed Data Model Additions (Top-Level Fields)
- `primaryAuth: 'email' | 'passkey' | 'wallet'` (optional)
- `authMethods: string[]` (e.g., `['email','passkey']`)
- `walletAddressLower` (normalized for quick lookups — already used in wallet map collection but mirror on user)
- `passkeyCredentialId` (already exists in prefs — promote)
- `passkeyPublicKey` (promote if needed; or keep only where required server-side)
- `authLinkedAt: { [method: string]: string }` ISO timestamps for when each method was linked

## High-Level Tasks
1. Inventory & Refactor Routes
2. Introduce Normalization Helpers
3. Add Linking Endpoints
4. Promote Fields / Backfill Script
5. Update Settings UI for Linking Flow
6. Harden Wallet Flow (mapping + normalization)
7. Harden Passkey Flow (re-auth & upgrade path)
8. Telemetry & Logging Standardization
9. Graceful Deletion / Unlink Strategy
10. Documentation & Migration Notes

## Detailed TODO

### 1. Inventory & Refactor Routes
- [ ] Extract shared auth method resolution logic into `src/lib/auth-methods.ts` (new).
- [ ] Split wallet verify logic: separate pure verification (signature) from account resolution/creation.
- [ ] Passkey routes: create `canRegister` check endpoint returning reason codes (e.g., `EXISTS_NO_PASSKEY`, `NO_ACCOUNT`).

### 2. Normalization Helpers
- [ ] Implement `ensureUserAuthMetadata(user)` to produce canonical shape.
- [ ] Implement `addAuthMethod(userId, method, extra)` that merges arrays & timestamps.
- [ ] Provide `getUserByWallet(addressLower)` unified (prefer wallet map, fallback top-level, last resort legacy prefs scan once — then schedule cleanup).

### 3. Linking Endpoints
- [ ] POST `/api/auth/link/wallet` (requires existing session) — performs nonce + signature challenge then attaches wallet.
- [ ] POST `/api/auth/link/passkey` (requires existing session) — generates registration options & stores credential upon verification.
- [ ] Safeguard: cannot link method already present (idempotent 200 with message).

### 4. Promote Fields / Backfill
- [ ] Backfill script: migrate `prefs.authMethod`, `prefs.walletAddress`, `prefs.passkeyCredentialId`, counters, to top-level.
- [ ] Add safe re-run capability (skip if target fields already populated).
- [ ] After backfill, add guards in runtime to write both (top-level authoritative, prefs legacy mirror until removal phase).

### 5. Settings UI Enhancements
- [ ] Abstract auth methods section into reusable component: `AuthMethodsManager`.
- [ ] Show list of linked methods with status (e.g., Passkey: Linked ✔ / Wallet: Not Linked + CTA).
- [ ] Add unlink (soft) button with confirmation and dependency checks (cannot remove last auth method).
- [ ] Provide flow to set primary method.

### 6. Wallet Flow Hardening
- [ ] Centralize SIWE message template + versioning.
- [ ] Enforce address normalization at boundary (lowercase) everywhere.
- [ ] Cache recent nonces per user (prevent replay; single-use). Already partly done — verify and document.
- [ ] Ensure mapping uniqueness enforcement surfaces friendly errors.

### 7. Passkey Flow Hardening
- [ ] Rotate & persist challenge state server-side (currently ephemeral? verify).
- [ ] Track passkey sign-in counter drift; lock & require re-registration if suspicious.
- [ ] Support multiple passkeys per account (future) — design data model now (`passkeys: [{id, counter, backedUp, deviceType, addedAt}]`).

### 8. Telemetry & Logging
- [ ] Standard log helper `logAuthEvent(type, method, stage, data)`.
- [ ] Add correlation ID per auth attempt (nonce or challenge ID) returned to client for support.
- [ ] Structured failures with stable error codes (map to user-friendly messages in UI).

### 9. Unlink / Deletion Strategy
- [ ] Endpoint to unlink wallet (valid only if another method remains).
- [ ] Endpoint to unlink passkey (with re-auth requirement if it is primary).
- [ ] Soft-delete history record for forensic/audit (optional future collection `auth_method_history`).

### 10. Documentation & Migration
- [ ] Write migration doc referencing legacy prefs removal phases (alpha: mirror both, beta: read top-level prefer, GA: remove prefs writes).
- [ ] Add checklist for rolling out linking endpoints (deploy order & fallback plan).

## Open Questions
- Multiple wallet addresses per user? (Currently no — single mapping.)
- Should we encrypt stored public keys? (Probably not; already public, but integrity concerns?)
- Rate limiting strategy per auth route? (Consider adding basic limits.)

## Success Criteria
- Zero duplicate accounts from wallet/passkey sign-in under race conditions in staging tests.
- Ability to add wallet or passkey post initial email signup via settings without errors.
- Backfill produces no skipped error rows and is idempotent.
- All new fields present on newly created users; legacy prefs reads removed (except fallback layer) by final phase.
