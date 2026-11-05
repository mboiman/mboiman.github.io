// Renders profile-README.md (the GitHub profile page, repo mboiman/mboiman) from
// profile-README.template.md and the English part of config.cv.toml.
//
//   npm run profile:readme            write profile-README.md
//   npm run profile:readme -- --check exit 1 when the file is stale
//
// Placeholders:
//   {{tagline}} {{availability}}  languages.en.params.ui
//   {{experience: N}}  career stations in CV order with dates, role and SECTOR
//                      (scripts/lib/profile-sectors.json), never the company;
//                      each role links to its CV section; the first N in a
//                      table, the rest in <details>. A station without a
//                      sector entry fails, so no company leaks by default.
//   {{talks}}          talks and workshops (scripts/lib/talk-patterns.json),
//                      without the venue
//   {{skills}}         every ui.sidebar_skills entry, grouped like the CV page
//                      (src/lib/skill-groups.ts)
//   {{education}} {{languages}}
//   {{badges: Label:logo:color[:logoColor] | ...}}
//                      shields.io badges on one line; a label the CV never
//                      mentions as a whole word fails, so the profile cannot
//                      claim a tool the CV does not carry
import fs from 'node:fs';
import toml from 'toml';
import { fileURLToPath } from 'node:url';
import { groupedSkills } from '../src/lib/skill-groups.ts';
import talkPatterns from './lib/talk-patterns.json' with { type: 'json' };
import sectors from './lib/profile-sectors.json' with { type: 'json' };

const CV = 'https://mboiman.github.io/en/';
const talkPosition = new RegExp(talkPatterns.position.join('|'), 'i');
const talkCompany = new RegExp(talkPatterns.company.join('|'), 'i');

export const isTalk = (e) => talkPosition.test(e.position || '') || talkCompany.test(e.company || '');

const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const link = (e, title = e.position) => `[${cell(title)}](${CV}#exp-${e.anchor})`;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function sectorOf(e) {
  const s = sectors[e.anchor];
  if (!s?.sector) throw new Error(`no sector for station "${e.anchor}" in scripts/lib/profile-sectors.json`);
  return s;
}

function experienceTable(rows) {
  // No company column: clients and employers are not named on the profile
  // (Michael, 2026-11-05). The sector stands in, the role links to the CV.
  return ['| When | Role | Sector |', '|---|---|---|',
    ...rows.map((e) => {
      const s = sectorOf(e);
      return `| ${cell(e.dates)} | ${link(e, s.role || e.position)} | ${cell(s.sector)} |`;
    })].join('\n');
}

function experience(params, arg) {
  const n = Number.parseInt(arg, 10);
  if (!Number.isInteger(n) || n < 1) throw new Error(`{{experience: N}} needs a positive N, got "${arg}"`);
  const jobs = params.experiences.list.filter((e) => !isTalk(e));
  const [shown, rest] = [jobs.slice(0, n), jobs.slice(n)];
  let out = experienceTable(shown);
  if (rest.length) {
    out += `\n\n<details>\n<summary>Earlier stations</summary>\n\n${experienceTable(rest)}\n\n</details>`;
  }
  return out;
}

function badges(raw, arg) {
  // A label counts as evidence only as a whole word: "Go" inside "Google" does not.
  const inCv = (label) => new RegExp(`(^|[^\\p{L}\\p{N}])${esc(label)}([^\\p{L}\\p{N}]|$)`, 'iu').test(raw);
  const specs = (arg || '').split('|').map((s) => s.trim()).filter(Boolean);
  const missing = [];
  const out = specs.map((spec) => {
    const [label, logo = '', color = '555555', logoColor = 'white'] = spec.split(':').map((s) => s.trim());
    if (!inCv(label)) missing.push(label);
    const msg = encodeURIComponent(label.replace(/-/g, '--').replace(/_/g, '__'));
    const query = ['style=for-the-badge', logo && `logo=${logo}`, logo && `logoColor=${logoColor}`].filter(Boolean).join('&');
    return `![${label}](https://img.shields.io/badge/${msg}-${color}?${query})`;
  });
  if (missing.length) throw new Error(`badge label not found in config.cv.toml: ${missing.join(', ')}`);
  return out.join(' ');
}

export function render(config, template, raw = fs.readFileSync(new URL('../config.cv.toml', import.meta.url), 'utf8')) {
  const params = config.languages.en.params;
  const ui = params.ui;
  // The template's leading note is for editors of the template, not for readers.
  return template.replace(/^<!--[\s\S]*?-->\n/, '').replace(/\{\{\s*([a-z]+)\s*(?::([^}]*))?\}\}/g, (_, key, arg) => {
    switch (key) {
      case 'tagline': return ui.tagline;
      case 'availability': return ui.availability;
      case 'experience': return experience(params, arg);
      case 'talks':
        return params.experiences.list.filter(isTalk)
          .map((e) => `- **${cell(e.dates)}** · ${link(e)}`).join('\n');
      case 'skills':
        return ['| Area | Skills |', '|---|---|',
          ...groupedSkills(ui.sidebar_skills, 'en').map((g) => `| **${cell(g.title)}** | ${g.items.map(cell).join(' · ')} |`)].join('\n');
      case 'education':
        return params.education.list
          .map((e) => `- **${cell(e.degree)}**${e.college ? `, ${cell(e.college)}` : ''} (${cell(e.dates)})`).join('\n');
      case 'languages':
        return params.language.list.map((l) => `${l.language} (${l.level.toLowerCase()})`).join(', ');
      case 'badges': return badges(raw, arg);
      default: throw new Error(`unknown placeholder {{${key}}}`);
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const at = (p) => new URL(`../${p}`, import.meta.url);
  const out = render(toml.parse(fs.readFileSync(at('config.cv.toml'), 'utf8')),
    fs.readFileSync(at('profile-README.template.md'), 'utf8'));
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(at('profile-README.md'), 'utf8') !== out) {
      console.error('profile-README.md is stale: run `npm run profile:readme`');
      process.exit(1);
    }
  } else {
    fs.writeFileSync(at('profile-README.md'), out);
  }
}
