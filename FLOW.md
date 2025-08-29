# Wallet Auth Hardening – Execution Plan

- [x] Establish env guardrails
  - [x] Ensure required env vars: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY, SERVER_NONCE_SECRET, AUTH_DOMAIN, AUTH_URI, AUTH_CHAIN_ID
  - [x] Add placeholders to env.sample and .sample.env if missing

- [ ] Implement stateless signed nonce (HMAC) utilities
  - [ ] Create wallet nonce signer/verifier to replace in-memory store
  - [ ] Payload: { addr, iat, exp, nonce, version, chainId, domain, uri }
  - [ ] Base64url + HMAC-SHA256 using SERVER_NONCE_SECRET

- [ ] Upgrade /api/auth/wallet/nonce
  - [ ] Return { nonceToken, domain, uri, version, chainId, statement, issuedAt, expirationTime }
  - [ ] Enforce config; validate address; checksum
  - [ ] Back-compat: optionally include legacy `nonce` for transition (not used in verify)

- [ ] Upgrade SIWE message building (server + client)
  - [ ] Standardize exact message format (domain, address, statement, uri, version, chainId, nonce, issuedAt, expirationTime)
  - [ ] Use same formatter on server and client to avoid mismatches

- [ ] Upgrade /api/auth/wallet/verify
  - [ ] Accept { address, signature, nonceToken, email? }
  - [ ] Verify HMAC nonceToken; check exp/iat, domain/uri/version/chainId
  - [ ] Rebuild SIWE message and recover signer; match address
  - [ ] Identity binding rules:
    - [ ] If authenticated session exists -> attach wallet to that user
    - [ ] Else if wallet already attached -> issue token for attached user
    - [ ] Else if email provided:
      - [ ] If email belongs to an existing user and caller not authenticated -> initiate email verification, do not attach yet (return actionable status)
      - [ ] If email not taken -> create user with email (mark emailVerified=false in prefs), attach wallet
    - [ ] Else -> create user without authoritative email, attach wallet
  - [ ] Return users.createToken result for successful binds

- [ ] Client helper: src/lib/appwrite/auth/wallet.ts
  - [ ] requestNonce(address)
  - [ ] buildSiweMessage(fields)
  - [ ] signMessage(provider)
  - [ ] verifySignature({ signature, address, nonceToken, email? })
  - [ ] authenticateWithCustomToken(userId, secret) (reuse existing)

 - [x] UI wiring (minimal)
   - [x] Settings: "Connect wallet" uses session attach path
   - [x] Sign-in: wallet-first path with optional email capture for recovery

 - [x] Security & DX
   - [x] Rate-limit endpoints (note: leave stubs or middleware hooks)
   - [x] Structured logging without secrets
   - [x] Clear error messages and actionable responses

- [ ] Backward compatibility and cleanup
  - [ ] Keep endpoint paths and prefs keys stable
  - [ ] Avoid users.list() except as guarded fallback with pagination
  - [ ] Document behavior changes in AGENTS.md or commit message
  - [ ] After verification, clear FLOW.md contents as requested
