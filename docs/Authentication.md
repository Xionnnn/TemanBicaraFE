# Authentication implementation

Implemented October 29, 2026 from the approved registration/login plan. Email verification
occurs once at registration; it is not an extra factor at subsequent logins. Both roles
can register publicly. A verified email does not establish school affiliation.

## Flow

Signed-out startup opens Login. Daftar opens registration with Guru/Siswa selection,
username, password, confirmation, and required email. Registration creates an unverified
Cold DB account and requests a six-digit SMTP code. The verification screen supports
expiry errors, limited attempts, and resend. Successful verification opens the registration
success dialog; Masuk returns to Login. Login opens the existing UUID-scoped database and
navigates to `/home`, which is intentionally blank for both roles.

No PECS sessions or activity events are created by this flow. Feature policies, student
communication screens, teacher dashboards, and synchronization remain outside this change.
The backend `Authorization/Policies/` directory contains only `.gitkeep`.

## Backend and configuration

The implementation is in the sibling `TemanBicaraAPI` repository. Its README documents
server setup, HTTP contracts, secrets, and its executable service/HTTP checks. Configure
database and SMTP credentials through .NET user secrets or server environment variables;
the example settings file is deliberately not loaded automatically.

`scripts/cold-db-auth.sql` is a one-time migration for the previously aligned empty
Cold DB. It changes users and all user foreign keys to UUID, requires and normalizes
account uniqueness, seeds Teacher/Student roles, and adds account authentication and
verification state. It aborts if affected records exist instead of dropping records.
The backend has an identical copy in `Database/001-auth.sql`. It was applied during this task.
`scripts/cold-db-auth-check.sql` checks live constraints with test records rolled back.

Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL` to the API's HTTPS address
reachable from the test device. A physical phone's localhost is not the development PC.
The TLS certificate must be trusted by the device. Do not put database or SMTP secrets
in `EXPO_PUBLIC_*` variables. Install dependencies with `npm install`, then `npx expo start`.

## Credential and account lifecycle

The backend uses PasswordHasher for password storage and issues an opaque protected bearer
credential using ASP.NET Core Data Protection. It is not a JWT or OAuth/OIDC issuer. Its
payload includes user UUID, password stamp, random identifier, and `auth_version`.
It intentionally has no fixed expiry, per the approved until-logout requirement.
Every API authentication checks the current account, email verification, role, password
stamp, and account version. Persist and protect the server key ring across restarts.

The frontend stores one small account journal in Expo SecureStore, with no biometric
prompt: active credential/account plus any pending logout revocation. It stores no password.
SQLite activity and images remain in their existing account directories. SecureStore
does not encrypt SQLite or replace the SQLite persistence mechanism.

Startup restores local account access without requiring a successful API call. Foreground
and connectivity recovery attempt validation. Connectivity is only a hint; requests still
handle server/network failure. A 401 blocks online access but preserves the local account.
The authentication context exposes connectivity and online authorization state for later
feature controls. The blank screen intentionally exposes no placeholder controls.

Logout first hides account UI and atomically stores a cleared active identity plus the
old credential queued for revocation. It closes the account database without deleting files.
The queue survives restart and is sent using the original account credential before a new
explicit login. Server logout increments auth_version only if the old version still matches,
so duplicate delivery cannot revoke a later credential version. A 401 means that queued
credential is already invalid and can be discarded. Offline server revocation is delayed
until reconnection; copied credentials remain usable until the server invalidates them.

The client authentication service implements logout; its visible control is deferred with
the home screen. There is no activity/session anchor or fake shared account. Authentication
work is serialized and late responses are ignored after logout or another account operation.

## Design and validation

The supplied reference controls the light theme and form layout. ENERGY 1 / RHYTHM 1 /
MOTION 1. Product name is text rather than an invented logo. Single-column forms support
scrolling and keyboard avoidance; selected roles have border and color feedback; labels
and live errors support assistive technology. Minimum control height is 50, and links
have minimum height 44. Only the success modal fades. Dark mode is not shipped.

Text contrast was checked: white on button #525252 is 7.81:1, white on disabled #666666
is 5.74:1, body #4B5563 on #FAFAFA is 7.24:1, and error #9B1C1C on #FAFAFA is 7.81:1.

Run `node --test scripts/auth-session.test.cjs scripts/database-schema.test.cjs`,
`npx tsc --noEmit`, `npx expo lint`, and `npx expo-doctor`. Android/iOS exports verify
bundle compilation; they do not establish native persistence or successful screen interaction.

Control behaviors inspected in source: Daftar/Masuk links navigate; Guru/Siswa changes
selection; Daftar validates and requests registration; Verifikasi submits the code; Kirim
Ulang respects the cooldown; the success dialog's Masuk and Android close return to Login;
startup retry reopens the account. Native click-through, screen-reader focus, device restart,
real SMTP delivery, and API access from a phone still require configured services/devices.
No device click-through PASS is claimed from code inspection or bundle export.

Execution results: 14 desktop lifecycle/schema tests passed; the backend's 58 service,
HTTP, and SMTP assertions passed using an in-memory repository and a loopback SMTP capture
server. Live PostgreSQL constraint checks passed with rolled-back fixtures. TypeScript,
lint, and Android/iOS bundle exports passed. Expo Doctor passed 19/20 checks, flagging
pre-existing patch differences for Expo, FileSystem, SQLite, and React Native. npm also
reports advisories in the existing Expo tooling tree; no forced SDK downgrade or broad
dependency repair was performed. A vulnerable cryptography dependency introduced by
MailKit was pinned to patched version 10.0.13; the backend build has no warnings.

At completion, `.env.local` and the backend's local user-secrets file were absent. Real
database/API and external email operation still need the server secrets described above.
