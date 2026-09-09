'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Obtains a fresh Cloudflare Turnstile token for each message.
 *
 * Fresh per message is not an optimisation — Turnstile tokens are single-use, so
 * a widget rendered once and read repeatedly would pass the first message and
 * fail every one after it. The widget is rendered in `execute` mode and run on
 * demand, then reset.
 *
 * The whole hook is inert when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset: no
 * script is loaded, `getToken` resolves to undefined, and the server skips the
 * check because its own secret is missing too. That is what lets this ship
 * before the Cloudflare account exists (issue 11).
 */
type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      execution?: 'render' | 'execute';
      appearance?: 'always' | 'execute' | 'interaction-only';
      callback?: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
    },
  ) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TOKEN_TIMEOUT_MS = 8_000;

export function useTurnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const widgetRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef<((token: string | undefined) => void) | null>(null);

  useEffect(() => {
    if (!siteKey || typeof window === 'undefined') return;

    const container = document.createElement('div');
    // Kept out of the layout entirely: this is the invisible variant, and a
    // stray 300x65 iframe would push the composer around.
    container.style.display = 'none';
    document.body.appendChild(container);
    containerRef.current = container;

    const settle = (token: string | undefined) => {
      pendingRef.current?.(token);
      pendingRef.current = null;
    };

    const render = () => {
      if (!window.turnstile || !containerRef.current) return;
      widgetRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        execution: 'execute',
        appearance: 'interaction-only',
        callback: settle,
        // A failed or expired challenge resolves undefined rather than hanging.
        // The server then refuses with a message telling the visitor to reload,
        // which beats a send button that silently does nothing.
        'error-callback': () => settle(undefined),
        'expired-callback': () => settle(undefined),
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_SRC}"]`,
      );
      const script = existing ?? document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.addEventListener('load', render);
      if (!existing) document.head.appendChild(script);
    }

    return () => {
      container.remove();
      containerRef.current = null;
      widgetRef.current = null;
    };
  }, [siteKey]);

  return useCallback((): Promise<string | undefined> => {
    if (!siteKey || !window.turnstile || !widgetRef.current) {
      return Promise.resolve(undefined);
    }

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        pendingRef.current = null;
        resolve(undefined);
      }, TOKEN_TIMEOUT_MS);

      pendingRef.current = (token) => {
        clearTimeout(timer);
        resolve(token);
      };

      // Single-use: reset before each run, or the second message reuses a spent
      // token and is refused.
      window.turnstile!.reset(widgetRef.current!);
      window.turnstile!.execute(widgetRef.current!);
    });
  }, [siteKey]);
}
