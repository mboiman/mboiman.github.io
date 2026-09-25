/**
 * The career graph behind the future view (src/components/CVFuture.astro).
 *
 * Three rows in one picture. On top the stations as bars on a time axis, with
 * the talks as marks on the axis itself. In the middle the competencies. At the
 * bottom the projects. A line joins a competency to every station and project
 * whose text names it, so the picture answers "where did he use X" by looking.
 *
 * Everything is computed at build time into plain coordinates and SVG paths:
 * the browser only highlights and opens, it never lays anything out. Pure and
 * free of Astro imports, so test/graph.test.mjs can run it under node.
 *
 * The competency nodes are a curated list (SKILLS below), not the sidebar
 * skills, because the sidebar spells them for reading ("Behave / pytest (BDD)")
 * and the tech stacks spell the same thing five ways ("A2A", "A2A Protocol
 * 1.0", "a2a-sdk"). Each node names the patterns it matches. A line is drawn
 * only where a pattern is found in that entry's own text, and a node that joins
 * fewer than two entries is dropped rather than drawn alone.
 */

export type Lang = 'de' | 'en';

export interface GraphInput {
  lang: Lang;
  /** Build time as a fractional year, e.g. 2026.73. Where a running bar ends. */
  now: number;
  stations: { anchor?: string; position: string; company: string; dates: string; details: string }[];
  talks: { anchor?: string; position: string; company: string; dates: string }[];
  projects: { anchor?: string; title: string; category: string; tech_stack?: string[]; tagline: string }[];
}

export interface Bar { id: string; anchor: string; x1: number; x2: number; y: number; label: string; labelX: number; labelAnchor: 'start' | 'end'; running: boolean }
export interface Mark { id: string; anchor: string; x: number; y: number; label: string }
export interface Pill { id: string; key: string; x: number; y: number; w: number; label: string }
export interface Dot { id: string; anchor: string; x: number; y: number; lines: string[] }
export interface Edge { from: string; to: string; d: string }
export interface Tick { x: number; label: string }

export interface CareerGraph {
  width: number;
  height: number;
  axisY: number;
  ticks: Tick[];
  today: number;
  bars: Bar[];
  talks: Mark[];
  skills: Pill[];
  projects: Dot[];
  edges: Edge[];
  /** Node id to the ids it is joined to, both directions. */
  neighbours: Record<string, string[]>;
}

/** The competency nodes. `match` is tested case-insensitively. */
export const SKILLS: { key: string; label: Record<Lang, string>; match: RegExp }[] = [
  { key: 'load', label: { de: 'Last- und Performancetests', en: 'Load and performance testing' }, match: /jmeter|gatling|loadrunner|lasttest|load ?test|performance[- ]?test/i },
  { key: 'java', label: { de: 'Java', en: 'Java' }, match: /\bjava\b(?!script)/i },
  { key: 'mobile', label: { de: 'iOS und Mobile', en: 'iOS and mobile' }, match: /\bios\b|\bswift\b|objective-c/i },
  { key: 'bdd', label: { de: 'BDD, pytest, Cucumber', en: 'BDD, pytest, Cucumber' }, match: /\bbdd\b|pytest|behave|cucumber|gherkin/i },
  { key: 'playwright', label: { de: 'Playwright', en: 'Playwright' }, match: /playwright/i },
  { key: 'python', label: { de: 'Python', en: 'Python' }, match: /\bpython\b/i },
  { key: 'typescript', label: { de: 'TypeScript', en: 'TypeScript' }, match: /typescript/i },
  { key: 'cicd', label: { de: 'CI/CD', en: 'CI/CD' }, match: /ci\/cd|github actions|jenkins|azure devops/i },
  { key: 'container', label: { de: 'Docker', en: 'Docker' }, match: /docker|kubernetes/i },
  { key: 'observability', label: { de: 'Monitoring', en: 'Monitoring' }, match: /grafana|kibana|elasticsearch|opentelemetry|otlp|azure monitor|dynatrace/i },
  { key: 'azure', label: { de: 'Azure', en: 'Azure' }, match: /\bazure\b/i },
  { key: 'einvoicing', label: { de: 'E-Invoicing, Peppol', en: 'E-invoicing, Peppol' }, match: /peppol|en ?16931|zugferd|x-?rechnung|e-invoic|e-rechnung/i },
  { key: 'llm', label: { de: 'LLMs', en: 'LLMs' }, match: /\bllms?\b|openai|\bgpt|\bclaude\b|gemini|langchain/i },
  { key: 'agents', label: { de: 'Agenten, MCP, A2A', en: 'Agents, MCP, A2A' }, match: /\bmcp\b|\ba2a\b|agent cards?|multi-agent|agenten-netz/i },
];

