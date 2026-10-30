# Synchronization Rules

## Status and scope

Agreed on October 23, 2026; synchronization is not implemented. This supplements
[AGENTS.md](../AGENTS.md). Bookkeeping, API contracts, and authentication details
remain unresolved; this agreement does not authorize implementing the backlog.

The mobile app uploads pending sessions, activity events, and asset metadata in
batches. The Cold API validates authentication, ownership, and data before storing
them. SQLite does not send requests; server workers do not read phones' Hot DBs.

Custom image bytes, dictionaries, and memberships remain local. Student
personalization must not overwrite shared builtin metadata on the server.

## Agreed external triggers

Use one account-scoped foreground coordinator with four external triggers:

| Trigger | Required behavior |
| --- | --- |
| Account becomes ready after login or restoration | Check for pending data once the correct database and usable authentication are available. |
| App returns to the foreground | Attempt synchronization once the account is ready. |
| Connectivity returns while the app is running | Request an attempt for the ready account. Connectivity does not prove that the API is reachable. |
| PECS session ends | Save the final state, including `ended_at`, as pending before requesting synchronization. |

Skip uploads when nothing is pending. Coalesce simultaneous triggers, such as
account readiness and foreground activation; prevent overlapping runs and respect
retry controls instead of starting an independent request for each trigger.

Card selections, accepted sentence playback events, and metadata changes are saved
locally as pending without triggering uploads. Follow the
[playback repetition rules](ActivityAndPlaybackRules.md#playback-repetition-rule);
teacher preview creates no student activity events.

No periodic upload timer is used during normal successful use. Device background
tasks require a separate decision and native verification; v1 does not depend on them.

## Controlled retries within the coordinator

A temporary failure starts bounded, increasingly delayed retries while the app
is active and the same account remains ready. These recover a failed attempt;
they do not introduce periodic uploads during normal successful use.

- Keep unacknowledged data pending after failure or a missing response.
- External triggers must not bypass backoff or create duplicate runs/timers.
- Stop retrying acknowledged work after success; preserve newer or unacknowledged changes.
- At the attempt limit, pause retries until the next eligible external trigger.
- Distinguish temporary failures from invalid data or authentication needing
  resolution; do not repeatedly send permanently rejected records.
- Before logout/switching, cancel or safely finish account-specific work. Never
  use another account's credentials or apply acknowledgments to its database.
- Timers need not survive suspension/termination. Pending data must survive so
  a later account-ready or foreground trigger can resume synchronization.

Retry parameters remain open. Consider server retry instructions and staggering
client retries when designing them; neither policy is finalized.

### Illustrative retry sequence

Session ends -> save final state -> upload fails -> wait 15 seconds -> retry
fails -> wait 30 seconds -> retry fails -> wait 60 seconds -> retry succeeds ->
persist acknowledgment and stop retrying accepted work. If the app stops, resume
pending work at a later eligible trigger. These timings are examples, not defaults.

## Persistence and acknowledgment requirements

Apply these synchronization invariants:

- Generate each event ID once and reuse it on retries; preserve occurrence times
  and historical labels. Upload alone does not change event `updated_at`.
- Same ID and accepted content: no duplicate event. Conflicting content: error.
- Acknowledge only confirmed server persistence; retry safely if its response is lost.
- Retain pending data across failures, logout, and restarts. An acknowledgment of
  an older uploaded session/metadata state must not clear a newer local change.
- Keep synchronization separate from local persistence and communication audio;
  upload failures must not prevent sentence composition or playback.

Playback repetition determines event creation; it is separate from upload retry
deduplication. Follow [storage rules](sqlite.md) for account isolation and migrations.

Server `received_at` is the first successful storage time and stays unchanged on
retries. The current Hot DB schema includes a nullable copy as required by the latest ERD;
it does not replace pending/acknowledgment tracking. Receipt persistence is not
implemented because synchronization is not implemented.

## Expected delay and remaining decisions

Activity can wait until session end or another trigger, including after an app
restart. Teacher dashboard updates are therefore not guaranteed to be realtime.

Before implementation, resolve:

- Durable bookkeeping, atomic local change recording, and uploaded-version tracking
  for mutable records, including changes during an upload.
- Batch sizes, endpoints/contracts, record dependencies, and partial acceptance.
- Retry delays/limits, failure classification, and persisted retry state.
- Integrating the implemented account restoration/readiness flow and handling rejected
  credentials during synchronization; see [authentication](Authentication.md).
- PECS session start/end and crash recovery; backgrounding alone does not reliably end a session.

Keep these decisions open until explicitly resolved. Design durable bookkeeping,
batch contracts, and mutation-during-upload handling before claiming reliable sync.
