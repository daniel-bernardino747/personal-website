import { MapPin } from "lucide-react";
import { TechBadge } from "@/components/ui/TechBadge";
import { profile } from "@/data/profile";

const techStack = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Prisma",
  "tRPC",
  "Tailwind CSS",
  "Framer Motion",
  "Docker",
  "AWS",
  "Git",
];

export function Skills() {
  return (
    <section id="skills" className="py-24 md:py-32 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-4">Skills &amp; Craft</h2>
        <p className="text-muted max-w-2xl mb-10 text-lg">
          My current toolkit — the technologies I reach for when building
          production applications.
        </p>

        <div className="flex flex-wrap gap-3 mb-12">
          {techStack.map((tech) => (
            <TechBadge key={tech} label={tech} />
          ))}
        </div>

        <div className="font-mono text-sm text-muted flex items-center gap-2">
          <MapPin size={14} strokeWidth={2} aria-hidden="true" />
          <span>{profile.location}</span>
        </div>
      </div>
    </section>
  );
}
