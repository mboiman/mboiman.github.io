// Tests for the GitHub profile README. Run with `npm run test:profile`.
// profile-README.md is rendered from profile-README.template.md and the English
// part of config.cv.toml. It is a fourth output next to website, PDF and agent
// card, so a correction to the CV must reach it too: the committed file has to
// match a fresh render, and every stack chip has to exist in the CV.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import toml from 'toml';
import { render } from '../scripts/profile-readme.mjs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const config = toml.parse(read('config.cv.toml'));
const ui = config.languages.en.params.ui;

test('committed profile-README.md matches a fresh render', () => {
  assert.equal(read('profile-README.md'), render(config, read('profile-README.template.md')),
    'profile-README.md is stale: run `npm run profile:readme` and copy it to mboiman/mboiman');
});

test('availability comes from the CV', () => {
  assert.match(render(config, '{{availability}}'), new RegExp(`^${ui.availability}$`));
});

test('a stack chip that is not in the English sidebar_skills fails', () => {
  assert.throws(() => render(config, '{{stack: Python | Fine-tuning}}'), /Fine-tuning/);
});

test('stack chips are joined in the given order', () => {
  assert.equal(render(config, '{{stack: TypeScript | Python}}'), 'TypeScript · Python');
});

test('an unknown placeholder fails instead of shipping braces', () => {
  assert.throws(() => render(config, '{{nope}}'), /nope/);
});

test('no dashes as punctuation and no counters in the rendered README', () => {
  const out = read('profile-README.md');
  assert.doesNotMatch(out, /[–—]/, 'en or em dash in profile-README.md');
  assert.doesNotMatch(out, /\d+\s*\+\s*(years|repos|skills)|\d+\s*%/i, 'counter or percentage');
});
