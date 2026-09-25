const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const toml = require('toml');
const sharp = require('sharp');
const { formatTextToParagraphs } = require('./lib/markdown-utils');
const { findDashes } = require('./lib/visible-text');
const { fontFaceCss, BASE_CSS, renderHeader, footerTemplate, applyApplicationOverrides } = require('./lib/pdf-theme');
const { groupedSkills } = require('../src/lib/skill-groups.ts');

// Verification anchors come from config.cv.toml (ui.impact_metrics). There is
// deliberately NO hardcoded fallback here: the previous one held '40+ Skills' and
// '20+ Repos orchestriert' and would have quietly reintroduced them into the PDF
// the moment the TOML field went missing. Fail loudly instead.

// Which projects reach the PDF, and in which order, is declared in
// config.cv.toml as `pdf_rank` on the project itself. This used to be a
// hardcoded TOP_PROJECTS list right here, matched against titles by substring,
// and it silently decided the PDF's contents from a second place. A project
// added to the TOML could never appear, however correct its entry was: that is
// exactly what happened to the voice-assistant project on 2026-08-21. The list
// also disagreed with itself — the comment said "top 8", the array held 9, and
// the code took slice(0, 4), so ranks 5 to 9 never rendered at all.

/**
 * Determine experience tier based on start date, unless the experience
 * declares an explicit pdf_tier override.
 * Tier 1 (full): 2024+, Tier 2 (medium): 2017-2023, Tier 3 (compact): pre-2017
 */
function getExperienceTier(exp) {
  if (exp.pdf_tier) return exp.pdf_tier;
  const dates = exp.dates;
  // Match "06/2025", "08/2021 – 05/2025", or "2023"
  const slashMatch = dates.match(/(\d{2})\/(\d{4})/);
  if (slashMatch) {
    const year = parseInt(slashMatch[2]);
    if (year >= 2024) return 'full';
    if (year >= 2017) return 'medium';
    return 'compact';
  }
  const yearMatch = dates.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 2024) return 'full';
    if (year >= 2017) return 'medium';
    return 'compact';
  }
  return 'medium'; // fallback
}

/**
 * Truncate for full tier: keep intro + first N bullets of Schwerpunkte + tools.
 */
function truncateToFull(details, maxBullets = 5) {
  if (!details) return '';
  const lines = details.split('\n');
  const introLines = [];
  const schwerpunktLines = [];
  const toolLines = [];
  let inSchwerpunkte = false;
  let inTools = false;
  let bulletCount = 0;

  const schwerpunktePattern = /^\*\*(Schwerpunkte|Key [Rr]esponsibilities|Workshop-Inhalte|Workshop Content|Präsentationsinhalte|Presentation content|Praktischer|Practical|Hauptverantwortlichkeiten|Projekte\b|Energiesektor|Energy Sector|Quantifizierbare|Quantifiable|Technische Lösungen|Focus areas|Key Focus|Key responsibilities)/;
  const toolPattern = /^\*\*(Tools|Technologien|Technologies|Eingesetzte|Technical Stack|Technischer)/;

  for (const line of lines) {
    if (line.match(schwerpunktePattern)) {
      inSchwerpunkte = true;
      inTools = false;
      schwerpunktLines.push(line);
      continue;
    }
    if (line.match(toolPattern)) {
      inSchwerpunkte = false;
      inTools = true;
      toolLines.push(line);
      continue;
    }
    if (!inSchwerpunkte && !inTools) {
      introLines.push(line);
    } else if (inSchwerpunkte) {
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        bulletCount++;
        if (bulletCount <= maxBullets) schwerpunktLines.push(line);
      } else {
        schwerpunktLines.push(line);
      }
    } else if (inTools) {
      toolLines.push(line);
    }
  }

  const parts = [introLines.join('\n').trim()];
  if (schwerpunktLines.length > 0) parts.push(schwerpunktLines.join('\n').trim());
  if (toolLines.length > 0) parts.push(toolLines.join('\n').trim());
  return parts.filter(Boolean).join('\n\n');
}

