-- Schema for the chat agent. Applied by `npm run db:migrate`, which is
-- idempotent and safe to re-run.
--
-- Two tables, for the two things the grilling session scoped in: rate limiting
-- and transcripts. Guestbook entries and lead capture were deliberately excluded
-- — they collect identifiable personal data from third parties and carry
-- moderation weight these do not.
--
-- No table stores an IP address. `visitor` is a salted SHA-256 of it: the
-- counter works identically, and a raw address is personal data under the LGPD.

-- Per-visitor daily counter. One row per visitor per day; the primary key makes
-- the increment a single atomic upsert with no read-modify-write race.
CREATE TABLE IF NOT EXISTS chat_rate_limit (
  visitor    TEXT        NOT NULL,
  day        DATE        NOT NULL,
  count      INTEGER     NOT NULL DEFAULT 0,
  PRIMARY KEY (visitor, day)
);

-- Site-wide daily ceiling — the circuit breaker the per-visitor limit cannot be:
-- twenty per IP does nothing against many IPs.
CREATE TABLE IF NOT EXISTS chat_global_limit (
  day        DATE        PRIMARY KEY,
  count      INTEGER     NOT NULL DEFAULT 0
);

-- What people ask, and what the agent answered. Kept seven days (issue 03), then
-- deleted outright — not flagged. Long enough to read a week of questions, not
-- long enough to profile anyone.
CREATE TABLE IF NOT EXISTS chat_transcript (
  id         BIGSERIAL   PRIMARY KEY,
  visitor    TEXT        NOT NULL,
  question   TEXT        NOT NULL,
  answer     TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_transcript_created_at_idx
  ON chat_transcript (created_at);

-- Counters older than a couple of days are dead weight; transcripts are deleted
-- on the retention boundary. Both sweeps are driven from the application so they
-- run without anyone remembering to.
