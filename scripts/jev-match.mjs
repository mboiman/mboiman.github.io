#!/usr/bin/env node
/**
 * The project match from the command line: one posting against the CV, judged
 * by Jev through the live jev-match worker, written as the same PDF the page's
 * export button builds (src/lib/match-report.ts). Made for the application
 * bundle, cover letter, then this evaluation, then the CV (generate_application.sh
 * picks it up via MATCH_PDF).
 *
 * Run:  npm run match -- --file posting.txt --title "AI Quality Engineer" --out applications/match_x.pdf
 *       [--lang de|en] [--json out.json] [--with-cv | --cv-follows] [--credit "line"]... [--from out.json]
 *
 * --from replays a stored run instead of asking Jev again (no cost, same PDF).
 * --with-cv appends public/pdfs/Michael_Boiman_CV_<LANG>.pdf, as the page does;
 * leave it out when the bundle brings its own CV, and say --cv-follows so the
 * last line announces it instead of pointing to the website.
 *
 * Access: the worker lets the page's origin through, and anyone else only with
 * the measure token. That token is a Worker secret (MEASURE_TOKEN) and, on
 * Michael's Mac, the keychain entry `jev-match-token` (account `mboiman`); JEV_TOKEN
 * overrides it. The direct TypeSafe API is no option from home: it refuses the
 * home connection with 403 before any key check (2026-09-26).
 *
 * What goes out: the posting text. The worker adds the public CV entries.
 * Prints a JSON summary on stdout for the job-application skill.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import toml from 'toml';
import { cvEntries, scoreMatch, verdictOf, DEFAULT_WEIGHTS, MET_LEVEL } from '../src/lib/match.ts';
import { reportInput } from '../src/lib/match-report.ts';
import { buildReportPdf } from '../src/lib/match-pdf.ts';
import { MATCH_ENDPOINT } from '../src/lib/match-config.ts';

const root = new URL('../', import.meta.url);

function args(argv) {
  const out = { lang: 'de', credit: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    const v = () => argv[++i];
    if (k === '--file') out.file = v();
    else if (k === '--text') out.text = v();
    else if (k === '--from') out.from = v();
    else if (k === '--lang') out.lang = v();
    else if (k === '--title') out.title = v();
    else if (k === '--out') out.out = v();
    else if (k === '--json') out.json = v();
    else if (k === '--credit') out.credit.push(v());
    else if (k === '--with-cv') out.withCv = true;
    else if (k === '--cv-follows') out.cvFollows = true;
    else { console.error(`unknown argument: ${k}`); process.exit(2); }
  }
  if (!['de', 'en'].includes(out.lang)) { console.error('--lang de|en'); process.exit(2); }
  if (!out.from && !out.file && !out.text) { console.error('need --file, --text or --from'); process.exit(2); }
  return out;
}

function token() {
  if (process.env.JEV_TOKEN) return process.env.JEV_TOKEN.trim();
  try {
    return execFileSync('security', ['find-generic-password', '-s', 'jev-match-token', '-a', 'mboiman', '-w'], { encoding: 'utf8' }).trim();
  } catch {
    console.error('No token: set JEV_TOKEN or add the keychain entry jev-match-token / mboiman.');
    process.exit(1);
  }
}

async function measure(text, lang) {
  const via = (process.env.JEV_VIA ?? MATCH_ENDPOINT).replace(/\/$/, '');
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(`${via}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-measure-token': token() },
      body: JSON.stringify({ lang, text }),
    });
    if (res.ok) return res.json();
    const body = await res.json().catch(() => ({}));
    if (res.status === 429 || res.status === 503) { await new Promise(r => setTimeout(r, 15000)); continue; }
    throw new Error(`jev-match ${res.status} ${body.error ?? ''}`.trim());
  }
  throw new Error('jev-match: rate limit, try again in a minute');
}

const a = args(process.argv.slice(2));
const config = toml.parse(fs.readFileSync(new URL('config.cv.toml', root), 'utf8'));
const entries = cvEntries(config.languages[a.lang].params);
const profile = JSON.parse(fs.readFileSync(new URL(`src/data/match/profile.${a.lang}.json`, root), 'utf8')).depth;

const meas = a.from
  ? JSON.parse(fs.readFileSync(a.from, 'utf8'))
  : await measure(a.text ?? fs.readFileSync(a.file, 'utf8'), a.lang);

// The worker's CV is the one deployed last; a local edit since then shows as
// evidence ids this checkout does not know.
const known = new Set(entries.map(e => e.id));
const stale = [...new Set(meas.requirements.map(r => r.evidence).filter(id => id && !known.has(id)))];
if (stale.length) console.error(`warning: the worker knows CV entries this checkout does not (${stale.join(', ')}); deploy the worker or pull`);

if (a.json) fs.writeFileSync(a.json, JSON.stringify(meas, null, 2) + '\n');

const cvPath = new URL(`public/pdfs/Michael_Boiman_CV_${a.lang.toUpperCase()}.pdf`, root);
const cv = a.withCv && fs.existsSync(cvPath) ? new Uint8Array(fs.readFileSync(cvPath)) : null;
const title = a.title ?? (a.lang === 'de' ? 'Eigene Ausschreibung' : 'Own posting');

if (a.out) {
  const bytes = await buildReportPdf(reportInput({ lang: a.lang, meas, profile, entries, title, date: new Date(), cv, credit: a.credit, cvFollows: a.cvFollows }));
  fs.mkdirSync(path.dirname(path.resolve(a.out)), { recursive: true });
  fs.writeFileSync(a.out, bytes);
}

const s = scoreMatch(meas.requirements, meas.project.demand, profile, DEFAULT_WEIGHTS);
const label = new Map(entries.map(e => [e.id, e.label]));
// Anchors of the cited entries, most cited first: cv.focus of the short CV and
// the focus of the tailored link.
const cited = new Map();
for (const r of meas.requirements) {
  if (!r.counts || r.level < 0.75 || !r.evidence || !/^[sp]-/.test(r.evidence) || !known.has(r.evidence)) continue;
  cited.set(r.evidence, (cited.get(r.evidence) ?? 0) + 1);
}
const focus = [...cited.entries()].sort((x, y) => y[1] - x[1]).map(([id]) => id.slice(2));
console.log(JSON.stringify({
  total: s.total,
  verdict: verdictOf(s.total),
  mustMet: s.mustMet,
  mustTotal: s.mustTotal,
  coverage: Math.round(s.coverage * 100),
  topicFit: Math.round(s.topicFit * 100),
  role: meas.project.role,
  focus,
  lines: meas.requirements.map(r => ({
    text: r.text,
    counts: r.counts,
    must: r.must >= 0.5,
    level: Math.round(r.level * 10) / 10,
    evidence: r.counts && r.level >= 0.75 ? label.get(r.evidence) ?? r.evidence : null,
    gap: r.counts && r.level < MET_LEVEL,
  })),
  pdf: a.out ?? null,
  json: a.json ?? null,
}, null, 2));
