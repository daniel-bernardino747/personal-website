# 08 — A mock agent for development

**What to do:** let the chat be developed and debugged without spending a cent
per message, while still behaving like a real streamed exchange.

**Status:** done

**Blocked by:** nothing. Built 2026-09-09 on top of issue 02.

## Why

Debugging a chat UI means sending the same message twenty times. Against the real
agent that is twenty paid calls, twenty rows of the daily quota, and a wait for
each one — so the natural instinct is to test less, which is how UI bugs survive.

## The risk this carries, and how it is contained

A chat answering from something other than the live Corpus is *exactly what
`src/data/responses.ts` was*, and removing it is the reason this whole effort
exists. A mock agent is that failure mode with a friendlier name, so it is built
with two properties rather than one:

**It cannot run in production.** `isMockEnabled()` checks
`NODE_ENV === 'production'` first and returns false unconditionally, before the
opt-in flag is read. The Dockerfile sets `NODE_ENV=production`, so a deployed
image cannot mock regardless of what variables are set on the Railway service.
The opt-in itself is the exact string `'1'` — `'true'` and `'0'` both fail
closed, so a typo cannot silently serve mocked answers to someone who believes
they are testing the agent.

**It invents nothing.** Every answer comes from `buildChatAnswers`, the helper
issue 01 left behind, which derives its text from the Featured Corpus. A mocked
reply is a real claim; a screenshot taken while developing is not a fabrication
(ADR-0003). When no question matches, it says *"I don't have that recorded"* —
the same shape the real agent uses when the Corpus is silent, rather than some
cheerful "I'm just a mock" prose that would be the fabrication all over again.

`src/lib/agent/mock.test.ts` asserts both, including that the mocked output is
byte-identical to what the Corpus produced. If the mock ever grows prose of its
own, that test fails.

## Usage

```
npm run dev:mock
```

Runs `next dev` with `CHAT_MOCK=1`. Responses stream word by word after a pause,
so the streaming client, the scroll driver and the empty-bubble state all behave
as they do in production. Every mocked response carries an `X-Chat-Mock: 1`
header, which is how to tell the two apart when a reply looks suspiciously fast.

The check sits **before** the rate limiter and the API key, so a mocked session
consumes no quota, needs no database and needs no key — verified: five messages
left the global counter at 13 and produced no `[chat]` usage line.

### Pacing

Read per request, so `.env.local` changes apply on the next message rather than
the next restart:

| Variable | Default | What it stands in for |
|---|---|---|
| `CHAT_MOCK_DELAY_MS` | `900` | Latency before the first token (~1.5s warm in production) |
| `CHAT_MOCK_CHUNK_MS` | `35` | Gap between chunks |

Set both to `0` for instant replies when iterating on layout rather than on
timing.

## Notes

`npm run dev:mock` goes through `scripts/dev-mock.mjs` rather than a
`CHAT_MOCK=1 next dev` prefix, because npm runs scripts through `cmd.exe` on
Windows, where that prefix is a syntax error rather than an environment variable.
The wrapper works from Git Bash and cmd alike.

The pacing values were originally read at module load. A test timed out at 5s
against the real delays and showed they could not be changed without a restart —
worth fixing rather than working around, since the whole point is a fast loop.

## Acceptance criteria

- [x] `npm run dev:mock` streams answers with no API call and no quota consumed
- [x] Mocked answers are byte-identical to the Corpus-derived text, with a test
- [x] `isMockEnabled()` returns false under `NODE_ENV=production` even with
      `CHAT_MOCK=1`, with a test
- [x] Anything other than the exact `'1'` leaves the mock off
- [x] Responses carry `X-Chat-Mock: 1`
- [x] An unmatched question refuses instead of improvising
