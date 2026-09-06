/**
 * Every font size and every corner radius on this site comes from a token.
 *
 * Why this exists. On 2026-09-06 the CV page carried thirteen distinct fixed
 * font sizes between 9.28px and 16px, and three of the pairs were
 * indistinguishable: 0.8125rem and text-[13px] are the same number written
 * twice, 0.82rem and 13px differ by 0.12px, 0.8rem and 12px by 0.8px. Radii
 * were 0.4 / 0.5 / 0.65 / 0.75 / 0.9rem. None of that is design; it is what a
 * run of pull requests leaves behind when each one picks a value that looks
 * right next to the one before it.
 *
 * The first pass covered the CV page alone. Counted right after, the rest of
 * the site still held 101 such values: 54 in the agent widget, 27 in the
 * presentation's stylesheet, 16 in its component, 4 in the shared sheet. The
 * largest single correction was 0.8px. That is the point: these are differences
 * nobody can see, and every one of them was a decision somebody had to make.
 *
 * A ladder alone would drift back on the next pull request, so it is checked
 * rather than agreed. The rungs live in global.css as --fs-* and --r-*.
 *
 * Allowed on purpose, and each for a reason rather than convenience:
 *   clamp(...)   a size that has to scale with the viewport, which the
 *                presentation's type is built on
 *   <n>em        a marker or glyph sized against the element it belongs to,
 *                not against the page
 *   <n>pt        print, where a physical unit is the correct one
 *   0            a square corner is not a radius
 *   var(--fs-*) / var(--r-*)
 */
import { readFileSync } from 'node:fs';

const FILES = [
  'src/components/CVPage.astro',
  'src/components/StoryPage.astro',
  'src/components/AgentWidget.astro',
  'src/styles/global.css',
  'src/styles/story.css',
];

const okFontSize = (value) =>
  value.startsWith('var(--fs-') ||
  value.startsWith('clamp(') ||
  /^\d*\.?\d+em$/.test(value) ||
  /^\d*\.?\d+pt$/.test(value);

// A radius may be a list ("0 6px 6px 0"), so every part has to hold on its own.
const okRadius = (value) =>
  value === 'inherit' ||
  value.split(/\s+/).every((part) => part === '0' || part.startsWith('var(--r-'));

const failures = [];

for (const file of FILES) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    const where = `${file}:${index + 1}`;

    for (const hit of line.matchAll(/font-size:\s*([^;]+);/g)) {
      const value = hit[1].trim();
      if (!okFontSize(value)) failures.push(`${where}  font-size: ${value}  → use a --fs-* token`);
    }

    for (const hit of line.matchAll(/border-radius:\s*([^;]+);/g)) {
      const value = hit[1].trim();
      if (!okRadius(value)) failures.push(`${where}  border-radius: ${value}  → use a --r-* token`);
    }

    // Arbitrary Tailwind sizes in the markup are the same magic number, just
    // spelled in a class. text-[clamp(...)] and text-[var(--...)] stay.
    for (const hit of line.matchAll(/\btext-\[\d*\.?\d+(?:px|rem)\]/g)) {
      failures.push(`${where}  ${hit[0]}  → use an fs-* class`);
    }
    for (const hit of line.matchAll(/\brounded-\[[^\]]+\]/g)) {
      failures.push(`${where}  ${hit[0]}  → use a Tailwind radius step or a --r-* token`);
    }
  });
}

if (failures.length) {
  console.error(`✗ ${failures.length} value(s) outside the scale:\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  console.error('\nRungs: --fs-10 --fs-11 --fs-12 --fs-13 --fs-14 --fs-15 --fs-16');
  console.error('       --r-xs --r-sm --r-md --r-lg --r-xl --r-pill');
  process.exit(1);
}

console.log(`✓ every font size and radius is on the scale (${FILES.length} files)`);
