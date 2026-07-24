import 'server-only';

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import matter from 'gray-matter';
import type { ZodError, ZodType } from 'zod';

import {
  type Accomplishment,
  type Affiliation,
  accomplishmentFrontmatterSchema,
  affiliationFrontmatterSchema,
  type Kind,
} from './schema';

/**
 * Thrown when the Corpus is malformed — a missing field, an invalid `kind`, or a
 * dangling Affiliation reference. Because the site is a static export, this halts
 * the build rather than shipping a broken page (spec story 34).
 */
export class CorpusError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'CorpusError';
  }
}

/**
 * The single seam between the `content/` directory and every consumer. Reads the
 * Corpus, validates frontmatter, resolves Affiliation references and exposes
 * typed entities plus the queries consumers need. No consumer parses frontmatter
 * itself.
 */
export interface Corpus {
  affiliations: Affiliation[];
  /** Records — Accomplishments with a Metric. Drafts are excluded by default. */
  accomplishments: Accomplishment[];
  /** Accomplishments with no Metric, retrievable on request. */
  drafts: Accomplishment[];
  /** Records marked Featured, for the public site. */
  featured: Accomplishment[];
  byKind(kind: Kind): Accomplishment[];
  byAffiliation(affiliationId: string): Accomplishment[];
}

interface ParsedFile {
  id: string;
  data: unknown;
  body: string;
}

const MD_EXTENSION = '.md';

function defaultContentDir(): string {
  return join(process.cwd(), 'content');
}

/**
 * Reads every markdown file in `dir`, using the filename (without `.md`) as the
 * stable id. A missing directory is a legitimate empty state, not an error.
 */
function readMarkdownFiles(dir: string): ParsedFile[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }

  return entries
    .filter((name) => name.endsWith(MD_EXTENSION))
    .sort()
    .map((name) => {
      const id = name.slice(0, -MD_EXTENSION.length);
      const parsed = matter(readFileSync(join(dir, name), 'utf8'));
      return { id, data: parsed.data, body: parsed.content.trim() };
    });
}

function formatIssues(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join('.') || '(frontmatter)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

/** Validate frontmatter against `schema`, or throw a labelled `CorpusError`. */
function validateFrontmatter<T>(
  schema: ZodType<T>,
  entity: 'Affiliation' | 'Accomplishment',
  id: string,
  data: unknown,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new CorpusError(
      `Invalid ${entity} "${id}" — ${formatIssues(result.error)}`,
      { cause: result.error },
    );
  }
  return result.data;
}

function parseAffiliation({ id, data }: ParsedFile): Affiliation {
  const frontmatter = validateFrontmatter(
    affiliationFrontmatterSchema,
    'Affiliation',
    id,
    data,
  );
  return { id, ...frontmatter };
}

function parseAccomplishment(
  { id, data, body }: ParsedFile,
  affiliationsById: Map<string, Affiliation>,
): Accomplishment {
  const { affiliation: affiliationId, date, kind, metric, featured } =
    validateFrontmatter(
      accomplishmentFrontmatterSchema,
      'Accomplishment',
      id,
      data,
    );

  if (body.length === 0) {
    throw new CorpusError(
      `Invalid Accomplishment "${id}" — the prose statement (file body) is empty.`,
    );
  }

  let affiliation: Affiliation | undefined;
  if (affiliationId !== undefined) {
    affiliation = affiliationsById.get(affiliationId);
    if (affiliation === undefined) {
      throw new CorpusError(
        `Accomplishment "${id}" references Affiliation "${affiliationId}", which does not exist in the Corpus.`,
      );
    }
  }

  return {
    id,
    affiliationId,
    affiliation,
    date,
    kind,
    metric,
    statement: body,
    featured,
    isDraft: metric === undefined,
  };
}

/**
 * Load and validate the Corpus rooted at `rootDir` (defaults to `content/` in the
 * project root). Safe to call at build time from a Server Component; the
 * `server-only` import keeps it out of client bundles.
 */
export function loadCorpus(rootDir: string = defaultContentDir()): Corpus {
  const affiliations = readMarkdownFiles(join(rootDir, 'affiliations')).map(
    parseAffiliation,
  );
  const affiliationsById = new Map(affiliations.map((a) => [a.id, a]));

  const allAccomplishments = readMarkdownFiles(
    join(rootDir, 'accomplishments'),
  ).map((file) => parseAccomplishment(file, affiliationsById));

  const records = allAccomplishments.filter((a) => !a.isDraft);
  const drafts = allAccomplishments.filter((a) => a.isDraft);

  return {
    affiliations,
    accomplishments: records,
    drafts,
    featured: records.filter((a) => a.featured),
    byKind: (kind) => records.filter((a) => a.kind === kind),
    byAffiliation: (affiliationId) =>
      records.filter((a) => a.affiliationId === affiliationId),
  };
}
