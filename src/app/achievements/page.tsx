import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { getCorpus } from "@/lib/corpus/site";
import { KIND_LABELS } from "@/lib/corpus/schema";

export const metadata = {
  title: "Featured Accomplishments",
  description: "The accomplishments Daniel considers most significant.",
};

export default function AchievementsPage() {
  const { featured } = getCorpus();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Back to home
      </Link>

      <h1 className="text-4xl font-bold mb-4">Featured Accomplishments</h1>
      <p className="text-muted-foreground text-lg mb-16 max-w-xl">
        The work I consider most significant — the highlights, without reading
        everything.
      </p>

      {featured.length === 0 ? (
        <p className="text-muted-foreground">
          Featured accomplishments will appear here as they are captured.
        </p>
      ) : (
        <div className="space-y-16">
          {featured.map((accomplishment, index) => (
            <article
              key={accomplishment.id}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-8 items-center`}
            >
              {/* Icon block */}
              <div className="w-full md:w-2/5 shrink-0">
                <div
                  className="rounded-2xl bg-gray-100 w-full aspect-video flex items-center justify-center"
                  role="img"
                  aria-label={`${accomplishment.id} illustration`}
                >
                  <Trophy
                    size={40}
                    strokeWidth={1.5}
                    className="text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Text block */}
              <div className="flex-1">
                <p className="font-mono text-sm text-muted-foreground mb-2">
                  {accomplishment.date}
                </p>
                <h2 className="text-2xl font-bold mb-1">
                  {accomplishment.affiliation?.organisation ??
                    KIND_LABELS[accomplishment.kind]}
                </h2>
                {accomplishment.metric && (
                  <p className="text-accent font-medium text-sm mb-4">
                    {accomplishment.metric}
                  </p>
                )}
                <p className="text-muted-foreground leading-relaxed">
                  {accomplishment.statement}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
