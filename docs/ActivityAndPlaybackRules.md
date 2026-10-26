# Activity Events and Playback

These rules supplement [AGENTS.md](../AGENTS.md). They describe agreed behavior,
not implemented functionality; inspect current code and [implementation status](ImplementationStatus.md).

## Event model

There are no `messages` or `message_items` tables in the agreed event model.
Teacher preview must not create student activity events.

| Event | Meaning |
| --- | --- |
| `asset_selected` | Record when a card is appended to the sentence strip. Removing it later does not undo the selection. |
| `message_completed` | Record a nonempty sentence for an accepted playback request that satisfies the repetition rule below. It does not prove that audio finished playing or was heard. |

Sentence payloads preserve ordered asset IDs and effective labels as historical
snapshots. Repeated occurrences of the same asset are allowed. Do not replace
historical labels with an asset's `default_name` or rewrite them after a rename.
Validate event-specific payload semantics in application code; valid JSON alone
is insufficient.

## Playback repetition rule

Compare ordered asset IDs and effective labels with the last recorded sentence
signature. Ignore empty strips and additional presses while playback or press
processing is active.

| Sequence or action | Required behavior |
| --- | --- |
| First playback of A | Record an event. |
| Replay unchanged A | Play without recording another event. |
| Edit A to B and back to A without playing B | Do not record another A. |
| Play A, then B, then A | Record three events. |
| Clear the strip | Reset the signature. Reconstructing and playing A may create a new event. |
| Restore the strip after restart | Restore its signature consistently. |

Save the event and signature consistently. A failed write must not falsely mark
the sentence as recorded. Logging failure must not prevent communication audio.

These rules determine event creation. Network retry deduplication is separate;
follow [synchronization rules](SyncronizationRules.md) for uploads. Saving activity
locally does not itself trigger an upload.

## Session lifecycle

PECS session start/end behavior and crash recovery remain unresolved. Do not
silently choose them or equate backgrounding the app with reliably ending a session.
An active session permits `ended_at = NULL`; its `user_id` records ownership.
Read [storage rules](sqlite.md) for persistence and synchronization rules for
the agreed session-end upload trigger.
