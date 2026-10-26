# TemanBicara Frontend — Agent Instructions

## Project purpose

TemanBicara is a picture-based communication application for students with
special needs, particularly students with cerebral palsy. It is a university
thesis project built with Expo, React Native, and TypeScript for Android and iOS.

Students use picture cards to compose and hear sentences. Teachers manage
classes and review student activity through a dashboard.

Prioritize reliable offline communication, accessible interaction, account
isolation, and maintainable code appropriate for a small team.

## Agent role

Act as a software engineering and architecture collaborator for TemanBicara.
Help evaluate designs, implement scoped changes, review code, and verify behavior.
Recommend practical solutions appropriate for a small thesis team, and explain
tradeoffs when they affect reliability, accessibility, or maintainability.

## Repository layout

- `docs/`: supporting instructions, requirements, diagrams, and status snapshots.
- `assets/`: bundled resources, including predefined PECS pictures.
- `src/`: application source; routes belong under `src/app/`.
- `scripts/`: tests and supporting scripts.

## Required reading by task

Read the relevant documents before designing or changing the following behavior.
These documents supplement this file; preserve their confirmed rules and keep
unresolved decisions explicit.

| Task | Required document |
| --- | --- |
| Account storage, switching/logout, SQLite, migrations, or local image persistence | [SQLite and account storage](docs/sqlite.md) |
| Asset labels, custom images, dictionaries, or card ordering | [Assets and dictionaries](docs/AssetsAndDictionaries.md) |
| Card selection, sentence playback, activity logging, or PECS session lifecycle | [Activity and playback](docs/ActivityAndPlaybackRules.md) |
| Synchronization, its triggers, or related account/session lifecycle | [Synchronization rules](docs/SyncronizationRules.md) |
| Assessing existing features, implementation gaps, or next work | [Implementation status](docs/ImplementationStatus.md), followed by current-code inspection |

## Collaboration and scope

- Evaluate proposals objectively. Explain tradeoffs and challenge inconsistencies.
- Distinguish confirmed requirements, implemented behavior, verified behavior,
  recommendations, and unresolved decisions.
- Do not treat diagrams or handoff documents as proof of implementation.
- Work on the requested task; do not implement the entire backlog automatically.
- Resolve routine implementation details independently. Discuss changes to
  established requirements or data semantics before treating them as settled.
- Follow the user's requested discussion language. Use clear English for code
  identifiers and technical documentation unless an existing convention differs.
- Preserve unrelated changes in the working tree.

## Sources of truth

Before changing code:

1. Read applicable AGENTS.md files.
2. Inspect Git status, package.json, relevant source files, and existing tests.
3. Compare the requested behavior with the latest confirmed requirements.
4. Identify design/code discrepancies relevant to the task.

Current code establishes what exists. Confirmed product decisions establish
the intended behavior. Neither should silently overwrite the other.

The latest approved Hot ERD governs local storage. The latest approved Cold
ERD governs server storage and its naming. Map differences explicitly.

Older handoff documents and diagrams may be outdated. When a required diagram
is unavailable, ask for the relevant source instead of inventing its contents.

## Expo and dependency rules

Expo and React Native APIs change between releases. Before writing code that
touches Expo, EAS, or React Native APIs:

1. Read the installed Expo major version from package.json.
2. Consult the matching documentation:
   https://docs.expo.dev/versions/v<major>.0.0/
3. For other Expo topics, start from https://docs.expo.dev/llms.txt and follow
   the relevant documentation links.

Do not rely on remembered APIs or assume the latest documentation matches
the installed SDK.

- Use `npx expo install <package>` for SDK-compatible dependencies.
- If the repository uses Bun, use `bunx` instead of `npx`.
- Preserve the existing package manager and lockfile.
- Prefer appropriate Expo modules before adding third-party native dependencies.
- Check available skills and existing dependencies before adding new tooling.
- Do not run broad dependency upgrades or compatibility fixes unless relevant
  to the requested task.

## Navigation and code organization

- Use Expo Router for navigation.
- Put route files and navigator layouts under `src/app/`.
- Keep components, hooks, services, database code, and utilities outside
  `src/app/`.
- Import routing APIs from `expo-router`.
- Do not assume Router is already installed or configured.
- Keep screens focused on rendering and interaction.
- Keep persistence, synchronization, and API operations separate from UI code.
- Reuse existing patterns before introducing new abstractions.
- Avoid duplicating derived state or adding global state without a clear need.

Router documentation:
https://docs.expo.dev/router/introduction.md

