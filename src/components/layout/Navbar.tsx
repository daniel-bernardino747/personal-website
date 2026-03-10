import Link from "next/link";
import { profile } from "@/data/profile";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "Achievements", href: "/achievements" },
  { label: "Guestbook", href: "/guestbook" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-sm">
      <nav
        className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="font-mono text-lg font-bold tracking-tight hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
          aria-label={`${profile.name} — home`}
        >
          {profile.initials}•
        </Link>

        <ul className="hidden md:flex items-center gap-6" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm text-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <a href={profile.bookingUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm">Book a Call</Button>
        </a>
      </nav>
    </header>
  );
}
