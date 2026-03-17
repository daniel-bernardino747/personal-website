import { profile } from '@/data/profile';

export interface ChatActionResponse {
  phrase: string;
  response: string;
}

export const INITIAL_RESPONSES: Record<string, ChatActionResponse> = {
  Me: {
    phrase: "Tell me about Daniel...",
    response: `I'm ${profile.name} — a ${profile.role[0]} based in ${profile.location}. ${profile.bio}`,
  },
  Projects: {
    phrase: "What projects has he worked on?",
    response: `I've built a range of projects spanning web apps, developer tools, and UI experiments. Check out the Projects section on my homepage for a full breakdown with links and descriptions.`,
  },
  Skills: {
    phrase: "Show me his top skills.",
    response: `My core stack includes TypeScript, React, Next.js, Node.js, and Tailwind CSS. I'm also comfortable with databases (PostgreSQL, Prisma), cloud deployments, and building clean REST/GraphQL APIs.`,
  },
  Fun: {
    phrase: "What does he do for fun?",
    response: `Outside of coding I enjoy exploring new coffee shops, reading about product design, and tinkering with side projects that never quite ship. I also love a good sci-fi novel.`,
  },
  Contact: {
    phrase: "Is he available for hire?",
    response: `Best way to reach me: ${profile.social.email} — or connect on LinkedIn (${profile.social.linkedin}). I'm open to interesting roles, freelance work, and collaborations.`,
  },
};

