#!/usr/bin/env node
/**
 * Check every address the CV links to, and record what came back.
 *
 * WHY THIS EXISTS. A dead link on a CV is not a cosmetic fault: the links are
 * the evidence, and a reader who clicks one and lands on a 404 has been told
 * something false by the page. Fifteen addresses are linked from the content,
 * and four of them are deep links that rot on someone else's schedule: a file
 * path inside a repository, an anchor on a generated page, a public slide deck,
 * a customer's site.
 *
 * IT NEVER FAILS THE BUILD. A third party being down for a minute is not a
 * reason to refuse a deploy, and a guard that blocks on someone else's uptime
 * gets disabled the first time it does. The script always exits 0; what it
 * produces is a record, and the page states the record.
 *
 * WHAT "REACHABLE" MEANS HERE, precisely, because the page repeats the claim:
 * the address resolves, the host answers, and the answer is not "gone". A host
 * that answers 403 or 999 to a script (LinkedIn does exactly that) has still
 * proven it is there; refusing a robot is not rot. Only 404 and 410, a name
 * that does not resolve, a refused connection or a timeout count as failures.
 *
 * The result lands in src/data/link-state.json, which is gitignored: it is
 * measured, not authored, and a committed copy would be a stale claim with a
 * date on it. Absent file means the page simply says nothing.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const SOURCES = ['config.cv.toml', 'src/lib/i18n.ts'];
const OUT = 'src/data/link-state.json';
const TIMEOUT_MS = 10000;
const CONCURRENCY = 5;
/** Answered, but declined to serve a script. The address is there. */
const ANSWERED_BUT_REFUSED = new Set([401, 403, 405, 429, 999]);

function collect() {
  const urls = new Set();
  for (const file of SOURCES) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(/https?:\/\/[^\s"'<>()\]]+/g)) {
      urls.add(match[0].replace(/[.,;:]+$/, ''));
    }
  }
  return [...urls].sort();
}

async function probe(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'mboiman.github.io link check (+https://mboiman.github.io/)' },
    });
    return { status: res.status };
  } catch (err) {
    return { status: 0, error: err?.name === 'AbortError' ? 'timeout' : String(err?.cause?.code || err?.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

async function check(url) {
  // HEAD first because it is cheap, GET after because plenty of hosts answer
  // HEAD with 405 or with a lie.
  let result = await probe(url, 'HEAD');
  if (result.status === 0 || result.status >= 400) result = await probe(url, 'GET');
  const { status, error } = result;
  const ok = (status > 0 && status < 400) || ANSWERED_BUT_REFUSED.has(status);
  return { url, status, ok, ...(error ? { error } : {}) };
}

async function run(urls) {
  const out = [];
  let next = 0;
  const workers = Array.from({ length: Math.min(CONCURRENCY, urls.length) }, async () => {
    while (next < urls.length) {
      const i = next++;
      out[i] = await check(urls[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

const urls = collect();
if (!urls.length) {
  console.log('link check: no addresses found in the content, nothing to do.');
  process.exit(0);
}

const results = await run(urls);
const failures = results.filter((r) => !r.ok);
const state = {
  checkedAt: new Date().toISOString().slice(0, 10),
  total: results.length,
  ok: results.length - failures.length,
  failures: failures.map((f) => ({ url: f.url, status: f.status, ...(f.error ? { error: f.error } : {}) })),
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(state, null, 2)}\n`);

console.log(`link check: ${state.ok}/${state.total} reachable on ${state.checkedAt}`);
for (const f of failures) console.log(`  UNREACHABLE ${f.url} -> ${f.status || f.error}`);
for (const r of results.filter((x) => ANSWERED_BUT_REFUSED.has(x.status))) {
  console.log(`  answered ${r.status} (declined to serve a script, counted as reachable): ${r.url}`);
}
