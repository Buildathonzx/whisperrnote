# ICP Integration Module

All Internet Computer (ICP) integration logic for whisperrnote lives in this directory.

- Only loaded if `NEXT_PUBLIC_INTEGRATION_ICP=true` in the environment.
- Exports agent, authentication, note CRUD, crypto, notification, draft, and enum utilities for use in the main app.
- Adapted from the original whisperrnote_icp/frontend codebase.

## Usage

Import from `src/integrations/icp` and wire up in the main app conditionally:

```ts
if (process.env.NEXT_PUBLIC_INTEGRATION_ICP === 'true') {
  // Import and use ICP integration
}
```

## Modules
- `agent.ts`: ICP agent and actor setup
- `auth.ts`: Authentication utilities
- `notes.ts`: Note CRUD and serialization
- `crypto.ts`: Note encryption/decryption
- `notifications.ts`: Notification helpers
- `draft.ts`: Draft note helpers
- `enums.ts`: Enum type guards
