/**
 * Every font size and every corner radius on the CV page comes from a token.
 *
 * Why this exists. On 2026-09-06 the page carried thirteen distinct fixed font
 * sizes between 9.28px and 16px, and three of the pairs were indistinguishable:
 * 0.8125rem and text-[13px] are the same number written twice, 0.82rem and 13px
 * differ by 0.12px, 0.8rem and 12px by 0.8px. Radii were 0.4 / 0.5 / 0.65 /
 * 0.75 / 0.9rem. None of that is design; it is what five pull requests leave
 * behind when each one picks a value that looks right next to the one before it.
 *
 * A ladder alone would drift back on the next pull request, so it is checked
 * rather than agreed. The rungs live in global.css as --fs-* and --r-*.
 *
 * Scope is the CV page. The presentation has its own visual system and is not
 * covered here; widening the scope means snapping its values first.
 *
 * Allowed on purpose:
 *   clamp(...)  a size that has to scale with the viewport
 *   <n>em       a marker sized against the element it belongs to, not the page
 *   var(--fs-*) / var(--r-*)
 */
import { readFileSync } from 'node:fs';

const FILE = 'src/components/CVPage.astro';
const src = readFileSync(FILE, 'utf8');
const lines = src.split('\n');

const failures = [];
const at = (index) => index + 1;

const okFontSize = (value) =>
  value.startsWith('var(--fs-') ||
  value.startsWith('clamp(') ||
  /^\d*\.?\d+em$/.test(value);

const okRadius = (value) =>
  value.startsWith('var(--r-') || value === 'inherit';

lines.forEach((line, index) => {
  const font = line.match(/font-size:\s*([^;]+);/);
  if (font && !okFontSize(font[1].trim())) {
    failures.push(`${FILE}:${at(index)}  font-size: ${font[1].trim()}  → use a --fs-* token`);
  }

  const radius = line.match(/border-radius:\s*([^;]+);/);
  if (radius && !okRadius(radius[1].trim())) {
    failures.push(`${FILE}:${at(index)}  border-radius: ${radius[1].trim()}  → use a --r-* token`);
  }

  // Arbitrary Tailwind sizes in the markup are the same magic number, just
  // spelled in a class. text-[clamp(...)] and text-[var(--...)] stay.
  for (const hit of line.matchAll(/\btext-\[\d*\.?\d+(?:px|rem)\]/g)) {
    failures.push(`${FILE}:${at(index)}  ${hit[0]}  → use an fs-* class`);
  }
  for (const hit of line.matchAll(/\brounded-\[[^\]]+\]/g)) {
    failures.push(`${FILE}:${at(index)}  ${hit[0]}  → use a Tailwind radius step or a --r-* token`);
  }
});

if (failures.length) {
  console.error(`✗ ${failures.length} value(s) outside the scale:\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  console.error('\nRungs: --fs-10 --fs-11 --fs-12 --fs-13 --fs-14 --fs-15 --fs-16');
  console.error('       --r-xs --r-sm --r-md --r-lg --r-pill');
  process.exit(1);
}

console.log('✓ every font size and radius on the CV page is on the scale');
