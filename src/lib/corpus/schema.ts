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
  period: z.object({
    start: dateLike,
    end: dateLike.optional(),
  }),
  stack: z.array(z.string()).default([]),
});

/** Frontmatter shape of an Accomplishment file, before body/id are attached. */
export const accomplishmentFrontmatterSchema = z.object({
  affiliation: z.string().min(1).optional(),
  date: dateLike,
  kind: z.enum(KINDS),
  metric: z.string().min(1).optional(),
  featured: z.boolean().default(false),
});

export type AffiliationFrontmatter = z.infer<typeof affiliationFrontmatterSchema>;
export type AccomplishmentFrontmatter = z.infer<
  typeof accomplishmentFrontmatterSchema
>;

/**
 * The organisation or institution an Accomplishment happened inside. Holds where
 * and when plus the stack involved; holds no claims. Referenced by its stable
 * `id` (the filename), never by display name.
 */
export interface Affiliation {
  id: string;
  organisation: string;
  role: string;
  period: { start: string; end?: string };
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
  /** The prose statement — the markdown body of the file. */
  statement: string;
  featured: boolean;
  /** True when the Accomplishment has no Metric. */
  isDraft: boolean;
}
