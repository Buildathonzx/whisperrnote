# Wallet Auth Hardening – Execution Plan

- [x] Wire API to HMAC nonce utils
  - [x] Replace ../_nonceStore with createNonceToken/verifyNonceToken in routes
  - [x] Standardize env names (use SIWE_* and SERVER_NONCE_SECRET)

- [x] Fix time handling in nonce response
  - [x] issuedAt/expirationTime use seconds*1000
  - [x] expiresIn computed from seconds (not ms)

- [x] Client SIWE message builder alignment
  - [x] Always use server-provided nonce (no placeholders)
  - [x] Ensure format matches server verify builder exactly

- [x] Reduce reliance on users.list()
  - [x] Guard with pagination or feature flag; document caveat

- [x] Post-completion cleanup
  - [x] Update env.sample with required SIWE_* and SERVER_NONCE_SECRET
  - [ ] Clear FLOW.md after verification truly complete