/**
 * Truncate experience details to intro + tools for medium tier.
 * Removes "Schwerpunkte"/"Key Responsibilities" sections, keeps intro + tools.
 */
function truncateToMedium(details) {
  if (!details) return '';
  const lines = details.split('\n');
  const introLines = [];
  const toolLines = [];
  let inSchwerpunkte = false;
  let inTools = false;

  const schwerpunktePattern = /^\*\*(Schwerpunkte|Key [Rr]esponsibilities|Workshop-Inhalte|Workshop Content|Präsentationsinhalte|Presentation content|Praktischer|Practical|Hauptverantwortlichkeiten|Projekte\b|Energiesektor|Energy Sector|Quantifizierbare|Quantifiable|Technische Lösungen|Focus areas|Key Focus|Key responsibilities)/;
  const toolPattern = /^\*\*(Tools|Technologien|Technologies|Eingesetzte|Technical Stack|Technischer)/;

  for (const line of lines) {
    if (line.match(schwerpunktePattern)) {
      inSchwerpunkte = true;
      inTools = false;
      continue;
    }
    if (line.match(toolPattern)) {
      inSchwerpunkte = false;
      inTools = true;
      toolLines.push(line);
      continue;
    }
    if (!inSchwerpunkte && !inTools) {
      introLines.push(line);
    } else if (inTools) {
      toolLines.push(line);
    }
  }

  let intro = introLines.join('\n').trim();
  // Limit intro to ~60 words
  const introWords = intro.split(/\s+/);
  if (introWords.length > 60) {
    intro = introWords.slice(0, 60).join(' ') + '...';
  }

  const tools = toolLines.join('\n').trim();
  return tools ? intro + '\n\n' + tools : intro;
}

/**
 * Detect if an experience entry is a workshop/presentation (not a regular position)
 */
const TALK_PATTERNS = require('./lib/talk-patterns.json');
const TALK_POSITION_RE = new RegExp(TALK_PATTERNS.position.join('|'), 'i');
const TALK_COMPANY_RE = new RegExp(TALK_PATTERNS.company.join('|'), 'i');

// Mirrors src/lib/experience.ts. Both read scripts/lib/talk-patterns.json, so a
// new pattern reaches BOTH renderers. The two hand-kept copies this replaces had
// already drifted apart.
function isWorkshopOrPresentation(exp) {
  return TALK_POSITION_RE.test(exp.position || '') || TALK_COMPANY_RE.test(exp.company || '');
}


/**
 * Truncate a project description to approximately maxWords words, without ever
 * cutting mid-sentence. Splits into lines, then into sentences within each line,
 * and stops as soon as adding the next sentence would exceed the budget — but
 * always keeps at least one full sentence. Strips a dangling unpaired ** marker
 * and appends an ellipsis when content was actually cut.
 */
function truncateProjectDescription(text, maxWords = 70) {
  if (!text) return '';
  const lines = text.split('\n');
  const outputLines = [];
  let wordCount = 0;
  let truncated = false;

  outer:
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      outputLines.push(line);
      continue;
    }
    // Split into sentences so a cut can never land mid-sentence.
    const sentences = trimmedLine.match(/[^.!?]+[.!?]*(\s|$)/g) || [trimmedLine];
    let lineOut = '';
    for (const sentence of sentences) {
      const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 0 && wordCount + sentenceWords > maxWords) {
        truncated = true;
        break outer;
      }
      lineOut += sentence;
      wordCount += sentenceWords;
    }
    outputLines.push(lineOut.trimEnd());
  }

  let result = outputLines.join('\n').trim();

  if (truncated) {
    const starCount = (result.match(/\*\*/g) || []).length;
    if (starCount % 2 !== 0) {
      result = result.replace(/\*\*([^*]*)$/, '$1').trimEnd();
    }
    result = result.replace(/[\s.,;:–—-]+$/, '') + '…';
  }

  return result;
}

