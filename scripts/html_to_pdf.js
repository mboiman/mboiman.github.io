const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const toml = require('toml');
const sharp = require('sharp');
const { formatTextToParagraphs } = require('./lib/markdown-utils');

// Impact metrics — shown as compact bar under career profile
const IMPACT_METRICS = {
  de: [
    { metric: '40+', label: 'Skills', detail: 'Ökosystem, ein Hub' },
    { metric: '20+', label: 'Repos orchestriert', detail: 'über 7 Projekt-Boards' },
    { metric: 'Live', label: 'A2A-Agent', detail: 'live unter mboiman.bks-lab.com' },
  ],
  en: [
    { metric: '40+', label: 'Skills', detail: 'one orchestration hub' },
    { metric: '20+', label: 'Repos orchestrated', detail: 'across 7 project boards' },
    { metric: 'Live', label: 'A2A agent', detail: 'live at mboiman.bks-lab.com' },
  ],
};

// Top 8 projects by impact — ordered by priority
const TOP_PROJECTS = [
  'Quality Dashboard',
  '24/7 Automated Legacy Migration Validator',
  'E-Invoicing Automation Platform',
  'AI Context Orchestrator',
  'E-Mail-Klassifizierung',
  'Email Classification',
  'Developer Workshop: AI-Agent',
  'Medical Transcription System',
  'AI Learning Platform',
];

// Specialization bar keywords
const SPECIALIZATIONS = {
  de: ['Quality Engineering', 'LLM/AI Architecture', 'CI/CD Automation', 'Multi-Cloud', 'Peppol/E-Invoice'],
  en: ['Quality Engineering', 'LLM/AI Architecture', 'CI/CD Automation', 'Multi-Cloud', 'Peppol/E-Invoice'],
};

const CONTACT_ICON_PATHS = {
  email: 'M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91A2.25 2.25 0 0 1 2.25 6.993V6.75',
  phone: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293a1.125 1.125 0 0 1-1.21.38 12.035 12.035 0 0 1-7.143-7.143 1.125 1.125 0 0 1 .38-1.21l1.293-.97c.36-.27.522-.735.417-1.173L6.963 3.102A1.125 1.125 0 0 0 5.872 2.25H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z',
  website: 'M12 21a9 9 0 1 0 0-18m0 18a9 9 0 1 1 0-18m0 18c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-7.5 9h15',
  linkedin: 'M8.25 8.25h3v1.54h.04c.42-.8 1.45-1.64 2.98-1.64 3.19 0 3.78 2.1 3.78 4.83v5.57h-3.13v-4.94c0-1.18-.02-2.7-1.64-2.7-1.65 0-1.9 1.29-1.9 2.62v5.02H8.25V8.25Zm-4.05 0h3.13v10.3H4.2V8.25Zm3.38-3.18a1.81 1.81 0 1 1-3.62 0 1.81 1.81 0 0 1 3.62 0Z',
  github: 'M12 2.25c-5.39 0-9.75 4.36-9.75 9.75 0 4.3 2.79 7.95 6.66 9.24.49.09.67-.21.67-.47v-1.78c-2.71.59-3.28-1.16-3.28-1.16-.44-1.13-1.08-1.43-1.08-1.43-.88-.6.07-.59.07-.59.98.07 1.49 1 1.49 1 .87 1.49 2.27 1.06 2.83.81.09-.63.34-1.06.61-1.3-2.16-.25-4.43-1.08-4.43-4.82 0-1.06.38-1.93 1-2.61-.1-.25-.43-1.24.1-2.58 0 0 .82-.26 2.68 1a9.3 9.3 0 0 1 4.88 0c1.86-1.26 2.68-1 2.68-1 .53 1.34.2 2.33.1 2.58.62.68 1 1.55 1 2.61 0 3.75-2.28 4.57-4.45 4.81.35.3.66.9.66 1.82v2.7c0 .26.18.56.67.47A9.76 9.76 0 0 0 21.75 12c0-5.39-4.36-9.75-9.75-9.75Z',
};

function getContactIconPath(item) {
  if (item.class && CONTACT_ICON_PATHS[item.class]) return CONTACT_ICON_PATHS[item.class];
  if (item.icon && item.icon.includes('phone')) return CONTACT_ICON_PATHS.phone;
  if (item.icon && item.icon.includes('linkedin')) return CONTACT_ICON_PATHS.linkedin;
  if (item.icon && item.icon.includes('github')) return CONTACT_ICON_PATHS.github;
  if (item.icon && item.icon.includes('globe')) return CONTACT_ICON_PATHS.website;
  return CONTACT_ICON_PATHS.email;
}

