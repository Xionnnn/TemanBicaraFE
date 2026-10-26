# Implementation Status

Inspected October 23, 2026. This is a dated snapshot supporting [AGENTS.md](../AGENTS.md).
Reinspect relevant files before relying on it. These gaps are context, not an
instruction to implement the backlog. Diagrams and type checking alone do not
establish feature completion.

## Frontend snapshot

| Area | Observed implementation |
| --- | --- |
| Application entry | `App.tsx` remains the starter screen. |
| Navigation and authentication | Expo Router and authentication are not implemented. |
| Account storage | Per-account initialization exists in `src/database/database.ts`, but is not connected to an authenticated application lifecycle. |
| Local schema | `src/database/schema.ts` remains at version 1: `asset_settings`, `assets.label`, and membership `position` remain; `default_name` and `dictionary_color` are absent. |
| Student and teacher features | Builtin catalog seeding, PECS screens, synchronization, and teacher dashboard functionality are not implemented. |
| Native verification | Filesystem persistence and live account switching have not been verified on Android/iOS. |

The initializer validates/normalizes UUID shape, creates per-account directories,
opens a dedicated connection, enables WAL/foreign keys, initializes transactionally,
rejects newer schema versions, and closes the connection on initialization failure.
UUID shape validation does not authenticate the caller.

`scripts/database-schema.test.cjs` contains four desktop SQLite tests for schema
constraints and dictionary membership. Their existence does not establish native
correctness; tests were not rerun for this documentation reorganization.

## Intended behavior and remaining design

- [SQLite and account storage](sqlite.md): lifecycle/migration requirements and
  implemented-versus-target schema differences.
- [Assets and dictionaries](AssetsAndDictionaries.md): confirmed target behavior
  and unresolved label, reset, category, and history semantics.
- [Activity and playback](ActivityAndPlaybackRules.md): event/repetition rules
  and unresolved PECS session lifecycle.
- [Synchronization](SyncronizationRules.md): agreed triggers and retries;
  durable bookkeeping, batch contracts, and upload-version handling remain open.

Credential handling, token lifecycle, and offline account restoration remain
unresolved. Do not infer these from the storage initializer or Supabase hosting.
