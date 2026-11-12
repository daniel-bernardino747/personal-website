/**
 * The stack shown on the "Craft" card. Every icon is a local SVG in
 * `public/stack/`, drawn as a silhouette in the text colour (see BentoCraft), so
 * they read as one set in both themes and no third-party CDN is hit at runtime.
 * Sources, all open licences (see `public/stack/LICENSES.md`): Simple Icons
 * (CC0), except AWS and VS Code from devicon (MIT) and OpenAI from LobeHub
 * icons (MIT), which Simple Icons no longer carries.
 */
export interface StackItem {
  description: string;
  related: {
    /** A same-origin SVG under /stack/, used as a mask. */
    iconImage: string;
    name: string;
  }[];
}

export const stack: StackItem[] = [
  {
    description: "Frontend Development",
    related: [
      { name: "React", iconImage: "/stack/react.svg" },
      { name: "Next.js", iconImage: "/stack/nextdotjs.svg" },
      { name: "TypeScript", iconImage: "/stack/typescript.svg" },
      { name: "Tailwind CSS", iconImage: "/stack/tailwindcss.svg" },
      { name: "Clerk", iconImage: "/stack/clerk.svg" },
      { name: "Supabase", iconImage: "/stack/supabase.svg" },
      { name: "Firebase", iconImage: "/stack/firebase.svg" },
    ],
  },
  {
    description: "Backend & Infrastructure",
    related: [
      { name: "Node.js", iconImage: "/stack/nodedotjs.svg" },
      { name: "NestJS", iconImage: "/stack/nestjs.svg" },
      { name: "PostgreSQL", iconImage: "/stack/postgresql.svg" },
      { name: "MongoDB", iconImage: "/stack/mongodb.svg" },
      { name: "Redis", iconImage: "/stack/redis.svg" },
      { name: "Prisma", iconImage: "/stack/prisma.svg" },
      { name: "Docker", iconImage: "/stack/docker.svg" },
      { name: "CI/CD", iconImage: "/stack/githubactions.svg" },
      { name: "AWS", iconImage: "/stack/amazonwebservices.svg" },
    ],
  },
  {
    description: "Design & Tools",
    related: [
      { name: "Figma", iconImage: "/stack/figma.svg" },
      { name: "Cursor", iconImage: "/stack/cursor.svg" },
      { name: "OpenAI", iconImage: "/stack/openai.svg" },
      { name: "Gemini", iconImage: "/stack/googlegemini.svg" },
      { name: "Claude", iconImage: "/stack/claude.svg" },
      { name: "Git", iconImage: "/stack/git.svg" },
      { name: "VS Code", iconImage: "/stack/vscode.svg" },
    ],
  },
  {
    description: "Mobile Development",
    related: [
      { name: "Flutter", iconImage: "/stack/flutter.svg" },
      { name: "React Native", iconImage: "/stack/react.svg" },
      { name: "Kotlin", iconImage: "/stack/kotlin.svg" },
    ],
  },
];