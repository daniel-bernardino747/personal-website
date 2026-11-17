import {
  Bot,
  Check,
  Code2,
  Globe,
  Puzzle,
  Smartphone,
  Workflow,
  Zap,
} from "lucide-react";

import type { Offer } from "@/content/oferta";

import { SectionHeader } from "./parts";

/** One icon per service, in the order the Identity lists them. */
const SERVICE_ICONS = [Code2, Puzzle, Smartphone, Workflow, Bot, Globe];

/** What Daniel builds for a business: the services from the Identity, each with its line. */
export function Services({
  offer,
  services,
}: {
  offer: Offer;
  services: string[];
}) {
  return (
    <section
      id={offer.ids.services}
      className="scroll-mt-28 px-6 py-16 md:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          eyebrow={offer.services.eyebrow}
          title={offer.services.title}
        />
        <ul className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = SERVICE_ICONS[i] ?? Code2;
            const note = offer.services.notes[i];
            return (
              <li
                key={service}
                className="bg-background p-7 transition-colors hover:bg-surface"
              >
                <Icon
                  size={22}
                  className="mb-5 text-accent-text"
                  aria-hidden="true"
                />
                <h3 className="mb-2 text-lg font-semibold">{service}</h3>
                {note && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {note}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** The process in six steps, then why it is fast. */
export function HowItWorks({ offer }: { offer: Offer }) {
  return (
    <section
      id={offer.ids.process}
      className="scroll-mt-28 px-6 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-5xl gap-14 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeader
            eyebrow={offer.process.eyebrow}
            title={offer.process.title}
          />
          <ol className="relative space-y-8 border-l border-border pl-8">
            {offer.process.steps.map((step, i) => (
              <li key={step.title} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[49px] grid size-8 place-items-center rounded-full border border-accent/40 bg-background font-mono text-xs font-bold text-accent-text"
                >
                  {i + 1}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <aside className="self-start rounded-3xl border border-accent/20 bg-accent/5 p-8 lg:sticky lg:top-28">
          <Zap size={22} className="mb-4 text-accent-text" aria-hidden="true" />
          <h3 className="mb-6 text-2xl font-bold tracking-tight">
            {offer.speed.title}
          </h3>
          <div className="space-y-6">
            {offer.speed.points.map((point) => (
              <div key={point.title}>
                <p className="font-semibold">{point.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {point.body}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

/**
 * The client portal, with three of its real screens in demo mode. Without
 * screens (English: the portal speaks Portuguese) the text stands alone.
 */
export function EloPortal({ offer }: { offer: Offer }) {
  const { elo } = offer;
  const withScreens = elo.screens.length > 0;
  return (
    <section
      id={offer.ids.elo}
      className="scroll-mt-28 overflow-hidden px-6 py-16 md:py-24"
    >
      <div
        className={`mx-auto grid max-w-5xl items-center gap-12 ${withScreens ? "lg:grid-cols-2" : ""}`}
      >
        <div>
          <SectionHeader
            eyebrow={elo.eyebrow}
            title={elo.title}
            lede={elo.lede}
          />
          <ul className="space-y-3">
            {elo.points.map((point) => (
              <li key={point} className="flex gap-3">
                <Check
                  size={18}
                  className="mt-0.5 shrink-0 text-accent-text"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">{elo.closing}</p>
        </div>

        {/* Three phones fanned out; the middle one in front. */}
        {withScreens && (
          <div className="relative mx-auto flex h-[460px] w-full max-w-md items-center justify-center md:h-[520px]">
            {elo.screens.map((screen, i) => {
              const position = [
                "-translate-x-[58%] -rotate-6 scale-90 opacity-70",
                "z-10",
                "translate-x-[58%] rotate-6 scale-90 opacity-70",
              ][i];
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={screen.src}
                  src={screen.src}
                  alt={screen.alt}
                  loading="lazy"
                  className={`absolute w-[44%] max-w-[210px] rounded-[1.75rem] border border-border shadow-2xl ${position}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/** What the contract promises, each with the clause it comes from. */
export function Guarantees({ offer }: { offer: Offer }) {
  const { guarantees } = offer;
  return (
    <section
      id={offer.ids.guarantees}
      className="scroll-mt-28 px-6 py-16 md:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <SectionHeader eyebrow={guarantees.eyebrow} title={guarantees.title} />
        <dl className="grid gap-x-12 gap-y-8 md:grid-cols-2">
          {guarantees.items.map((item) => (
            <div key={item.title} className="border-t border-border pt-5">
              <dt className="flex items-center gap-2 font-semibold">
                <Check
                  size={18}
                  className="shrink-0 text-accent-text"
                  aria-hidden="true"
                />
                {item.title}
              </dt>
              <dd className="mt-2 text-muted-foreground">{item.body}</dd>
              {"clause" in item && item.clause && (
                <dd className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
                  {item.clause}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
