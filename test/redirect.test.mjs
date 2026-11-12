// Checks the generated site in out/, not the generator.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const TARGET = 'https://michael.boiman.net/cv';
execFileSync('node', ['build.mjs'], { stdio: 'inherit' });
const pages = readFileSync('pages.txt', 'utf8').split('\n').filter(Boolean);
const file = (p) => `out${p}index.html`;

test('every old page has its own redirect to the same path under /cv', () => {
  for (const p of pages) {
    assert.ok(existsSync(file(p)), `missing ${p}`);
    const h = readFileSync(file(p), 'utf8');
    assert.match(h, new RegExp(`<link rel="canonical" href="${TARGET}${p}">`), p);
    assert.match(h, new RegExp(`<meta http-equiv="refresh" content="0; url=${TARGET}${p}">`), p);
    assert.match(h, new RegExp(`<a href="${TARGET}${p}">`), p);
  }
});

test('the script keeps path, query and hash, so ?for= links survive', () => {
  const h = readFileSync(file('/de/match/'), 'utf8');
  assert.match(h, /location\.replace\('https:\/\/michael\.boiman\.net\/cv' \+ location\.pathname \+ location\.search \+ location\.hash\)/);
  // The script comes before the meta refresh, which would drop the query.
  assert.ok(h.indexOf('location.replace') < h.indexOf('http-equiv="refresh"'));
});

test('404 catches every other address, PDFs included, and forwards it', () => {
  const h = readFileSync('out/404.html', 'utf8');
  assert.match(h, /location\.replace\('https:\/\/michael\.boiman\.net\/cv' \+ location\.pathname \+ location\.search \+ location\.hash\)/);
  assert.match(h, /name="robots" content="noindex"/);
});

test('Pages serves the folder as is', () => {
  assert.ok(existsSync('out/.nojekyll'));
  assert.equal(readFileSync('out/robots.txt', 'utf8'), 'User-agent: *\nAllow: /\n');
});

test('no dashes as punctuation in visible text', () => {
  for (const p of [...pages.map(file), 'out/404.html']) {
    const text = readFileSync(p, 'utf8').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(text, /[–—]| -- /, p);
  }
});
