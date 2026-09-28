// Tests for the match report outside the browser (src/lib/match-report.ts):
// the same evaluation the page exports, built in Node for the application
// bundle (scripts/jev-match.mjs). Run with `npm run test:match`.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import toml from 'toml';
import { PDFDocument } from 'pdf-lib';
import { cvEntries, scoreMatch, DEFAULT_WEIGHTS } from '../src/lib/match.ts';
import { reportInput } from '../src/lib/match-report.ts';
import { buildReportPdf } from '../src/lib/match-pdf.ts';
import { i18n } from '../src/lib/i18n.ts';

const config = toml.parse(fs.readFileSync(new URL('../config.cv.toml', import.meta.url), 'utf8'));
const load = (name) => JSON.parse(fs.readFileSync(new URL(`../src/data/match/${name}`, import.meta.url), 'utf8'));
const meas = load('demo-portal-testautomation.de.json');
const profile = load('profile.de.json').depth;
const entries = cvEntries(config.languages.de.params);

const build = (extra = {}) => reportInput({
  lang: 'de', meas, profile, entries, title: 'AI Quality Engineer', date: new Date('2026-09-28T12:00:00Z'), cv: null, ...extra,
});

test('reportInput: score, verdict and gaps are the ones the page computes', () => {
  const r = build();
  const s = scoreMatch(meas.requirements, meas.project.demand, profile, DEFAULT_WEIGHTS);
  assert.equal(r.total, s.total);
  assert.equal(r.gaps.length, s.gaps.length);
  assert.equal(r.lines.length, meas.requirements.length);
  assert.equal(r.kicker, i18n.de.match.kicker);
  assert.equal(r.title, 'AI Quality Engineer');
  assert.equal(r.axes.length, 8);
});

test('reportInput: the mode line names the measurement date, the footer today', () => {
  const r = build();
  assert.match(r.modeLine, /26\.0?9\.2026/);
  assert.match(r.footer, /28\.9\.2026|28\.09\.2026/);
});

test('reportInput: evidence names a CV entry by its label, never by its id', () => {
  const r = build();
  const labels = new Set(entries.map(e => e.label));
  for (const l of r.lines.filter(l => l.evidence && l.evidence !== i18n.de.match.noEvidence)) {
    assert.ok(labels.has(l.evidence), l.evidence);
  }
});

test('reportInput: credit lines pass through, none by default', () => {
  assert.deepEqual(build().credit, []);
  assert.deepEqual(build({ credit: ['Erstellt mit Jev'] }).credit, ['Erstellt mit Jev']);
});

test('buildReportPdf runs in Node and appends the CV when given', async () => {
  const bare = await PDFDocument.load(await buildReportPdf(build({ credit: ['Erstellt mit Jev · typesafe.ai'] })));
  assert.ok(bare.getPageCount() >= 2);
  const cv = await PDFDocument.create();
  cv.addPage(); cv.addPage();
  const withCv = await PDFDocument.load(await buildReportPdf(build({ cv: await cv.save() })));
  assert.equal(withCv.getPageCount(), bare.getPageCount() + 2);
});

test('reportInput: cvFollows announces the CV behind the evaluation instead of a link', () => {
  const r = build({ cvFollows: true });
  assert.equal(r.cvMissing, i18n.de.match.pdfCvNote);
});
