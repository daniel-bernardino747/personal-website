import { CalendarDays, MessageCircle } from "lucide-react";

import { whatsappHref } from "@/lib/contact";
import { oferta } from "@/content/oferta/pt";

/** The heading every local section opens with, matching the Projects section. */
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

/** The two ways to start: WhatsApp first, the booking page beside it. */
export function ContactButtons({ whatsapp, className = "" }: { whatsapp?: string; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
      {whatsapp && (
        <a
          href={whatsappHref(whatsapp, oferta.whatsapp.message)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-white shadow-lg shadow-accent/20 transition-colors hover:bg-accent/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <MessageCircle size={18} aria-hidden="true" />
          {oferta.whatsapp.cta}
        </a>
      )}
      <a
        href={oferta.booking.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-6 font-medium text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <CalendarDays size={18} aria-hidden="true" />
        {oferta.booking.cta}
      </a>
    </div>
  );
}
