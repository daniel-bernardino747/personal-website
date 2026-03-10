import { Github, Linkedin, Mail } from "lucide-react";
import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-sm">{profile.initials}•</span>
          <span className="text-sm text-muted">
            Built with Next.js &amp; Tailwind CSS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={profile.social.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="text-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
          >
            <Github size={18} strokeWidth={2} aria-hidden="true" />
          </a>
          <a
            href={profile.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="text-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
          >
            <Linkedin size={18} strokeWidth={2} aria-hidden="true" />
          </a>
          <a
            href={`mailto:${profile.social.email}`}
            aria-label="Send email"
            className="text-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
          >
            <Mail size={18} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
