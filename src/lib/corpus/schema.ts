import { z } from 'zod';

/**
 * The kinds an Accomplishment can take, per CONTEXT.md — a talk, an open-source
 * contribution and a shipped project are all Accomplishments distinguished only
 * by this discriminator, not by separate entities.
 */
export const KINDS = [
  'engineering',
  'talk',
  'open-source',
  'project',
  'education',
  'writing',
] as const;

export type Kind = (typeof KINDS)[number];

/**
 * Human-readable label per Kind. Keyed by `Kind` so adding a Kind to `KINDS`
 * forces a label here rather than silently rendering a raw enum value.
 */
export const KIND_LABELS: Record<Kind, string> = {
  engineering: 'Engineering',
  talk: 'Talk',
  'open-source': 'Open Source',
  project: 'Project',
  education: 'Education',
  writing: 'Writing',
};

/**
 * The `site:json` contract (ADR-0013): what the `career` repository hands this
 * site, and the only way the site learns anything about the Corpus. The gate is
 * on the other side: `career` emits only what may be published, so this schema
 * validates shape, not visibility. A mismatched `version` is refused before
 * parsing, because the producer lives in another repository.
 */
export const SITE_JSON_VERSION = 1;

const affiliationSchema = z.object({
  id: z.string().min(1),
  organisation: z.string().min(1),
  role: z.string().min(1),
  period: z.object({ start: z.string().min(1), end: z.string().min(1).optional() }).optional(),
  stack: z.array(z.string()),
});

const accomplishmentSchema = z.object({
  id: z.string().min(1),
  affiliationId: z.string().min(1).optional(),
  date: z.string().min(1),
  kind: z.enum(KINDS),
  metric: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  image: z.object({ src: z.string().regex(/^\/projects\/[\w.-]+$/), alt: z.string().min(1) }).optional(),
  statement: z.string().min(1),
  featured: z.boolean(),
  isDraft: z.boolean(),
});

const identitySchema = z.object({
  name: z.string().min(1),
  initials: z.string().min(1),
  role: z.array(z.string().min(1)).min(1),
  location: z.string().min(1),
  headline: z.string().min(1).optional(),
  bookingUrl: z.string().min(1),
  social: z.object({
    github: z.string().min(1),
    linkedin: z.string().min(1),
    email: z.string().min(1),
  }),
  availability: z
    .object({
      engagement: z.array(z.string().min(1)).min(1),
      workMode: z.string().min(1),
      hours: z.string().min(1),
    })
    .optional(),
  bio: z.string().min(1),
});

export const siteJsonSchema = z.object({
  version: z.literal(SITE_JSON_VERSION),
  identity: identitySchema.nullable(),
  affiliations: z.array(affiliationSchema),
  accomplishments: z.array(accomplishmentSchema),
});

/**
 * The organisation or institution an Accomplishment happened inside. Holds where
 * and when plus the stack involved; holds no claims. Referenced by its stable
 * `id` (the filename), never by display name.
 */
export interface Affiliation {
  id: string;
  organisation: string;
  role: string;
  /** When the Affiliation ran. Absent when not yet recorded. */
  period?: { start: string; end?: string };
  stack: string[];
}

/**
 * One provable thing, written to stand alone outside its Affiliation. An
 * Accomplishment without a Metric is valid but marked a draft and excluded from
 * the default view.
 */
export interface Accomplishment {
  id: string;
  /** Stable id of the referenced Affiliation, if any. */
  affiliationId?: string;
  /** The resolved Affiliation, populated by the loader. */
  affiliation?: Affiliation;
  date: string;
  kind: Kind;
  metric?: string;
  /**
   * The display name, when the Accomplishment is a named thing. Absent for the
   * many that are a claim rather than a product — consumers fall back to the
   * Affiliation or render no heading.
   */
  title?: string;
  /**
   * The image a project card shows, 1200×630 WebP under `public/projects/`.
   * Absent for most Accomplishments, and for projects with nothing to show yet.
   */
  image?: { src: string; alt: string };
  /** The prose statement — the markdown body of the file. */
  statement: string;
  featured: boolean;
  /** True when the Accomplishment has no Metric. */
  isDraft: boolean;
}

/**
 * Who Daniel is, as the site header and the resume header both read it. Lives in
 * the Corpus — not in site configuration — so the two can never disagree. There
 * is exactly one, and it arrives through `site:json`.
 */
export interface Identity {
  name: string;
  initials: string;
  role: string[];
  location: string;
  /** A one-line professional summary, if recorded. */
  headline?: string;
  bookingUrl: string;
  social: { github: string; linkedin: string; email: string };
  /**
   * The terms Daniel takes work on, if recorded. Anything outside them is a
   * conversation, not a no — every Render Target says so alongside it.
   */
  availability?: { engagement: string[]; workMode: string; hours: string };
  /** The bio prose — the markdown body of `identity.md`. */
  bio: string;
}
