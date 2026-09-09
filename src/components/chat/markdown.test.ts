import { describe, expect, it } from 'vitest';

import { parseInline, parseMarkdown, safeHref } from './markdown';

/**
 * The parser reads text produced by a model that reads visitor input, so the
 * URL tests are not hypothetical hygiene — they are the reason this returns a
 * typed tree instead of an HTML string.
 */
describe('safeHref', () => {
  it('allows the schemes a chat answer legitimately needs', () => {
    expect(safeHref('https://example.com')).toBe('https://example.com');
    expect(safeHref('http://example.com')).toBe('http://example.com');
    expect(safeHref('mailto:someone@example.com')).toBe('mailto:someone@example.com');
  });

  it('rejects schemes that can execute or smuggle content', () => {
    expect(safeHref('javascript:alert(1)')).toBeUndefined();
    expect(safeHref('JavaScript:alert(1)')).toBeUndefined();
    expect(safeHref('data:text/html;base64,PHNjcmlwdD4=')).toBeUndefined();
    expect(safeHref('vbscript:msgbox')).toBeUndefined();
    expect(safeHref('not a url at all')).toBeUndefined();
  });
});

describe('parseInline', () => {
  it('reads bold', () => {
    expect(parseInline('At **CodeSquare**, he built')).toEqual([
      { type: 'text', text: 'At ' },
      { type: 'bold', text: 'CodeSquare' },
      { type: 'text', text: ', he built' },
    ]);
  });

  it('reads links', () => {
    expect(parseInline('reach him on [LinkedIn](https://linkedin.com/in/x)')).toEqual([
      { type: 'text', text: 'reach him on ' },
      { type: 'link', text: 'LinkedIn', href: 'https://linkedin.com/in/x' },
    ]);
  });

  it('renders a rejected link as its own text, losing nothing but the trap', () => {
    expect(parseInline('click [here](javascript:alert)')).toEqual([
      { type: 'text', text: 'click ' },
      { type: 'text', text: 'here' },
    ]);
  });

  it('still refuses a rejected link whose URL contains parentheses', () => {
    // The URL pattern stops at the first `)`, so a nested one leaves a stray
    // character behind. Cosmetic, and only reachable through malformed input —
    // what matters is that no `link` node is produced.
    const nodes = parseInline('click [here](javascript:alert(1))');

    expect(nodes.some((n) => n.type === 'link')).toBe(false);
    expect(nodes.map((n) => n.text).join('')).toBe('click here)');
  });

  it('leaves an unclosed marker literal, as mid-stream text', () => {
    // Every chunk re-parses the whole answer, so half-written markup is the
    // normal case, not an edge case.
    expect(parseInline('At **CodeSq')).toEqual([{ type: 'text', text: 'At **CodeSq' }]);
  });

  it('keeps plain text untouched', () => {
    expect(parseInline('no markup here')).toEqual([
      { type: 'text', text: 'no markup here' },
    ]);
  });
});

/**
 * The agent writes most of its contact details unadorned, not as Markdown links.
 * Without autolinking they render as dead text on the one line whose entire
 * purpose is to be clicked.
 */
