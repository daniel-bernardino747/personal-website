export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
}

export const projects: Project[] = [
  {
    id: "01",
    title: "Project Alpha",
    description:
      "A full-stack SaaS platform for teams to collaborate in real time. Built with a focus on performance and developer ergonomics.",
    techStack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind"],
    githubUrl: "https://github.com/yourname/project-alpha",
    liveUrl: "https://project-alpha.vercel.app",
  },
  {
    id: "02",
    title: "DevTool CLI",
    description:
      "A command-line toolkit that automates repetitive development workflows. Reduced setup time for new projects by 80%.",
    techStack: ["Node.js", "TypeScript", "Commander.js", "Ink"],
    githubUrl: "https://github.com/yourname/devtool-cli",
  },
  {
    id: "03",
    title: "UI Component Library",
    description:
      "A themeable, accessible React component library with 40+ components. Published to npm with full Storybook documentation.",
    techStack: ["React", "TypeScript", "Storybook", "Radix UI", "Tailwind"],
    githubUrl: "https://github.com/yourname/ui-lib",
    liveUrl: "https://ui-lib.vercel.app",
  },
  {
    id: "04",
    title: "Analytics Dashboard",
    description:
      "A real-time analytics dashboard with customizable widgets, CSV export, and role-based access control.",
    techStack: ["Next.js", "Recharts", "Zustand", "tRPC", "PlanetScale"],
    githubUrl: "https://github.com/yourname/analytics-dashboard",
  },
];
