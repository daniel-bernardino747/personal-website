export interface StackItem {
  description: string;
  related: {
    iconImage: string;
    name: string;
  }[];
}

export const stack: StackItem[] = [
  {
    description: "Frontend Development",
    related: [
      { name: "React", iconImage: "https://cdn.simpleicons.org/react" },
      { name: "Next.js", iconImage: "https://cdn.simpleicons.org/nextdotjs" },
      { name: "TypeScript", iconImage: "https://cdn.simpleicons.org/typescript" },
      { name: "Tailwind CSS", iconImage: "https://cdn.simpleicons.org/tailwindcss" },
      { name: "Clerk", iconImage: "https://cdn.simpleicons.org/clerk" },
      { name: "Supabase", iconImage: "https://cdn.simpleicons.org/supabase" },
      { name: "Firebase", iconImage: "https://cdn.simpleicons.org/firebase" },
    ],
  },
  {
    description: "Backend & Infrastructure",
    related: [
      { name: "Node.js", iconImage: "https://cdn.simpleicons.org/nodedotjs" },
      { name: "NestJS", iconImage: "https://cdn.simpleicons.org/nestjs" },
      { name: "PostgreSQL", iconImage: "https://cdn.simpleicons.org/postgresql" },
      { name: "MongoDB", iconImage: "https://cdn.simpleicons.org/mongodb" },
      { name: "Redis", iconImage: "https://cdn.simpleicons.org/redis" },
      { name: "Prisma", iconImage: "https://cdn.simpleicons.org/prisma" },
      { name: "Docker", iconImage: "https://cdn.simpleicons.org/docker" },
      { name: "CI/CD", iconImage: "https://cdn.simpleicons.org/githubactions" },
      { name: "AWS", iconImage: "https://raw.githubusercontent.com/devicons/devicon/master/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
    ],
  },
  {
    description: "Design & Tools",
    related: [
      { name: "Figma", iconImage: "https://cdn.simpleicons.org/figma" },
      { name: "Cursor", iconImage: "https://cdn.simpleicons.org/cursor" },
      { name: "OpenAI", iconImage: "https://cdn.simpleicons.org/openai" },
      { name: "Gemini", iconImage: "https://cdn.simpleicons.org/google" },
      { name: "Claude", iconImage: "https://cdn.simpleicons.org/anthropic" },
      { name: "Git", iconImage: "https://cdn.simpleicons.org/git" },
      { name: "VS Code", iconImage: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
    ],
  },
  {
    description: "Mobile Development",
    related: [
      { name: "Flutter", iconImage: "https://cdn.simpleicons.org/flutter" },
      { name: "React Native", iconImage: "https://cdn.simpleicons.org/react" },
      { name: "Kotlin", iconImage: "https://cdn.simpleicons.org/kotlin" },
    ],
  },
];