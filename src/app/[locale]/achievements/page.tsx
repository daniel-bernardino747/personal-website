import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { getCorpus, getIdentity } from "@/lib/corpus/site";
import { parseStatement } from "@/lib/corpus/statement";
import { pageMetadata } from "@/lib/site-url";
import { getDictionary } from "@/i18n/dictionary";
import { isLocale, localeHref } from "@/i18n/routing";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params) {
  const { locale: param } = await params;
  const locale = isLocale(param) ? param : "pt";
  const t = getDictionary(locale);
  const owner = getIdentity().name;
  return pageMetadata({
    title: t.achievements.metaTitle,
    description: t.achievements.metaDescription,
    path: "/achievements",
    owner,
    imageAlt: t.meta.imageAlt(owner),
    locale,
  });
}

export default async function AchievementsPage({ params }: Params) {
  const { locale: param } = await params;
  const locale = isLocale(param) ? param : "pt";
  const t = getDictionary(locale);
  const home = localeHref(locale, "/");
  const { featured } = getCorpus(locale);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link
        href={home}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        {t.achievements.back}
      </Link>

      <h1 className="text-4xl font-bold mb-4">{t.achievements.title}</h1>
      <p className="text-muted-foreground text-lg mb-16 max-w-xl">
        {t.achievements.lede}
      </p>

      {featured.length === 0 ? (
        <p className="text-muted-foreground">
          {t.achievements.empty}
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
                  aria-label={t.achievements.illustration(accomplishment.id)}
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
                    t.kinds[accomplishment.kind]}
                </h2>
                {accomplishment.metric && (
                  <p className="text-accent font-medium text-sm mb-4">
                    {accomplishment.metric}
                  </p>
                )}
                {(() => {
                  // The prose, then the stack and links the statement closes
                  // with, as on the project cards. Rendered whole, the English
                  // "Built with … Live: …" tail would follow the Portuguese prose.
                  const { prose, tech, liveUrl, repoUrl } = parseStatement(accomplishment.statement);
                  return (
                    <>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{prose}</p>
                      {tech.length > 0 && (
                        <p className="mt-4 font-mono text-xs text-muted-foreground">{tech.join(" · ")}</p>
                      )}
                      {(liveUrl || repoUrl) && (
                        <p className="mt-2 flex gap-4 text-sm">
                          {liveUrl && (
                            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              {t.projects.live}
                            </a>
                          )}
                          {repoUrl && (
                            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              {t.projects.source}
                            </a>
                          )}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
