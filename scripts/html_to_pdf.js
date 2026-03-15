const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const toml = require('toml');
const sharp = require('sharp');
const { formatMarkdownToHTML, formatTextToParagraphs } = require('./lib/markdown-utils');

// Function to generate HTML content from TOML configuration
async function generateHTMLFromConfig(langConfig, profileImageData) {
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

  // Generate AI showcase items
  const aiShowcaseItems = langConfig.ai_showcase.list.map(item => `
    <div class="ai-skill-card">
      <div class="ai-skill-name">${item.name}</div>
      <div class="ai-skill-desc">${item.description}</div>
    </div>
  `).join('');

  // Truncate verbose experience details for PDF — keep intro + tools, remove bullet lists
  function truncateForPDF(details) {
    if (!details) return '';
    const lines = details.split('\n');
    const introLines = [], toolLines = [];
    let inTools = false, inBullets = false;
    for (const line of lines) {
      if (line.match(/^\*\*(Schwerpunkte|Key Responsibilities|Workshop-Inhalte|Workshop Content|Practical|Projekte\b|Energiesektor|Quantifizierbare|Quantifiable|Focus areas|Key Focus|Hauptverantwortlichkeiten|Präsentationsinhalte|Wichtige Erfolge|Technische Lösungen)/)) {
        inBullets = true; inTools = false; continue;
      }
      if (line.match(/^\*\*(Tools|Technologien|Technologies|Eingesetzte|Technical Stack|Technischer)/)) {
        inBullets = false; inTools = true; toolLines.push(line); continue;
      }
      if (!inBullets && !inTools) introLines.push(line);
      else if (inTools) toolLines.push(line);
    }
    let intro = introLines.join('\n').trim();
    const words = intro.split(/\s+/);
    if (words.length > 50) intro = words.slice(0, 50).join(' ') + '...';
    // Compact tool lines into middot-separated
    let tools = toolLines.join('\n').trim();
    const toolItems = tools.split('\n').filter(l => l.startsWith('- ')).map(l => l.replace(/^- /, ''));
    if (toolItems.length > 3) {
      const header = toolLines.find(l => l.startsWith('**')) || '**Tools & Technologien**';
      tools = header + '\n' + toolItems.join(' · ');
    }
    const toolWords = tools.split(/\s+/);
    if (toolWords.length > 40) tools = toolWords.slice(0, 40).join(' ') + '...';
    return tools ? intro + '\n\n' + tools : intro;
  }

  // Sort: priority employers first, workshops last
  const isWorkshop = (exp) => /Workshop|Präsentation|Presentation/i.test(exp.position);
  const priorityEmployers = ['TÜV', 'DVAG', 'DB Vertrieb', 'DB Systel', 'BKS'];
  const mainExps = langConfig.experiences.list.filter(e => !isWorkshop(e));
  const workshopExps = langConfig.experiences.list.filter(e => isWorkshop(e));

  // Bring priority employers to the top within mainExps
  mainExps.sort((a, b) => {
    const aHasPrio = priorityEmployers.some(p => a.company.includes(p));
    const bHasPrio = priorityEmployers.some(p => b.company.includes(p));
    if (aHasPrio && !bHasPrio) return -1;
    if (!aHasPrio && bHasPrio) return 1;
    return 0; // keep original order within same priority
  });

  const sortedExps = [...mainExps, ...workshopExps];

  // Top 7 with truncated details (to include DB Vertrieb), older as compact
  const recentExps = sortedExps.slice(0, 7);
  const olderExps = sortedExps.slice(7);

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
  }).join('') + (olderExps.length > 0 ? `
    <div style="margin-top: 10px; border-top: 1px solid #E2E8F0; padding-top: 8px;">
      <div style="font-size: 7pt; text-transform: uppercase; letter-spacing: 0.15em; color: #7a8b9a; margin-bottom: 6px;">Frühere Positionen</div>
      ${olderExps.map(exp => `
        <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 3px 0; border-bottom: 1px solid rgba(0,0,0,0.04);">
          <div><span style="font-weight: 600; font-size: 7.5pt;">${exp.position}</span> <span style="color: #7a8b9a; font-size: 7pt;">— ${exp.company}</span></div>
          <span style="font-size: 6.5pt; color: #7a8b9a; white-space: nowrap;">${exp.dates}</span>
        </div>
      `).join('')}
    </div>
  ` : '');

  // Sort projects: Enterprise/Impact projects first, side projects last
  const priorityProjects = [
    '24/7 Automated Legacy Migration',  // DB/Bahn
    'Quality Dashboard',                 // DVAG
    'E-Invoicing Automation',            // Stepstone
    'E-Mail-Klassifizierung',            // Ryze
    'Email Classification',             // EN version
    'AI Context Orchestrator',           // BKS
    'KI-basierter Chatbot',             // Messe
    'AI-Driven Chatbot',                // EN version
  ];
  const featuredProjects = langConfig.projects.list.filter(p => p.featured);
  featuredProjects.sort((a, b) => {
    const aIdx = priorityProjects.findIndex(p => a.title.includes(p));
    const bIdx = priorityProjects.findIndex(p => b.title.includes(p));
    const aPrio = aIdx >= 0 ? aIdx : 100;
    const bPrio = bIdx >= 0 ? bIdx : 100;
    return aPrio - bPrio;
  });

  // Generate project items
  const projectItems = await Promise.all(featuredProjects.map(async project => {
    const techTags = project.tech_stack ? project.tech_stack.map(tech => 
      `<span class="tech-tag">${tech}</span>`
    ).join('') : '';
    
    // Check if project has screenshot and try to load it
    let screenshotBase64 = '';
    let hasScreenshot = false;
    
    if (project.screenshot) {
      const screenshotPath = path.join(__dirname, '..', 'assets', 'images', project.screenshot);
      try {
        // Komprimiere das Bild mit sharp
        const compressedImage = await sharp(screenshotPath)
          .resize(170, 120, { // Größere Screenshots für visuelle Wirkung
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 80 }) // Bessere Qualität
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
    
    const formattedTagline = formatMarkdownToHTML(project.tagline);
    
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

  return `
<!DOCTYPE html>
<html lang="de" class="pdf-cv-layout">
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
            font-size: 7.5pt;
            line-height: 1.35;
            color: #1E293B;
            background: white;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }
        
        .cv-container { max-width: 100%; margin: 0; padding: 0; }
        
        .cv-header {
            display: grid;
            grid-template-columns: 100px 1fr;
            gap: 18px;
            align-items: center;
            background: linear-gradient(135deg, #0B1120, #162032);
            color: #F0F0F0;
            margin: -12mm -10mm 0 -10mm;
            padding: 14mm 10mm 14px 10mm;
            border-bottom: 3px solid #3a8fa0;
        }

        .profile-photo {
            width: 95px; height: 95px; border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.15); object-fit: cover;
            box-shadow: 0 0 15px rgba(58,143,160,0.2);
        }

        .header-content h1 {
            font-family: Georgia, 'Times New Roman', serif; font-weight: 700;
            font-size: 20pt; color: #F0F0F0; margin-bottom: 3px;
            letter-spacing: -0.02em;
        }

        .header-tagline {
            font-size: 8.5pt; color: rgba(255,255,255,0.7); font-weight: 500; margin-bottom: 8px;
        }

        .contact-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 4px 20px; font-size: 7pt;
        }

        .contact-item {
            display: flex; align-items: center; gap: 4px;
            color: rgba(255,255,255,0.5);
        }

        .contact-item i { width: 10px; color: #3a8fa0; font-size: 6pt; }
        .contact-item a { color: #3a8fa0; text-decoration: none; }
        .contact-item span { color: rgba(255,255,255,0.5); }

        /* Impact strip between header and AI showcase */
        .impact-strip {
            display: grid; grid-template-columns: 1fr 1fr 1fr;
            gap: 10px; margin: 12px 0;
        }
        .impact-card {
            background: #0F1419; border-radius: 5px;
            padding: 10px 14px; text-align: center;
            border-top: 2px solid #3a8fa0;
        }
        .impact-number {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 22pt; font-weight: 900; color: #3a8fa0;
            line-height: 1; letter-spacing: -0.02em;
        }
        .impact-label { font-size: 7.5pt; font-weight: 600; color: #F0F0F0; margin-top: 3px; }
        .impact-detail { font-size: 6.5pt; color: #8899AA; margin-top: 2px; }
        
        .ai-showcase {
            background: linear-gradient(135deg, #E8EEF4 0%, #DCE6EF 100%);
            border: 1px solid #CBD5E1;
            border-left: 4px solid #3a8fa0;
            padding: 14px 16px; margin: 12px 0;
            border-radius: 0 6px 6px 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        
        .ai-showcase h2 {
            font-family: Georgia, 'Times New Roman', serif; font-weight: 700;
            font-size: 11pt; font-weight: 600; color: #3a8fa0;
            margin-bottom: 8px; text-align: center;
        }
        
        .ai-skills-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        
        .ai-skill-card {
            background: #F0F4F8; padding: 9px 10px; border-radius: 5px;
            border: 1px solid #C4CDD8;
            box-shadow: 0 1px 3px rgba(0,0,0,0.06);
            transition: none;
        }
        
        .ai-skill-name {
            font-size: 7.5pt; font-weight: 600; color: #3a8fa0; margin-bottom: 3px;
        }
        
        .ai-skill-desc {
            font-size: 7pt; color: #475569; line-height: 1.35;
        }
        
        .cv-main {
            display: grid; grid-template-columns: 2fr 1fr; /* Keep sidebar but make experience section wider */
            gap: 20px; margin-top: 15px;
        }
        
        .cv-section h2 {
            font-family: Georgia, 'Times New Roman', serif; font-weight: 700;
            font-size: 11pt; font-weight: 700; color: #3a8fa0;
            margin: 12px 0 10px 0; padding-bottom: 4px;
            border-bottom: 2px solid #3a8fa0;
            text-transform: uppercase; letter-spacing: 0.8px;
            page-break-after: avoid;
        }
        
        .cv-full-width {
            margin-top: 20px;
        }
        
        .career-profile {
            background: #E8EEF4; border-left: 4px solid #3a8fa0;
            padding: 12px; margin: 12px 0; border-radius: 0 4px 4px 0;
        }
        
        .career-profile h2 {
            font-family: Georgia, 'Times New Roman', serif; font-weight: 700;
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
        
        .experience-item {
            margin-bottom: 10px; padding: 10px 12px; background: #EDF2F7;
            border-left: 3px solid #3a8fa0; border-radius: 0 6px 6px 0;
            page-break-inside: avoid;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        
        .experience-header {
            display: grid; grid-template-columns: 1fr auto;
            align-items: baseline; margin-bottom: 4px;
        }
        
        .experience-title {
            font-size: 8.5pt; font-weight: 700; color: #3a8fa0;
        }
        
        .experience-dates {
            font-size: 7pt; color: #7a8b9a; font-style: italic;
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
        
        .projects-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .project-item {
            width: calc(50% - 4px);
            margin-bottom: 0; padding: 10px 12px; background: #EDF2F7;
            border-left: 3px solid #3a8fa0; border-radius: 0 6px 6px 0;
            page-break-inside: avoid;
            box-sizing: border-box;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
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
            font-size: 8.5pt; font-weight: 700; color: #3a8fa0; margin-bottom: 4px;
        }

        .project-tech { margin: 3px 0; }

        .tech-tag {
            background: #D1DAE6; color: #334155; padding: 2px 4px;
            border-radius: 2px; font-size: 6pt; font-weight: 500; margin-right: 3px;
            display: inline-block; margin-bottom: 2px;
        }

        .project-description {
            font-size: 6.5pt; line-height: 1.35; color: #334155; margin-top: 4px;
        }

        .project-screenshot {
            width: 85px; height: 60px; object-fit: cover;
            border-radius: 4px; border: 1px solid #d1d9e0;
            background: #fff; flex-shrink: 0;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
            box-shadow: 0 2px 6px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
        }
        
        .cv-sidebar {
            background: linear-gradient(180deg, #E8EEF4 0%, #DDE5EE 100%);
            padding: 15px; border-radius: 8px;
            border: 1px solid #B8C5D3; height: fit-content;
            box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        
        .sidebar-section { margin-bottom: 15px; }
        
        .sidebar-section h3 {
            font-size: 8pt; font-weight: 600; color: #3a8fa0;
            margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px;
        }
        
        .skills-list { display: flex; flex-wrap: wrap; gap: 4px; }

        .skill-tag {
            background: #D4E4EA; color: #1E293B; padding: 3px 7px;
            border-radius: 4px; font-size: 6.5pt; font-weight: 500;
            border: 1px solid rgba(58,143,160,0.5);
        }
        
        .education-item { margin-bottom: 8px; font-size: 7pt; }
        .education-degree { font-weight: 600; color: #3a8fa0; margin-bottom: 2px; }
        .education-school { color: #475569; margin-bottom: 2px; }
        .education-dates { color: #7a8b9a; font-style: italic; }

        .language-item {
            display: flex; justify-content: space-between;
            margin-bottom: 4px; font-size: 7pt;
        }

        .language-name { font-weight: 600; color: #3a8fa0; }
        .language-level { color: #475569; }
        
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

        <div class="impact-strip">
            <div class="impact-card">
                <div class="impact-number">-80%</div>
                <div class="impact-label">weniger Rückfragen</div>
                <div class="impact-detail">durch Quality-Monitoring</div>
            </div>
            <div class="impact-card">
                <div class="impact-number">96%</div>
                <div class="impact-label">Qualität nach Migration</div>
                <div class="impact-detail">vorher 30%</div>
            </div>
            <div class="impact-card">
                <div class="impact-number">80%</div>
                <div class="impact-label">KI-gestützte Tests</div>
                <div class="impact-detail">auto-generiert</div>
            </div>
        </div>

        <section class="ai-showcase">
            <h2>${langConfig.ui.ai_skills_title}</h2>
            <div class="ai-skills-grid">
                ${aiShowcaseItems}
            </div>
        </section>

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

        <!-- Full width section for projects -->
        <section class="cv-section cv-full-width">
            <h2>${langConfig.projects.title}</h2>
            <div class="projects-grid">
                ${projectItemsHtml}
            </div>
        </section>

        <!-- Full width section for experience -->
        <section class="cv-section cv-full-width">
            <h2>${langConfig.experiences.title}</h2>
            ${experienceItems}
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
  const htmlContent = await generateHTMLFromConfig(langConfig, profileImageBase64);
  
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