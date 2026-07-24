"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Identity } from "@/lib/corpus/schema";

/**
 * Carries the Corpus Identity to Client Components. The loader is `server-only`
 * and cannot be imported into a client bundle, so a Server Component (the root
 * layout) reads the Identity at build time and seeds it here; client components
 * read it through `useIdentity()` instead of importing career data directly.
 */
const IdentityContext = createContext<Identity | null>(null);

export function IdentityProvider({
  identity,
  children,
}: {
  identity: Identity;
  children: ReactNode;
}) {
  return (
    <IdentityContext.Provider value={identity}>
      {children}
    </IdentityContext.Provider>
  );
}

export function useIdentity(): Identity {
  const identity = useContext(IdentityContext);
  if (!identity) {
    throw new Error("useIdentity must be used within an IdentityProvider");
  }
  return identity;
}
