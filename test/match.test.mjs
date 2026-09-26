// Tests for the project match (/match/). Run with `npm run test:match`.
// The page asks Jev small questions and composes the answers in code; these
// check the code half: how a posting becomes requirements, what goes into a
// request, how answers become a score, and that the stored demo measurements
// still belong to the CV and the demo texts they were measured on.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import toml from 'toml';
import {
  AXES, cvEntries, splitRequirements, projectRequest, requirementRequest, profileRequest,
  readProject, readRequirement, readProfile, scoreMatch, verdictOf, entriesHash, DEFAULT_WEIGHTS,
} from '../src/lib/match.ts';
import { DEMOS } from '../src/lib/match-demos.ts';

const config = toml.parse(fs.readFileSync(new URL('../config.cv.toml', import.meta.url), 'utf8'));
const params = (lang) => config.languages[lang].params;

test('splitRequirements: bullets become lines, headings and short fragments drop out', () => {
  const text = [
    'Senior QA Engineer (m/w/d)',
    '',
    'Ihre Aufgaben:',
    '- Aufbau einer Testautomatisierung mit Playwright für unser Kundenportal',
    '• Integration der Tests in Azure DevOps Pipelines',
    '',
    'Ihr Profil',
    '1. Mehrjährige Erfahrung mit Python oder TypeScript',
    '* Gute Deutschkenntnisse',
    '- ok',
    '- Aufbau einer Testautomatisierung mit Playwright für unser Kundenportal',
  ].join('\n');
  const lines = splitRequirements(text);
  assert.deepEqual(lines, [
    'Senior QA Engineer (m/w/d)',
    'Aufbau einer Testautomatisierung mit Playwright für unser Kundenportal',
    'Integration der Tests in Azure DevOps Pipelines',
    'Mehrjährige Erfahrung mit Python oder TypeScript',
    'Gute Deutschkenntnisse',
  ]);
});

test('splitRequirements: a paragraph without bullets splits into sentences, capped', () => {
  const para = Array.from({ length: 30 }, (_, i) => `Sie arbeiten an Thema Nummer ${i + 1} im Team.`).join(' ');
  const lines = splitRequirements(para, 12);
  assert.equal(lines.length, 12);
  assert.equal(lines[0], 'Sie arbeiten an Thema Nummer 1 im Team.');
});

test('splitRequirements: very long lines are cut, empty input gives nothing', () => {
  assert.deepEqual(splitRequirements('   \n  '), []);
  const long = `- ${'Erfahrung '.repeat(80)}`;
  assert.ok(splitRequirements(long)[0].length <= 300);
});

for (const lang of ['de', 'en']) {
  const entries = cvEntries(params(lang));

  test(`cvEntries [${lang}]: one per station, talk, anchored project, plus the profile`, () => {
    const p = params(lang);
    const anchored = p.projects.list.filter((x) => x.anchor).length;
    assert.equal(entries.length, p.experiences.list.filter((e) => e.anchor).length + anchored + 1);
    const ids = entries.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, 'ids are unique');
    for (const e of entries) {
      assert.match(e.id, /^[spx]-[a-z0-9-]+$/);
      assert.ok(e.text.length > 20 && e.text.length <= 700, `${e.id} text length ${e.text.length}`);
      assert.doesNotMatch(e.text, /\*\*|\]\(/, `${e.id} carries markdown`);
    }
  });

  test(`requests [${lang}]: evidence may name every entry or none, and nothing else`, () => {
    const req = requirementRequest('Erfahrung mit Playwright', entries);
    assert.equal(req.state.requirement, 'Erfahrung mit Playwright');
    assert.deepEqual(Object.keys(req.state.cv).sort(), entries.map((e) => e.id).sort());
    assert.deepEqual(Object.keys(req.questions.evidence.criteria).sort(), [...entries.map((e) => e.id), 'none'].sort());
    assert.deepEqual(Object.keys(req.questions.axis.criteria).sort(), [...AXES.map((a) => a.key), 'other'].sort());
    assert.equal(req.questions.level.criteria.length, 4);
    const pr = projectRequest('Ein Projekt');
    assert.deepEqual(Object.keys(pr.questions).filter((k) => k.startsWith('demand:')).length, AXES.length);
    const prof = profileRequest(entries);
    assert.equal(Object.keys(prof.questions).length, AXES.length);
  });
}

// A hand-built measurement: two requirements fully covered, one must-have
// missing, one line that is no requirement at all.
const answer = (o) => ({ answers: o, usage: { input_tokens: 1000 }, _seconds: 0.4 });
const reqAnswer = (isReq, must, axis, evidence, level) => answer({
  is_req: { noul: isReq }, must: { noul: must },
  axis: { choice: axis, probabilities: { [axis]: 0.9 } },
  evidence: { choice: evidence, probabilities: { [evidence]: 0.8, none: 0.1 } },
  level: { score: level },
});
const reqs = [
  readRequirement('Playwright', reqAnswer(0.95, 0.9, 'testauto', 's-dvag', 3)),
  readRequirement('Azure DevOps', reqAnswer(0.9, 0.2, 'cloud', 's-tuev-sued', 2)),
  readRequirement('SAP S/4HANA', reqAnswer(0.9, 0.8, 'dev', 'none', 0.2)),
  readRequirement('Wir bieten Obstkorb', reqAnswer(0.1, 0.1, 'other', 'none', 0)),
];
const demand = Object.fromEntries(AXES.map((a) => [a.key, 0]));
demand.testauto = 1; demand.cloud = 0.5;
const profile = Object.fromEntries(AXES.map((a) => [a.key, 0.5]));
profile.testauto = 1;

