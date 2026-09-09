import 'server-only';

import { createHash } from 'node:crypto';

import { getPool } from './pool';

/**
 * Two limits, because they stop different things: the per-visitor counter stops
 * one person with a script, and the global ceiling is the circuit breaker
 * against many addresses, which a per-IP limit cannot see.
 *
 * Both are configuration rather than literals buried in the handler — they are
 * deliberately loose to start and will be tuned once there is real traffic.
 */
export const PER_VISITOR_DAILY_LIMIT = Number(
  process.env.CHAT_LIMIT_PER_VISITOR ?? 20,
);
export const GLOBAL_DAILY_LIMIT = Number(process.env.CHAT_LIMIT_GLOBAL ?? 500);

export type LimitVerdict =
  | { allowed: true }
  | { allowed: false; reason: 'visitor' | 'global' };

/**
 * Identifies a visitor without storing who they are.
 *
 * The address is hashed with a server-side salt and never persisted in the
 * clear: a raw IP is personal data under the LGPD, and a counter does not need
 * one. Rotating `RATE_LIMIT_SALT` resets every counter, which is the intended
 * escape hatch and not something to do casually.
 */
export function visitorKey(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT;
  if (!salt) {
    throw new Error('RATE_LIMIT_SALT is not set; refusing to hash without it.');
  }
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/**
 * Reads the visitor's address from the proxy headers Railway sets. Falls back to
 * a constant rather than to something spoofable-but-plausible: if the address
 * cannot be determined, every such request shares one bucket, which fails
 * closed instead of handing out a fresh quota per request.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const [first] = forwarded.split(',');
    if (first?.trim()) return first.trim();
  }
  return headers.get('x-real-ip')?.trim() || 'unknown';
}

/**
 * Consumes one unit of quota, atomically, and reports whether the request may
 * proceed. The global ceiling is checked first: when the site is out of budget,
 * an individual visitor's remaining allowance is irrelevant.
 *
 * Both increments are single upserts. Reading a count and writing it back would
 * race under concurrent requests and let the limit be exceeded.
 */
export async function consumeQuota(visitor: string): Promise<LimitVerdict> {
  const pool = getPool();

  const global = await pool.query<{ count: number }>(
    `INSERT INTO chat_global_limit (day, count)
     VALUES (CURRENT_DATE, 1)
     ON CONFLICT (day) DO UPDATE SET count = chat_global_limit.count + 1
     RETURNING count`,
  );

  if (global.rows[0].count > GLOBAL_DAILY_LIMIT) {
    return { allowed: false, reason: 'global' };
  }

  const perVisitor = await pool.query<{ count: number }>(
    `INSERT INTO chat_rate_limit (visitor, day, count)
     VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (visitor, day) DO UPDATE SET count = chat_rate_limit.count + 1
     RETURNING count`,
    [visitor],
  );

  if (perVisitor.rows[0].count > PER_VISITOR_DAILY_LIMIT) {
    return { allowed: false, reason: 'visitor' };
  }

  return { allowed: true };
}
