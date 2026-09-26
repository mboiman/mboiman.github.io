// Tests for the career graph of the future view. Run with `npm run test:graph`.
// The layout is computed at build time; these check that what it computes can
// be drawn: every station has a bar, nothing on a row overlaps, and every line
// ends at a node that exists.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import toml from 'toml';
import { buildCareerGraph, dateRange, wrap } from '../src/lib/career-graph.ts';
import talkPatterns from '../scripts/lib/talk-patterns.json' with { type: 'json' };

const config = toml.parse(fs.readFileSync(new URL('../config.cv.toml', import.meta.url), 'utf8'));
const isTalk = (e) => new RegExp(talkPatterns.position.join('|'), 'i').test(e.position || '')
  || new RegExp(talkPatterns.company.join('|'), 'i').test(e.company || '');

for (const lang of ['de', 'en']) {
  const p = config.languages[lang].params;
  const g = buildCareerGraph({
    lang, now: 2026.73,
    stations: p.experiences.list.filter((e) => !isTalk(e)),
    talks: p.experiences.list.filter(isTalk),
    projects: p.projects.list,
  });

  test(`graph [${lang}]: one bar per station, bars in one lane never overlap`, () => {
    assert.equal(g.bars.length, p.experiences.list.filter((e) => !isTalk(e)).length);
    const byLane = Object.groupBy(g.bars, (b) => b.y);
    for (const lane of Object.values(byLane)) {
      const sorted = [...lane].sort((a, b) => a.x1 - b.x1);
      for (let i = 1; i < sorted.length; i += 1) assert.ok(sorted[i].x1 >= sorted[i - 1].x2, `${sorted[i - 1].label} and ${sorted[i].label} overlap`);
    }
  });

  test(`graph [${lang}]: rows stay inside the frame and do not overlap`, () => {
    for (const s of g.skills) assert.ok(s.x - s.w / 2 >= 0 && s.x + s.w / 2 <= g.width, `${s.label} leaves the frame`);
    for (const row of Object.values(Object.groupBy(g.skills, (s) => s.y))) {
      const pills = [...row].sort((a, b) => a.x - b.x);
      for (let i = 1; i < pills.length; i += 1) assert.ok(pills[i].x - pills[i].w / 2 >= pills[i - 1].x + pills[i - 1].w / 2, `${pills[i - 1].label} and ${pills[i].label} overlap`);
    }
    for (const row of Object.values(Object.groupBy(g.projects, (d) => d.y))) {
      const dots = [...row].sort((a, b) => a.x - b.x);
      for (let i = 1; i < dots.length; i += 1) assert.ok(dots[i].x - dots[i - 1].x >= 128, `projects ${dots[i - 1].id} and ${dots[i].id} crowd`);
    }
    for (const b of g.bars) {
      const w = b.label.length * 8.1;
      const [lo, hi] = b.labelAnchor === 'end' ? [b.labelX - w, b.labelX] : [b.labelX, b.labelX + w];
      assert.ok(lo >= 0 && hi <= g.width, `label ${b.label} leaves the frame`);
    }
  });

  test(`graph [${lang}]: every line joins two nodes that exist, every competency joins two or more`, () => {
    const ids = new Set([...g.bars, ...g.skills, ...g.projects, ...g.talks].map((n) => n.id));
    for (const e of g.edges) assert.ok(ids.has(e.from) && ids.has(e.to), `${e.from} to ${e.to}`);
    for (const s of g.skills) assert.ok((g.neighbours[s.id] || []).length >= 2, `${s.label} stands alone`);
  });
}

test('the axis gives recent years more room than old ones, and says where it changes', () => {
  const p = config.languages.de.params;
  const g = buildCareerGraph({ lang: 'de', now: 2026.73, stations: p.experiences.list.filter((e) => !isTalk(e)), talks: [], projects: [] });
  const at = (y) => g.years.find(([, year]) => year === y)[0];
  assert.ok(at(2025) - at(2024) > 2 * (at(2009) - at(2008)), 'a recent year is wider than an old one');
  assert.ok(g.breakX !== null && g.breakX > at(2008) && g.breakX < at(2024), 'the scale change is marked');
});

test('a project with a year from the TOML appears in that year', () => {
  const p = config.languages.de.params;
  const g = buildCareerGraph({ lang: 'de', now: 2026.73, stations: p.experiences.list.filter((e) => !isTalk(e)), talks: [], projects: p.projects.list });
  const dated = p.projects.list.filter((x) => typeof x.year === 'number');
  assert.ok(dated.length >= 1, 'the TOML carries project years');
  for (const proj of dated) {
    const dot = g.projects.find((d) => d.anchor === proj.anchor);
    const x = g.years.find(([, y]) => y === proj.year)[0];
    assert.equal(dot.year, proj.year);
    assert.ok(Math.abs(dot.reveal - x) < 0.2, `${proj.anchor} appears at ${proj.year}`);
  }
});

test('dateRange reads every form in the TOML', () => {
  assert.deepEqual(dateRange('seit 06/2025', 2026.5), { start: 2025 + 5 / 12, end: 2026.5, running: true });
  assert.equal(dateRange('09/2025-09/2026', 2027).end, 2026 + 9 / 12);
  assert.deepEqual(dateRange('2023', 2026), { start: 2023, end: 2024, running: false });
});

test('project labels wrap into two lines, also at a hyphen, and say when they were cut', () => {
  assert.deepEqual(wrap('E-Mail-Klassifizierung und -Verarbeitungsprozess', 17), ['E-Mail-', 'Klassifizierung…']);
  assert.deepEqual(wrap('Quality Dashboard', 17), ['Quality Dashboard']);
  assert.deepEqual(wrap('Medical Transcription System', 17), ['Medical', 'Transcription…']);
  for (const line of wrap('24/7 Automated Legacy Migration Validator', 17)) assert.ok(line.length <= 17);
});
