// Tests for the GitHub profile README. Run with `npm run test:profile`.
// profile-README.md is rendered from profile-README.template.md and the English
// part of config.cv.toml. It is a fourth output next to website, PDF and agent
// card, so a correction to the CV must reach it too: the committed file has to
// match a fresh render, and nothing in it may name a tool the CV does not carry.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import toml from 'toml';
import { render, isTalk } from '../scripts/profile-readme.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const config = toml.parse(read('config.cv.toml'));
const en = config.languages.en.params;
const readme = read('profile-README.md');

test('committed profile-README.md matches a fresh render', () => {
  assert.equal(readme, render(config, read('profile-README.template.md')),
    'profile-README.md is stale: run `npm run profile:readme` and copy it to mboiman/mboiman');
});

test('availability and tagline come from the CV', () => {
  assert.equal(render(config, '{{availability}}|{{tagline}}'), `${en.ui.availability}|${en.ui.tagline}`);
});

test('every career position is listed with its dates and a link to its CV section', () => {
  const out = render(config, '{{experience: 3}}');
  const jobs = en.experiences.list.filter((e) => !isTalk(e));
  assert.ok(jobs.length > 3, 'fixture: more positions than the visible table');
  for (const e of jobs) {
    assert.ok(out.includes(`(https://mboiman.github.io/en/#exp-${e.anchor})`), `no link for ${e.anchor}`);
    assert.ok(out.includes(e.dates), `no dates for ${e.anchor}`);
  }
  assert.match(out, /<details>[\s\S]*<\/details>/, 'positions beyond the first 3 go into a details block');
});

test('talks are listed apart from positions', () => {
  const talks = en.experiences.list.filter(isTalk);
  assert.ok(talks.length > 0);
  const out = render(config, '{{talks}}');
  const jobs = render(config, '{{experience: 99}}');
  for (const t of talks) {
    assert.ok(out.includes(`#exp-${t.anchor})`), `talk ${t.anchor} missing`);
    assert.ok(!jobs.includes(`#exp-${t.anchor})`), `talk ${t.anchor} listed as a position`);
  }
});

test('every sidebar skill appears exactly once in the skills table', () => {
  const out = render(config, '{{skills}}');
  for (const s of en.ui.sidebar_skills) {
    const cells = out.split('\n').map((row) => row.trim().replace(/^\||\|$/g, ''))
      .flatMap((row) => row.split(' | ')).flatMap((c) => c.split(' · ')).map((c) => c.trim());
    assert.equal(cells.filter((c) => c === s).length, 1, `${s} not exactly once`);
  }
});

test('a badge whose label the CV never mentions fails', () => {
  assert.throws(() => render(config, '{{badges: Python:python:3776AB | Kubeflow:kubeflow:000000}}'), /Kubeflow/);
});

test('badge labels are escaped for shields.io', () => {
  const out = render(config, '{{badges: GitHub Actions:githubactions:2088FF}}');
  assert.ok(out.includes('https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white'), out);
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

test('no dashes as punctuation and no counters in the rendered README', () => {
  assert.doesNotMatch(readme, /[–—]/, 'en or em dash in profile-README.md');
  const prose = readme.replace(/https?:\/\/[^\s)"]+/g, ''); // URL encoding (%C3) is not a percentage
  assert.doesNotMatch(prose, /\d+\s*\+\s*(years|repos|skills)|\d+\s*%/i, 'counter or percentage');
  assert.doesNotMatch(readme, /\{\{\s*[a-z]+/, 'unrendered placeholder');
});