/**
 * The PDF's project selection, read from the TOML. A project takes part by
 * carrying a numeric `pdf_rank`; the rank is the order. No fallback and no
 * silent empty result: an unranked config is a config error, and the same
 * "fail loudly" rule already governs the verification anchors above.
 *
 * There is deliberately no cap in here and none at the call site either. The
 * hardcoded predecessor took slice(0, 4) and silently dropped everything below
 * rank five, which is why a project could be ranked and still be missing from
 * the PDF. How many projects belong in the document is a content decision and
 * lives in config.cv.toml; the only split downstream is between the page-one
 * column and the full-width overflow row, and both halves are rendered.
 */
function rankedProjects(langConfig, targetLang) {
  const ranked = (langConfig.projects.list || [])
    .filter(p => Number.isFinite(p.pdf_rank))
    .sort((a, b) => a.pdf_rank - b.pdf_rank);
  if (!ranked.length) {
    throw new Error(
      `config.cv.toml [${targetLang}]: no project carries pdf_rank, so the PDF would ` +
      'ship without a projects section. Add pdf_rank = <n> to the projects that belong in it.'
    );
  }
  const seen = new Set();
  for (const p of ranked) {
    if (seen.has(p.pdf_rank)) {
      throw new Error(`config.cv.toml [${targetLang}]: pdf_rank ${p.pdf_rank} is used twice ("${p.title}").`);
    }
    seen.add(p.pdf_rank);
  }
  return ranked;
}

/**
 * Start of a date range as a sortable number (YYYYMM). "seit 06/2025",
 * "08/2021-05/2025" and "2023" all work; unknown formats sort last.
 */
function startKey(dates) {
  const m = String(dates || '').match(/(\d{2})\/(\d{4})/);
  if (m) return parseInt(m[2], 10) * 100 + parseInt(m[1], 10);
  const y = String(dates || '').match(/(\d{4})/);
  return y ? parseInt(y[1], 10) * 100 : 0;
}

