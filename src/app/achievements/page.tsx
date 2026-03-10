import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Trophy } from "lucide-react";
import { achievements } from "@/data/achievements";

export const metadata = {
  title: "Achievements",
  description: "A track record of milestones, recognition, and notable work.",
};

export default function AchievementsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Back to home
      </Link>

      <h1 className="text-4xl font-bold mb-4">Achievements</h1>
      <p className="text-muted text-lg mb-16 max-w-xl">
        A track record of milestones, recognition, and work I&apos;m proud of.
      </p>

      <div className="space-y-16">
        {achievements.map((achievement, index) => (
          <article
            key={achievement.title}
            className={`flex flex-col ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            } gap-8 items-center`}
          >
            {/* Image / icon block */}
            <div className="w-full md:w-2/5 shrink-0">
              {achievement.imageUrl ? (
                <Image
                  src={achievement.imageUrl}
                  alt={achievement.title}
                  width={480}
                  height={320}
                  className="rounded-2xl object-cover w-full aspect-video"
                />
              ) : (
                <div
                  className="rounded-2xl bg-gray-100 w-full aspect-video flex items-center justify-center"
                  role="img"
                  aria-label={`${achievement.title} image placeholder`}
                >
                  <Trophy
                    size={40}
                    strokeWidth={1.5}
                    className="text-muted"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>

            {/* Text block */}
            <div className="flex-1">
              <p className="font-mono text-sm text-muted mb-2">
                {achievement.date}
              </p>
              <h2 className="text-2xl font-bold mb-1">{achievement.title}</h2>
              <p className="text-accent font-medium text-sm mb-4">
                {achievement.subtitle}
              </p>
              <p className="text-muted leading-relaxed">
                {achievement.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