describe('autolinking bare addresses', () => {
  it('links a bare URL', () => {
    expect(parseInline('see https://example.com/x for more')).toEqual([
      { type: 'text', text: 'see ' },
      { type: 'link', text: 'https://example.com/x', href: 'https://example.com/x' },
      { type: 'text', text: ' for more' },
    ]);
  });

  it('links a bare email through mailto', () => {
    expect(parseInline('reach him at dn.someone@gmail.com today')).toEqual([
      { type: 'text', text: 'reach him at ' },
      {
        type: 'link',
        text: 'dn.someone@gmail.com',
        href: 'mailto:dn.someone@gmail.com',
      },
      { type: 'text', text: ' today' },
    ]);
  });

  it('leaves a sentence-ending full stop out of the href', () => {
    const nodes = parseInline('book a call at https://cal.com/daniel/get-off-the-ground.');
    const link = nodes.find((n) => n.type === 'link');

    expect(link).toEqual({
      type: 'link',
      text: 'https://cal.com/daniel/get-off-the-ground',
      href: 'https://cal.com/daniel/get-off-the-ground',
    });
    expect(nodes.at(-1)).toEqual({ type: 'text', text: '.' });
  });

  it('leaves a wrapping parenthesis out of the href', () => {
    // Straight from a live answer: "connect on LinkedIn (https://…/?locale=en),"
    const nodes = parseInline(
      'connect on LinkedIn (https://www.linkedin.com/in/someone/?locale=en), or',
    );
    const link = nodes.find((n) => n.type === 'link');

    expect(link?.type === 'link' && link.href).toBe(
      'https://www.linkedin.com/in/someone/?locale=en',
    );
  });

  it('keeps a parenthesis the URL itself opened', () => {
    const nodes = parseInline('https://en.wikipedia.org/wiki/Ruby_(gem)');
    const link = nodes.find((n) => n.type === 'link');

    expect(link?.type === 'link' && link.href).toBe(
      'https://en.wikipedia.org/wiki/Ruby_(gem)',
    );
  });

  it('does not re-scan the label of a Markdown link', () => {
    const nodes = parseInline('[write to me@example.com](https://example.com)');

    expect(nodes).toEqual([
      { type: 'link', text: 'write to me@example.com', href: 'https://example.com' },
    ]);
  });

  it('handles a full contact line the way the agent writes it', () => {
    const nodes = parseInline(
      'reach Daniel at dn.b@gmail.com, connect on LinkedIn (https://www.linkedin.com/in/x/?locale=en), or book a call at https://cal.com/y.',
    );
    const links = nodes.filter((n) => n.type === 'link');

    expect(links).toHaveLength(3);
    expect(links.map((l) => l.type === 'link' && l.href)).toEqual([
      'mailto:dn.b@gmail.com',
      'https://www.linkedin.com/in/x/?locale=en',
      'https://cal.com/y',
    ]);
  });
});

describe('parseMarkdown', () => {
  it('groups consecutive bullets into one list', () => {
    const blocks = parseMarkdown('Highlights:\n\n- first item\n- second item');

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: 'Highlights:' }],
    });
    expect(blocks[1].type).toBe('list');
    expect(blocks[1].type === 'list' && blocks[1].items).toHaveLength(2);
  });

  it('separates paragraphs on a blank line', () => {
    const blocks = parseMarkdown('first para\n\nsecond para');
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'paragraph']);
  });

  it('handles the shape the agent actually returns', () => {
    const answer = [
      'A few highlights from his work:',
      '',
      '- At **CodeSquare**, he cut page load from 7s to 1.5s.',
      '- At **iForth Systems**, delivery went from 4 days to 1 day.',
      '',
      'Reach him at [LinkedIn](https://www.linkedin.com/in/x).',
    ].join('\n');

    const blocks = parseMarkdown(answer);
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'list', 'paragraph']);

    const list = blocks[1];
    expect(list.type === 'list' && list.items[0]).toContainEqual({
      type: 'bold',
      text: 'CodeSquare',
    });

    // The metric survives the parse byte for byte — ADR-0003 does not stop being
    // true because the text passed through a renderer.
    const flat = JSON.stringify(blocks);
    expect(flat).toContain('7s to 1.5s');
    expect(flat).toContain('4 days to 1 day');
  });

  it('accepts every bullet character in use', () => {
    // The live agent writes `-`; the Corpus-derived answers behind the mock and
    // the quick actions write `•`. Both have to render as a list, or the two
    // sources look like different products.
    for (const bullet of ['-', '*', '•']) {
      const blocks = parseMarkdown(`${bullet} one\n${bullet} two`);
      expect(blocks, `bullet ${bullet}`).toHaveLength(1);
      expect(blocks[0].type === 'list' && blocks[0].items).toHaveLength(2);
    }
  });

  it('returns nothing for empty input', () => {
    expect(parseMarkdown('')).toEqual([]);
  });
});
