/**
 * How the sidebar skills are bucketed, and the rule that no skill may fall out.
 *
 * A skill in `ui.sidebar_skills` that matches NO group is silently dropped and
 * never renders. The component used to carry these regexes inline and warn on
 * the console at build time, which nobody reads. They live here so
 * scripts/check-i18n.mjs can fail the build on an orphan instead: adding a
 * skill and not seeing it is exactly the failure this repo keeps producing.
 */
export interface SkillGroup {
  title: string;
  test: RegExp;
}

/**
 * The `test` patterns are shared between both languages; only the headings are
 * translated. Keep a pattern broad enough that a reworded skill still lands
 * somewhere, and add to it when a genuinely new area appears.
 */
const GROUPS: { de: string; en: string; test: RegExp }[] = [
  {
    de: 'Quality Engineering',
    en: 'Quality Engineering',
    test: /quality|playwright|cucumber|gauge|jmeter|gatling|behave|pytest|bdd/i,
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
    test: /grafana|elastic|peppol|e-invoicing|azure|kql|monitor/i,
  },
];

export function skillGroups(lang: 'de' | 'en'): SkillGroup[] {
  return GROUPS.map((g) => ({ title: g[lang], test: g.test }));
}

/** Skills that match no group. Empty is the only acceptable result. */
export function orphanSkills(skills: string[]): string[] {
  return skills.filter((s) => !GROUPS.some((g) => g.test.test(s)));
}
