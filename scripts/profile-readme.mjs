// Renders profile-README.md (the GitHub profile page, repo mboiman/mboiman) from
// profile-README.template.md and the English part of config.cv.toml.
//
//   node scripts/profile-readme.mjs          write profile-README.md
//   node scripts/profile-readme.mjs --check  exit 1 when the file is stale
//
// Placeholders:
//   {{tagline}}        languages.en.params.ui.tagline
//   {{availability}}   languages.en.params.ui.availability
//   {{stack: A | B}}   chips joined with " · "; each one must be an exact entry
//                      of languages.en.params.ui.sidebar_skills, so the profile
//                      never names a skill the CV does not carry.
import fs from 'node:fs';
import toml from 'toml';
import { fileURLToPath } from 'node:url';

export function render(config, template) {
  const ui = config.languages.en.params.ui;
  const skills = new Set(ui.sidebar_skills);
  // The template's leading note is for editors of the template, not for readers.
  return template.replace(/^<!--[\s\S]*?-->\n/, '').replace(/\{\{\s*([a-z]+)\s*(?::([^}]*))?\}\}/g, (_, key, arg) => {
    if (key === 'tagline') return ui.tagline;
    if (key === 'availability') return ui.availability;
    if (key === 'stack') {
      const chips = (arg || '').split('|').map((s) => s.trim()).filter(Boolean);
      const missing = chips.filter((c) => !skills.has(c));
      if (missing.length) throw new Error(`stack chip not in en sidebar_skills: ${missing.join(', ')}`);
      return chips.join(' · ');
    }
    throw new Error(`unknown placeholder {{${key}}}`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const at = (p) => new URL(`../${p}`, import.meta.url);
  const out = render(toml.parse(fs.readFileSync(at('config.cv.toml'), 'utf8')),
    fs.readFileSync(at('profile-README.template.md'), 'utf8'));
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(at('profile-README.md'), 'utf8') !== out) {
      console.error('profile-README.md is stale: run `npm run profile:readme`');
      process.exit(1);
    }
  } else {
    fs.writeFileSync(at('profile-README.md'), out);
  }
}
