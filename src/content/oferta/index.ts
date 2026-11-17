import type { Locale } from "@/i18n/routing";

import { offer as en } from "./en";
import { oferta as pt } from "./pt";

/**
 * The offer to clients that opens the home page, one per language. Portuguese
 * speaks to businesses in Criciúma (ADR-0015), English to founders and small
 * businesses abroad (ADR-0019). The shape is shared, so the sections render
 * either; what differs is the copy and how a visitor gets in touch.
 */
export type Offer = {
  /** The anchors each section carries, which the navbar links to. */
  ids: { services: string; process: string; elo: string; guarantees: string; firstDelivery: string; contact: string };
  seo: { title: string; description: string };
  hero: { greeting: string; eyebrow: string; title: string; lede: string };
  /** The ways to start a conversation; the first one present is the primary button. */
  reach: {
    whatsapp?: { cta: string; message: string };
    /** Without `href`, the booking link in the Identity. */
    booking: { cta: string; href?: string };
    email?: { cta: string; subject: string };
  };
  services: { eyebrow: string; title: string; notes: readonly string[] };
  process: { eyebrow: string; title: string; steps: readonly { title: string; body: string }[] };
  speed: { title: string; points: readonly { title: string; body: string }[] };
  elo: {
    eyebrow: string;
    title: string;
    lede: string;
    points: readonly string[];
    closing: string;
    /** Phone screens of the portal; none in English, because its interface is Portuguese. */
    screens: readonly { src: string; alt: string }[];
  };
  guarantees: {
    eyebrow: string;
    title: string;
    /** `clause` names the clause of the contract template the promise restates. */
    items: readonly { title: string; body: string; clause?: string }[];
  };
  firstDelivery: { eyebrow: string; accomplishmentId: string; speedNote: string };
  contact: {
    eyebrow: string;
    title: string;
    lede: string;
    inPerson?: (area: string) => string;
    hours?: (hours: string) => string;
    company: (name: string, legalName: string, cnpj: string) => string;
  };
};

const OFFERS: Record<Locale, Offer> = { pt, en };

export function getOffer(locale: Locale): Offer {
  return OFFERS[locale];
}
