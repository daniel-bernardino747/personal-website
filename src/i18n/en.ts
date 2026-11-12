import type { Kind } from '@/lib/corpus/schema';

/**
 * The interface text in English: everything a visitor reads or a screen reader
 * announces that is not Corpus data (ADR-0015). This object defines the shape;
 * `pt.ts` is typed against it, so a key missing in Portuguese is a type error.
 *
 * `**…**` marks the words a sentence sets in bold (see `Emphasized`). Text that
 * interpolates is a function.
 */
export const en = {
  skipLink: 'Skip to main content',

  nav: {
    ariaLabel: 'Main navigation',
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    labs: 'Labs',
    achievements: 'Achievements',
    chat: 'Chat',
    /** Portuguese-only links (the local offer); English never shows them. */
    services: 'Services',
    process: 'How it works',
    contact: 'Contact',
    booking: 'Get it off the ground',
  },

  footer: {
    builtWith: 'Built with Next.js & Tailwind CSS',
    github: 'GitHub profile',
    linkedin: 'LinkedIn profile',
    resume: 'Résumé (PDF)',
    email: 'Send email',
  },

  hero: {
    greeting: "Hi, I'm",
    scroll: 'Scroll',
  },

  /** The suggested questions: chips on the home page and in `/chat`, and the
   * phrases the home input types out. Keyed by the chat answer's `id`. */
  questions: {
    me: { label: 'Me', phrase: 'Tell me about Daniel...' },
    projects: { label: 'Projects', phrase: 'What has he actually shipped?' },
    skills: { label: 'Skills', phrase: 'What does he work with?' },
    site: { label: 'This site', phrase: 'How was this site built?' },
    contact: { label: 'Contact', phrase: 'Is he available for hire?' },
  },

  aiInput: {
    /** Sent when the visitor submits an empty box. */
    emptyQuestion: 'Hi',
  },

  bento: {
    connect: "Let's Connect",
    connectAria: (name: string) => `Connect with ${name} on LinkedIn (opens in a new tab)`,
    craftTitle: 'Craft',
    craftLead: 'Building scalable **apps, websites, and automations.**',
    craftBody:
      'I understand what advantages modern tech can provide, helping me advise on the solutions a business actually needs.',
    openToCollaboration: 'Open to collaboration',
    fullResume: 'Full résumé',
    /** The end of a period still running: "2025–now". */
    now: 'now',
    mindsetTitle: 'Mindset',
    mindsetLead:
      '**Building more than software.** My passions provide the **discipline and focus** I need to grow.',
    mindsetCaption: 'Focus & Discipline',
    mindsetClose: 'Mastering body and mind is my path to **excellence.**',
    letsTalk: "Let's talk",
  },

  projects: {
    eyebrow: 'Selected work',
    title: 'Projects',
    lede: "Things I've built — side projects, open source contributions, and professional work.",
    all: 'All',
    filterAria: 'Filter projects by year',
    empty: 'Projects are being written up — check back soon.',
    shown: (count: number) => `${count} project${count === 1 ? '' : 's'} shown`,
    live: 'Live',
    source: 'Source',
    featured: 'Featured',
    thisSite: "You're looking at it",
    thisSiteNote:
      "This is the site you're browsing right now — the source below is what builds this page.",
    readMore: 'Read more',
    showLess: 'Show less',
    /** Read after "Read more" by a screen reader only, with a leading space. */
    about: (title: string) => ` about ${title}`,
    visit: (title?: string) => `Visit ${title ?? 'the live site'}`,
    onGitHub: (title?: string) => (title ? `${title} on GitHub` : 'Source on GitHub'),
    /** The curved gallery (a carousel, to assistive tech). */
    carousel: 'Projects, one at a time',
    slide: (index: number, total: number, title: string) => `Project ${index} of ${total}: ${title}`,
    previous: 'Previous project',
    next: 'Next project',
    pause: 'Pause the rotation',
    play: 'Resume the rotation',
    open: (title: string) => `Open ${title}`,
    close: 'Close',
  },

  labs: {
    title: 'Labs',
    lede: 'Where I build small, working demos on public data. Each one answers a single concrete question and cites every source it uses. They are concepts, not products for any company.',
    exitLabel: 'Every demo, with its sources and method',
    departures: 'Departures',
    position: (index: number, total: number, title: string) => `Demo ${index} of ${total}: ${title}`,
    previous: 'Previous demo',
    next: 'Next demo',
    listAria: 'Labs demos',
    shipped: 'Shipped',
    open: 'Open demo',
  },

  chat: {
    metaTitle: 'Ask about his work',
    metaDescription: (name: string) =>
      `Ask anything about ${name}'s work. Every answer comes from his recorded projects and results — nothing invented.`,
    home: 'Home',
    online: 'Online',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    email: 'Email',
    clearConfirm: 'Clear chat history?',
    clearTitle: 'Clear History (Debug)',
    empty: 'Ask me anything using the buttons below or type a message.',
    placeholder: 'Ask me anything...',
    error: 'Something went wrong, and I would rather say so than guess.',
    emptyReply: 'I came back with nothing to say, which is a bug.',
    unreachable: 'I could not reach the server just now. Worth trying again in a moment.',
  },

  achievements: {
    metaTitle: 'Featured Accomplishments',
    metaDescription: 'The accomplishments Daniel considers most significant.',
    back: 'Back to home',
    title: 'Featured Accomplishments',
    lede: 'The work I consider most significant — the highlights, without reading everything.',
    empty: 'Featured accomplishments will appear here as they are captured.',
    illustration: (id: string) => `${id} illustration`,
  },

  /** The label an Accomplishment's Kind shows when it has no Affiliation. */
  kinds: {
    engineering: 'Engineering',
    talk: 'Talk',
    'open-source': 'Open Source',
    project: 'Project',
    education: 'Education',
    writing: 'Writing',
  } satisfies Record<Kind, string>,

  guestbook: {
    back: 'Back to home',
    title: 'Guestbook',
    lede: 'Leave a note — say hello, share feedback, or just drop a wave.',
    name: 'Name',
    message: 'Message',
    sending: 'Sending…',
    submit: 'Sign the guestbook',
    done: 'Thanks for signing! Your message was received.',
    error: 'Something went wrong. Please try again.',
  },

  meta: {
    /** The share image's alt text on pages below the root. */
    imageAlt: (owner: string) => `${owner} — portfolio`,
  },
} as const;

/** Every string widened, so a translation may say something else. */
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Widen<R>
    : T extends object
      ? { readonly [K in keyof T]: Widen<T[K]> }
      : T;

export type Dictionary = Widen<typeof en>;