// ── Geometry, in viewBox units ─────────────────────────────────────────────
// Close to the shape of the room the graph gets beside the panel on a laptop
// (about 1.45 to 1): a wider box was scaled down to fit its width and set the
// labels at eight pixels.
const W = 1240;
const H = 750;
const PAD_X = 40;
const AXIS_Y = 46;
const LANE_Y0 = 92;
const LANE_H = 42;
/** Two staggered rows each for competencies and projects, so labels get twice the room. */
const SKILL_Y = [392, 440];
const PILL_H = 26;
const PROJECT_Y = [590, 668];
const CHAR_W = 8.1;          // average advance of IBM Plex Sans at 15 units
const SKILL_CHAR_W = 7.5;    // at 14 units

/** "seit 06/2025", "09/2025-09/2026", "2023", "04/2026" to fractional years. */
export function dateRange(dates: string, now: number): { start: number; end: number; running: boolean } {
  const raw = String(dates || '');
  const running = /^\s*(?:seit|since|ab|from)\b/i.test(raw);
  const months = [...raw.matchAll(/(\d{1,2})\s*\/\s*(\d{4})/g)].map(m => Number(m[2]) + (Number(m[1]) - 1) / 12);
  if (months.length) {
    const start = months[0];
    const end = running ? now : months.length > 1 ? months[1] + 1 / 12 : start + 1 / 12;
    return { start, end, running };
  }
  const year = Number(raw.match(/\d{4}/)?.[0] ?? NaN);
  if (!Number.isFinite(year)) return { start: now, end: now, running };
  return { start: year, end: running ? now : year + 1, running };
}

/** First part of a title: before ":" or " · ", which carry the subtitle. */
function shortTitle(title: string): string {
  return title.split(/:\s| · /)[0].trim();
}

/** Word wrap into at most two lines of `max` characters, with an ellipsis. */
function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= max) { line = next; continue; }
    if (line) lines.push(line);
    line = word;
    if (lines.length === 2) break;
  }
  if (line && lines.length < 2) lines.push(line);
  if (lines.length === 2 && text.length > lines.join(' ').length) lines[1] = `${lines[1].replace(/\s*\S{0,3}$/, '')}…`;
  return lines.map(l => (l.length > max ? `${l.slice(0, max - 1)}…` : l));
}

/**
 * Put items with a wanted x on one row without overlap, as close to their wish
 * as the room allows: sorted, pushed right where they collide, then the whole
 * row shifted back inside the frame.
 */
function spread<T extends { want: number; w: number }>(items: T[], gap: number, lo: number, hi: number): (T & { x: number })[] {
  const sorted = [...items].sort((a, b) => a.want - b.want);
  const placed: (T & { x: number })[] = [];
  let right = -Infinity;
  for (const it of sorted) {
    const x = Math.max(it.want, right + gap + it.w / 2);
    placed.push({ ...it, x });
    right = x + it.w / 2;
  }
  // Backward pass: nothing past the right edge, nothing into its right
  // neighbour. Then, if the row now starts left of the frame, shift it back
  // (which only overflows again when the row is wider than the frame).
  for (let i = placed.length - 1; i >= 0; i -= 1) {
    const limit = i === placed.length - 1 ? hi : placed[i + 1].x - placed[i + 1].w / 2 - gap;
    placed[i].x = Math.min(placed[i].x, limit - placed[i].w / 2);
  }
  if (placed.length && placed[0].x - placed[0].w / 2 < lo) {
    const shift = lo - (placed[0].x - placed[0].w / 2);
    placed.forEach(p => { p.x += shift; });
  }
  return placed;
}

