import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { getCorpus } from '@/lib/corpus/site';
import { renderSelectionToPdf } from '@/lib/render/resume';
import { buildCompleteSelection } from '@/lib/resume/complete';
import { SITE_URL } from '@/lib/site-url';

/**
 * The complete résumé, as a download.
 *
 * Prerendered at build, like `opengraph-image`: Tectonic runs here, on the
 * machine that holds the Corpus, and the deployed server only ever hands out the
 * finished bytes — it has neither Tectonic nor the non-Featured records. A build
 * without Tectonic fails at this route rather than shipping a broken link, which
 * is why it is a prerequisite in CLAUDE.md.
 */
export const dynamic = 'force-static';

export function GET() {
  const selection = buildCompleteSelection(getCorpus(), SITE_URL);
  const outDir = mkdtempSync(join(tmpdir(), 'complete-resume-'));

  try {
    const { pdfPath } = renderSelectionToPdf(selection, { outDir, name: 'resume' });
    const filename = `${selection.header.name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`;

    return new Response(readFileSync(pdfPath), {
      headers: {
        'Content-Type': 'application/pdf',
        // `inline` opens it in the browser's viewer; the name is what "Save"
        // proposes, instead of a bare "resume.pdf".
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
}