test('readRequirement: none evidence is null, level becomes 0..1', () => {
  assert.equal(reqs[2].evidence, null);
  assert.equal(reqs[0].evidence, 's-dvag');
  assert.equal(reqs[0].cover, 1);
  assert.equal(reqs[3].counts, false);
  assert.equal(reqs[0].seconds, 0.4);
});

test('scoreMatch: coverage weighs must-haves, topic fit caps at the demand', () => {
  const s = scoreMatch(reqs, demand, profile, DEFAULT_WEIGHTS);
  // weights: must 2, nice 1, must 2 ; cover 1, 2/3, 0.2/3
  const coverage = (2 * 1 + 1 * (2 / 3) + 2 * (0.2 / 3)) / 5;
  assert.ok(Math.abs(s.coverage - coverage) < 1e-9);
  // testauto: demand 1, its line covered 1 ; cloud: demand .5, its line 2/3
  const topicFit = (1 * 1 + 0.5 * (2 / 3)) / 1.5;
  assert.ok(Math.abs(s.topicFit - topicFit) < 1e-9);
  assert.equal(s.perAxis.cloud.fromLines, true);
  // lead has no line: falls back to the profile
  assert.deepEqual(s.perAxis.lead, { demand: 0, cover: 0.5, fromLines: false });
  assert.equal(s.mustTotal, 2);
  assert.equal(s.mustMet, 1);
  assert.equal(s.counted, 3);
  assert.deepEqual(s.gaps.map((g) => g.text), ['SAP S/4HANA']);
  assert.equal(s.total, Math.round(100 * (DEFAULT_WEIGHTS.reqShare * coverage + (1 - DEFAULT_WEIGHTS.reqShare) * topicFit)));
});

test('scoreMatch: weights move the score, not the answers', () => {
  const a = scoreMatch(reqs, demand, profile, { reqShare: 1, mustFactor: 1 });
  const b = scoreMatch(reqs, demand, profile, { reqShare: 0, mustFactor: 1 });
  assert.equal(b.total, Math.round(100 * b.topicFit));
  assert.notEqual(a.total, b.total);
  assert.equal(a.gaps.length, b.gaps.length);
});

test('scoreMatch: nothing to count gives zero, not NaN', () => {
  const s = scoreMatch([reqs[3]], Object.fromEntries(AXES.map((a) => [a.key, 0])), profile, DEFAULT_WEIGHTS);
  assert.equal(s.total, 0);
  assert.ok(Number.isFinite(s.coverage));
});

test('verdictOf: four bands', () => {
  assert.equal(verdictOf(85), 'strong');
  assert.equal(verdictOf(75), 'good');
  assert.equal(verdictOf(55), 'partial');
  assert.equal(verdictOf(40), 'weak');
});

test('readProject / readProfile: scores 0..3 become 0..1 per axis', () => {
  const pa = answer(Object.fromEntries([
    ...AXES.map((a) => [`demand:${a.key}`, { score: 1.5 }]),
    ['role', { choice: 'qa_lead', probabilities: { qa_lead: 0.7 } }],
  ]));
  const p = readProject(pa);
  assert.equal(p.demand.testauto, 0.5);
  assert.equal(p.role, 'qa_lead');
  const pf = readProfile(answer(Object.fromEntries(AXES.map((a) => [`depth:${a.key}`, { score: 3 }]))));
  assert.equal(pf.agents, 1);
});

// ── The stored measurements ────────────────────────────────────────────────
const dataDir = new URL('../src/data/match/', import.meta.url);

for (const lang of ['de', 'en']) {
  const entries = cvEntries(params(lang));
  const ids = new Set(entries.map((e) => e.id));

  test(`profile measurement [${lang}] exists and names every axis`, () => {
    const prof = JSON.parse(fs.readFileSync(new URL(`profile.${lang}.json`, dataDir), 'utf8'));
    for (const a of AXES) assert.ok(prof.depth[a.key] >= 0 && prof.depth[a.key] <= 1, a.key);
    if (prof.entriesHash !== entriesHash(entries)) {
      console.warn(`[match] profile.${lang}.json was measured on an older CV. Re-measure: node --experimental-strip-types scripts/jev-measure.mjs`);
    }
  });

  for (const demo of DEMOS) {
    test(`demo ${demo.id} [${lang}]: measured on the current text, evidence still exists`, () => {
      const m = JSON.parse(fs.readFileSync(new URL(`demo-${demo.id}.${lang}.json`, dataDir), 'utf8'));
      assert.deepEqual(m.requirements.map((r) => r.text), splitRequirements(demo.text[lang]), 'demo text changed since the measurement');
      for (const r of m.requirements) {
        if (r.evidence) assert.ok(ids.has(r.evidence), `${r.evidence} is no longer in the CV`);
      }
    });
  }
}
