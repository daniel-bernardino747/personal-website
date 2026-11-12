"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getDictionary, type Dictionary } from "@/i18n/dictionary";
import type { Locale } from "@/i18n/routing";

/**
 * Carries the interface text to Client Components, the way `IdentityProvider`
 * carries the Identity. It is seeded with the locale rather than the dictionary
 * itself: the dictionary holds functions (text that interpolates), and a
 * function cannot cross from a Server Component into a Client Component's props.
 */
const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={getDictionary(locale)}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary(): Dictionary {
  const dictionary = useContext(DictionaryContext);
  if (!dictionary) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return dictionary;
}
