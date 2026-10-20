import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const query = vi.fn(async (_sql: string, _params?: unknown[]) => ({ rows: [] }));
vi.mock('./pool', () => ({ getPool: () => ({ query }) }));

import { recordExchange } from './transcripts';

beforeEach(() => query.mockClear());

describe('recordExchange', () => {
  it('stores the scope label next to the exchange', async () => {
    await recordExchange('v', 'write me a script', 'I only answer…', 'task');

    const [sql, params] = query.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO chat_transcript \(visitor, question, answer, scope\)/);
    expect(params).toEqual(['v', 'write me a script', 'I only answer…', 'task']);
  });

  it('stores NULL when no label is given', async () => {
    await recordExchange('v', 'q', 'a');
    expect(query.mock.calls[0][1]).toEqual(['v', 'q', 'a', null]);
  });
});

describe('schema.sql', () => {
  it('adds the scope column without breaking a re-run', () => {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    expect(schema).toMatch(/ALTER TABLE chat_transcript\s+ADD COLUMN IF NOT EXISTS scope TEXT/);
  });
});
