// Writes out/: one redirect page per old CV page, a 404 that forwards any
// other address, and the og images old link previews still fetch.
// The CV moved from mboiman.github.io to michael.boiman.net/cv/.
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const TARGET = 'https://michael.boiman.net/cv';
const pages = readFileSync('pages.txt', 'utf8').split('\n').filter(Boolean);

// GitHub Pages cannot send a 301. The script forwards path, query and hash
// (application links carry ?for=), the meta refresh is the fallback without
// JavaScript and drops the query, so it comes second.
const forward = `<script>location.replace('${TARGET}' + location.pathname + location.search + location.hash)</script>`;

function page({ lang, url, canonical, robots }) {
  const de = lang === 'de';
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${de ? 'Lebenslauf umgezogen' : 'CV moved'} · Michael Boiman</title>
${canonical ? `<link rel="canonical" href="${url}">\n` : ''}${robots ? '<meta name="robots" content="noindex">\n' : ''}${forward}
<meta http-equiv="refresh" content="0; url=${url}">
</head>
<body>
<p>${de ? 'Der Lebenslauf ist umgezogen:' : 'The CV has moved:'} <a href="${url}">${url.replace('https://', '')}</a></p>
</body>
</html>
`;
}

rmSync('out', { recursive: true, force: true });
for (const p of pages) {
  const f = `out${p}index.html`;
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, page({ lang: p.startsWith('/en/') ? 'en' : 'de', url: `${TARGET}${p}`, canonical: true }));
}
writeFileSync('out/404.html', page({ lang: 'de', url: `${TARGET}/`, robots: true }));
writeFileSync('out/robots.txt', 'User-agent: *\nAllow: /\n');
writeFileSync('out/.nojekyll', '');
mkdirSync('out/images', { recursive: true });
for (const img of ['og-card.png', 'og-match-de.png', 'og-match-en.png']) {
  if (existsSync(`images/${img}`)) copyFileSync(`images/${img}`, `out/images/${img}`);
}
console.log(`redirect site: ${pages.length} pages to ${TARGET}/ in out/`);
