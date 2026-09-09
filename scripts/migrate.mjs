// Applies src/lib/db/schema.sql. Idempotent — every statement is IF NOT EXISTS,
// so re-running it is the normal case, not a repair.
//
// Run with `npm run db:migrate`, which loads .env.local. Against Railway that
// needs the PUBLIC connection string: `*.railway.internal` resolves only inside
// Railway's network, and from here it fails with a DNS error that reads like
// anything but a wrong URL.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, '..', 'src', 'lib', 'db', 'schema.sql'), 'utf8');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set. Put it in .env.local.');
  process.exit(1);
}

if (new URL(connectionString).hostname.endsWith('.railway.internal')) {
  console.error(
    'DATABASE_URL points at *.railway.internal, which only resolves inside\n' +
      "Railway's network. For local use, copy DATABASE_PUBLIC_URL from the\n" +
      'Railway dashboard instead (host looks like *.proxy.rlwy.net).',
  );
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(schema);
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name LIKE 'chat_%'
     ORDER BY table_name`,
  );
  console.log('Applied. Tables:', rows.map((r) => r.table_name).join(', '));
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
