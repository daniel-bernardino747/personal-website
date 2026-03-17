'use client';

import { AvatarVideo } from '@/components/AvatarVideo';
import { Button } from '@/components/ui/Button';
import { profile } from '@/data/profile';
import { ArrowLeft, Calendar, Github, Linkedin, Mail } from 'lucide-react';
import Link from 'next/link';

export function ChatHeader() {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mr-2"
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </Link>
        
        <AvatarVideo
          containerClassName="shrink-0"
          className="w-10 h-10 rounded-full object-cover border border-accent/20"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{profile.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs text-emerald-400">Online</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border-r border-border pr-3">
            <a
              href={profile.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <a
              href={profile.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              href={`mailto:${profile.social.email}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>

          <a href={profile.bookingUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              className="rounded-full bg-accent text-white border border-accent/20 hover:bg-accent/80 flex gap-2 items-center shadow-lg shadow-accent/20 transition-all active:scale-95 text-xs h-8"
            >
              <Calendar size={14} />
              <span className="hidden sm:inline">Book a Call</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