## Architecture boundaries

- The mobile application owns UI behavior, local SQLite access, local image
  storage, and initiation of synchronization.
- SQLite is the Hot DB. It does not send HTTP requests.
- The ASP.NET Core Cold API owns server-side authentication, authorization,
  validation, synchronization ingestion, and dashboard queries.
- Supabase PostgreSQL is the Cold DB.
- The frontend must not connect directly to PostgreSQL or contain database
  passwords or privileged server credentials.
- Supabase database hosting does not imply that Supabase Auth has been selected.
- Do not invent endpoints or authentication contracts that the backend has not
  defined. Clearly identify mocks and provisional contracts.

Core communication must remain usable offline after the necessary account
context and local data are available. Do not place a network dependency in
the card-selection or sentence-composition path.

## Account storage and migrations

- Support one active account with separate persistent storage per authenticated UUID.
- Logout preserves local data. Prevent cross-account access and uploads.
- Finish/cancel account work, close the old database, and clear account UI before switching.
- Do not bypass unfinished authentication with a fake shared account.
- Reuse the initializer; preserve transactions, foreign keys, and version checks.
- Use bound parameters and versioned, data-preserving migrations; never reset data
  to avoid a migration. Read [storage rules](docs/sqlite.md) before changes.

## Assets and activity

- Bundle builtin images for offline use; keep custom images persistent and account-scoped.
- Dictionaries remain local. Discuss unresolved label/reset/history semantics before changes.
- Use the agreed activity event model; teacher preview creates no student events.
- Logging or synchronization failure must not block communication audio.
- Follow the detailed asset and playback rules linked above.

## Synchronization requirements

Synchronization is not implemented. The agreed v1 approach uses client-initiated
batches, four external triggers, and controlled retries in a foreground coordinator.
Read [synchronization rules](docs/SyncronizationRules.md) before changes; durable
bookkeeping, batch contracts, and mutation-during-upload handling remain unresolved.

## Accessibility and mobile performance

Implementation guidance:

- Use generous touch targets, clear selection feedback, and readable labels.
- Avoid making essential communication actions depend exclusively on dragging,
  precise gestures, or long presses.
- Do not use color as the only way to identify a dictionary tab.
- Keep card positions predictable and avoid accidental reordering.
- Provide accessibility labels for interactive controls.
- Keep card browsing responsive and avoid loading full-resolution images into
  every visible card.
- Avoid blocking the UI thread with expensive database or image work.
- Test important behavior on Android and iOS; a web preview is not proof of
  native correctness.

Exact visual dimensions and interaction choices should follow approved designs
and user testing rather than invented clinical assumptions.

## Native configuration and builds

- If native directories are generated, configure native behavior through Expo
  app configuration and config plugins; do not hand-create them.
- Expo Go only supports its bundled native modules.
- When adding native code unavailable in Expo Go, use a development build.
- Use EAS for cloud builds, signing, submission, and OTA updates when requested.
- Run EAS CLI as `npx eas-cli@latest <command>`, or
  `bunx eas-cli <command>` in a Bun project.
- Do not publish, submit, or deploy as a side effect of ordinary development.

EAS documentation:
https://docs.expo.dev/eas/index.md

## Validation

For code changes, run:

    npx tsc --noEmit
    npx expo lint

For database changes, also run:

    node --test scripts/database-schema.test.cjs

Use `npx expo-doctor` when dependency or native configuration changes warrant it.
Use `npx expo install --fix` only when compatibility repair is part of the task.

Add meaningful tests for changed behavior, especially migrations, account
isolation, playback repetition, and synchronization retries.

Desktop SQLite tests do not verify native filesystem persistence or account
switching. Report exactly what was tested and identify remaining device checks.

For documentation-only changes, verify accuracy and consistency; application
tests are unnecessary unless the documentation change accompanies code changes.

## Implementation status

Read [the dated status snapshot](docs/ImplementationStatus.md) when assessing
existing behavior or gaps, then reinspect the relevant files. A snapshot is
context, not proof of implementation or an instruction to complete the backlog.

## Scope exclusions

Do not silently add:

- Image search.
- Cloud backup of custom image bytes or dictionaries.
- Saved multi-card sentence templates.
- A caregiver or administrator role.
- Realtime tracking.
- Guaranteed periodic background synchronization.

## Completion reports

Explain:

- What changed and why.
- What was tested and the result.
- Any remaining uncertainty, migration implications, or device verification.

Do not report a feature as complete solely because it appears in a diagram,
passes type checking, or has a database table.
