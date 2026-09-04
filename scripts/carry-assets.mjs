#!/usr/bin/env node
/**
 * Carry the previous build's CSS and JS forward by exactly one generation.
 *
 * THE FAILURE THIS FIXES, measured on 2026-09-04 right after PR #83 went live:
 * GitHub Pages answers every HTML request with `cache-control: max-age=600`,
 * and Astro renames a stylesheet or a script whenever its content changes. For
 * up to ten minutes after a deploy the edge therefore serves the PREVIOUS
 * HTML, which names files the deploy has just deleted. Checked against the
 * previous published build:
 *
 *   404  /_astro/CVPage.Dw2WzeVR.css
 *   404  /_astro/AgentWidget.astro_astro_type_script_index_0_lang.DJcCax8t.js
 *
 * Two of the three code assets gone, so a visitor in that window got the page
 * without its stylesheet and the chat without its script. The pictures survived
 * because their hashes had not changed, which is why it reads as "the layout
 * broke" rather than "the site is down". A visitor's own browser cache extends
 * the window past those ten minutes.
 *
 * WHY NOT `keep_files: true`. peaceiris/actions-gh-pages can simply stop
 * deleting, and that would fix this in one line. It is the wrong line for THIS
 * repo: on 2026-08-07 three screenshots were removed from the working tree
 * because of what was visible in them. A deploy that never deletes would keep
 * every withdrawn picture reachable forever. Deletion has to keep working for
 * the files where it matters, so this script carries CODE only and never an
 * image. The cost is that a picture which changed hash can 404 inside the same
 * window; a missing picture is a cosmetic fault, a picture that cannot be
 * withdrawn is not.
 *
 * EXACTLY ONE GENERATION, and that is what the manifest is for. Carrying
 * "whatever is on the branch but not in the new build" would accumulate every
 * asset the site ever had, deploy after deploy. So each run records what it
 * carried in `_astro/carried.json`, and the next run refuses to carry anything
 * named there: a file gets one deploy of grace, which is longer than the cache
 * window it exists for, and then it goes.
 *
 * Runs AFTER `npm run build` on purpose. The build's own guard
 * (scripts/check-output.mjs) then measures a clean tree, and the carried files
 * arrive afterwards as extras that no page references.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const REF = process.env.CARRY_REF ?? 'origin/gh-pages';
const DIST = process.env.CARRY_DIST ?? 'dist';
const ASSETS = '_astro';
const MANIFEST = 'carried.json';
const CARRIED_TYPES = /\.(css|js)$/;

const git = (args, opts = {}) =>
  execFileSync('git', args, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, ...opts });

const gitText = (args) => git(args).toString('utf8');

/** Every path under _astro/ on the published branch, or null if there is no branch yet. */
function publishedAssets() {
  try {
    git(['rev-parse', '--verify', `${REF}^{commit}`], { stdio: 'pipe' });
  } catch {
    return null; // first ever deploy, or the branch was not fetched
  }
  const out = gitText(['ls-tree', '--name-only', REF, `${ASSETS}/`]);
  return out.split('\n').filter(Boolean).map((p) => p.slice(ASSETS.length + 1));
}

/** What the PREVIOUS run carried. Those files have had their generation. */
function previouslyCarried() {
  try {
    // stderr silenced: on the very first run the manifest does not exist yet and
    // git says so with a `fatal:` line. That is the expected path, not a failure,
    // and an unexplained `fatal:` in a deploy log is worse than no line at all.
    const raw = git(['show', `${REF}:${ASSETS}/${MANIFEST}`], {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString('utf8');
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed.files) ? parsed.files : []);
  } catch {
    return new Set(); // no manifest yet: everything on the branch is a real previous build
  }
}

const published = publishedAssets();
if (published === null) {
  console.log('carry-assets: no published branch yet, nothing to carry.');
  process.exit(0);
}

const distAssets = join(DIST, ASSETS);
if (!existsSync(distAssets)) mkdirSync(distAssets, { recursive: true });
const fresh = new Set(readdirSync(distAssets));
const stale = previouslyCarried();

const carry = published.filter(
  (name) => CARRIED_TYPES.test(name) && !fresh.has(name) && !stale.has(name),
);

let bytes = 0;
for (const name of carry) {
  const blob = git(['show', `${REF}:${ASSETS}/${name}`]);
  writeFileSync(join(distAssets, name), blob);
  bytes += blob.length;
}

writeFileSync(
  join(distAssets, MANIFEST),
  `${JSON.stringify({ files: carry, note: 'One deploy of grace for cached HTML. See scripts/carry-assets.mjs.' }, null, 2)}\n`,
);

const dropped = published.filter((n) => CARRIED_TYPES.test(n) && !fresh.has(n) && stale.has(n));
console.log(
  `carry-assets: carried ${carry.length} file(s), ${Math.round(bytes / 1024)} kB` +
    (carry.length ? `: ${carry.join(', ')}` : '') +
    (dropped.length ? ` | dropped after their generation: ${dropped.join(', ')}` : ''),
);
