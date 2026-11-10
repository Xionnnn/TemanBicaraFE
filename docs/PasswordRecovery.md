# Password recovery

Implemented November 10, 2026. The login link **Lupa password akun? Klik disini**
opens `/forgot-password`. The user enters their account email and requests a code.
An unknown email produces the API's explicit error. A known email opens the OTP
dialog on the same page. Correct verification replaces the route with
`/reset-password`, which contains Password, Konfirmasi Password, and Ganti Password.
Both password fields use the shared Lucide visibility controls.

After a successful reset, a confirmation dialog returns the user to Login. The
flow does not automatically sign in or change the account UUID, role, SQLite
database, or local files. Recovery also does not complete an unverified account's
registration verification.

## State and navigation

The recovery challenge stays in the forgot-password screen. A separate,
short-lived reset grant is held only in AuthProvider memory, never in route
parameters, SecureStore, application logs, or SQLite. Opening the reset route
without a grant redirects to the email page. Leaving the reset screen clears the
grant. Restarting the app requires requesting a new code; the backend challenge
itself survives API restarts.

The OTP dialog supports cancellation, code verification, and resend with the
server-provided cooldown. Controls are disabled during submission and when
connectivity is unavailable. All requests still handle API/network errors because
connectivity state is only a hint. Invalid/expired codes stay on the OTP screen;
an expired reset grant offers a new-code path.

The attached reference supplies the existing light theme, centered OTP dialog,
cancel/confirm actions, and stacked new-password fields. The layout reuses the
shared form spacing, colors, and touch targets. ENERGY 1 / RHYTHM 1 / MOTION 1;
only the existing modal fade is used. Lucide X/Check identify cancel/confirm actions
and have explicit screen-reader labels.

## API and database dependency

The sibling API implements `POST /auth/forgot-password`,
`POST /auth/verify-password-reset`, and `POST /auth/reset-password`.
Its `docs/PasswordRecovery.md` defines the contracts and error codes.

Apply the API's additive `002-password-recovery.sql` migration before using the
flow. Codes expire in 10 minutes, allow five attempts, and have a 60-second resend
cooldown. Reset grants expire in 10 minutes and are single-use. A successful reset
invalidates previous server credentials, while preserving local offline data.

New-password validation matches the current registration testing policy:
1 to 128 characters, not whitespace-only, with matching confirmation. Existing
registration validation was not changed by this feature.

## Verification limits

TypeScript, lint, and platform export validate code and bundling. They do not
establish native keyboard behavior, screen-reader focus, SMTP delivery, or a full
phone-to-API password reset. Verify those separately on Android and iOS.
