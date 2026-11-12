import { NextResponse, type NextRequest } from 'next/server';

import { routePath } from '@/i18n/routing';

/** Portuguese at the root, English under `/en` (ADR-0015). See `routePath`. */
export function proxy(request: NextRequest) {
  const routing = routePath(request.nextUrl.pathname);
  if (routing.kind === 'next') return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = routing.pathname;
  return routing.kind === 'rewrite' ? NextResponse.rewrite(url) : NextResponse.redirect(url, 308);
}

export const config = {
  // Pages only. The API and Next's own files keep one address for both
  // languages; files with an extension (the share images `/og/pt.png`,
  // `/resume.pdf`, images) are let through by `routePath`.
  // (An escaped dot does not survive the matcher's compilation: `\.` became
  // `.`, and the matcher then skipped every path but `/`.)
  matcher: ['/((?!api|_next).*)'],
};
