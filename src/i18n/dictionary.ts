import { en, type Dictionary } from './en';
import { pt } from './pt';
import type { Locale } from './routing';

export type { Dictionary } from './en';

const DICTIONARIES: Record<Locale, Dictionary> = { pt, en };

/**
 * The interface text in a language. Server code calls it with the `[locale]`
 * param; Client Components read the same object through `useDictionary()`.
 */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
