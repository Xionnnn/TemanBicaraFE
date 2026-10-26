# SQLite and Account Storage

These rules supplement [AGENTS.md](../AGENTS.md). Read them before changing
account storage, switching/logout, SQLite, migrations, or local image persistence.

## Account isolation and lifecycle

Support one active account at a time, with separate persistent storage for every
account that has used the device. The native database is created on Android/iOS
when that account is opened, not inside the Git repository.

```text
document/profiles/<account-uuid>/
  temanbicara.db
  custom-images/
```

- Use the stable UUID from authenticated identity, never an email or username.
  UUID shape validation does not establish authentication.
- Sessions, events, asset metadata, dictionaries, and custom images are scoped
  to the account. Bundled image files are shared application resources.
- Logout must not automatically delete local data.
- Before switching, finish/cancel account-specific work, close the old connection,
  clear account-specific UI state, and open the new account's storage.
- Never upload account A's pending data under account B. Follow
  [synchronization rules](SyncronizationRules.md) for in-flight work and acknowledgments.
- Do not open a fake shared account to bypass unfinished authentication.

Credential handling, token lifecycle, and offline account restoration remain
unresolved. Resolve them before treating account readiness as implemented.

## Existing initializer

The app uses `expo-sqlite` and `expo-file-system`.
`src/database/database.ts` exposes `initializeDatabase()` and
`openUserDatabase(userId)`. Pass the verified account UUID returned by Cold API;
open once and reuse the returned connection. The starter screen is not connected
to this initializer because authentication/restoration is not implemented.

The initializer normalizes UUIDs, creates persistent profile/custom-image
directories, and opens a dedicated native connection. It enables WAL and foreign
keys, initializes transactionally using `user_version`, rejects newer schema
versions, and closes the connection if initialization fails. Reopening preserves
existing data; native persistence and switching still require device verification.

Example for a future authenticated caller:

```ts
import { openUserDatabase } from '../database/database';

// Run after authenticating/restoring the active account; reuse this connection.
const local = await openUserDatabase(authenticatedUser.id);

const sessions = await local.database.getAllAsync(
  'SELECT * FROM sessions WHERE user_id = ? ORDER BY started_at DESC',
  local.userId,
);

// On logout/account switch: first stop sync and finish/cancel outstanding queries.
await local.database.closeAsync();
// This does not delete the account's files.
```

## Migration and write requirements

- Reuse `src/database/`; preserve transactional initialization, foreign-key
  enforcement, and schema version checks.
- Add versioned migrations for schema changes. Editing only the initial schema
  does not upgrade existing installations.
- Never reset a user's database to avoid a migration. Preserve existing data or
  explicitly resolve conversion rules before a destructive migration.
- Bind user-provided data with `runAsync`/`getAllAsync` parameters. Reserve
  `execAsync` for trusted, static migration SQL.
- Store GUIDs and UTC ISO-8601 timestamps as TEXT. Generate IDs once and retain
  them during retries. Event `created_at` is the original occurrence time;
  initially `updated_at = created_at`, and upload alone does not change it.
- `sessions.user_id` records ownership and must match the active account; there
  is no local users table or local FK for that column.
- `sessions.ended_at` permits NULL for active sessions.
- Validate event payload semantics in application code; `json_valid(payload)`
  only checks JSON validity. Follow [activity rules](ActivityAndPlaybackRules.md).
- Store relative custom-image references; resolve bundled images through the
  catalog and `source_type`. See [asset rules](AssetsAndDictionaries.md).
- Update storage documentation and schema tests whenever storage behavior changes.

## Implemented schema versus approved target

Version 1 has six tables: `sessions`, `event_logs`, `assets`, `asset_settings`,
`dictionaries`, and `assets_dictionaries`. It reflects an earlier Hot ERD, not
the latest approved target.

| Area | Implemented version 1 | Approved target or open decision |
| --- | --- | --- |
| Asset labels | `assets.asset_name`, `assets.label`, and nullable `asset_settings.label_override` | Add `default_name` for builtin reset; the editable role of `asset_name` and conversion rules remain unresolved. |
| Per-asset settings | Unique, required `asset_settings.assetid`; nullable font size and letter spacing | Remove `asset_settings`; label customization remains required. |
| Dictionary color | Absent | `dictionary_color` is required. |
| Membership ordering | `assets_dictionaries.position` | Use `display_order`; dictionary tab ordering already uses `dictionaries.display_order`. |
| Sync bookkeeping | No durable pending/acknowledgment mechanism or local `received_at` | Design bookkeeping; whether to retain returned `received_at` remains unresolved. |

Foreign keys prevent deleting referenced parents by default; no cascading history
deletion is added. Image/history retention and deletion workflows remain open.
The implemented Hot DB has no event-level `asset_path`. Builtin catalog seeding
and cloud image uploads are not implemented.

Follow the latest approved Hot ERD and resolve data conversions before migration.
This documentation does not change the schema. See [implementation status](ImplementationStatus.md).

## Native verification

This custom-directory initializer targets Android/iOS, not web SQLite storage.
After native dependencies are added, rebuild existing development builds.

Once an authenticated lifecycle is connected, verify on both platforms:

1. Open account A, insert a session with A's ID, and restart the app.
2. Reopen A and confirm the session remains.
3. Close A, open B, and confirm B cannot see A's session.
4. Reopen A and confirm A's data is still present.

Desktop SQLite tests do not establish native filesystem persistence or live
account switching. Report the device checks actually performed.
