# 13 — Every exchange is recorded, refused or cut short

**What to do:** make `/api/chat` record every exchange that reaches the model
stage, with its `scope` label, whatever way it ends — and stop refusals from
leaving an unhandled rejection in the logs.

**Status:** implemented, not deployed

**Blocked by:** nothing.

## How this was found

After ticket 12 went live (2026-10-20), two messages were sent from the site:
"What stack does he work with?" (answered, then cut off at 486 bytes) and
"Write me a Python function that reverses a string." (refused by Jev). Both
passed the rate limiter — the day's counter read 2 — and **neither reached
`chat_transcript`**. The newest row was still from 2026-09-09, which also meant
the 7-day sweep, run on write, had not run for six weeks.

## Causes

1. **The refusal path closed the response twice.** It enqueued the refusal,
   called `controller.close()` and returned; the `finally` then called
   `controller.close()` again, which throws `Invalid state: Controller is
   already closed` — before `recordExchange`. Every refusal since ticket 10 was
   lost, despite the comment saying they are "the only signal that someone is
   probing the endpoint".
2. **A response cut off mid-stream lost its record the same way.** Once the
   visitor's side is gone, `enqueue` throws, the `catch` tries to enqueue again,
   and the throw escapes past `recordExchange`.
3. **`stream.abort()` left an unhandled rejection.** The SDK's `MessageStream`
   rejects on abort when nothing listens for `abort`, which put `⨯
   unhandledRejection: Error: Request was aborted.` in the Railway logs on every
   refusal.

Why the stack answer was cut at ~3 s is **not** established. Reproduced with the
production keys in plain Node and in `next dev`, the classifier's 2.5 s timeout
fired and the answer streamed to the end both times. This ticket makes such a cut
leave a record; it does not claim to prevent it.

## Done when

- A refused, completed, errored or abandoned exchange is recorded exactly once,
  with its label.
- Neither a refusal nor an abandoned stream leaves an unhandled rejection.
- The streaming logic lives outside the route so it can be tested.

## What else changed

- **The visitor leaving now stops the model.** `cancel()` aborts the stream, so
  an answer nobody will read stops being billed. Before, it ran to the end.
- **Two more hangs, found in review and already on `master`.** The SDK's
  iterator only hears events emitted after it is created, and the route created
  it after the verdict. A model that failed, or a visitor who left, while the
  classifier was still running left the response open forever, with nothing
  recorded, and the failure also raised an unhandled rejection. The iterator is
  now created before the verdict.
- **A visitor who leaves before the verdict is recorded with an empty answer.**
  The text they never received is not stored as if they had.
