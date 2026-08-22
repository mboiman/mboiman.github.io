/**
 * How the sidebar skills are bucketed, and the rule that no skill may fall out.
 *
 * Two renderers read `ui.sidebar_skills`, and they disagree about grouping:
 * the CV page renders the groups below, scripts/html_to_pdf.js renders the same
 * list FLAT, as one row of chips with no headings at all. So a skill matching
 * no pattern is not invisible, it is inconsistent: present in the PDF, absent
 * from the page. The build used to fail on it with the message "would render
 * nowhere", which was simply untrue and blocked entries such as Terraform,
 * Kibana, SQL or ISTQB that no pattern was ever written for.
 *
 * The last group is a catch-all, so every skill lands somewhere by
 * construction. scripts/check-i18n.mjs reports what fell into it as a notice
 * rather than an error: a growing catch-all is a hint that a new area deserves
 * its own heading, not a reason to break the build.
 */
export interface SkillGroup {
  title: string;
  items: string[];
}

/**
 * The `test` patterns are shared between both languages; only the headings are
 * translated. Keep a pattern broad enough that a reworded skill still lands
 * somewhere, and add to it when a genuinely new area appears.
 *
 * Order matters: the FIRST matching pattern wins, so a skill never renders
 * twice. Before that rule existed, each group filtered the full list on its
 * own, and "Azure Kubernetes Service (AKS)" rendered under both Platform and
 * Delivery.
 *
 * The catch-all MUST stay last.
 */
const GROUPS: { de: string; en: string; test: RegExp }[] = [
  {
    de: 'Quality Engineering',
    en: 'Quality Engineering',
    test: /quality|playwright|cucumber|gauge|jmeter|gatling|behave|pytest|bdd|spezifikation|verifikation|specification|verification/i,
  },
  {
    de: 'KI & Agenten',
    en: 'AI & Agents',
    test: /llm|claude|gemini|gpt|copilot|mcp|a2a|adk|langchain|agent/i,
  },
  {
    de: 'Delivery & Automation',
    en: 'Delivery & Automation',
    test: /ci\/cd|docker|kubernetes|python|rest|agile|scrum|kanban|fastapi|typescript|json-rpc/i,
  },
  {
    de: 'Plattform & Monitoring',
    en: 'Platform & Monitoring',
    test: /grafana|elastic|kibana|opentelemetry|otlp|peppol|e-invoicing|azure|kql|monitor|cloudflare|microsoft 365|m365|exchange/i,
  },
  {
    de: 'Weiteres',
    en: 'More',
    test: /.*/,
  },
];

/** Index of the catch-all group. It is the last entry, by contract. */
const CATCH_ALL = GROUPS.length - 1;

/** The groups a skill matches, catch-all excluded. */
function matchingGroups(skill: string): number[] {
  const hits: number[] = [];
  for (let i = 0; i < CATCH_ALL; i += 1) {
    if (GROUPS[i].test.test(skill)) hits.push(i);
  }
  return hits;
}

/**
 * The sidebar buckets, in group order, with every skill in exactly one of them.
 * Empty groups are dropped so an unused heading never renders.
 */
export function groupedSkills(skills: string[], lang: 'de' | 'en'): SkillGroup[] {
  const buckets = GROUPS.map((g) => ({ title: g[lang], items: [] as string[] }));
  for (const skill of skills) {
    const [first] = matchingGroups(skill);
    buckets[first ?? CATCH_ALL].items.push(skill);
  }
  return buckets.filter((b) => b.items.length > 0);
}

/**
 * Skills that fall into the catch-all group. Not an error (they render, under
 * the catch-all heading on the page and flat in the PDF), but worth naming in
 * the build log: a long list here means a heading is missing.
 */
export function catchAllSkills(skills: string[]): string[] {
  return skills.filter((s) => matchingGroups(s).length === 0);
}

/**
 * Skills matching more than one real pattern. Only the first one wins, so the
 * skill renders under a heading that may not be the intended one. Reported as
 * a notice; `groups` carries the English headings, because the build log is
 * one log for both branches.
 */
export function multiGroupSkills(skills: string[]): { skill: string; groups: string[] }[] {
  return skills
    .map((skill) => ({ skill, groups: matchingGroups(skill).map((i) => GROUPS[i].en) }))
    .filter((hit) => hit.groups.length > 1);
}
