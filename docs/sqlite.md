# SQLite in TemanBicara

The mobile app uses `expo-sqlite` and `expo-file-system`. The database is created
on the Android/iOS device when an account is opened, not in the Git repository.

```text
document/profiles/<user-id>/
  temanbicara.db
  custom-images/
```

`src/database/database.ts` exposes `openUserDatabase(userId)`. Pass the verified
account UUID returned by Cold API. Login has not been implemented yet, so the
starter screen intentionally does not open a fake/shared account database.

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

Initialization enables WAL and foreign keys and runs schema migrations in a
transaction. SQLite's `user_version` records the migration version. Reopening an
existing database preserves its data; a database from a newer app is rejected.

## Schema conventions

- The six tables follow the Hot DB ERD, including its existing FK column names.
- GUIDs are stored as TEXT. Generate IDs once and retain them during sync.
- Store timestamps as UTC ISO 8601 TEXT (`new Date().toISOString()`).
- `sessions.user_id` must match the active account; it is not a local FK.
- `ended_at`, `label_override`, `font_size`, and `letter_spacing` are nullable.
- `asset_settings.assetid` is UNIQUE and NOT NULL.
- JSON payloads are stored as TEXT. Database validation checks valid JSON;
  event-specific payload validation still belongs in application code.
- `created_at` is the original occurrence time for events. Initially set
  `updated_at` equal to `created_at`; uploading alone does not modify it.
- Hot DB has no `users` table, `received_at`, or event-level `asset_path`.
- Use a relative path for custom images; resolve bundled assets using
  `source_type` and the bundled catalog.
- Foreign keys restrict deletion by default. Image/history retention and deletion
  workflows still need a product decision; no cascading history deletion is added.
- Builtin assets are not seeded yet. Sync/outbox tracking and cloud image upload
  are not part of this initial setup.

Use bound parameters with `runAsync`/`getAllAsync` for user data. Reserve
`execAsync` for trusted, static migration SQL.

## Native verification

Once a signed-in screen is connected, verify on Android/iOS:

1. Open account A, insert a session with A's ID, and restart the app.
2. Reopen A and confirm the session remains.
3. Close A, open B, and confirm B cannot see A's session.
4. Reopen A and confirm A's data is still present.

The initializer uses a custom native directory and is not a web storage setup.
Existing development builds need rebuilding after native dependencies are added.
