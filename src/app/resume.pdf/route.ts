import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getIdentity } from '@/lib/corpus/site';

/**
 * The complete résumé, as a download (ADR-0009).
 *
 * `career` renders it, where Tectonic and the whole Corpus are (ADR-0013), and
 * `scripts/fetch-corpus.mjs` puts the finished PDF in `.corpus/`. This route
 * is prerendered at build and only hands out those bytes, so neither this site
 * nor its server holds Tectonic or the non-Featured records as data.
 */
export const dynamic = 'force-static';

export function GET() {
  const pdf = readFileSync(join(process.cwd(), '.corpus', 'resume.pdf'));
  const filename = `${getIdentity().name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`;

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      // `inline` opens it in the browser's viewer; the name is what "Save"
      // proposes, instead of a bare "resume.pdf".
      'Content-Disposition': `inline; filename="${filename}"`,
    },
  });
}
