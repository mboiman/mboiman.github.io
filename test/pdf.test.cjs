// Tests for the application PDFs: the cover letter and the CV must print as one
// sober document. Run with `npm run test:pdf`.
//
// The first block checks the generated HTML (fast, no browser). The last test
// renders a real application with Puppeteer and inspects the PDF itself:
// page counts, the embedded fonts, and the absence of the old web styling.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const toml = require('toml');
const { PDFDocument, PDFDict, PDFName } = require('pdf-lib');

const ROOT = path.join(__dirname, '..');
const { generateHTMLFromConfig, startKey } = require('../scripts/html_to_pdf.js');
const { generateCoverLetterHTML, recipientBlock, letterDate } = require('../scripts/application_to_pdf.js');
const { applyApplicationOverrides, contactDisplay, stripEmoji } = require('../scripts/lib/pdf-theme.js');
const { findDashes } = require('../scripts/lib/visible-text');

const config = toml.parse(fs.readFileSync(path.join(ROOT, 'config.cv.toml'), 'utf8'));
const PHOTO = 'data:image/jpeg;base64,AAAA';
// ©, ® and ™ are Extended_Pictographic too, and belong in names such as "ISTQB®".
const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;

// Styling the old renderers used and a printed business document must not:
// tinted card backgrounds, pills, chips, gradients, serif display type.
const WEB_STYLING = [/linear-gradient/, /border-radius:\s*999px/, /availability-pill/, /skill-tag/, /tech-tag/, /Georgia/, /rgba\(37,\s*99,\s*235/];

function fixture(overrides = {}) {
  return {
    language: 'de',
    company: 'Beispiel Consulting GmbH',
    address: 'Musterstraße 5, 12345 Musterstadt',
    contactPerson: 'Erika Mustermann',
    date: '24. September 2026',
    position: 'Senior Quality Engineer (Kennung 42)',
    greeting: 'Sehr geehrte Frau Mustermann,',
    opening: 'für die Rolle bewerbe ich mich.\n\nZweiter Absatz mit **Betonung**.',
    closing: 'Für Rückfragen stehe ich gern zur Verfügung.',
    signOff: 'Mit freundlichen Grüßen\n\nMichael Boiman',
    contactInfo: { email: 'michael.boiman@example.com', phone: '+49 152 33822623' },
    header: { availability: 'Angestellt bei der Beispiel GmbH' },
    requirements: [
      { requirement: '🎯 M1 Playwright', response: 'Seit 2021 produktiv ✅', cvReference: 'CV: DVAG' },
    ],
    ...overrides,
  };
}

function headerOf(html) {
  const m = html.match(/<header class="doc-header">[\s\S]*?<\/header>/);
  assert.ok(m, 'document has the shared header');
  return m[0];
}

for (const lang of ['de', 'en']) {
  const params = config.languages[lang].params;

  test(`CV [${lang}]: sections in reading order`, async () => {
    const html = await generateHTMLFromConfig(params, PHOTO, lang);
    const order = [params.summary.title, lang === 'de' ? 'Kompetenzen' : 'Competencies', params.experiences.title,
      lang === 'de' ? 'Ausgewählte Projekte' : 'Selected projects', params.education.title, params.language.title];
    let last = -1;
    for (const title of order) {
      const at = html.indexOf(`>${title}</h2>`);
      assert.ok(at > last, `"${title}" comes after the previous section`);
      last = at;
    }
  });

  test(`CV [${lang}]: every skill printed, as text not chips`, async () => {
    const html = await generateHTMLFromConfig(params, PHOTO, lang);
    for (const skill of params.ui.sidebar_skills) {
      assert.ok(html.includes(skill), `skill "${skill}" is printed`);
    }
    for (const re of WEB_STYLING) assert.doesNotMatch(html, re);
  });

  test(`CV [${lang}]: no emoji, no dashes as punctuation`, async () => {
    const html = await generateHTMLFromConfig(params, PHOTO, lang);
    const visible = html.replace(/<style[\s\S]*?<\/style>/g, '');
    assert.doesNotMatch(visible, EMOJI);
    assert.deepEqual(findDashes(html, { includeMeta: false }), []);
  });

  test(`letter [${lang}]: shares the CV header exactly`, async () => {
    const data = fixture({ language: lang });
    const letter = generateCoverLetterHTML(data, params, PHOTO);
    const cv = await generateHTMLFromConfig(applyApplicationOverrides(params, data), PHOTO, lang);
    assert.equal(headerOf(letter), headerOf(cv));
  });
}

test('CV: stations newest start first, earlier positions without a summary column', async () => {
  const html = await generateHTMLFromConfig(config.languages.de.params, PHOTO, 'de');
  const starts = [...html.matchAll(/class="exp-dates">([^<]+)</g)].map((m) => startKey(m[1]));
  assert.ok(starts.length >= 6);
  assert.deepEqual(starts, [...starts].sort((a, b) => b - a));
  assert.doesNotMatch(html, /earlier-summary/);
});

test('startKey reads every date form in the TOML', () => {
  assert.equal(startKey('seit 06/2025'), 202506);
  assert.equal(startKey('08/2021-05/2025'), 202108);
  assert.equal(startKey('2023'), 202300);
});

test('letter: placeholders filled, emoji stripped, web styling gone', () => {
  const html = generateCoverLetterHTML(fixture(), config.languages.de.params, PHOTO);
  assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}/);
  assert.doesNotMatch(html.replace(/<style[\s\S]*?<\/style>/g, ''), EMOJI);
  for (const re of WEB_STYLING) assert.doesNotMatch(html, re);
  assert.match(html, /M1 Playwright/);
  assert.match(html, /Anlage: Lebenslauf, Anforderungsabgleich/);
  assert.match(html, /<strong>Betonung<\/strong>/);
});

