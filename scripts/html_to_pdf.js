const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const toml = require('toml');
const sharp = require('sharp');
const { formatMarkdownToHTML, formatTextToParagraphs } = require('./lib/markdown-utils');

// Impact metrics — shown as compact bar under career profile
const IMPACT_METRICS = {
  de: [
    { metric: '-80%', label: 'Rückfragen', detail: 'durch Quality-Monitoring' },
    { metric: '96%', label: 'Qualität', detail: 'nach Migration (vorher 30%)' },
    { metric: '80%', label: 'auto-generiert', detail: 'KI-gestützte Test-Cases' },
  ],
  en: [
    { metric: '-80%', label: 'Inquiries', detail: 'through quality monitoring' },
    { metric: '96%', label: 'Quality', detail: 'after migration (was 30%)' },
    { metric: '80%', label: 'Auto-generated', detail: 'AI-driven test cases' },
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

/**
 * Determine experience tier based on start date.
 * Tier 1 (full): 2023+, Tier 2 (medium): 2017-2022, Tier 3 (compact): pre-2017
 */
function getExperienceTier(dates) {
  // Match "06/2025", "08/2021 – 05/2025", or "2023"
  const slashMatch = dates.match(/(\d{2})\/(\d{4})/);
  if (slashMatch) {
    const year = parseInt(slashMatch[2]);
    if (year >= 2023) return 'full';
    if (year >= 2017) return 'medium';
    return 'compact';
  }
  const yearMatch = dates.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= 2023) return 'full';
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
    lowerPos.includes('anwendungen von ki') ||
    lowerCompany.includes('workshop') ||
    lowerCompany.includes('präsentation');
}

/**
 * Limit text to approximately maxWords words
 */
function limitWords(text, maxWords) {
  if (!text) return '';
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
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
        <i class="fa ${item.icon}"></i>
        ${isLink ? `<a ${href}>${item.title}</a>` : `<span>${item.title}</span>`}
      </div>
    `;
  }).join('');

  // Generate impact metrics
  const lang = targetLang || 'de';
  const metrics = IMPACT_METRICS[lang] || IMPACT_METRICS.de;
  const impactMetricsHtml = metrics.map(m => `
    <div class="impact-metric">
      <div class="impact-number">${m.metric}</div>
      <div class="impact-label">${m.label}</div>
      <div class="impact-detail">${m.detail}</div>
    </div>
  `).join('');

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
    const tier = getExperienceTier(exp.dates);
    if (tier === 'full') fullExperiences.push(exp);
    else if (tier === 'medium') mediumExperiences.push(exp);
    else compactExperiences.push(exp);
  });

  const fullExpHtml = fullExperiences.map(exp => {
    // Full tier: intro + first 5 bullets of Schwerpunkte + tools
    const truncatedDetails = truncateToFull(exp.details || '', 5);
    const formattedDetails = formatTextToParagraphs(truncatedDetails);
    return `
      <div class="experience-item page-break-avoid">
        <div class="experience-header">
          <div class="experience-title">${exp.position}</div>
          <div class="experience-dates">${exp.dates}</div>
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
      <div class="experience-item experience-medium page-break-avoid">
        <div class="experience-header">
          <div class="experience-title">${exp.position}</div>
          <div class="experience-dates">${exp.dates}</div>
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
            <td class="compact-dates">${exp.dates}</td>
            <td class="compact-role"><strong>${exp.position}</strong> — ${exp.company}</td>
            <td class="compact-summary">${extractFirstSentence(exp.details)}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  ` : '';

  // Generate project items — top 8 by impact priority
  const featuredProjects = langConfig.projects.list.filter(p => p.featured && isTopProject(p.title));
  const sortedProjects = sortByPriority(featuredProjects).slice(0, 6);

  const projectItems = await Promise.all(sortedProjects.map(async project => {
    const techTags = project.tech_stack ? project.tech_stack.slice(0, 5).map(tech =>
      `<span class="tech-tag">${tech}</span>`
    ).join('') : '';

    // Check if project has screenshot and try to load it
    let screenshotBase64 = '';
    let hasScreenshot = false;

    if (project.screenshot) {
      const screenshotPath = path.join(__dirname, '..', 'assets', 'images', project.screenshot);
      try {
        const compressedImage = await sharp(screenshotPath)
          .resize(170, 120, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 80 })
          .toBuffer();

        screenshotBase64 = `data:image/jpeg;base64,${compressedImage.toString('base64')}`;
        hasScreenshot = true;

        const originalSize = fs.statSync(screenshotPath).size;
        const compressedSize = compressedImage.length;
        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        console.log(`✅ Screenshot komprimiert für ${project.title}: ${(originalSize/1024/1024).toFixed(2)}MB → ${(compressedSize/1024).toFixed(1)}KB (-${reduction}%)`);
      } catch (error) {
        console.log(`⚠️  Could not load screenshot for ${project.title}: ${error.message}`);
      }
    }

    const formattedTagline = formatMarkdownToHTML(limitWords(project.tagline, 60));

    if (hasScreenshot) {
      return `
        <div class="project-item with-screenshot page-break-avoid">
          <div class="project-content">
            <div class="project-title">${project.title}</div>
            <div class="project-tech">${techTags}</div>
            <div class="project-description">${formattedTagline}</div>
          </div>
          <img src="${screenshotBase64}" alt="${project.title}" class="project-screenshot">
        </div>
      `;
    } else {
      return `
        <div class="project-item page-break-avoid">
          <div class="project-title">${project.title}</div>
          <div class="project-tech">${techTags}</div>
          <div class="project-description">${formattedTagline}</div>
        </div>
      `;
    }
  }));
  const projectItemsHtml = projectItems.join('');

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
    <title>${langConfig.profile.name} - Professional CV</title>

    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
        }

        body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            font-size: 7.5pt;
            line-height: 1.35;
            color: #1E293B;
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
            border-bottom: 2px solid #3a8fa0;
            margin-bottom: 12px;
        }

        .profile-photo {
            width: 105px; height: 105px;
            border-radius: 50%;
            border: 3px solid rgba(58, 143, 160, 0.2);
            object-fit: cover;
        }

        .header-content h1 {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 18pt; font-weight: 700; color: #3a8fa0; margin-bottom: 3px;
        }

        .header-tagline {
            font-size: 9pt; color: #475569; font-weight: 600; margin-bottom: 8px;
        }

        .contact-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 4px 20px; font-size: 7pt;
        }

        .contact-item {
            display: flex; align-items: center; gap: 4px;
        }

        .contact-item i { width: 10px; color: #3a8fa0; font-size: 6pt; }
        .contact-item a { color: #3a8fa0; text-decoration: none; }

        /* === IMPACT METRICS BAR === */
        .impact-bar {
            display: flex;
            justify-content: space-between;
            padding: 10px 15px;
            margin: 10px 0;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
        }

        .impact-metric { text-align: center; flex: 1; }

        .impact-number {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 14pt; font-weight: 700; color: #3a8fa0;
            line-height: 1.1;
        }

        .impact-label {
            font-size: 7pt; font-weight: 600; color: #334155; margin-top: 2px;
        }

        .impact-detail {
            font-size: 6pt; color: #64748B;
        }

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
            color: #3a8fa0;
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
            font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
            font-size: 10pt; font-weight: 700; color: #3a8fa0;
            margin: 12px 0 10px 0; padding-bottom: 4px;
            border-bottom: 2px solid #3a8fa0;
            letter-spacing: -0.01em;
            page-break-after: avoid;
        }

        .cv-full-width {
            margin-top: 20px;
        }

        /* === CAREER PROFILE === */
        .career-profile {
            background: #F8FAFC;
            border-left: 4px solid #3a8fa0;
            padding: 12px;
            margin: 12px 0;
            border-radius: 0 8px 8px 0;
        }

        .career-profile h2 {
            font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
            margin-top: 0; margin-bottom: 8px; border: none; font-size: 10pt;
        }

        .career-profile p {
            font-size: 7pt; line-height: 1.4; margin-bottom: 6px;
        }

        .career-profile ul {
            margin: 4px 0 6px 12px; padding: 0; font-size: 7pt;
        }

        .career-profile li {
            margin-bottom: 2px; line-height: 1.3;
        }

        .career-profile strong { font-weight: 600; color: #3a8fa0; }

        /* === EXPERIENCE ITEMS === */
        .experience-item {
            margin-bottom: 8px; padding: 10px;
            background: #F8FAFC;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
            page-break-inside: avoid;
        }

        .experience-header {
            display: grid; grid-template-columns: 1fr auto;
            align-items: baseline; margin-bottom: 4px;
        }

        .experience-title {
            font-size: 8.5pt; font-weight: 700; color: #3a8fa0;
        }

        .experience-dates {
            font-size: 7pt; color: #64748B;
            background: rgba(58,143,160,0.08);
            padding: 1px 6px; border-radius: 4px;
            font-weight: 500;
        }

        .experience-company {
            font-size: 7.5pt; font-weight: 600; color: #334155; margin-bottom: 5px;
        }

        .experience-details {
            font-size: 6.5pt; line-height: 1.35; color: #334155;
        }

        .experience-details p { margin-bottom: 4px; }
        .experience-details ul { margin: 4px 0 4px 12px; padding: 0; }
        .experience-details li { margin-bottom: 2px; line-height: 1.3; }
        .experience-details strong { font-weight: 600; color: #3a8fa0; }

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
            font-size: 6.5pt;
        }

        .compact-row td {
            padding: 4px 6px;
            border-bottom: 1px solid #F1F5F9;
            vertical-align: top;
        }

        .compact-dates {
            width: 85px;
            color: #64748B;
            white-space: nowrap;
            font-size: 6pt;
        }

        .compact-role {
            color: #334155;
        }

        .compact-role strong {
            color: #3a8fa0;
            font-weight: 600;
        }

        .compact-summary {
            color: #64748B;
            font-size: 6pt;
            max-width: 200px;
        }

        /* === PROJECTS === */
        .projects-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .project-item {
            width: calc(50% - 4px);
            margin-bottom: 0; padding: 10px;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 8px;
            page-break-inside: avoid;
            box-sizing: border-box;
        }

        .project-item.with-screenshot {
            display: flex;
            gap: 8px; align-items: flex-start;
        }

        .project-content {
            flex: 1;
            min-width: 0;
        }

        .project-title {
            font-size: 8pt; font-weight: 700; color: #3a8fa0; margin-bottom: 4px;
        }

        .project-tech { margin: 3px 0; }

        .tech-tag {
            background: rgba(58,143,160,0.08); color: #3a8fa0; padding: 2px 5px;
            border-radius: 4px; font-size: 6pt; font-weight: 500; margin-right: 3px;
            display: inline-block; margin-bottom: 2px;
        }

        .project-description {
            font-size: 6.5pt; line-height: 1.35; color: #334155; margin-top: 4px;
        }

        .project-screenshot {
            width: 85px; height: 60px; object-fit: cover;
            border-radius: 6px; border: 1px solid #d1d9e0;
            background: #fff; flex-shrink: 0;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        /* === SIDEBAR === */
        .cv-sidebar {
            background: #F8FAFC; padding: 15px;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
            height: fit-content;
        }

        .sidebar-section { margin-bottom: 15px; }

        .sidebar-section h3 {
            font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
            font-size: 8pt; font-weight: 600; color: #3a8fa0;
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 1px solid #E2E8F0;
            letter-spacing: -0.01em;
        }

        .skills-list { display: flex; flex-wrap: wrap; gap: 4px; }

        .skill-tag {
            background: white; color: #334155; padding: 3px 6px;
            border-radius: 6px; font-size: 6.5pt; font-weight: 500;
            border: 1px solid #CBD5E1;
        }

        .education-item { margin-bottom: 8px; font-size: 7pt; }
        .education-degree { font-weight: 600; color: #3a8fa0; margin-bottom: 2px; }
        .education-school { color: #475569; margin-bottom: 2px; }
        .education-dates { color: #64748B; font-style: italic; }

        .language-item {
            display: flex; justify-content: space-between;
            margin-bottom: 4px; font-size: 7pt;
        }

        .language-name { font-weight: 600; color: #3a8fa0; }
        .language-level { color: #475569; }

        /* === EARLIER POSITIONS HEADING === */
        .earlier-heading {
            font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
            font-size: 8pt; font-weight: 600; color: #64748B;
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
            padding: 8px 10px;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            font-size: 7pt;
        }

        .workshop-title {
            font-weight: 600; color: #3a8fa0; margin-bottom: 2px;
        }

        .workshop-meta {
            font-size: 6.5pt; color: #64748B;
        }

        /* === UTILITIES === */
        .page-break-before { page-break-before: always; }
        .page-break-avoid { page-break-inside: avoid; }
        .no-print { display: none !important; }
    </style>
    <!-- Font Awesome icons replaced with simple text symbols for PDF -->
    <style>
        .fa-envelope::before { content: "✉"; }
        .fa-phone::before { content: "☎"; }
        .fa-map-marker-alt::before { content: "📍"; }
        .fa-linkedin::before { content: "💼"; }
        .fa-github::before { content: "⚡"; }
        .fa-globe::before { content: "🌐"; }
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

                <div class="sidebar-section">
                    <h3>${langConfig.ui.sidebar_qualifications_title || 'Additional Qualifications'}</h3>
                    <div class="skills-list">
                        <span class="skill-tag">ISTQB Certified</span>
                        <span class="skill-tag">Agile (Scrum/Kanban)</span>
                        <span class="skill-tag">${langConfig.ui.ai_badge}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Full width section for projects (Top 8) -->
        <section class="cv-section cv-full-width">
            <h2>${langConfig.projects.title}</h2>
            <div class="projects-grid">
                ${projectItemsHtml}
            </div>
        </section>

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

  // Generate PDF with optimized settings
  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: false,
    displayHeaderFooter: false,
    margin: {
      top: '8mm',
      bottom: '10mm',
      left: '8mm',
      right: '8mm'
    },
    scale: 1.0,
    tagged: true
  });

  await browser.close();
  console.log('✅ PDF generated successfully at:', outputPdf);
})();
