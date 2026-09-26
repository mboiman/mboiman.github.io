#!/usr/bin/env node
/**
 * Writes the CV as Jev sees it (src/lib/match.ts, cvEntries) for the live
 * worker, which cannot read config.cv.toml itself. Generated at deploy time by
 * workers/jev-match/wrangler.toml, never committed: a committed copy would be a
 * second CV that drifts from the first one.
 */
import fs from 'node:fs';
import toml from 'toml';
import { cvEntries } from '../src/lib/match.ts';

const config = toml.parse(fs.readFileSync(new URL('../config.cv.toml', import.meta.url), 'utf8'));
const out = new URL('../workers/jev-match/.generated/', import.meta.url);
fs.mkdirSync(out, { recursive: true });
for (const lang of ['de', 'en']) {
  fs.writeFileSync(new URL(`entries.${lang}.json`, out), JSON.stringify(cvEntries(config.languages[lang].params)));
}
console.log('wrote workers/jev-match/.generated/entries.{de,en}.json');
