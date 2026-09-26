#!/usr/bin/env node
/**
 * Measures the project match with Jev and stores what the page replays:
 *   src/data/match/profile.<lang>.json         how deep the CV is per area
 *   src/data/match/demo-<id>.<lang>.json       one run per example project
 *
 * Run:  npm run measure:match            (all)
 *       npm run measure:match -- --profile-only
 *       JEV_VIA=http://localhost:8799 JEV_TOKEN=<any word> npm run measure:match
 *
 * JEV_VIA sends everything through the jev-match worker instead of calling the
 * API directly (then no key is needed here). Needed on 2026-09-26: TypeSafe
 * refused the home connection with 403 before any key check, while the same
 * request from Cloudflare went through. Start the worker for that with
 *   cd workers/jev-match && wrangler dev --remote --env dev --port 8799 \
 *     --var TYPESAFE_API_KEY:<key> --var MEASURE_TOKEN:<same word as JEV_TOKEN>
 * The token lets the script past the worker's origin check and opens /profile.
 *
 * The API key is never in this repository. It comes from the environment
 * (TYPESAFE_API_KEY) or, on Michael's Mac, from the login keychain entry
 * `typesafe-api` (account `mboiman`), the same one the bks-lab.com lab uses.
 *
 * What goes out: the public CV entries (the text of config.cv.toml) and the
 * invented example postings in src/lib/match-demos.ts. Nothing else.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import toml from 'toml';
import {
  cvEntries, entriesHash, splitRequirements, projectRequest, requirementRequest, profileRequest,
  readProject, readRequirement, readProfile, MODEL,
} from '../src/lib/match.ts';
import { DEMOS } from '../src/lib/match-demos.ts';

const URL_API = 'https://api.typesafe.ai/v1/systemone';
const OUT = new URL('../src/data/match/', import.meta.url);
const PARALLEL = 4;

const VIA = process.env.JEV_VIA?.replace(/\/$/, '');

function apiKey() {
  if (VIA) return '';
  if (process.env.TYPESAFE_API_KEY) return process.env.TYPESAFE_API_KEY.trim();
  try {
    return execFileSync('security', ['find-generic-password', '-s', 'typesafe-api', '-a', 'mboiman', '-w'], { encoding: 'utf8' }).trim();
  } catch {
    console.error('No key: set TYPESAFE_API_KEY or add the keychain entry typesafe-api / mboiman.');
    process.exit(1);
  }
}
const KEY = apiKey();

async function ask(body) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const started = performance.now();
    const res = await fetch(URL_API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const out = await res.json();
      out._seconds = Math.round(performance.now() - started) / 1000;
      return out;
    }
    if ([429, 500, 502, 503, 504].includes(res.status)) {
      await new Promise(r => setTimeout(r, 1000 * 2 ** attempt));
      continue;
    }
    throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  throw new Error('Jev did not answer after five attempts');
}

async function pool(items, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(PARALLEL, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); }
  }));
  return out;
}

const write = (name, data) => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(new URL(name, OUT), `${JSON.stringify(data, null, 2)}\n`);
  console.log(`wrote src/data/match/${name}`);
};

const config = toml.parse(fs.readFileSync(new URL('../config.cv.toml', import.meta.url), 'utf8'));
const profileOnly = process.argv.includes('--profile-only');
const measuredAt = new Date().toISOString().slice(0, 10);

async function viaWorker(path, body) {
  const res = await fetch(`${VIA}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-measure-token': process.env.JEV_TOKEN ?? '' }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`worker ${path}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

for (const lang of ['de', 'en']) {
  const entries = cvEntries(config.languages[lang].params);

  let profile;
  if (VIA) {
    const p = await viaWorker('/profile', { lang });
    profile = { model: p.model, depth: p.depth, seconds: p.seconds, tokens: p.tokens };
  } else {
    const prof = await ask(profileRequest(entries));
    profile = { model: prof.model ?? MODEL, depth: readProfile(prof), seconds: prof._seconds, tokens: prof.usage?.input_tokens ?? 0 };
  }
  write(`profile.${lang}.json`, { lang, measuredAt, model: profile.model, entriesHash: entriesHash(entries), depth: profile.depth, seconds: profile.seconds, tokens: profile.tokens });
  if (profileOnly) continue;

  for (const demo of DEMOS) {
    if (VIA) {
      const m = await viaWorker('/match', { lang, text: demo.text[lang] });
      delete m.live;
      write(`demo-${demo.id}.${lang}.json`, m);
      // The worker allows ten runs a minute per address.
      await new Promise(r => setTimeout(r, 7000));
      continue;
    }
    const text = demo.text[lang];
    const lines = splitRequirements(text);
    const [project, answers] = await Promise.all([
      ask(projectRequest(text)),
      pool(lines, line => ask(requirementRequest(line, entries))),
    ]);
    write(`demo-${demo.id}.${lang}.json`, {
      lang, measuredAt, model: project.model ?? MODEL,
      project: readProject(project),
      requirements: lines.map((line, i) => readRequirement(line, answers[i])),
    });
  }
}
