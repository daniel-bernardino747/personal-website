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
 * YAML timestamps like `2024-03-15` are parsed into `Date` objects by the
 * frontmatter parser, while partial dates like `2022-01` stay strings. Normalise
 * both to a stable `YYYY-MM-DD` (or `YYYY-MM`) string so consumers never see a
 * `Date`.
 */
const dateLike = z
  .union([z.string().min(1), z.date()])
  .transform((value) =>
    value instanceof Date ? value.toISOString().slice(0, 10) : value,
  );

/** Frontmatter shape of an Affiliation file, before its id is attached. */
export const affiliationFrontmatterSchema = z.object({
  organisation: z.string().min(1),
  role: z.string().min(1),
  // A background Affiliation (a club, an ongoing course of study) may be recorded
  // before its exact dates are known. Rather than fabricate a period, the loader
  // accepts its absence — the seam absorbing schema evolution as real content
  // arrives, per the spec.
  period: z
    .object({
      start: dateLike,
      end: dateLike.optional(),
    })
    .optional(),
  stack: z.array(z.string()).default([]),
});

/** Frontmatter shape of an Accomplishment file, before body/id are attached. */
export const accomplishmentFrontmatterSchema = z.object({
  affiliation: z.string().min(1).optional(),
  date: dateLike,
  kind: z.enum(KINDS),
  metric: z.string().min(1).optional(),
  featured: z.boolean().default(false),
  // The display name — "BaixarMusica", not the `baixarmusica` filename. Optional
  // because most Accomplishments are a claim rather than a named thing; a project
  // gallery needs it, a résumé bullet does not.
  title: z.string().min(1).optional(),
});

/**
 * Frontmatter shape of the Identity file. Identity is the resume header — legal
 * name, contact and profile URLs, plus the site-facing role, headline and
 * initials — and belongs to the Corpus so the site and every generated resume
 * agree. The bio prose is the file body, not frontmatter.
 */
export const identityFrontmatterSchema = z.object({
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
});

export type AffiliationFrontmatter = z.infer<typeof affiliationFrontmatterSchema>;
export type AccomplishmentFrontmatter = z.infer<
  typeof accomplishmentFrontmatterSchema
>;
export type IdentityFrontmatter = z.infer<typeof identityFrontmatterSchema>;

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
  /** The prose statement — the markdown body of the file. */
  statement: string;
  featured: boolean;
  /** True when the Accomplishment has no Metric. */
  isDraft: boolean;
}

/**
 * Who Daniel is, as the site header and the resume header both read it. Lives in
 * the Corpus — not in site configuration — so the two can never disagree. There
 * is exactly one, loaded from `content/identity.md`.
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
  /** The bio prose — the markdown body of `identity.md`. */
  bio: string;
}
