import { afterEach, describe, expect, it } from 'vitest';

import { isAllowedOrigin } from './origin';

/**
 * The origin check is the cheapest of the chat's defences and the easiest to get
 * subtly wrong — an over-broad match (`endsWith('teamdbsolutions.com')`) would
 * accept `evil-teamdbsolutions.com`, and an over-narrow one would lock out the
 * site itself.
 */
const original = process.env.NODE_ENV;

function req(origin?: string): Request {
  return new Request('https://www.teamdbsolutions.com/api/chat', {
    method: 'POST',
    headers: origin ? { origin } : {},
  });
}

function setNodeEnv(value: string) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

afterEach(() => setNodeEnv(original ?? 'test'));

describe('isAllowedOrigin', () => {
  it('accepts the site itself', () => {
    setNodeEnv('production');
    expect(isAllowedOrigin(req('https://www.teamdbsolutions.com'))).toBe(true);
    expect(isAllowedOrigin(req('https://teamdbsolutions.com'))).toBe(true);
  });

  it('refuses a request with no Origin at all', () => {
    setNodeEnv('production');
    // A browser always sends Origin on a fetch POST. Its absence means the
    // caller is not a browser — which is exactly the traffic this stops.
    expect(isAllowedOrigin(req())).toBe(false);
  });

  it('refuses another site embedding the chat', () => {
    setNodeEnv('production');
    expect(isAllowedOrigin(req('https://someone-elses-site.com'))).toBe(false);
  });

  it('refuses a lookalike domain', () => {
    setNodeEnv('production');
    // The reason this compares whole hosts rather than a suffix.
    expect(isAllowedOrigin(req('https://evil-teamdbsolutions.com'))).toBe(false);
    expect(isAllowedOrigin(req('https://teamdbsolutions.com.attacker.net'))).toBe(
      false,
    );
  });

  it('refuses a malformed Origin', () => {
    setNodeEnv('production');
    expect(isAllowedOrigin(req('not a url'))).toBe(false);
  });

  it('allows localhost only outside production', () => {
    setNodeEnv('development');
    expect(isAllowedOrigin(req('http://localhost:3000'))).toBe(true);

    setNodeEnv('production');
    expect(isAllowedOrigin(req('http://localhost:3000'))).toBe(false);
  });

  it('honours CHAT_ALLOWED_ORIGINS for a preview or a domain being moved', () => {
    setNodeEnv('production');
    process.env.CHAT_ALLOWED_ORIGINS = 'preview.example.com, other.example.com';

    expect(isAllowedOrigin(req('https://preview.example.com'))).toBe(true);
    expect(isAllowedOrigin(req('https://other.example.com'))).toBe(true);
    expect(isAllowedOrigin(req('https://not-listed.example.com'))).toBe(false);

    delete process.env.CHAT_ALLOWED_ORIGINS;
  });

  it('is case-insensitive about the host', () => {
    setNodeEnv('production');
    expect(isAllowedOrigin(req('https://WWW.TeamDBSolutions.com'))).toBe(true);
  });
});