const round = (n: number) => Math.round(n * 10) / 10;
const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const my = (y1 + y2) / 2;
  return `M${round(x1)} ${round(y1)} C${round(x1)} ${round(my)} ${round(x2)} ${round(my)} ${round(x2)} ${round(y2)}`;
};

export function buildCareerGraph(input: GraphInput): CareerGraph {
  const { lang, now, stations, talks, projects } = input;

  // ── Time axis ────────────────────────────────────────────────────────────
  const ranges = stations.map(s => dateRange(s.dates, now));
  const first = Math.floor(Math.min(...ranges.map(r => r.start), ...talks.map(t => dateRange(t.dates, now).start)));
  const last = Math.max(now, ...ranges.map(r => r.end));
  const xOf = (year: number) => PAD_X + ((year - first) / (last - first)) * (W - 2 * PAD_X);
  const ticks: Tick[] = [];
  for (let y = first; y <= Math.floor(last); y += 2) ticks.push({ x: round(xOf(y)), label: String(y) });

  // ── Station bars: newest first into the lowest free lane ─────────────────
  // A lane is taken over the bar AND its label, so a short bar with a long
  // company name cannot run into its neighbour.
  // The company as the reader knows it: "BKS im Auftrag eines Verlags" is
  // "BKS", a list of clients is its first name plus a count. Where two bars
  // would then read the same, the first words of the role tell them apart.
  const companyOf = (c: string) => {
    const clients = c.split(' · ')[0].split(',').map(x => x.trim()).filter(Boolean);
    const first = clients[0].split(/\s+(?:im Auftrag|for|on behalf)\b/i)[0].trim();
    return clients.length > 1 ? `${first} +${clients.length - 1}` : first;
  };
  const roleOf = (p: string) => p.split(/\s+(?:&|·|\()\s*|,\s/)[0].trim();
  const counts = new Map<string, number>();
  stations.forEach(s => counts.set(companyOf(s.company), (counts.get(companyOf(s.company)) || 0) + 1));

  const lanes: number[][] = [];
  const order = stations.map((s, i) => ({ s, r: ranges[i] })).sort((a, b) => b.r.start - a.r.start);
  const bars: Bar[] = order.map(({ s, r }) => {
    const x1 = xOf(r.start);
    const x2 = Math.max(xOf(r.end), x1 + 6);
    const company = companyOf(s.company);
    const label = (counts.get(company) || 0) > 1 ? `${company} · ${roleOf(s.position)}` : company;
    const textW = label.length * CHAR_W;
    // A label that would run past the right edge is set right-aligned, ending
    // where its bar ends, and takes its room to the left instead.
    const anchorEnd = x1 + textW > W - PAD_X / 2;
    const from = anchorEnd ? Math.min(x1, x2 - textW) : x1;
    const to = (anchorEnd ? x2 : Math.max(x2, x1 + textW)) + 14;
    let lane = lanes.findIndex(taken => !taken.some((v, i) => i % 2 === 0 && from < taken[i + 1] && to > v));
    if (lane < 0) { lanes.push([]); lane = lanes.length - 1; }
    lanes[lane].push(from, to);
    return {
      id: `s:${s.anchor}`,
      anchor: s.anchor || '',
      x1: round(x1), x2: round(x2),
      y: LANE_Y0 + lane * LANE_H,
      label,
      labelX: round(anchorEnd ? x2 : x1),
      labelAnchor: anchorEnd ? 'end' : 'start',
      running: r.running,
    };
  });

  const talkMarks: Mark[] = talks.filter(t => t.anchor).map(t => {
    const r = dateRange(t.dates, now);
    return { id: `t:${t.anchor}`, anchor: t.anchor!, x: round(xOf(r.start)), y: AXIS_Y, label: shortTitle(t.position) };
  });

  // ── Which entry names which competency ───────────────────────────────────
  const stationText = new Map(stations.map(s => [`s:${s.anchor}`, `${s.position}\n${s.details}`]));
  const projectText = new Map(projects.map(p => [`p:${p.anchor}`, `${p.title}\n${(p.tech_stack || []).join(', ')}\n${p.tagline}`]));
  const links = SKILLS.map(sk => ({
    sk,
    stations: [...stationText].filter(([, text]) => sk.match.test(text)).map(([id]) => id),
    projects: [...projectText].filter(([, text]) => sk.match.test(text)).map(([id]) => id),
  })).filter(l => l.stations.length + l.projects.length >= 2);

  // ── Competency row: each pill wants to sit under its stations ────────────
  const barById = new Map(bars.map(b => [b.id, b]));
  const mid = (b: Bar) => (b.x1 + b.x2) / 2;
  const wished = links.map(l => {
    const xs = l.stations.map(id => mid(barById.get(id)!));
    const want = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : W / 2;
    const label = l.sk.label[lang];
    return { want, w: label.length * SKILL_CHAR_W + 24, key: l.sk.key, label };
  }).sort((a, b) => a.want - b.want);
  // Alternate rows in order of their wish, then settle each row on its own.
  const skills: Pill[] = [0, 1].flatMap(row =>
    spread(wished.filter((_, i) => i % 2 === row), 12, PAD_X / 2, W - PAD_X / 2)
      .map(p => ({ id: `k:${p.key}`, key: p.key, x: round(p.x), y: SKILL_Y[row], w: round(p.w), label: p.label })));
  const skillX = new Map(skills.map(s => [s.id, s.x]));

  // ── Projects: under the competencies they share, on two staggered rows ───
  const projectSkills = new Map<string, string[]>();
  for (const l of links) for (const p of l.projects) projectSkills.set(p, [...(projectSkills.get(p) || []), `k:${l.sk.key}`]);
  const wishedProjects = projects.filter(p => p.anchor).map(p => {
    const id = `p:${p.anchor}`;
    const ks = projectSkills.get(id) || [];
    const want = ks.length ? ks.reduce((a, k) => a + skillX.get(k)!, 0) / ks.length : W / 2;
    return { id, anchor: p.anchor!, want, w: 128, title: shortTitle(p.title) };
  }).sort((a, b) => a.want - b.want);
  const projectsOut: Dot[] = [0, 1].flatMap(row =>
    spread(wishedProjects.filter((_, i) => i % 2 === row), 8, PAD_X / 2, W - PAD_X / 2)
      .map(d => ({ id: d.id, anchor: d.anchor, x: round(d.x), y: PROJECT_Y[row], lines: wrap(d.title, 17) })));

  // ── Edges ────────────────────────────────────────────────────────────────
  const edges: Edge[] = [];
  const pill = new Map(skills.map(s => [s.id, s]));
  const dot = new Map(projectsOut.map(d => [d.id, d]));
  for (const l of links) {
    const k = pill.get(`k:${l.sk.key}`)!;
    for (const sid of l.stations) {
      const b = barById.get(sid)!;
      edges.push({ from: sid, to: k.id, d: curve(mid(b), b.y + 5, k.x, k.y - PILL_H / 2) });
    }
    for (const pid of l.projects) {
      const d = dot.get(pid);
      if (d) edges.push({ from: k.id, to: pid, d: curve(k.x, k.y + PILL_H / 2, d.x, d.y - 7) });
    }
  }

  const neighbours: Record<string, string[]> = {};
  for (const e of edges) {
    (neighbours[e.from] ||= []).push(e.to);
    (neighbours[e.to] ||= []).push(e.from);
  }

  return {
    width: W, height: H, axisY: AXIS_Y, ticks, today: round(xOf(now)),
    bars, talks: talkMarks, skills, projects: projectsOut, edges, neighbours,
  };
}
