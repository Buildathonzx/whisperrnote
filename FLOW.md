# Wallet Auth Hardening – Execution Plan

- [x] Implement stateless signed nonce (HMAC) utilities
  - [x] Create wallet nonce signer/verifier to replace in-memory store
  - [x] Payload: { addr, iat, exp, nonce, version, chainId, domain, uri }
  - [x] Base64url + HMAC-SHA256 using SERVER_NONCE_SECRET

- [x] Upgrade /api/auth/wallet/nonce
  - [x] Return { nonceToken, domain, uri, version, chainId, statement, issuedAt, expirationTime }
  - [x] Enforce config; validate address; checksum
  - [x] Back-compat: optionally include legacy `nonce` for transition (not used in verify)

- [x] Upgrade SIWE message building (server + client)
  - [x] Standardize exact message format (domain, address, statement, uri, version, chainId, nonce, issuedAt, expirationTime)
  - [x] Use same formatter on server and client to avoid mismatches

- [x] Upgrade /api/auth/wallet/verify
  - [x] Accept { address, signature, nonceToken, email? }
  - [x] Verify HMAC nonceToken; check exp/iat, domain/uri/version/chainId
  - [x] Rebuild SIWE message and recover signer; match address
  - [x] Identity binding rules:
    - [x] If authenticated session exists -> attach wallet to that user
    - [x] Else if wallet already attached -> issue token for attached user
    - [x] Else if email provided:
      - [x] If email belongs to an existing user and caller not authenticated -> initiate email verification, do not attach yet (return actionable status)
      - [x] If email not taken -> create user with email (mark emailVerified=false in prefs), attach wallet
    - [x] Else -> create user without authoritative email, attach wallet
  - [x] Return users.createToken result for successful binds

- [x] Client helper: src/lib/appwrite/auth/wallet.ts
  - [x] requestNonce(address)
  - [x] buildSiweMessage(fields)
  - [x] signMessage(provider)
  - [x] verifySignature({ signature, address, nonceToken, email? })
  - [x] authenticateWithCustomToken(userId, secret) (reuse existing)

 - [x] UI wiring (minimal)
   - [x] Settings: "Connect wallet" uses session attach path
   - [x] Sign-in: wallet-first path with optional email capture for recovery

 - [x] Security & DX
   - [x] Rate-limit endpoints (note: leave stubs or middleware hooks)
   - [x] Structured logging without secrets
   - [x] Clear error messages and actionable responses

- [x] Backward compatibility and cleanup
  - [x] Keep endpoint paths and prefs keys stable
  - [x] Avoid users.list() except as guarded fallback with pagination
  - [x] Document behavior changes in AGENTS.md or commit message
  - [x] After verification, clear FLOW.md contents as requested
