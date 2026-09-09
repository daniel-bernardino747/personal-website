// Starts `next dev` with the mock agent on, in a way that works from both Git
// Bash and cmd.exe. npm runs scripts through cmd.exe on Windows, where the
// `CHAT_MOCK=1 next dev` prefix form is a syntax error rather than an env var.
//
// The mock answers from the Featured Corpus and cannot engage in production —
// see src/lib/agent/mock.ts.

import { spawn } from 'node:child_process';

const child = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, CHAT_MOCK: '1', NODE_ENV: 'development' },
});

child.on('exit', (code) => process.exit(code ?? 0));
