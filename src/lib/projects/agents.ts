import type { Accomplishment } from '../corpus/schema';

/**
 * The projects shown in the Agents section, in the order they appear there
 * (`.scratch/projects-and-agents/`). An agent is a project with no screen of its
 * own — an AI agent uses it, or it runs unattended — so a picture explains
 * nothing and a bespoke animation does the explaining instead.
 *
 * Membership is this list, not a Corpus field: which section shows a project,
 * and how, is presentation, and presentation belongs to the site (ADR-0013). An
 * id joins only together with its animation (`components/sections/agents/`), so
 * the section never shows an agent it cannot animate; until then the project
 * stays in the "Other projects" list.
 */
export const AGENT_IDS = ['scholia-mcp', 'permit-compliance-analysis'] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export function isAgentId(id: string): id is AgentId {
  return (AGENT_IDS as readonly string[]).includes(id);
}

/**
 * Splits the projects between the Agents section, in `AGENT_IDS` order, and
 * the rest, whose order is kept. A registered id missing from the Corpus is
 * simply not shown.
 */
export function splitAgents(projects: readonly Accomplishment[]): {
  agents: (Accomplishment & { id: AgentId })[];
  rest: Accomplishment[];
} {
  const byId = new Map(projects.map((p) => [p.id, p]));
  const agents = AGENT_IDS.flatMap((id) => {
    const project = byId.get(id);
    return project ? [{ ...project, id }] : [];
  });
  return { agents, rest: projects.filter((p) => !isAgentId(p.id)) };
}