test('letter: contactInfo and header overrides reach the letter', () => {
  const html = generateCoverLetterHTML(fixture(), config.languages.de.params, PHOTO);
  const header = headerOf(html);
  assert.match(header, /michael\.boiman@example\.com/);
  assert.doesNotMatch(header, /mboiman@gmail\.com/);
  assert.match(header, /Angestellt bei der Beispiel GmbH/);
  assert.doesNotMatch(header, /verfügbar für neue Projekte/);
});

test('letter: no requirements means no enclosure page', () => {
  const html = generateCoverLetterHTML(fixture({ requirements: [] }), config.languages.de.params, PHOTO);
  assert.doesNotMatch(html, /class="mapping"/);
  assert.match(html, /Anlage: Lebenslauf</);
});

test('letter: "$" in the data survives the template fill', () => {
  const html = generateCoverLetterHTML(fixture({ closing: 'Tagessatz $& 1.000 $1' }), config.languages.de.params, PHOTO);
  assert.ok(html.includes('Tagessatz $&amp; 1.000 $1'));
});

test('recipient block splits street and town', () => {
  assert.equal(
    recipientBlock({ company: 'A GmbH', contactPerson: 'B C', address: 'Weg 1, 76530 Baden-Baden' }),
    'A GmbH<br>B C<br>Weg 1<br>76530 Baden-Baden',
  );
});

test('letter date gets the town once', () => {
  const params = config.languages.de.params;
  assert.equal(letterDate({ date: '24. September 2026' }, params, 'de'), 'Frankfurt am Main, 24. September 2026');
  assert.equal(letterDate({ date: 'Berlin, 1. Mai 2026' }, params, 'de'), 'Berlin, 1. Mai 2026');
});

test('letter date: US-style English date still gets the town', () => {
  const params = config.languages.en.params;
  assert.equal(letterDate({ date: 'April 12, 2026' }, params, 'en'), 'Frankfurt am Main, April 12, 2026');
});

