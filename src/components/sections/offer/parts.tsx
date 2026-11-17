import { CalendarDays, Mail, MessageCircle } from "lucide-react";

import type { Offer } from "@/content/oferta";
import type { Identity } from "@/lib/corpus/schema";
import { whatsappHref } from "@/lib/contact";

/** The heading every offer section opens with, matching the Projects section. */
export function SectionHeader({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: string }) {
  return (
    <div className="mb-10">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-accent-text">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      <div aria-hidden="true" className="mt-3 h-1 w-16 rounded-full bg-accent/60" />
      {lede && <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{lede}</p>}
    </div>
  );
}

const PRIMARY =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-white shadow-lg shadow-accent/20 transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const SECONDARY =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-6 font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

/**
 * The ways to start a conversation, in the offer's order: in Portuguese the
 * WhatsApp first and the booking page beside it, in English the booking link
 * first and an email beside it. The first one present is the filled button.
 */
export function ContactButtons({ offer, identity, className = "" }: { offer: Offer; identity: Identity; className?: string }) {
  const { reach } = offer;
  const whatsapp = reach.whatsapp && identity.social.whatsapp;
  const email = reach.email && identity.social.email;
  const bookingHref = reach.booking.href ?? identity.bookingUrl;

  const buttons = [
    whatsapp && reach.whatsapp && {
      href: whatsappHref(whatsapp, reach.whatsapp.message),
      label: reach.whatsapp.cta,
      Icon: MessageCircle,
      external: true,
    },
    bookingHref && { href: bookingHref, label: reach.booking.cta, Icon: CalendarDays, external: true },
    email && reach.email && {
      href: `mailto:${email}?subject=${encodeURIComponent(reach.email.subject)}`,
      label: reach.email.cta,
      Icon: Mail,
      external: false,
    },
  ].filter((button) => !!button);

  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      {buttons.map(({ href, label, Icon, external }, i) => (
        <a
          key={label}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={i === 0 ? PRIMARY : SECONDARY}
        >
          <Icon size={18} aria-hidden="true" />
          {label}
        </a>
      ))}
    </div>
  );
}
