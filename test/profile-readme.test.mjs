// Tests for the GitHub profile README. Run with `npm run test:profile`.
// profile-README.md is rendered from profile-README.template.md and the English
// part of config.cv.toml. It is a fourth output next to website, PDF and agent
// card, so a correction to the CV must reach it too: the committed file has to
// match a fresh render, and nothing in it may name a tool the CV does not carry.
// Michael 2026-11-05: no client or employer names on the profile, sectors only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import toml from 'toml';
import { render, isTalk } from '../scripts/profile-readme.mjs';
import sectors from '../scripts/lib/profile-sectors.json' with { type: 'json' };

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const config = toml.parse(read('config.cv.toml'));
const en = config.languages.en.params;
const jobs = en.experiences.list.filter((e) => !isTalk(e));
const talks = en.experiences.list.filter(isTalk);
const readme = read('profile-README.md');
// What a reader sees: no URLs (repo paths such as bks-lab/... are addresses, not prose).
const visible = readme.replace(/https?:\/\/[^\s)"']+/g, '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('committed profile-README.md matches a fresh render', () => {
  assert.equal(readme, render(config, read('profile-README.template.md')),
    'profile-README.md is stale: run `npm run profile:readme` and copy it to mboiman/mboiman');
});

test('availability and tagline come from the CV', () => {
  assert.equal(render(config, '{{availability}}|{{tagline}}'), `${en.ui.availability}|${en.ui.tagline}`);
});

test('no client, employer or venue is named', () => {
  // Every company field of the CV, its first segment and its first word, except
  // our own firm (BKS) and the generic labels of talks.
  const names = new Set();
  for (const e of en.experiences.list) {
    const first = e.company.split(' · ')[0].trim();
    if (/^BKS\b/.test(first) || /^(Developer|Enterprise|AI) /.test(first)) continue;
    names.add(first);
    names.add(first.split(/\s+/)[0]);
  }
  names.add('QualityCluster');
  names.add('SAP');
  for (const n of names) {
    assert.doesNotMatch(visible, new RegExp(`(^|[^\\p{L}\\p{N}])${esc(n)}([^\\p{L}\\p{N}]|$)`, 'iu'), `company named: ${n}`);
  }
});

test('every career station has a sector, and a station without one fails', () => {
  for (const e of jobs) assert.ok(sectors[e.anchor]?.sector, `no sector for ${e.anchor}`);
  const broken = structuredClone(config);
  broken.languages.en.params.experiences.list.push({ position: 'X', anchor: 'new-client', dates: '2027', company: 'Acme' });
  assert.throws(() => render(broken, '{{experience: 3}}'), /new-client/);
});

test('every career station is listed with dates, sector and a link to its CV section', () => {
  const out = render(config, '{{experience: 3}}');
  for (const e of jobs) {
    assert.ok(out.includes(`(https://mboiman.github.io/en/#exp-${e.anchor})`), `no link for ${e.anchor}`);
    assert.ok(out.includes(e.dates), `no dates for ${e.anchor}`);
    assert.ok(out.includes(sectors[e.anchor].sector), `no sector for ${e.anchor}`);
  }
  assert.match(out, /<details>[\s\S]*<\/details>/, 'stations beyond the first 3 go into a details block');
});

test('talks are listed apart from stations, without the venue', () => {
  const out = render(config, '{{talks}}');
  const all = render(config, '{{experience: 99}}');
  for (const t of talks) {
    assert.ok(out.includes(`#exp-${t.anchor})`), `talk ${t.anchor} missing`);
    assert.ok(!all.includes(`#exp-${t.anchor})`), `talk ${t.anchor} listed as a station`);
  }
});

test('every sidebar skill appears exactly once in the full skill table', () => {
  const out = render(config, '{{skills}}');
  const cells = out.split('\n').map((row) => row.trim().replace(/^\||\|$/g, ''))
    .flatMap((row) => row.split(' | ')).flatMap((c) => c.split(' · ')).map((c) => c.trim());
  for (const s of en.ui.sidebar_skills) assert.equal(cells.filter((c) => c === s).length, 1, `${s} not exactly once`);
});

test('a badge whose label the CV never mentions as a word fails', () => {
  assert.throws(() => render(config, '{{badges: Python:python:3776AB | Kubeflow:kubeflow:000000}}'), /Kubeflow/);
  // "Goo" occurs inside "Google"; only a whole word counts as evidence
  assert.throws(() => render(config, '{{badges: Goo:go:00ADD8}}'), /Goo/);
});

test('badges are escaped for shields.io and stay on one line', () => {
  const out = render(config, '{{badges: GitHub Actions:githubactions:2088FF | Python:python:3776AB}}');
  assert.ok(out.includes('https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white'), out);
  assert.ok(!out.includes('\n'));
});

test('education and languages come from the CV', () => {
  const out = render(config, '{{education}}\n{{languages}}');
  for (const e of en.education.list) assert.ok(out.includes(e.degree), e.degree);
  for (const l of en.language.list) assert.ok(out.includes(l.language), l.language);
  assert.doesNotMatch(out, /Russian|Hebrew/);
});

test('an unknown placeholder fails instead of shipping braces', () => {
  assert.throws(() => render(config, '{{nope}}'), /nope/);
});

test('no dashes as punctuation, no counters, no leftover placeholders', () => {
  assert.doesNotMatch(readme, /[–—]/, 'en or em dash in profile-README.md');
  assert.doesNotMatch(visible, /\d+\s*\+\s*(years|repos|skills)|\d+\s*%/i, 'counter or percentage');
  assert.doesNotMatch(readme, /\{\{\s*[a-z]+/, 'unrendered placeholder');
});
