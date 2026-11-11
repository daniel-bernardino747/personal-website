import localFont from "next/font/local";

import { getDictionary } from "@/i18n/dictionary";
import { INTL_LOCALE, type Locale } from "@/i18n/routing";
import type { Accomplishment } from "@/lib/corpus/schema";
import { displayTitle, parseStatement } from "@/lib/corpus/statement";
import { LABS_ORIGIN } from "@/lib/projects/labs";

import s from "./labs.module.css";
import { type LabsDemo, LabsSlider } from "./LabsSlider";

const signage = localFont({
  src: [
    { path: "./fonts/overpass-latin-400-normal.woff", weight: "400" },
    { path: "./fonts/overpass-latin-700-normal.woff", weight: "700" },
    { path: "./fonts/overpass-latin-900-normal.woff", weight: "900" },
  ],
  variable: "--font-signage",
});

const flap = localFont({
  src: "./fonts/overpass-mono-latin-700-normal.woff",
  weight: "700",
  variable: "--font-flap",
});

/**
 * "2026-09" → "SEP 2026" (or "SET 2026" in Portuguese); a date recorded as a year
 * alone stays a year. The month is the page language's own short name, in the
 * board's capitals and without the abbreviation's dot.
 */
function boardMonth(date: string, locale: Locale): string {
  const [year, month] = date.split("-");
  const m = Number(month);
  if (!(m >= 1 && m <= 12)) return year;
  const name = new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: "short", timeZone: "UTC" })
    .format(new Date(Date.UTC(2000, m - 1, 1)))
    .replace(".", "")
    .toUpperCase();
  return `${name} ${year}`;
}

/**
 * The Labs section: a deliberate break in the page, where Labs' own world (the
 * departure hall of labs.teamdbsolutions.com, see prospect-me's labs/DESIGN.md)
 * takes over between a yellow edge and a yellow exit. It holds the projects whose
 * Live link is a Labs demo, which the Projects gallery leaves out.
 */
export function Labs({ demos, locale }: { demos: Accomplishment[]; locale: Locale }) {
  const t = getDictionary(locale);
  const board: LabsDemo[] = demos.flatMap((demo) => {
    const { prose, liveUrl } = parseStatement(demo.statement);
    const title = displayTitle(demo);
    if (!liveUrl || !title) return [];
    return [{ id: demo.id, title, when: boardMonth(demo.date, locale), prose, href: liveUrl, image: demo.image }];
  });
  if (board.length === 0) return null;

  return (
    <section id="labs" aria-labelledby="labs-title" className={`${s.hall} ${signage.variable} ${flap.variable}`}>
      <div className={s.inner}>
        <header className={s.header}>
          <h2 id="labs-title" className={s.title}>
            {t.labs.title}
          </h2>
          <p className={s.lede}>
            {t.labs.lede}
          </p>
        </header>

        <LabsSlider demos={board} />
      </div>

      <a href={LABS_ORIGIN} className={s.exit}>
        <span className={s.exitSign}>
          <svg viewBox="0 0 48 32" aria-hidden="true">
            <path d="M2 16h40M30 4l12 12-12 12" fill="none" stroke="currentColor" strokeWidth="5" />
          </svg>
          <span>
            <span className={s.exitHost}>labs.teamdbsolutions.com</span>
            <span className={s.exitLabel}>{t.labs.exitLabel}</span>
          </span>
        </span>
      </a>
    </section>
  );
}
