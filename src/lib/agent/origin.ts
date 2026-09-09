import 'server-only';

/**
 * Rejects requests that did not come from this site's own pages.
 *
 * This does not make the endpoint private — nothing can. A page a visitor's
 * browser can call is a page `curl` can call, and any secret shipped to the
 * browser is a secret the visitor has. What this removes is the *casual* abuse:
 * a script pointed at `/api/chat`, or someone else's site embedding the chat and
 * spending this account's quota.
 *
 * A forged `Origin` header defeats it in one line of curl. That is fine — it is
 * the cheapest layer, not the last one. Turnstile is the layer that costs an
 * attacker something real, and the rate limits are what cap the damage when both
 * are bypassed.
 */

/** Browsers always send `Origin` on a `fetch` POST, same-origin included. */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');

  // No Origin at all means no browser sent this. A legitimate visitor never
  // produces such a request; a shell one-liner always does.
  if (!origin) return false;

  let host: string;
  try {
    host = new URL(origin).host.toLowerCase();
  } catch {
    return false;
  }

  return allowedHosts().has(host);
}

/**
 * The hosts allowed to reach the chat.
 *
 * The site's own domain plus the Railway-generated one, which stays live
 * alongside it. `CHAT_ALLOWED_ORIGINS` (comma-separated) extends this without a
 * deploy — a preview URL, or a domain being migrated.
 */
function allowedHosts(): Set<string> {
  const hosts = new Set<string>([
    'www.teamdbsolutions.com',
    'teamdbsolutions.com',
  ]);

  const railway = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (railway) hosts.add(railway.toLowerCase());

  for (const entry of (process.env.CHAT_ALLOWED_ORIGINS ?? '').split(',')) {
    const trimmed = entry.trim().toLowerCase();
    if (trimmed) hosts.add(trimmed);
  }

  // `npm run dev` and the local production build, which are not production.
  if (process.env.NODE_ENV !== 'production') {
    hosts.add('localhost:3000');
    hosts.add('localhost:3100');
    hosts.add('127.0.0.1:3000');
  }

  return hosts;
}
