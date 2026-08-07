/**
 * Fail the build when a language branch is missing a key, when the two branches
 * disagree, or when the act budget is broken.
 *
 * This exists because a cleanup pass silently deleted eight keys from BOTH
 * branches (storyRole, the proof labels, the aria labels). Astro does not
 * type-check at build time, so the build stayed green and the labels simply
 * rendered as empty strings on the live page.
 */
import { i18n } from '../src/lib/i18n.ts';

const MAX_BULLET_WORDS = 8;
const MAX_BULLETS = 5;
const errors = [];

const [de, en] = [i18n.de, i18n.en];
const keys = new Set([...Object.keys(de), ...Object.keys(en)]);
for (const k of keys) {
  if (!(k in de)) errors.push(`de is missing key: ${k}`);
  if (!(k in en)) errors.push(`en is missing key: ${k}`);
  for (const [name, br] of [['de', de], ['en', en]]) {
    const v = br[k];
    if (v === undefined || v === null) errors.push(`${name}.${k} is ${v}`);
    if (typeof v === 'string' && v.trim() === '') errors.push(`${name}.${k} is empty`);
  }
}

if (de.acts.length !== en.acts.length) {
  errors.push(`act count differs: de=${de.acts.length} en=${en.acts.length}`);
}

for (const [name, br] of [['de', de], ['en', en]]) {
  br.acts.forEach((a, i) => {
    if (a.bullets.length > MAX_BULLETS) errors.push(`${name}.acts[${i}] ${a.id}: ${a.bullets.length} bullets > ${MAX_BULLETS}`);
    a.bullets.forEach((b) => {
      const n = b.split(/\s+/).length;
      if (n > MAX_BULLET_WORDS) errors.push(`${name}.acts[${i}] ${a.id}: bullet has ${n} words > ${MAX_BULLET_WORDS}: "${b}"`);
    });
    const blob = [a.eyebrow, a.headline, ...a.bullets, a.hook ?? '', a.anchor?.label ?? ''].join(' ');
    if (/[—–]/.test(blob)) errors.push(`${name}.acts[${i}] ${a.id}: dash used as punctuation`);
    if (a.anchor && a.anchor.state === 'closed' && !a.anchor.note) errors.push(`${name}.acts[${i}] ${a.id}: closed anchor without a reason`);
  });
  if (br.acts[0].id !== de.acts[0].id) errors.push(`${name}: act order differs from de`);
}

if (errors.length) {
  console.error('i18n check failed:');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}
console.log(`i18n check ok: ${de.acts.length} acts, ${keys.size} keys, both branches complete`);