test('emoji stripping keeps ®, © and ™ and paragraph breaks', () => {
  assert.equal(stripEmoji('ISTQB® Certified Tester, Claude™ Code'), 'ISTQB® Certified Tester, Claude™ Code');
  const html = generateCoverLetterHTML(fixture({ opening: 'Satz eins ✅\n\nSatz zwei', signOff: 'Mit freundlichen Grüßen 👋\n\nMichael Boiman' }), config.languages.de.params, PHOTO);
  assert.match(html, /<p>Satz eins<\/p><p>Satz zwei<\/p>/);
  assert.match(html, /Mit freundlichen Grüßen<br><br>Michael Boiman/);
});

test('letter prose is escaped and not rewritten as markdown', () => {
  const html = generateCoverLetterHTML(fixture({
    opening: '1. Oktober 2026 ist ein Start möglich.',
    closing: 'Kurz gesagt:',
    requirements: [{ requirement: 'Java', response: 'Java mit List<String> und Map<K,V>', cvReference: 'CV: DVAG' }],
  }), config.languages.de.params, PHOTO);
  assert.match(html, /<p>1\. Oktober 2026 ist ein Start möglich\.<\/p>/);
  assert.match(html, /<p>Kurz gesagt:<\/p>/);
  assert.match(html, /List&lt;String&gt; und Map&lt;K,V&gt;/);
});

test('overrides never mutate the parsed TOML', () => {
  const params = config.languages.de.params;
  const before = JSON.stringify(params);
  applyApplicationOverrides(params, fixture());
  assert.equal(JSON.stringify(params), before);
});

test('contacts print as readable addresses', () => {
  assert.equal(contactDisplay({ url: 'mailto:a@b.de', title: 'x' }), 'a@b.de');
  assert.equal(contactDisplay({ url: 'https://www.linkedin.com/in/mboiman/', title: 'michael-boiman' }), 'linkedin.com/in/mboiman');
  assert.equal(contactDisplay({ url: 'tel:+49152', title: '+49 152' }), '+49 152');
  assert.equal(stripEmoji('🎯 Ziel ✅'), 'Ziel');
});

test('rendered application: one font family, sane page counts', { timeout: 240000 }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-test-'));
  try {
    const json = path.join(dir, 'letter.json');
    fs.writeFileSync(json, JSON.stringify(fixture()));
    const out = path.join(dir, 'application.pdf');
    execFileSync(path.join(ROOT, 'scripts', 'generate_application.sh'), ['config.cv.toml', out, 'de', json], { cwd: ROOT, stdio: 'pipe' });

    const pdfLetter = path.join(dir, 'letter.pdf');
    execFileSync('node', ['scripts/application_to_pdf.js', 'config.cv.toml', pdfLetter, 'de', json], { cwd: ROOT, stdio: 'pipe' });
    const letterPages = (await PDFDocument.load(fs.readFileSync(pdfLetter))).getPageCount();
    assert.equal(letterPages, 2, 'letter page plus one requirements page');

    const total = (await PDFDocument.load(fs.readFileSync(out))).getPageCount();
    const cvPages = total - letterPages;
    assert.ok(cvPages >= 3 && cvPages <= 5, `CV has ${cvPages} pages, expected 3 to 5`);

    // Every font dictionary in the combined file, read through pdf-lib because
    // the objects sit in compressed object streams.
    const doc = await PDFDocument.load(fs.readFileSync(out));
    const fonts = new Set();
    for (const [, obj] of doc.context.enumerateIndirectObjects()) {
      if (!(obj instanceof PDFDict)) continue;
      if (obj.get(PDFName.of('Type')) !== PDFName.of('Font')) continue;
      const base = obj.get(PDFName.of('BaseFont'));
      if (base) fonts.add(base.asString().replace(/^\//, '').replace(/^[A-Z]{6}\+/, ''));
    }
    assert.ok(fonts.size > 0, 'fonts found');
    for (const f of fonts) assert.match(f, /^IBMPlexSans/, `unexpected font ${f}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
