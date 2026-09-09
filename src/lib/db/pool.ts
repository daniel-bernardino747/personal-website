import 'server-only';

import { Pool } from 'pg';

/**
 * The Postgres pool, shared across requests.
 *
 * Railway hands out two connection strings and only one works from any given
 * place: the deployed service uses the internal `*.railway.internal` host, while
 * `npm run dev` on this machine needs the public `*.proxy.rlwy.net` one. Both
 * arrive here as `DATABASE_URL`; the difference shows up as a DNS failure that
 * looks nothing like a configuration mistake, so it is named in the error below.
 *
 * SSL is required against the public proxy and harmless internally. Railway's
 * certificate is not in Node's trust store, hence `rejectUnauthorized: false` —
 * the connection is still encrypted, and the credentials in the URL are what
 * authenticate it.
 */
let pool: Pool | undefined;

export class DatabaseUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DatabaseUnavailableError';
  }
}

export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new DatabaseUnavailableError('DATABASE_URL is not set.');
  }

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  });

  // A pool-level error (a dropped backend, a proxy restart) is emitted on the
  // pool itself and would otherwise crash the process as an unhandled 'error'.
  pool.on('error', () => {});

  return pool;
}

/** True when the string points at a host only reachable inside Railway. */
export function isInternalUrl(connectionString: string): boolean {
  try {
    return new URL(connectionString).hostname.endsWith('.railway.internal');
  } catch {
    return false;
  }
}
