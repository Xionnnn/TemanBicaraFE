# Implementation Status

November 25, 2026 addition: `/usage-history` now has a responsive UI preview based
on the supplied Figma design. It displays four labeled example sentences, placeholder
timestamps, wrapping picture cards, and a Home button. The view includes an empty-list
state. It does not read or write activity events: PECS logging, the event payload
contract, and history image retention remain separate work. No account-storage,
playback, synchronization, or route-access behavior changes are included.
TypeScript, Expo lint, and Android/iOS bundle exports passed. Android Expo Go
emulator checks covered the example-data label, ordered sentence labels, scrolling
to the long sentence, and Home navigation. Screenshots were inspected at logical
widths 320 and 720 and at system font scale 200%. The empty-list state was inspected
in source. Physical Android devices and iOS interaction remain unverified.

November 25, 2026 addition: `/teacher-classes` now renders the teacher's class table
and an Add Class dialog based on the supplied Figma wireframe. This is a UI preview:
example rows are visibly labeled, and adding or deleting a class changes only the
mounted screen's state. State resets when the account changes. No classroom API,
SQLite tables, or route authorization changes are included. History and student-list
actions explain that those features are not available yet. `/class-settings` remains
a placeholder; `/usage-history` has the UI preview described above. TypeScript, Expo lint, and Android/iOS bundle
exports passed. Android Expo Go emulator checks covered adding a preview class,
empty-name validation, closing/canceling dialogs, cancel/confirm deletion, both
unavailable-feature dialogs, the empty table, and Home navigation. The table was
visually checked at logical widths 320 and 720, and at system font scale 200%.
Large text moves the detail actions below the class information to keep column
labels readable. Physical Android devices and iOS interaction still need verification.

November 10, 2026 addition: [password recovery](PasswordRecovery.md) now has frontend
screens and separate API challenge storage. It requires the backend's additive
`002-password-recovery.sql` migration; device and real-mail verification are separate
from automated checks. The older feature snapshot below is unchanged.

November 11, 2026 addition: `/catalog-settings` (Pengaturan Katalog), for signed-in
Student accounts, reads dictionaries and saved words from the account's SQLite database.
The five PECS mock categories are seeded as interim starter dictionaries; their mock
cards are display-only dummy data. The word `+` opens a form that picks a library
image, copies it into the account's `custom-images` folder, and saves the asset first
in the selected dictionary. Choosing an already saved word, unchanged, links that same
asset instead; editing its name returns the form to a new word (November 16 rules in
[assets and dictionaries](AssetsAndDictionaries.md)). Dictionary creation, editing,
deletion, label reset, builtin image files (`assets/pecs`), and synchronization are not
implemented. The PECS communication screen still uses only mock data. Native picker,
file persistence, and restart behavior need Android/iOS verification.

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
