import 'server-only';

import type { Corpus } from '@/lib/corpus/loader';
import type { Accomplishment, Identity } from '@/lib/corpus/schema';
import { displayTitle, parseStatement } from '@/lib/corpus/statement';

import type { ChatAnswer } from './types';

/**
 * Derives the chat's suggested answers from the Corpus.
 *
 * These answers used to be hand-written strings in `src/data/responses.ts` —
 * scaffold prose that claimed, in Daniel's first person, an interest in coffee
 * shops and science fiction and a stack the Corpus does not record. That made
 * `/chat` the one Render Target in production violating ADR-0003. Every line
 * here is assembled from records Daniel actually captured, and a Metric is only
 * ever quoted as the Corpus's own string.
 *
 * This is deliberately a stopgap. Issue 02 of `agent-answers-from-the-corpus`
 * replaces the answers with a real agent reading the same Featured set; the
 * question set and the provider seam survive that, this file does not.
 *
 * Scope is the Featured Accomplishments only — the same five records
 * `/achievements` renders, per ADR-0008. Nothing here may read `accomplishments`
 * or `drafts`.
 */
export function buildChatAnswers(corpus: Corpus): ChatAnswer[] {
  const { identity, featured } = corpus;

  return [
    { id: 'me', phrase: 'Tell me about Daniel...', response: aboutMe(identity) },
    {
      id: 'projects',
      phrase: 'What has he actually shipped?',
      response: projects(featured),
    },
    {
      id: 'skills',
      phrase: 'What does he work with?',
      response: skills(featured),
    },
    {
      id: 'site',
      phrase: 'How was this site built?',
      response: thisSite(featured),
    },
    { id: 'contact', phrase: 'Is he available for hire?', response: contact(identity) },
  ];
}

function aboutMe(identity: Identity | undefined): string {
  if (!identity) return 'The Corpus has no Identity recorded yet.';

  const roles = identity.role.join(', ');
  const headline = identity.headline ? ` ${identity.headline}` : '';
  return `I'm ${identity.name} — ${roles}, based in ${identity.location}.${headline} ${identity.bio}`;
}

/**
 * One line per Featured record: its heading, the year, and its Metric quoted
 * verbatim. The Metric is never re-derived or rounded — ADR-0003 and ADR-0008.
 */
function projects(featured: Accomplishment[]): string {
  if (featured.length === 0) {
    return 'Nothing is featured on the Corpus right now, so I have no work to point you at. The projects section on the homepage is the better place to look.';
  }

  const lines = featured.map((accomplishment) => {
    const heading = displayTitle(accomplishment) ?? 'Untitled';
    const year = accomplishment.date.slice(0, 4);
    const metric = accomplishment.metric ? ` — ${accomplishment.metric}` : '';
    return `• ${heading} (${year})${metric}`;
  });

  const noun = featured.length === 1 ? 'piece' : 'pieces';
  return `${featured.length} ${noun} of work are featured right now:\n\n${lines.join(
    '\n',
  )}\n\nAsk me about any of them and I'll tell you what the record says.`;
}

/**
 * The stack, read off the Affiliations behind the Featured work and the
 * "Built with …" sentences the capture convention leaves in a statement. Never a
 * list typed by hand — the previous version of this answer claimed Prisma and
 * GraphQL, neither of which appears anywhere in the Corpus.
 */
function skills(featured: Accomplishment[]): string {
  const seen = new Set<string>();
  const stack: string[] = [];

  for (const accomplishment of featured) {
    const fromAffiliation = accomplishment.affiliation?.stack ?? [];
    const fromStatement = parseStatement(accomplishment.statement).tech;

    for (const entry of [...fromAffiliation, ...fromStatement]) {
      const key = entry.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        stack.push(entry);
      }
    }
  }

  if (stack.length === 0) {
    return 'The Corpus does not record a stack against the featured work yet, so I would rather not guess at one.';
  }

  return `Everything here is read off the work itself, not a list I keep: ${stack.join(
    ', ',
  )}.`;
}

/** The `personal-website` record, which is the one the chat sits inside. */
function thisSite(featured: Accomplishment[]): string {
  const site = featured.find(
    (accomplishment) => accomplishment.id === 'personal-website',
  );

  if (!site) {
    return 'This site is not a featured record on the Corpus right now, so I have nothing recorded about how it was built.';
  }

  const { prose, repoUrl } = parseStatement(site.statement);
  const metric = site.metric ? `\n\nThe number on it: ${site.metric}.` : '';
  const repo = repoUrl ? `\n\nThe source is public: ${repoUrl}` : '';

  return `${prose}${metric}${repo}`;
}

function contact(identity: Identity | undefined): string {
  if (!identity) return 'The Corpus has no Identity recorded yet.';

  const { email, linkedin } = identity.social;
  return `Email is the surest route: ${email}. LinkedIn works too (${linkedin}), and there's a booking link if a call is easier: ${identity.bookingUrl}`;
}
