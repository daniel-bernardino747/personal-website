import 'server-only';

import { getPool } from './pool';

/** Issue 03: seven days, then gone. Not flagged — deleted. */
export const RETENTION_DAYS = Number(process.env.CHAT_RETENTION_DAYS ?? 7);

/**
 * Records one exchange, and sweeps anything past the retention boundary.
 *
 * Both are best-effort by design. Persisting a transcript is secondary to
 * answering: a database outage must degrade logging, never the agent. The caller
 * does not await a failure into the response path — it is swallowed here, on
 * purpose, and the chat carries on.
 */
export async function recordExchange(
  visitor: string,
  question: string,
  answer: string,
): Promise<void> {
  try {
    const pool = getPool();

    await pool.query(
      `INSERT INTO chat_transcript (visitor, question, answer) VALUES ($1, $2, $3)`,
      [visitor, question, answer],
    );

    // Swept on write rather than on a schedule: there is no cron on this
    // deployment, and retention that depends on someone remembering is not
    // retention. Cheap — the index on created_at makes it a range delete.
    await pool.query(
      `DELETE FROM chat_transcript
       WHERE created_at < now() - ($1 || ' days')::interval`,
      [String(RETENTION_DAYS)],
    );

    // Counters go the same way; two days is enough to cover a clock skew.
    await pool.query(`DELETE FROM chat_rate_limit WHERE day < CURRENT_DATE - 2`);
    await pool.query(`DELETE FROM chat_global_limit WHERE day < CURRENT_DATE - 2`);
  } catch {
    // Deliberate. See the note above: logging is not allowed to take the agent
    // down with it.
  }
}
