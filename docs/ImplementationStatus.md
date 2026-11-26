# Implementation Status

November 26, 2026 addition: all seven remaining Figma page/dialog designs now have
UI in their existing catalog and teacher-class flows. Dictionary editing includes
gallery/name/color/order drafts, a proposed-order confirmation, and a deletion
preview. Custom and builtin image editors include name/image drafts, deletion or
reset confirmation, and unsaved previews. These editors never write SQLite, alter
memberships, delete files, or change activity history. Builtin reset demonstrates
the original name/image in the draft only; unresolved storage/history semantics
in AssetsAndDictionaries.md are not settled by this UI.

The teacher class eye action opens an example student list with removal confirmation
and an example class-code dialog. A local five-minute timer expires and can be
renewed; `CONTOH` is explicitly a demo code with no cross-device join service.
Student removal updates the mounted class count and history preview. The history
action opens two labeled example charts and word-frequency tables for each student,
including empty states. Horizontal bars retain names/values on phones; charts can
sit side by side on wider landscape layouts. Detail views support return-to-class,
Home, and Android Back navigation. New classes start with empty student/history data.
All teacher preview data resets when the screen unmounts or its account key changes.

The shared AppDialog retains existing dialog styling and supports scrollable forms
with Android's native keyboard resize behavior. Catalog content now scrolls when
the shorter landscape viewport cannot fit its grid. No dependencies, database
schemas, backend endpoints, or route-access rules were changed for these additions.
TypeScript, Expo lint, and the Android bundle export passed. The seven additions
were exercised in an isolated Android Expo Go harness at phone portrait and tablet
landscape (1728x1080), including 200% system text in landscape. Checks included
validation, order/deletion/reset confirmations, gallery selection/cancel, preserving
original catalog data, student removal/count updates, history tables, empty classes,
code expiry/renewal, and return navigation. Countdown expiry was tested with a short
duration on the same dialog; the normal five-minute countdown was inspected visually.
No application JavaScript or Android runtime errors were observed during these
checks. See [the verification report](UICompletionVerification.md) for detailed
results, design reasons, and the limits of isolated-component testing.
Additional keyboard checks passed Tab/Enter activation but exposed an unresolved
Escape issue in Expo Go 58.0.5 and 58.0.6: the native window disappears without
clearing editor state, leaving underlying touches blocked. Back and visible close
controls work. A standalone debug APK build was attempted, but configuration failed
with CXX1101 because the local NDK 27.1.12297006 lacks source.properties. The APK
was not produced. These native verification limits remain open in the checklist;
the full antislop delivery gate is not reported as clean.

November 25, 2026 addition: the Buat Kamus action in `/catalog-settings` now opens
the Membuat Kamus Baru dialog from the supplied Figma design. This is UI-only:
gallery image selection, name, hex color, named color choices, validation, and
cancel lead to an explicitly unsaved dictionary preview. The preview supports
editing and returning to the catalog. No dictionary rows or persistent image files
are created, and existing word creation/storage is unchanged. The dialog unmounts
when closed or when the catalog's account key changes; late picker results are
ignored after unmount. Dictionary image persistence and ordering remain separate
design/integration work.
TypeScript, Expo lint, and the Android bundle export passed. Android Expo Go checks used the actual form in an
isolated UI preview without an authenticated account or database. Checks covered
real gallery selection and cancellation, required fields, invalid and custom hex
colors, named colors, preview/edit, close, Android Back, and reset on reopening.
The form was visually inspected in phone portrait and tablet landscape (1728x1080),
including 200% system text in landscape with scrolling to the action buttons.
Signed-in catalog wiring was inspected in source; that account flow and physical
Android-device behavior were not exercised.

November 25, 2026 addition: `/class-settings` now has the student's class-settings UI
based on the supplied Figma design: a Year/Class/Detail table, a class-code dialog,
and confirmation before removing a class from the preview list. All data is visibly
labeled as examples and stays in component state. The code `CONTOH` adds `Kelas2`;
empty input, other codes, and repeated joins show feedback. No classroom API,
database, or route-access integration is included. Account changes reset the preview.
The current development target is Android, with phone portrait and tablet landscape.
Expo orientation is now `default` to allow rotation; existing generated Android
projects need configuration regeneration and a rebuild to pick up that native setting.
TypeScript, Expo lint, and the Android bundle export passed. Android Expo Go emulator
checks covered empty/incorrect/demo codes, duplicate joins, cancel and Android Back,
form reset, cancel/confirm leaving, the empty list, and Home navigation. The UI and
join dialog were visually checked in phone portrait and tablet landscape (1728x1080),
including 200% system text in landscape. Expo Doctor passed 19/20 checks; the remaining
finding is the existing dependency-version mismatch. Physical-device verification
and backend classroom behavior remain outside this UI preview.

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
actions explain that those features are not available yet. `/class-settings` and
`/usage-history` have the UI previews described above. TypeScript, Expo lint, and Android/iOS bundle
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
