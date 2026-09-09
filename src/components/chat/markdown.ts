/**
 * A deliberately small Markdown reader for chat answers.
 *
 * The agent writes Markdown — bold, `-` lists, links — and the bubble rendered it
 * as literal text, so answers arrived full of `**asterisks**` and contact links
 * showed as `[LinkedIn](https://…)`: ugly, and not clickable, which hurts the one
 * thing the chat is for.
 *
 * This covers what the model actually emits and nothing more. A full Markdown
 * library would be ~100KB in a page whose featured claim is "page load 7s →
 * 1.5s"; the trade is that unsupported syntax degrades to literal text, which is
 * exactly today's behaviour and never a crash.
 *
 * Security note: this text comes from a model that reads visitor input, so a
 * link's URL is attacker-influenced in principle. `safeHref` is why the output
 * is a typed tree rather than an HTML string — nothing here is ever passed to
 * `dangerouslySetInnerHTML`, and only http/https/mailto survive.
 */

export type Inline =
  | { type: 'text'; text: string }
  | { type: 'bold'; text: string }
  | { type: 'link'; text: string; href: string };

export type Block =
  | { type: 'paragraph'; content: Inline[] }
  | { type: 'list'; items: Inline[][] };

/** Only schemes that cannot execute script. `javascript:` and `data:` are out. */
export function safeHref(candidate: string): string | undefined {
  const trimmed = candidate.trim();
  try {
    const url = new URL(trimmed);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol)
      ? trimmed
      : undefined;
  } catch {
    return undefined;
  }
}

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/;
const BOLD = /\*\*([^*]+)\*\*/;

/** A bare URL or email address sitting in ordinary prose. */
const BARE = /(https?:\/\/[^\s<>"]+|[\w.+-]+@[\w-]+\.[\w.-]*\w)/;

/**
 * Trailing punctuation that belongs to the sentence, not the address.
 *
 * "book a call at https://cal.com/x." ends in a full stop, and
 * "on LinkedIn (https://…/?locale=en)" closes a parenthesis the URL never
 * opened. Both would otherwise be swallowed into the href and 404.
 */
function trimTrailingPunctuation(url: string): { url: string; rest: string } {
  let end = url.length;

  while (end > 0) {
    const char = url[end - 1];

    if ('.,;:!?'.includes(char)) {
      end -= 1;
      continue;
    }

    // A closing bracket is part of the URL only if this URL opened it — Wikipedia
    // links genuinely contain them, prose parentheses genuinely do not.
    if (char === ')' || char === ']') {
      const open = char === ')' ? '(' : '[';
      const slice = url.slice(0, end);
      const opens = slice.split(open).length - 1;
      const closes = slice.split(char).length - 1;
      if (closes > opens) {
        end -= 1;
        continue;
      }
    }

    break;
  }

  return { url: url.slice(0, end), rest: url.slice(end) };
}

/**
 * Turns bare URLs and email addresses in a plain-text run into links.
 *
 * The agent writes these unadorned — "reach him at name@example.com" — so
 * without this they render as dead text, which is the opposite of what a contact
 * line is for. Only runs that are already plain text reach this; a Markdown
 * link's own label is never re-scanned.
 */
function autolink(text: string): Inline[] {
  const out: Inline[] = [];
  let rest = text;

  while (rest.length > 0) {
    const match = BARE.exec(rest);
    if (!match) {
      out.push({ type: 'text', text: rest });
      break;
    }

    if (match.index > 0) {
      out.push({ type: 'text', text: rest.slice(0, match.index) });
    }

    const raw = match[0];
    const { url, rest: tail } = trimTrailingPunctuation(raw);
    const candidate = url.includes('@') && !url.startsWith('http')
      ? `mailto:${url}`
      : url;
    const href = safeHref(candidate);

    out.push(href ? { type: 'link', text: url, href } : { type: 'text', text: url });
    if (tail) out.push({ type: 'text', text: tail });

    rest = rest.slice(match.index + raw.length);
  }

  return out;
}

/**
 * Splits one line into text, bold and link runs.
 *
 * Links are matched before bold so a bold label inside a link does not break the
 * link apart. A link whose URL is rejected renders as its own text — the reader
 * still sees the words, just not a clickable trap.
 */
export function parseInline(line: string): Inline[] {
  const out: Inline[] = [];
  let rest = line;

  while (rest.length > 0) {
    const link = LINK.exec(rest);
    const bold = BOLD.exec(rest);

    // Whichever marker comes first wins; neither means the rest is plain text.
    const next =
      link && bold ? (link.index <= bold.index ? link : bold) : (link ?? bold);

    if (!next) {
      out.push(...autolink(rest));
      break;
    }

    if (next.index > 0) {
      out.push(...autolink(rest.slice(0, next.index)));
    }

    if (next === link) {
      const href = safeHref(link[2]);
      out.push(
        href
          ? { type: 'link', text: link[1], href }
          : { type: 'text', text: link[1] },
      );
    } else {
      out.push({ type: 'bold', text: bold![1] });
    }

    rest = rest.slice(next.index + next[0].length);
  }

  return out.filter((node) => node.type !== 'text' || node.text.length > 0);
}

const BULLET = /^\s*[-*•]\s+(.*)$/;

/**
 * Groups lines into paragraphs and lists.
 *
 * Consecutive bullet lines become one list; a blank line ends a paragraph. This
 * runs on every streamed chunk, so it has to be cheap and has to cope with a
 * half-written line — an unclosed `**` simply stays literal until its partner
 * arrives.
 */
export function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let items: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: 'paragraph', content: parseInline(paragraph.join(' ')) });
    paragraph = [];
  };

  const flushList = () => {
    if (items.length === 0) return;
    blocks.push({ type: 'list', items: items.map(parseInline) });
    items = [];
  };

  for (const line of text.split('\n')) {
    const bullet = BULLET.exec(line);

    if (bullet) {
      flushParagraph();
      items.push(bullet[1]);
      continue;
    }

    if (line.trim() === '') {
      flushList();
      flushParagraph();
      continue;
    }

    flushList();
    paragraph.push(line.trim());
  }

  flushList();
  flushParagraph();

  return blocks;
}
