export interface Achievement {
  title: string;
  subtitle: string;
  description: string;
  date: string;
  imageUrl?: string;
}

export const achievements: Achievement[] = [
  {
    title: "Open Source Contributor of the Month",
    subtitle: "GitHub",
    description:
      "Recognized for significant contributions to the Next.js ecosystem, including a widely-adopted middleware pattern and several bug fixes merged into the core.",
    date: "January 2025",
  },
  {
    title: "Speaker — React Summit 2024",
    subtitle: "Amsterdam, Netherlands",
    description:
      "Delivered a talk on \"Server Components at Scale\" to an audience of 800+ developers, covering architectural patterns and production lessons learned.",
    date: "June 2024",
  },
  {
    title: "1st Place — Hackathon XYZ",
    subtitle: "Startup Weekend",
    description:
      "Led a team of four to build and ship a working MVP in 48 hours. The project was later developed into a Y Combinator application.",
    date: "March 2024",
  },
  {
    title: "Top 1% on Stack Overflow",
    subtitle: "Stack Overflow",
    description:
      "Reached top 1% overall reputation through consistent, high-quality answers in the React, TypeScript, and Next.js tags.",
    date: "2023",
  },
  {
    title: "Published Author",
    subtitle: "Dev.to / personal blog",
    description:
      "Published a 10-part series on TypeScript advanced patterns that accumulated 50k+ views and was featured in the TypeScript Weekly newsletter.",
    date: "2023",
  },
];
