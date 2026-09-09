'use client';

import { type Inline, parseMarkdown } from './markdown';

/**
 * Renders a chat answer's Markdown.
 *
 * Named `MarkdownMessage` rather than `Markdown` because `markdown.ts` sits
 * beside it: two files differing only in case resolve to the same path on
 * Windows and macOS, and TypeScript refuses the import outright.
 *
 * Everything goes through React elements — there is no `dangerouslySetInnerHTML`
 * here and there must never be. The text comes from a model that reads visitor
 * input, so the parser hands back a typed tree and this file turns it into
 * elements; a URL that `safeHref` rejected never reaches an `href` because it
 * never became a link node in the first place.
 *
 * Re-parsing on every streamed chunk is cheap enough at answer length, and it is
 * what makes partial markup behave: an unclosed `**` renders literally until its
 * partner arrives, then snaps into bold.
 */
function InlineNodes({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === 'bold') {
          return (
            <strong key={i} className="font-semibold">
              {node.text}
            </strong>
          );
        }

        if (node.type === 'link') {
          return (
            <a
              key={i}
              href={node.href}
              target="_blank"
              // `noopener` is the one that matters — it denies the opened page a
              // handle back to this window.
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-2 hover:opacity-80 break-words"
            >
              {node.text}
            </a>
          );
        }

        return <span key={i}>{node.text}</span>;
      })}
    </>
  );
}

export function MarkdownMessage({ text }: { text: string }) {
  const blocks = parseMarkdown(text);

  return (
    <>
      {blocks.map((block, i) =>
        block.type === 'list' ? (
          <ul key={i} className="list-disc pl-5 my-2 space-y-1.5 marker:text-accent/60">
            {block.items.map((item, j) => (
              <li key={j}>
                <InlineNodes nodes={item} />
              </li>
            ))}
          </ul>
        ) : (
          // No margin on the first block, so a one-paragraph answer sits flush
          // in its bubble the way a plain string used to.
          <p key={i} className={i === 0 ? '' : 'mt-3'}>
            <InlineNodes nodes={block.content} />
          </p>
        ),
      )}
    </>
  );
}
