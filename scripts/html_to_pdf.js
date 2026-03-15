const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const toml = require('toml');
const sharp = require('sharp');
const { formatMarkdownToHTML, formatTextToParagraphs } = require('./lib/markdown-utils');

// Function to generate HTML content from TOML configuration
async function generateHTMLFromConfig(langConfig, profileImageData, language) {
  const isDE = language === 'de';

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

  // Impact metrics (hardcoded, same as website)
  const impactCards = isDE ? [
    { number: '-80%', label: 'weniger Rückfragen', detail: 'durch Quality-Monitoring' },
    { number: '96%', label: 'Qualität nach Migration', detail: 'vorher 30%' },
    { number: '80%', label: 'KI-gestützte Tests', detail: 'auto-generiert' }
  ] : [
    { number: '-80%', label: 'fewer inquiries', detail: 'via quality monitoring' },
    { number: '96%', label: 'quality post-migration', detail: 'previously 30%' },
    { number: '80%', label: 'AI-powered tests', detail: 'auto-generated' }
  ];

  const impactCardsHtml = impactCards.map(card => `
    <div class="impact-card">
      <div class="impact-number">${card.number}</div>
      <div class="impact-label">${card.label}</div>
      <div class="impact-detail">${card.detail}</div>
    </div>
  `).join('');

  // Truncate experience details — keep intro + tools, remove verbose bullets
  function truncateForPDF(details) {
    if (!details) return '';
    const lines = details.split('\n');
    const introLines = [];
    const toolLines = [];
    let inTools = false, inBullets = false;
    for (const line of lines) {
      if (line.match(/^\*\*(Schwerpunkte|Key Responsibilities|Workshop-Inhalte|Workshop Content|Practical|Projekte\b|Energiesektor|Quantifizierbare|Quantifiable|Focus areas|Key Focus|Hauptverantwortlichkeiten|Präsentationsinhalte|Wichtige Erfolge|Key Achievements|Technische Lösungen|Technical Solutions)/)) {
        inBullets = true; inTools = false; continue;
      }
      if (line.match(/^\*\*(Tools|Technologien|Technologies|Eingesetzte|Technical Stack|Technischer)/)) {
        inBullets = false; inTools = true; toolLines.push(line); continue;
      }
      // Also catch bare tool lines (- IntelliJ, - Java, etc.) after a Tools header
      if (inBullets && line.match(/^- [A-Z]/) && !line.match(/^- \*\*/)) {
        continue; // skip bullet items in Schwerpunkte sections
      }
      if (!inBullets && !inTools) introLines.push(line);
      else if (inTools) toolLines.push(line);
    }
    let intro = introLines.join('\n').trim();
    const words = intro.split(/\s+/);
    if (words.length > 45) intro = words.slice(0, 45).join(' ') + '...';
    // Compact tool lines: if individual items (- Tool), join into one line
    let tools = toolLines.join('\n').trim();
    const toolItems = tools.split('\n').filter(l => l.startsWith('- ')).map(l => l.replace(/^- /, ''));
    if (toolItems.length > 3) {
      // Compress individual tool lines into a comma-separated list
      const header = toolLines.find(l => l.startsWith('**')) || '**Tools & Technologien**';
      tools = header + '\n' + toolItems.join(' · ');
    }
    // Limit tools section length
    const toolWords = tools.split(/\s+/);
    if (toolWords.length > 40) tools = toolWords.slice(0, 40).join(' ') + '...';
    return tools ? intro + '\n\n' + tools : intro;
  }

  // Sort experiences: employment first, workshops/presentations last
  const allExps = [...langConfig.experiences.list];
  const isWorkshop = (exp) => /Workshop|Präsentation|Presentation/i.test(exp.position);
  const mainExps = allExps.filter(e => !isWorkshop(e));
  const workshopExps = allExps.filter(e => isWorkshop(e));
  const sortedExps = [...mainExps, ...workshopExps];

  // Split: recent with details, older as compact
  const recentExps = sortedExps.slice(0, 5);
  const olderExps = sortedExps.slice(5);

  const experienceItems = recentExps.map(exp => {
    const truncated = truncateForPDF(exp.details);
    const formattedDetails = formatTextToParagraphs(truncated);
    return `
      <div class="experience-item page-break-avoid">
        <div class="experience-header">
          <div class="experience-title">${exp.position}</div>
          <div class="experience-dates">${exp.dates}</div>
        </div>
        <div class="experience-company">${exp.company}</div>
        <div class="experience-details">${formattedDetails}</div>
      </div>
    `;
  }).join('');

  const olderExpItems = olderExps.length > 0 ? `
    <div style="margin-top: 12px; border-top: 1px solid #E2E8F0; padding-top: 10px;">
      <div style="font-size: 7pt; text-transform: uppercase; letter-spacing: 0.15em; color: #7a8b9a; margin-bottom: 8px;">
        ${isDE ? 'Frühere Positionen' : 'Earlier Positions'}
      </div>
      ${olderExps.map(exp => `
        <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 3px 0; border-bottom: 1px solid rgba(0,0,0,0.04);">
          <div><span style="font-weight: 600; font-size: 8pt;">${exp.position}</span> <span style="color: #7a8b9a; font-size: 7.5pt;">— ${exp.company}</span></div>
          <span style="font-size: 7pt; color: #7a8b9a; white-space: nowrap;">${exp.dates}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Generate project items — compact, no screenshots
  const projectItems = langConfig.projects.list.filter(project => project.featured).slice(0, 6).map(project => {
    const techTags = project.tech_stack ? project.tech_stack.map(tech =>
      `<span class="tech-tag">${tech}</span>`
    ).join('') : '';

    const formattedTagline = formatMarkdownToHTML(project.tagline);

    return `
      <div class="project-item page-break-avoid">
        <div class="project-title">${project.title}</div>
        <div class="project-tech">${techTags}</div>
        <div class="project-description">${formattedTagline}</div>
      </div>
    `;
  });
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

  return `
<!DOCTYPE html>
<html lang="${language}" class="pdf-cv-layout">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${langConfig.profile.name} - Professional CV</title>

    <style>
        /* System fonts only — no external dependencies */

        * { margin: 0; padding: 0; box-sizing: border-box; }

        @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
        }

        body {
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            font-size: 9pt;
            line-height: 1.5;
            color: #1E293B;
            background: white;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }

        .cv-container { max-width: 100%; margin: 0; padding: 0; }

        /* --- DARK HEADER --- */
        .cv-header {
            display: grid;
            grid-template-columns: 90px 1fr;
            gap: 16px;
            align-items: center;
            background: #0F1419;
            margin: -12mm -10mm 15px -10mm;
            padding: 16mm 10mm 14px 10mm;
        }

        .profile-photo {
            width: 90px; height: 90px; border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.1); object-fit: cover;
        }

        .header-content h1 {
            font-family: Georgia, 'Times New Roman', serif; font-weight: 700;
            font-size: 20pt; color: #F0F0F0; margin-bottom: 3px;
        }

        .header-tagline {
            font-size: 9pt; color: rgba(255,255,255,0.7); font-weight: 500; margin-bottom: 10px;
        }

        .contact-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 4px 20px; font-size: 8pt;
        }

        .contact-item {
            display: flex; align-items: center; gap: 4px;
            color: rgba(255,255,255,0.6);
        }

        .contact-item i { width: 10px; color: #3a8fa0; font-size: 7pt; }
        .contact-item a { color: #3a8fa0; text-decoration: none; }
        .contact-item span { color: rgba(255,255,255,0.6); }

        /* --- IMPACT STRIP --- */
        .impact-strip {
            display: grid; grid-template-columns: 1fr 1fr 1fr;
            gap: 12px; margin: 0 0 18px 0;
        }

        .impact-card {
            background: #0F1419; border-radius: 6px;
            padding: 12px 16px; text-align: center;
        }

        .impact-number {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 20pt; font-weight: 700; color: #3a8fa0;
            line-height: 1.1; margin-bottom: 2px;
        }

        .impact-label {
            font-size: 8pt; font-weight: 600; color: #F0F0F0;
            margin-bottom: 2px;
        }

        .impact-detail {
            font-size: 7pt; color: rgba(255,255,255,0.5);
        }

        /* --- SECTION HEADINGS --- */
        .cv-section h2 {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 11pt; font-weight: 700; color: #3a8fa0;
            margin: 14px 0 10px 0; padding-bottom: 4px;
            border-bottom: 2px solid #3a8fa0;
            letter-spacing: -0.01em;
            page-break-after: avoid;
        }

        /* --- META STRIP (replaces sidebar) --- */
        .meta-strip {
            display: grid; grid-template-columns: 1fr 1fr 1fr;
            gap: 16px; margin: 0 0 14px 0;
            padding: 14px; background: #F8FAFC;
            border-radius: 6px; border: 1px solid #E2E8F0;
        }

        .meta-col h3 {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 9pt; font-weight: 600; color: #3a8fa0;
            margin-bottom: 8px; letter-spacing: -0.01em;
        }

        .skills-list { display: flex; flex-wrap: wrap; gap: 4px; }

        .skill-tag {
            background: #F1F5F9; color: #334155; padding: 3px 6px;
            border-radius: 3px; font-size: 7pt; font-weight: 500;
            border: 1px solid #3a8fa0;
        }

        .education-item { margin-bottom: 8px; font-size: 8pt; }
        .education-degree { font-weight: 600; color: #3a8fa0; margin-bottom: 2px; }
        .education-school { color: #475569; margin-bottom: 2px; }
        .education-dates { color: #7a8b9a; font-style: italic; }

        .language-item {
            display: flex; justify-content: space-between;
            margin-bottom: 4px; font-size: 8pt;
        }

        .language-name { font-weight: 600; color: #3a8fa0; }
        .language-level { color: #475569; }

        /* --- CAREER PROFILE --- */
        .career-profile {
            background: #F8FAFC; border-left: 4px solid #3a8fa0;
            padding: 12px; margin: 0 0 14px 0; border-radius: 0 4px 4px 0;
        }

        .career-profile h2 {
            font-family: Georgia, 'Times New Roman', serif;
            margin-top: 0; margin-bottom: 8px; border: none;
            font-size: 11pt; font-weight: 700; color: #3a8fa0;
            letter-spacing: -0.01em;
        }

        .career-profile p {
            font-size: 8pt; line-height: 1.5; margin-bottom: 6px;
        }

        .career-profile ul {
            margin: 4px 0 6px 14px; padding: 0; font-size: 8pt;
        }

        .career-profile li {
            margin-bottom: 2px; line-height: 1.4;
        }

        .career-profile strong { font-weight: 600; color: #3a8fa0; }

        /* --- EXPERIENCE --- */
        .experience-item {
            margin-bottom: 8px; padding: 8px 10px;
            background: white; border-left: 3px solid #3a8fa0;
            page-break-inside: avoid;
        }

        .experience-header {
            display: grid; grid-template-columns: 1fr auto;
            align-items: baseline; margin-bottom: 4px;
        }

        .experience-title {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 9.5pt; font-weight: 700; color: #3a8fa0;
        }

        .experience-dates {
            font-size: 8pt; color: #7a8b9a; font-style: italic;
        }

        .experience-company {
            font-size: 8pt; font-weight: 600; color: #334155; margin-bottom: 5px;
        }

        .experience-details {
            font-size: 8pt; line-height: 1.5; color: #334155;
        }

        .experience-details p { margin-bottom: 4px; }
        .experience-details ul { margin: 4px 0 4px 14px; padding: 0; }
        .experience-details li { margin-bottom: 2px; line-height: 1.4; }
        .experience-details strong { font-weight: 600; color: #3a8fa0; }

        /* --- PROJECTS (compact 2-col grid) --- */
        .projects-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .project-item {
            padding: 8px; background: white;
            border-left: 3px solid #3a8fa0;
            page-break-inside: avoid;
            box-sizing: border-box;
        }

        .project-title {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 9pt; font-weight: 700; color: #3a8fa0; margin-bottom: 3px;
        }

        .project-tech { margin: 3px 0; }

        .tech-tag {
            background: #E2E8F0; color: #475569; padding: 2px 4px;
            border-radius: 2px; font-size: 7pt; font-weight: 500; margin-right: 3px;
            display: inline-block; margin-bottom: 2px;
        }

        .project-description {
            font-size: 8pt; line-height: 1.4; color: #334155; margin-top: 3px;
            display: -webkit-box; -webkit-line-clamp: 2;
            -webkit-box-orient: vertical; overflow: hidden;
        }

        .page-break-before { page-break-before: always; }
        .page-break-avoid { page-break-inside: avoid; }
        .no-print { display: none !important; }
    </style>
    <!-- Font Awesome icons replaced with simple text symbols for PDF -->
    <style>
        .fa-envelope::before { content: "\\2709"; }
        .fa-phone::before { content: "\\260E"; }
        .fa-map-marker-alt::before { content: "\\1F4CD"; }
        .fa-linkedin::before { content: "\\1F4BC"; }
        .fa-github::before { content: "\\26A1"; }
        .fa-globe::before { content: "\\1F310"; }
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

        <div class="impact-strip">
            ${impactCardsHtml}
        </div>

        <section class="career-profile page-break-avoid">
            <h2>${langConfig.summary.title}</h2>
            ${formatTextToParagraphs(langConfig.summary.summary)}
        </section>

        <div class="meta-strip">
            <div class="meta-col">
                <h3>${langConfig.ui.sidebar_skills_title || 'Technical Skills'}</h3>
                <div class="skills-list">
                    ${skillTags}
                </div>
            </div>
            <div class="meta-col">
                <h3>${langConfig.education.title}</h3>
                ${educationItems}
                <h3 style="margin-top: 10px;">${langConfig.ui.sidebar_qualifications_title || 'Additional Qualifications'}</h3>
                <div class="skills-list">
                    <span class="skill-tag">ISTQB Certified</span>
                    <span class="skill-tag">Agile (Scrum/Kanban)</span>
                    <span class="skill-tag">${langConfig.ui.ai_badge}</span>
                </div>
            </div>
            <div class="meta-col">
                <h3>${langConfig.language.title}</h3>
                ${languageItems}
            </div>
        </div>

        <section class="cv-section">
            <h2>${langConfig.experiences.title}</h2>
            ${experienceItems}
            ${olderExpItems}
        </section>

        <section class="cv-section">
            <h2>${langConfig.projects.title}</h2>
            <div class="projects-grid">
                ${projectItemsHtml}
            </div>
        </section>
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
  
  // We'll generate HTML content directly from TOML config
  console.log('🎯 Generating PDF content from TOML configuration...');
  
  // Read and encode the profile image as base64
  const profileImagePath = path.join(__dirname, '..', 'assets', 'images', 'profile.png');
  let profileImageBase64 = '';
  try {
    // Komprimiere das Profilbild
    const compressedProfile = await sharp(profileImagePath)
      .resize(210, 210, { // Doppelte Größe für Retina, wird im CSS auf 105x105 angezeigt
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 }) // Höhere Qualität für Profilbild
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
    console.log('✅ Applying PDF optimizations...');
      
    // Apply PDF optimizations
    document.querySelectorAll('.no-print').forEach(el => {
      el.style.display = 'none';
    });
    
    // Ensure all animations are disabled
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('✅ PDF optimizations completed');
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