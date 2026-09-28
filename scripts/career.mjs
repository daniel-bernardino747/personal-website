// Runs one of the `career` checkout's contract scripts and returns its stdout.
// Shared by fetch-corpus and project-image, which both read `career` by path.
import { execFileSync } from 'node:child_process';

import { careerRepo } from '../src/lib/corpus/location.ts';

export function runCareer(script, args = []) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  return execFileSync(npm, ['run', '--silent', script, ...(args.length ? ['--', ...args] : [])], {
    cwd: careerRepo(),
    encoding: 'utf8',
    shell: process.platform === 'win32',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}
