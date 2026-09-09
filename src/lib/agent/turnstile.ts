import 'server-only';

/**
 * Cloudflare Turnstile — the layer that actually costs an automated caller
 * something.
 *
 * Origin checking stops a shell one-liner and nothing more; a forged header
 * defeats it. Turnstile makes the client solve a challenge issued per visit,
 * which a script cannot replay cheaply. It is free, and invisible to most
 * visitors — no puzzle, no images to click.
 *
 * **It is optional and off until configured.** With no `TURNSTILE_SECRET_KEY`
 * set, `verifyTurnstile` returns `skipped` and the request proceeds on the other
 * layers. That is deliberate: shipping this switched on before the keys exist
 * would take the chat down, and a half-finished defence that breaks the site is
 * worse than the exposure it was meant to close. See issue 11 for the setup.
 */
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileResult = 'pass' | 'fail' | 'skipped';

export function isTurnstileConfigured(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

export async function verifyTurnstile(
  token: string | undefined,
  ip: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return 'skipped';

  // Configured but no token means the visitor's widget never solved — either a
  // direct call, or a browser that failed to load the script. Both are refused;
  // the message tells a real visitor to reload.
  if (!token) return 'fail';

  try {
    const body = new URLSearchParams({ secret, response: token });
    // Cloudflare uses the address to bind a token to its solver. `unknown` is
    // what `clientIp` returns when no proxy header arrived; sending it would be
    // a guaranteed mismatch, so it is left off instead.
    if (ip && ip !== 'unknown') body.set('remoteip', ip);

    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) return 'skipped';

    const result: { success?: boolean } = await response.json();
    return result.success ? 'pass' : 'fail';
  } catch {
    // Cloudflare unreachable. Failing open here is the same call as the
    // classifier: an outage at a third party must not silence the site, and the
    // rate limits still cap what an attacker can extract in the meantime.
    return 'skipped';
  }
}
