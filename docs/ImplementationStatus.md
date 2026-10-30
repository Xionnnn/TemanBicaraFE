# Implementation Status

Authentication and entry inspected October 29, 2026; schema alignment dates from
October 27, 2026. This is a dated snapshot supporting [AGENTS.md](../AGENTS.md).
Reinspect relevant files before relying on it. These gaps are context, not an
instruction to implement the backlog. Diagrams and type checking alone do not
establish feature completion.

## Frontend snapshot

| Area | Observed implementation |
| --- | --- |
| Application entry | `index.ts` loads Expo Router; routes are under `src/app/`. |
| Navigation and authentication | Registration, email verification, login, secure credential persistence, and a blank authenticated route are implemented. See [authentication](Authentication.md) for configuration and verification limits. |
| Account storage | Authentication restoration opens the UUID-scoped database; logout closes it and preserves account files. Native persistence remains unverified. |
| Local schema | The initial schema matches the latest Hot ERD. Version 1 is unchanged; no migration is included, so existing databases retain their earlier structure. |
| Student and teacher features | Builtin catalog seeding, PECS screens, synchronization, and teacher dashboard functionality are not implemented. |
| Native verification | Filesystem persistence and live account switching have not been verified on Android/iOS. |

The initializer validates/normalizes UUID shape, creates per-account directories,
opens a dedicated connection, enables WAL/foreign keys, initializes transactionally,
rejects newer schema versions, and closes the connection on initialization failure.
UUID shape validation does not authenticate the caller.

`scripts/database-schema.test.cjs` covers schema constraints, dictionary membership,
receipt timestamps, and the Hot ERD table/column set. Desktop tests do not establish
native correctness or migration readiness.

## Intended behavior and remaining design

- [SQLite and account storage](sqlite.md): lifecycle/migration requirements and
  implemented-versus-target schema differences.
- [Assets and dictionaries](AssetsAndDictionaries.md): confirmed target behavior
  and unresolved label, reset, category, and history semantics.
- [Activity and playback](ActivityAndPlaybackRules.md): event/repetition rules
  and unresolved PECS session lifecycle.
- [Synchronization](SyncronizationRules.md): agreed triggers and retries;
  durable bookkeeping, batch contracts, and upload-version handling remain open.

Credential handling and offline restoration follow [the approved authentication flow](Authentication.md).
The Cold API issues persistent credentials and checks `users.auth_version`; no token table
is used. SMTP/database secrets and native testing are required before claiming live readiness.
Feature authorization policies and classroom membership enforcement remain deferred.
