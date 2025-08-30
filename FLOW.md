# Wallet Auth Hardening – Execution Plan

- [ ] Wire API to HMAC nonce utils
  - [ ] Replace ../_nonceStore with createNonceToken/verifyNonceToken in routes
  - [ ] Standardize env names (use SIWE_* and SERVER_NONCE_SECRET)

- [ ] Fix time handling in nonce response
  - [ ] issuedAt/expirationTime use seconds*1000
  - [ ] expiresIn computed from seconds (not ms)

- [ ] Client SIWE message builder alignment
  - [ ] Always use server-provided nonce (no placeholders)
  - [ ] Ensure format matches server verify builder exactly

- [ ] Reduce reliance on users.list()
  - [ ] Guard with pagination or feature flag; document caveat

- [ ] Post-completion cleanup
  - [ ] Update env.sample with required SIWE_* and SERVER_NONCE_SECRET
  - [ ] Clear FLOW.md after verification truly complete