// Function to generate HTML content from TOML configuration.
//
// Layout (2026-09-24): one column, in the order a recruiter reads a CV:
// profile, competencies, experience, selected projects, talks, education and
// languages. The earlier layout put projects before experience and packed
// skills, education and languages into a 30 % sidebar; the sidebar ran longer
// than the column beside it and pushed a nearly empty page into every PDF,
// while professional experience only started on page three. All styling that
// the cover letter shares lives in scripts/lib/pdf-theme.js.
async function generateHTMLFromConfig(langConfig, profileImageData, targetLang) {
  const lang = targetLang || 'de';
  const de = lang === 'de';

  // Verification anchors, sourced from TOML only (see the note at the top).
  const metrics = langConfig.ui.impact_metrics;
  if (!Array.isArray(metrics) || metrics.length === 0) {
    throw new Error(`config.cv.toml: languages.${lang}.params.ui.impact_metrics is missing or empty`);
  }
  const anchorsHtml = metrics.map(m => `
      <div class="anchor">
        <div class="anchor-key">${m.metric}</div>
        <div class="anchor-label">${m.label}</div>
        <div class="anchor-detail">${m.url ? `<a href="${m.url}">${m.detail}</a>` : m.detail}</div>
      </div>`).join('');

  // Competencies: the same grouping the website uses, printed as labelled
  // lines instead of chips.
  const skillGroups = groupedSkills(langConfig.ui.sidebar_skills || [], lang);
  const skillsHtml = skillGroups.map(g => `
      <div class="skill-row">
        <div class="skill-group">${g.title}</div>
        <div class="skill-items">${g.items.join(', ')}</div>
      </div>`).join('');

  // Experience, with the 3-tier truncation and workshops split off.
  const fullExperiences = [];
  const mediumExperiences = [];
  const compactExperiences = [];
  const workshopExperiences = [];
  langConfig.experiences.list.forEach(exp => {
    if (isWorkshopOrPresentation(exp)) {
      workshopExperiences.push(exp);
      return;
    }
    const tier = getExperienceTier(exp);
    if (tier === 'full') fullExperiences.push(exp);
    else if (tier === 'medium') mediumExperiences.push(exp);
    else compactExperiences.push(exp);
  });

  // Newest start first, across both tiers: the tier decides how much of a
  // station prints, never where it stands. The TOML order is the website's.
  // A medium station is short, so it never splits across a page; before, the
  // tool list of one landed alone at the top of the next page.
  const byStart = (a, b) => startKey(b.dates) - startKey(a.dates);
  const renderExperience = (exp, details, keep) => `
      <div class="exp${keep ? ' keep' : ''}">
        <div class="exp-head">
          <div class="exp-title">${exp.position}</div>
          <div class="exp-dates">${exp.dates}</div>
        </div>
        <div class="exp-company">${exp.company}</div>
        <div class="exp-details">${formatTextToParagraphs(details)}</div>
      </div>`;

  const stationsHtml = [...fullExperiences, ...mediumExperiences].sort(byStart).map(exp => fullExperiences.includes(exp)
    ? renderExperience(exp, truncateToFull(exp.details || '', 4), false)
    : renderExperience(exp, truncateToMedium(exp.details || ''), true)).join('');
  compactExperiences.sort(byStart);

  const compactExpHtml = compactExperiences.length > 0 ? `
      <table class="earlier">
        ${compactExperiences.map(exp => `
          <tr>
            <td class="earlier-dates">${exp.dates}</td>
            <td class="earlier-role"><strong>${exp.position}</strong><br><span class="muted">${exp.company}</span></td>
          </tr>`).join('')}
      </table>` : '';

  // Projects, in the order config.cv.toml declares via pdf_rank.
  const projectsHtml = rankedProjects(langConfig, targetLang).map(project => {
    const tech = project.tech_stack ? project.tech_stack.slice(0, 5).join(' · ') : '';
    const descriptionSource = project.tagline_pdf
      ? project.tagline_pdf.trim()
      : truncateProjectDescription(project.tagline, 70);
    return `
      <div class="project">
        <div class="project-title">${project.title}</div>
        ${tech ? `<div class="project-tech">${tech}</div>` : ''}
        <div class="project-body">${formatTextToParagraphs(descriptionSource)}</div>
      </div>`;
  }).join('');

  const workshopHtml = workshopExperiences.map(exp => `
      <tr>
        <td class="earlier-dates">${exp.dates}</td>
        <td><strong>${exp.position}</strong><br><span class="muted">${exp.company}</span></td>
      </tr>`).join('');

  const educationHtml = langConfig.education.list.map(edu => `
      <tr>
        <td class="earlier-dates">${edu.dates}</td>
        <td><strong>${edu.degree}</strong>${edu.college ? `<br><span class="muted">${edu.college}</span>` : ''}</td>
      </tr>`).join('');

  const languageHtml = langConfig.language.list.map(l => `
      <tr><td><strong>${l.language}</strong></td><td class="muted">${l.level}</td></tr>`).join('');

  const t = {
    skills: de ? 'Kompetenzen' : 'Competencies',
    earlier: de ? 'Frühere Positionen' : 'Earlier positions',
    projects: de ? 'Ausgewählte Projekte' : 'Selected projects',
    talks: de ? 'Vorträge & Workshops' : 'Talks & workshops',
  };

  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="utf-8">
    <title>${langConfig.profile.name}, ${de ? 'Lebenslauf' : 'CV'}</title>
    <style>
        ${fontFaceCss()}
        ${BASE_CSS}

        body { font-size: 9pt; line-height: 1.45; }
        .muted { color: var(--muted); }

        .profile p { margin-bottom: 2mm; }

        .anchors {
            display: grid; grid-template-columns: repeat(3, 1fr);
            column-gap: 6mm; margin-top: 3mm;
            padding: 2.5mm 0; border-top: 0.5pt solid var(--rule-soft); border-bottom: 0.5pt solid var(--rule-soft);
        }
        .anchor-key { font-size: 9.5pt; font-weight: 600; color: var(--ink); }
        .anchor-label { font-size: 8pt; color: var(--text); }
        .anchor-detail { font-size: 7.5pt; color: var(--muted); }

        .skill-row { display: grid; grid-template-columns: 38mm 1fr; column-gap: 4mm; padding: 1mm 0; }
        .skill-group { font-weight: 600; color: var(--ink); }
        .skill-items { color: var(--text); }

        .exp { margin-bottom: 4.5mm; }
        .exp-head { display: grid; grid-template-columns: 1fr auto; column-gap: 4mm; align-items: baseline; break-after: avoid; page-break-after: avoid; }
        .exp-title { font-size: 10pt; font-weight: 600; color: var(--ink); }
        .exp-dates { font-size: 8.5pt; color: var(--muted); white-space: nowrap; }
        .exp-company { font-size: 9pt; color: var(--accent); margin: 0.3mm 0 1.5mm 0; break-after: avoid; page-break-after: avoid; }
        .exp-details { font-size: 8.2pt; orphans: 3; widows: 3; }
        .exp-details p { margin-bottom: 1.5mm; }
        .exp-details ul, .project-body ul { margin: 0.5mm 0 2mm 4mm; padding: 0; }
        .exp-details li, .project-body li { margin-bottom: 0.8mm; }
        .exp-details ul:last-of-type { columns: 2; column-gap: 6mm; break-inside: avoid-page; }
        .exp-details p:has(+ ul) { break-after: avoid; page-break-after: avoid; margin-bottom: 0.5mm; }

        table { width: 100%; border-collapse: collapse; }
        tr { break-inside: avoid; page-break-inside: avoid; }
        td { vertical-align: top; padding: 1.2mm 0; border-bottom: 0.5pt solid var(--rule-soft); }
        tr:last-child td { border-bottom: none; }
        .earlier { font-size: 8.5pt; }
        .earlier-dates { width: 30mm; color: var(--muted); white-space: nowrap; padding-right: 4mm; }
        .subhead { font-size: 8.5pt; font-weight: 600; color: var(--muted); margin: 3mm 0 1mm 0; break-after: avoid; }

        .projects { display: grid; grid-template-columns: 1fr 1fr; column-gap: 7mm; row-gap: 4mm; }
        .project { break-inside: avoid; page-break-inside: avoid; font-size: 8.2pt; }
        .project-title { font-size: 9.5pt; font-weight: 600; color: var(--ink); }
        .project-tech { font-size: 7.5pt; color: var(--accent); margin: 0.5mm 0 1mm 0; }
        .project-body p { margin-bottom: 1mm; }

        .keep { break-inside: avoid; page-break-inside: avoid; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; column-gap: 8mm; }
        .two-col td { font-size: 8.5pt; }
        .two-col section { break-inside: avoid; page-break-inside: avoid; }
    </style>
</head>
<body>
    ${renderHeader(langConfig, profileImageData)}

    <section class="profile">
        <h2 class="section-title">${langConfig.summary.title}</h2>
        ${formatTextToParagraphs(langConfig.summary.summary)}
        <div class="anchors">${anchorsHtml}</div>
    </section>

    <section class="keep">
        <h2 class="section-title">${t.skills}</h2>
        ${skillsHtml}
    </section>

    <section>
        <h2 class="section-title">${langConfig.experiences.title}</h2>
        ${stationsHtml}
        ${compactExperiences.length > 0 ? `<div class="subhead">${t.earlier}</div>${compactExpHtml}` : ''}
    </section>

    <section>
        <h2 class="section-title">${t.projects}</h2>
        <div class="projects">${projectsHtml}</div>
    </section>

    <div class="two-col">
        ${workshopExperiences.length > 0 ? `
        <section>
            <h2 class="section-title">${t.talks}</h2>
            <table>${workshopHtml}</table>
        </section>` : '<div></div>'}
        <section>
            <h2 class="section-title">${langConfig.education.title}</h2>
            <table>${educationHtml}</table>
            <h2 class="section-title">${langConfig.language.title}</h2>
            <table>${languageHtml}</table>
        </section>
    </div>
</body>
</html>
  `;
}

module.exports = { generateHTMLFromConfig, startKey };

if (require.main === module) (async () => {
  // Optional 4th argument: the cover letter JSON of an application, so the
  // CV carries the same contact details and header lines as the letter.
  const [,, configPath, outputPdf, language, applicationJson] = process.argv;
  if (!configPath || !outputPdf) {
    console.error('Usage: node html_to_pdf.js <config.toml> <output.pdf> [language]');
    console.error('Available languages: de, en');
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPdf);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Created output directory:', outputDir);
  }

  // Read and parse TOML configuration
  console.log('📋 Reading configuration from:', configPath);
  const configContent = fs.readFileSync(configPath, 'utf8');
  const config = toml.parse(configContent);

  // Determine language - use parameter if provided, otherwise defaultContentLanguage
  const targetLang = language || config.defaultContentLanguage || 'de';

  if (!config.languages[targetLang]) {
    console.error(`❌ Language '${targetLang}' not found in configuration!`);
    console.error('Available languages:', Object.keys(config.languages).join(', '));
    process.exit(1);
  }

  const langConfig = applyApplicationOverrides(
    config.languages[targetLang].params,
    applicationJson ? JSON.parse(fs.readFileSync(applicationJson, 'utf8')) : null,
  );
  console.log(`🌐 Using ${targetLang.toUpperCase()} language configuration`);

  console.log('🚀 Starting professional PDF generation...');
  console.log('📋 Config:', configPath);
  console.log('📄 Output:', outputPdf);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-gpu',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();

  // Set viewport for A4 rendering
  await page.setViewport({
    width: 1240,
    height: 1754,
    deviceScaleFactor: 1.5
  });

  console.log('🎯 Generating PDF content from TOML configuration...');

  // Read and encode the profile image as base64
  const profileImagePath = path.join(__dirname, '..', 'assets', 'images', 'profile.png');
  let profileImageBase64 = '';
  try {
    const compressedProfile = await sharp(profileImagePath)
      .resize(320, 320, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    profileImageBase64 = `data:image/jpeg;base64,${compressedProfile.toString('base64')}`;

    const originalSize = fs.statSync(profileImagePath).size;
    const compressedSize = compressedProfile.length;
    const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    console.log(`✅ Profilbild komprimiert: ${(originalSize/1024).toFixed(1)}KB → ${(compressedSize/1024).toFixed(1)}KB (-${reduction}%)`);
  } catch (error) {
    console.log('⚠️  Could not load profile image:', error.message);
  }

  // Generate HTML content directly from TOML config
  const htmlContent = await generateHTMLFromConfig(langConfig, profileImageBase64, targetLang);

  // Same rule as scripts/check-output.mjs applies to the site, checked here
  // because the PDF is a second artifact that no HTML guard ever sees. It is
  // needed: this renderer used to rewrite every clean date range from the TOML
  // ("01/2024-04/2025") into a spaced en dash on the way out, ten per PDF, none
  // of them present in any source file. The two callers share one rule module
  // rather than one regex each.
  const dashes = findDashes(htmlContent, { includeMeta: false });
  if (dashes.length) {
    console.error(`PDF content check failed for [${targetLang}]:`);
    for (const d of dashes) console.error(`  - ${d.kind} in "${d.snippet}"`);
    throw new Error('dash used as punctuation in PDF content');
  }

  await page.setContent(htmlContent, {
    waitUntil: ['domcontentloaded'],
    timeout: 60000
  });

  console.log('⚡ Optimizing for PDF...');

  // Apply PDF optimizations
  await page.evaluate(() => {
    document.querySelectorAll('.no-print').forEach(el => {
      el.style.display = 'none';
    });

    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
  });

  // Wait for rendering
  await new Promise(resolve => setTimeout(resolve, 2000));
  await page.evaluateHandle('document.fonts.ready');

  console.log('📄 Generating PDF...');

  // Generate PDF with optimized settings
  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: false,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: footerTemplate(`${langConfig.profile.name} · ${targetLang === 'de' ? 'Lebenslauf' : 'Curriculum Vitae'}`),
    margin: {
      top: '14mm',
      bottom: '16mm',
      left: '16mm',
      right: '16mm'
    },
    scale: 1.0,
    tagged: true
  });

  await browser.close();
  console.log('✅ PDF generated successfully at:', outputPdf);
})();
