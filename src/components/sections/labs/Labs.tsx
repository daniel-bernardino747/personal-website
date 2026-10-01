import localFont from "next/font/local";

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

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** "2026-09" → "SEP 2026"; a date recorded as a year alone stays a year. */
function boardMonth(date: string): string {
  const [year, month] = date.split("-");
  const m = Number(month);
  return m >= 1 && m <= 12 ? `${MONTHS[m - 1]} ${year}` : year;
}

/**
 * The Labs section: a deliberate break in the page, where Labs' own world (the
 * departure hall of labs.teamdbsolutions.com, see prospect-me's labs/DESIGN.md)
 * takes over between a yellow edge and a yellow exit. It holds the projects whose
 * Live link is a Labs demo, which the Projects gallery leaves out.
 */
export function Labs({ demos }: { demos: Accomplishment[] }) {
  const board: LabsDemo[] = demos.flatMap((demo) => {
    const { prose, liveUrl } = parseStatement(demo.statement);
    const title = displayTitle(demo);
    if (!liveUrl || !title) return [];
    return [{ id: demo.id, title, when: boardMonth(demo.date), prose, href: liveUrl, image: demo.image }];
  });
  if (board.length === 0) return null;

  return (
    <section id="labs" aria-labelledby="labs-title" className={`${s.hall} ${signage.variable} ${flap.variable}`}>
      <div className={s.inner}>
        <header className={s.header}>
          <h2 id="labs-title" className={s.title}>
            Labs
          </h2>
          <p className={s.lede}>
            Where I build small, working demos on public data. Each one answers a single concrete question and cites
            every source it uses. They are concepts, not products for any company.
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
            <span className={s.exitLabel}>Every demo, with its sources and method</span>
          </span>
        </span>
      </a>
    </section>
  );
}