function getContactBadge(item) {
  if (item.class === 'linkedin') return 'in';
  if (item.class === 'github') return 'gh';
  if (item.class === 'website') return 'www';
  return '';
}

function renderContactIcon(item) {
  const badge = getContactBadge(item);
  if (badge) return `<span class="contact-icon contact-icon-badge">${badge}</span>`;
  return `<span class="contact-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${getContactIconPath(item)}" /></svg></span>`;
}

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
 * Extract first sentence from experience details for compact tier.
 */
function extractFirstSentence(details) {
  if (!details) return '';
  // Get the first bold line or first sentence
  const boldMatch = details.match(/\*\*([^*]+)\*\*/);
  if (boldMatch) return boldMatch[1].trim();
  const sentenceMatch = details.match(/^[^.!?\n]+[.!?]/);
  if (sentenceMatch) return sentenceMatch[0].trim();
  return details.split('\n')[0].trim().substring(0, 120);
}

/**
 * Detect if an experience entry is a workshop/presentation (not a regular position)
 */
function isWorkshopOrPresentation(exp) {
  const lowerPos = exp.position.toLowerCase();
  const lowerCompany = (exp.company || '').toLowerCase();
  return lowerPos.includes('workshop') ||
    lowerPos.includes('präsentation') ||
    lowerPos.includes('presentation') ||
    lowerPos.includes('impulsvortrag') ||
    lowerPos.includes('vortrag') ||
    lowerPos.includes('guest lecture') ||
    lowerPos.includes('lecture') ||
    lowerPos.includes('anwendungen von ki') ||
    lowerCompany.includes('workshop') ||
    lowerCompany.includes('präsentation');
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
 * Check if a project matches one of the top priority projects
 */
function isTopProject(title) {
  return TOP_PROJECTS.some(tp => title.includes(tp) || tp.includes(title.substring(0, 20)));
}

/**
 * Sort projects by priority order
 */
function sortByPriority(projects) {
  return projects.sort((a, b) => {
    const aIdx = TOP_PROJECTS.findIndex(tp => a.title.includes(tp) || tp.includes(a.title.substring(0, 20)));
    const bIdx = TOP_PROJECTS.findIndex(tp => b.title.includes(tp) || tp.includes(b.title.substring(0, 20)));
    const aPrio = aIdx === -1 ? 999 : aIdx;
    const bPrio = bIdx === -1 ? 999 : bIdx;
    return aPrio - bPrio;
  });
}

// Function to generate HTML content from TOML configuration
async function generateHTMLFromConfig(langConfig, profileImageData, targetLang) {
  // Generate contact items
  const contactItems = langConfig.contact.list.map(item => {
    const href = item.url ? `href="${item.url}"` : '';
    const isLink = item.url;
    return `
      <div class="contact-item">
        ${renderContactIcon(item)}
        ${isLink ? `<a ${href}>${item.title}</a>` : `<span>${item.title}</span>`}
      </div>
    `;
  }).join('');

  const fontDir = path.join(__dirname, '..', 'public', 'fonts', 'ibm-plex-sans');
  const fontUrl = (file) => `data:font/woff2;base64,${fs.readFileSync(path.join(fontDir, file)).toString('base64')}`;
  const fontFaceCss = `
        @font-face {
            font-family: "IBM Plex Sans";
            src: url("${fontUrl('IBMPlexSans-Light.woff2')}") format("woff2");
            font-weight: 300;
            font-style: normal;
        }
        @font-face {
            font-family: "IBM Plex Sans";
            src: url("${fontUrl('IBMPlexSans-Regular.woff2')}") format("woff2");
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: "IBM Plex Sans";
            src: url("${fontUrl('IBMPlexSans-Text.woff2')}") format("woff2");
            font-weight: 450;
            font-style: normal;
        }
        @font-face {
            font-family: "IBM Plex Sans";
            src: url("${fontUrl('IBMPlexSans-Medium.woff2')}") format("woff2");
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: "IBM Plex Sans";
            src: url("${fontUrl('IBMPlexSans-SemiBold.woff2')}") format("woff2");
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: "IBM Plex Sans";
            src: url("${fontUrl('IBMPlexSans-Bold.woff2')}") format("woff2");
            font-weight: 700;
            font-style: normal;
        }`;

  // Generate impact metrics — sourced from TOML (langConfig.ui.impact_metrics),
  // falling back to the IMPACT_METRICS constant when the field is absent.
  const lang = targetLang || 'de';
  const metrics = (langConfig.ui.impact_metrics && langConfig.ui.impact_metrics.length > 0)
    ? langConfig.ui.impact_metrics
    : (IMPACT_METRICS[lang] || IMPACT_METRICS.de);
  const impactMetricsHtml = metrics.map(m => {
    const isLong = (m.metric || '').replace(/\s+/g, '').length > 10;
    const detailContent = m.url
      ? `<a href="${m.url}" class="impact-link">${m.detail}</a>`
      : m.detail;
    return `
    <div class="impact-metric">
      <div class="impact-number${isLong ? ' impact-number-long' : ''}">${m.metric}</div>
      <div class="impact-label">${m.label}</div>
      <div class="impact-detail">${detailContent}</div>
    </div>
  `;
  }).join('');

  // Generate specialization bar
  const specs = SPECIALIZATIONS[lang] || SPECIALIZATIONS.de;
  const specBarHtml = specs.map(s => `<span class="spec-tag">${s}</span>`).join('<span class="spec-sep">|</span>');

  // Generate experience items with 3-tier truncation + workshop separation
  const fullExperiences = [];
  const mediumExperiences = [];
  const compactExperiences = [];
  const workshopExperiences = [];

  langConfig.experiences.list.forEach(exp => {
    // Separate workshops/presentations into their own section
    if (isWorkshopOrPresentation(exp)) {
      workshopExperiences.push(exp);
      return;
    }
    const tier = getExperienceTier(exp);
    if (tier === 'full') fullExperiences.push(exp);
    else if (tier === 'medium') mediumExperiences.push(exp);
    else compactExperiences.push(exp);
  });

  const fullExpHtml = fullExperiences.map(exp => {
    // Full tier: intro + first 4 bullets of Schwerpunkte + tools
    const truncatedDetails = truncateToFull(exp.details || '', 4);
    const formattedDetails = formatTextToParagraphs(truncatedDetails);
    return `
      <div class="experience-item">
        <div class="experience-header">
          <div class="experience-title">${exp.position}</div>
          <div class="experience-dates">${exp.dates.replace(/\s*[-–]\s*/, ' – ')}</div>
        </div>
        <div class="experience-company">${exp.company}</div>
        <div class="experience-details">
          ${formattedDetails}
        </div>
      </div>
    `;
  }).join('');

  const mediumExpHtml = mediumExperiences.map(exp => {
    const truncated = truncateToMedium(exp.details || '');
    const formattedDetails = formatTextToParagraphs(truncated);
    return `
      <div class="experience-item experience-medium">
        <div class="experience-header">
          <div class="experience-title">${exp.position}</div>
          <div class="experience-dates">${exp.dates.replace(/\s*[-–]\s*/, ' – ')}</div>
        </div>
        <div class="experience-company">${exp.company}</div>
        <div class="experience-details">
          ${formattedDetails}
        </div>
      </div>
    `;
  }).join('');

  const compactExpHtml = compactExperiences.length > 0 ? `
    <div class="experience-compact-section">
      <table class="compact-table">
        ${compactExperiences.map(exp => `
          <tr class="compact-row">
            <td class="compact-dates">${exp.dates.replace(/\s*[-–]\s*/, ' – ')}</td>
            <td class="compact-role"><strong>${exp.position}</strong> — ${exp.company}</td>
            <td class="compact-summary">${extractFirstSentence(exp.details)}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  ` : '';

  // Generate project items — top 4 by impact priority. Screenshots are not
  // rendered in the PDF (result-first text cards instead); sharp stays in use
  // for the profile photo below.
  const featuredProjects = langConfig.projects.list.filter(p => p.featured && isTopProject(p.title));
  const sortedProjects = sortByPriority(featuredProjects).slice(0, 4);

  const projectItemsHtml = sortedProjects.map(project => {
    const techTags = project.tech_stack ? project.tech_stack.slice(0, 5).map(tech =>
      `<span class="tech-tag">${tech}</span>`
    ).join('') : '';

    // tagline_pdf carries a curated intro + Problem/Lösung/Ergebnis bullets and
    // is used verbatim (no truncation); otherwise fall back to a sentence-safe
    // truncation of the web tagline.
    const descriptionSource = project.tagline_pdf
      ? project.tagline_pdf.trim()
      : truncateProjectDescription(project.tagline, 70);
    const formattedTagline = formatTextToParagraphs(descriptionSource);

    return `
        <div class="project-item">
          <div class="project-title">${project.title}</div>
          <div class="project-tech">${techTags}</div>
          <div class="project-description">${formattedTagline}</div>
        </div>
      `;
  }).join('');

  // Generate education items
  const educationItems = langConfig.education.list.map(edu => `
    <div class="education-item">
      <div class="education-degree">${edu.degree}</div>
      ${edu.college ? `<div class="education-school">${edu.college}</div>` : ''}
      <div class="education-dates">${edu.dates}</div>
    </div>
  `).join('');

  // Generate language items
  const languageItems = langConfig.language.list.map(lang => `
    <div class="language-item">
      <span class="language-name">${lang.language}</span>
      <span class="language-level">${lang.level}</span>
    </div>
  `).join('');

  // Generate skills from TOML config
  const skillTags = (langConfig.ui.sidebar_skills || [])
    .map(skill => `<span class="skill-tag">${skill}</span>`).join('');

  // Labels
  const earlierLabel = lang === 'de' ? 'Frühere Positionen' : 'Earlier Positions';
  const workshopLabel = lang === 'de' ? 'Workshops & Vorträge' : 'Workshops & Presentations';

  // Generate workshop section (compact cards)
  const workshopHtml = workshopExperiences.length > 0 ? workshopExperiences.map(exp => `
    <div class="workshop-item">
      <div class="workshop-title">${exp.position}</div>
      <div class="workshop-meta">${exp.company} — ${exp.dates}</div>
    </div>
  `).join('') : '';

  return `
<!DOCTYPE html>
<html lang="${lang}" class="pdf-cv-layout">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${langConfig.profile.name} – ${targetLang === 'de' ? 'Lebenslauf' : 'CV'}</title>

    <style>
        ${fontFaceCss}

        :root {
            --font-body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            --font-display: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
            --accent: #2563EB;
            --accent-deep: #1D4ED8;
            --text: #17212B;
            --muted: #475569;
            --surface: #FFFFFF;
            --surface-soft: #F5F9FF;
            --line: #C4D4EA;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        /* Ränder: page.pdf margin gewinnt, preferCSSPageSize:false */

        body {
            font-family: var(--font-body);
            font-size: 9pt;
            line-height: 1.45;
            color: var(--text);
            background: white;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }

        .cv-container { max-width: 100%; margin: 0; padding: 0; }

        /* === HEADER === */
        .cv-header {
            display: grid;
            grid-template-columns: 110px 1fr;
            gap: 20px;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1.5px solid var(--accent);
            margin-bottom: 12px;
        }

        .profile-photo {
            width: 105px; height: 105px;
            border-radius: 50%;
            border: 3px solid rgba(37, 99, 235, 0.14);
            object-fit: cover;
        }

        .header-content h1 {
            font-family: var(--font-display);
            font-size: 22pt; font-weight: 300; color: var(--text); margin-bottom: 3px;
            letter-spacing: -0.035em;
        }

        .header-tagline {
            font-size: 10pt; color: var(--muted); font-weight: 450; margin-bottom: 4px;
        }

        .header-meta {
            font-size: 7.5pt; color: var(--text); font-weight: 500; margin-bottom: 8px;
            display: flex; align-items: center; flex-wrap: wrap;
        }

        .availability-pill {
            display: inline-flex; align-items: center; gap: 5px;
            background: rgba(22, 163, 74, 0.08);
            border-radius: 999px;
            padding: 2px 8px;
            margin-left: 8px;
            color: #15803D;
            font-weight: 600;
        }
        .availability-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: #16A34A;
            flex: 0 0 auto;
            display: inline-block;
        }

        .contact-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 4px 20px; font-size: 7.5pt;
        }

        .contact-item {
            display: flex; align-items: center; gap: 5px;
            min-width: 0;
            color: var(--muted);
        }

        .contact-icon {
            width: 14px; height: 14px; border-radius: 999px;
            display: inline-flex; align-items: center; justify-content: center;
            color: var(--accent);
            background: rgba(37, 99, 235, 0.08);
            flex: 0 0 auto;
        }
        .contact-icon svg { width: 9px; height: 9px; }
        .contact-icon-badge {
            font-size: 5.8pt;
            font-weight: 700;
            letter-spacing: -0.03em;
            line-height: 1;
            text-transform: lowercase;
        }
        .contact-item a { color: var(--text); text-decoration: none; }

        /* === IMPACT METRICS BAR === */
        .impact-bar {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            margin: 10px 0;
            background: var(--surface-soft);
            border: 1px solid var(--line);
            border-radius: 8px;
        }

        .impact-metric { text-align: center; flex: 1; }

        .impact-number {
            font-family: var(--font-display);
            font-size: 12.5pt; font-weight: 300; color: var(--accent);
            line-height: 1.15;
        }

        .impact-number.impact-number-long {
            font-size: 11.5pt;
            line-height: 1.2;
        }

        .impact-label {
            font-size: 7.5pt; font-weight: 600; color: #334155; margin-top: 2px;
        }

        .impact-detail {
            font-size: 7pt; color: #475569;
        }

        .impact-link { color: inherit; text-decoration: none; }

        /* === SPECIALIZATION BAR === */
        .spec-bar {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 0;
            margin-bottom: 12px;
            font-size: 7pt;
        }

        .spec-tag {
            color: var(--accent);
            font-weight: 600;
            letter-spacing: 0.3px;
        }

        .spec-sep {
            color: #CBD5E1;
            font-weight: 300;
        }

        /* === MAIN LAYOUT (70/30) === */
        .cv-main {
            display: grid;
            grid-template-columns: 7fr 3fr;
            gap: 20px;
            margin-top: 12px;
        }

        /* === SECTION TITLES === */
        .cv-section h2 {
            font-family: var(--font-display);
            font-size: 9.5pt; font-weight: 600; color: var(--text);
            margin: 12px 0 10px 0; padding-bottom: 4px;
            border-bottom: 1px solid var(--line);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            page-break-after: avoid;
            position: relative;
        }

        .cv-section h2::after {
            content: '';
            position: absolute;
            left: 0; bottom: -1px;
            width: 56px; height: 2.5px;
            background: linear-gradient(90deg, #2563EB, transparent);
        }

        .cv-full-width {
            margin-top: 20px;
        }

        /* === CAREER PROFILE === */
        .career-profile {
            background: var(--surface-soft);
            border-left: 3px solid var(--accent);
            padding: 12px;
            margin: 12px 0;
            border-radius: 0 8px 8px 0;
        }

        .career-profile h2 {
            font-family: var(--font-display);
            margin-top: 0; margin-bottom: 8px; border: none; font-size: 10pt;
        }

        .career-profile p {
            font-size: 8.5pt; line-height: 1.4; margin-bottom: 6px;
        }

        .career-profile ul {
            margin: 4px 0 6px 12px; padding: 0; font-size: 8.5pt;
        }

        .career-profile li {
            margin-bottom: 2px; line-height: 1.3;
        }

        .career-profile strong { font-weight: 600; color: var(--accent-deep); }

        /* === EXPERIENCE ITEMS === */
        .experience-item {
            margin-bottom: 8px; padding: 10px;
            background: var(--surface);
            border-radius: 8px;
            border: 1px solid var(--line);
        }

        .experience-header {
            display: grid; grid-template-columns: 1fr auto;
            align-items: baseline; margin-bottom: 4px;
            page-break-after: avoid;
        }

        .experience-title {
            font-size: 10pt; font-weight: 600; color: var(--accent-deep);
        }

        .experience-dates {
            font-size: 7.5pt; color: #475569;
            background: rgba(37,99,235,0.08);
            padding: 1px 6px; border-radius: 4px;
            font-weight: 500;
        }

        .experience-company {
            font-size: 8.5pt; font-weight: 600; color: #334155; margin-bottom: 5px;
            page-break-after: avoid;
        }

        .experience-details {
            font-size: 8pt; line-height: 1.5; color: #334155;
            orphans: 3; widows: 3;
        }

        .experience-details p { margin-bottom: 4px; }
        .experience-details ul { margin: 4px 0 4px 12px; padding: 0; }
        .experience-details li { margin-bottom: 2px; line-height: 1.45; }
        .experience-details strong { font-weight: 600; color: var(--accent-deep); }
        .experience-details ul:last-of-type { columns: 2; column-gap: 14px; break-inside: avoid-page; }
        /* Keep sub-headings (bold-only <p> before a list) attached to their list —
           prevents a lone widow bullet landing on the next page (EN p.4 case). */
        .experience-details p:has(+ ul) { page-break-after: avoid; break-after: avoid; }

        /* Medium tier: slightly less padding */
        .experience-medium {
            background: transparent;
            border: 1px solid #E2E8F0;
        }

        /* Compact tier: table rows */
        .experience-compact-section {
            margin-top: 8px;
        }

        .compact-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7.5pt;
        }

        .compact-row td {
            padding: 4px 6px;
            border-bottom: 1px solid #F1F5F9;
            vertical-align: top;
        }

        .compact-dates {
            width: 85px;
            color: #475569;
            white-space: nowrap;
            font-size: 7pt;
        }

        .compact-role {
            color: #334155;
        }

        .compact-role strong {
            color: var(--accent-deep);
            font-weight: 600;
        }

        .compact-summary {
            color: #475569;
            font-size: 7pt;
            max-width: 200px;
        }

        /* === PROJECTS === */
        .projects-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .cv-content .projects-grid {
            display: block;
        }

        .project-item {
            width: calc(50% - 4px);
            margin-bottom: 0; padding: 10px;
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 8px;
            page-break-inside: avoid;
            box-sizing: border-box;
        }

        .cv-content .project-item {
            width: 100%;
            margin-bottom: 8px;
        }

        .project-title {
            font-size: 9pt; font-weight: 600; color: var(--accent-deep); margin-bottom: 4px;
        }

        .project-tech { margin: 3px 0; }

        .tech-tag {
            background: rgba(37,99,235,0.08); color: var(--accent-deep); padding: 2px 5px;
            border-radius: 4px; font-size: 7pt; font-weight: 500; margin-right: 3px;
            display: inline-block; margin-bottom: 2px;
        }

        .project-description {
            font-size: 8pt; line-height: 1.35; color: #334155; margin-top: 4px;
        }

        .project-description p { margin-bottom: 4px; }
        .project-description ul { margin: 4px 0 4px 12px; padding: 0; }
        .project-description li { margin-bottom: 2px; line-height: 1.3; }
        .project-description strong { font-weight: 600; color: var(--accent-deep); }

        /* === SIDEBAR === */
        .cv-sidebar {
            background: var(--surface-soft); padding: 15px;
            border-radius: 8px;
            border: 1px solid var(--line);
            height: fit-content;
        }

        .sidebar-section { margin-bottom: 15px; }

        .sidebar-section h3 {
            font-family: var(--font-display);
            font-size: 8pt; font-weight: 600; color: var(--accent-deep);
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 1px solid var(--line);
            letter-spacing: -0.01em;
        }

        .skills-list { display: flex; flex-wrap: wrap; gap: 4px; }

        .skill-tag {
            background: white; color: #334155; padding: 3px 6px;
            border-radius: 6px; font-size: 7.5pt; font-weight: 500;
            border: 1px solid #CBD5E1;
        }

        .education-item { margin-bottom: 8px; font-size: 8pt; }
        .education-degree { font-weight: 600; color: var(--accent-deep); margin-bottom: 2px; }
        .education-school { color: #475569; margin-bottom: 2px; }
        .education-dates { color: #475569; font-style: italic; }

        .language-item {
            display: flex; justify-content: space-between;
            margin-bottom: 4px; font-size: 8pt;
        }

        .language-name { font-weight: 600; color: var(--accent-deep); }
        .language-level { color: #475569; }

        /* === EARLIER POSITIONS HEADING === */
        .earlier-heading {
            font-family: var(--font-display);
            font-size: 8pt; font-weight: 600; color: #475569;
            margin: 12px 0 6px 0;
            padding-bottom: 3px;
            border-bottom: 1px solid #E2E8F0;
        }

        /* === WORKSHOPS === */
        .workshop-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .workshop-item {
            width: calc(50% - 3px);
            padding: 6px 10px;
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 6px;
            font-size: 7pt;
        }

        .workshop-title {
            font-weight: 600; color: var(--accent-deep); margin-bottom: 2px;
        }

        .workshop-meta {
            font-size: 6.5pt; color: #475569;
        }

        /* === UTILITIES === */
        .page-break-before { page-break-before: always; }
        .page-break-avoid { page-break-inside: avoid; }
        .no-print { display: none !important; }
    </style>
</head>
<body>
    <div class="cv-container">
        <header class="cv-header">
            <div class="profile-image">
                <img src="${profileImageData}" alt="${langConfig.profile.name}" class="profile-photo">
            </div>
            <div class="header-content">
                <h1>${langConfig.profile.name}</h1>
                <div class="header-tagline">${langConfig.ui.tagline}</div>
                ${(langConfig.ui.location || langConfig.ui.availability) ? `<div class="header-meta">${langConfig.ui.location ? `<span class="meta-location">${langConfig.ui.location}</span>` : ''}${langConfig.ui.availability ? `<span class="availability-pill"><span class="availability-dot"></span>${langConfig.ui.availability}</span>` : ''}</div>` : ''}
                <div class="contact-grid">
                    ${contactItems}
                </div>
            </div>
        </header>

        <!-- Impact Metrics Bar -->
        <div class="impact-bar">
            ${impactMetricsHtml}
        </div>

        <!-- Specialization Bar -->
        <div class="spec-bar">
            ${specBarHtml}
        </div>

        <div class="cv-main">
            <div class="cv-content">
                <section class="career-profile page-break-avoid">
                    <h2>${langConfig.summary.title}</h2>
                    ${formatTextToParagraphs(langConfig.summary.summary)}
                </section>

                <section class="cv-section">
                    <h2>${langConfig.projects.title}</h2>
                    <div class="projects-grid">
                        ${projectItemsHtml}
                    </div>
                </section>
            </div>

            <div class="cv-sidebar">
                <div class="sidebar-section">
                    <h3>${langConfig.ui.sidebar_skills_title || 'Technical Skills'}</h3>
                    <div class="skills-list">
                        ${skillTags}
                    </div>
                </div>

                <div class="sidebar-section">
                    <h3>${langConfig.education.title}</h3>
                    ${educationItems}
                </div>

                <div class="sidebar-section">
                    <h3>${langConfig.language.title}</h3>
                    ${languageItems}
                </div>
            </div>
        </div>

        <!-- Full width section for experience -->
        <section class="cv-section cv-full-width">
            <h2>${langConfig.experiences.title}</h2>
            ${fullExpHtml}
            ${mediumExpHtml}
            ${compactExperiences.length > 0 ? `<div class="earlier-heading">${earlierLabel}</div>` : ''}
            ${compactExpHtml}
        </section>

        ${workshopExperiences.length > 0 ? `
        <!-- Workshops & Presentations -->
        <section class="cv-section cv-full-width">
            <h2>${workshopLabel}</h2>
            <div class="workshop-grid">
                ${workshopHtml}
            </div>
        </section>
        ` : ''}
    </div>
</body>
</html>
  `;
}

(async () => {
  const [,, configPath, outputPdf, language] = process.argv;
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

  const langConfig = config.languages[targetLang].params;
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
      .resize(210, 210, {
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

  // Footer renders in an isolated context without the page's @font-face rules —
  // embed IBM Plex Regular as a data URI so the footer doesn't fall back to Times.
  const footerFontUrl = `data:font/woff2;base64,${fs.readFileSync(path.join(__dirname, '..', 'public', 'fonts', 'ibm-plex-sans', 'IBMPlexSans-Regular.woff2')).toString('base64')}`;

  // Generate PDF with optimized settings
  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: false,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<style>@font-face{font-family:'IBM Plex Sans';src:url('${footerFontUrl}') format('woff2');font-weight:400;}</style><div style="font-size:6.5pt;color:#94A3B8;width:100%;text-align:center;font-family:'IBM Plex Sans',Helvetica,Arial,sans-serif;">${langConfig.profile.name} · <span class="pageNumber"></span>/<span class="totalPages"></span></div>`,
    margin: {
      top: '8mm',
      bottom: '14mm',
      left: '8mm',
      right: '8mm'
    },
    scale: 1.0,
    tagged: true
  });

  await browser.close();
  console.log('✅ PDF generated successfully at:', outputPdf);
})();
