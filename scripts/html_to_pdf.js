const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const toml = require('toml');

// Function to generate HTML content from TOML configuration
function generateHTMLFromConfig(langConfig, profileImageData) {
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

  // Generate experience items
  const experienceItems = langConfig.experiences.list.map(exp => {
    // Clean up details text - remove markdown-style formatting for PDF
    let details = exp.details || '';
    details = details.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
    details = details.replace(/^\*\s+/gm, '• '); // Bullet points
    details = details.replace(/^-\s+/gm, '• '); // Bullet points
    
    return `
      <div class="experience-item page-break-avoid">
        <div class="experience-header">
          <div class="experience-title">${exp.position}</div>
          <div class="experience-dates">${exp.dates}</div>
        </div>
        <div class="experience-company">${exp.company}</div>
        <div class="experience-details">
          ${details.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('')}
        </div>
      </div>
    `;
  }).join('');

  // Generate project items (projects before experience as requested)
  const projectItems = langConfig.projects.list.filter(project => project.featured).map(project => {
    const techTags = project.tech_stack ? project.tech_stack.map(tech => 
      `<span class="tech-tag">${tech}</span>`
    ).join('') : '';
    
    return `
      <div class="project-item page-break-avoid">
        <div class="project-title">${project.title}</div>
        <div class="project-tech">${techTags}</div>
        <div class="project-description">${project.tagline}</div>
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

  // Generate skills from the skills section (sample skills for sidebar)
  const skillTags = [
    'Quality Engineering', 'Playwright', 'Cucumber/Gauge', 'Python', 'LLMs & AI APIs',
    'LangChain', 'CI/CD', 'Kubernetes', 'Azure Functions', 'Grafana', 'Elasticsearch',
    'REST APIs', 'Docker', 'JMeter', 'Gatling'
  ].map(skill => `<span class="skill-tag">${skill}</span>`).join('');

  return `
<!DOCTYPE html>
<html lang="de" class="pdf-cv-layout">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${langConfig.profile.name} - Professional CV</title>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
        }
        
        body {
            font-family: 'Inter', 'Arial', sans-serif;
            font-size: 7.5pt;
            line-height: 1.3;
            color: #2c3e50;
            background: white;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }
        
        .cv-container { max-width: 100%; margin: 0; padding: 0; }
        
        .cv-header {
            display: grid;
            grid-template-columns: 80px 1fr;
            gap: 15px;
            align-items: center;
            padding: 15px 0;
            border-bottom: 2px solid #2d7788;
            margin-bottom: 15px;
        }
        
        .profile-photo {
            width: 75px; height: 75px; border-radius: 6px;
            border: 2px solid #e1e8ed; object-fit: cover;
        }
        
        .header-content h1 {
            font-size: 18pt; font-weight: 700; color: #2d7788; margin-bottom: 3px;
        }
        
        .header-tagline {
            font-size: 9pt; color: #5a6c7d; font-style: italic; margin-bottom: 8px;
        }
        
        .contact-grid {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 4px 20px; font-size: 7pt;
        }
        
        .contact-item {
            display: flex; align-items: center; gap: 4px;
        }
        
        .contact-item i { width: 10px; color: #2d7788; font-size: 6pt; }
        .contact-item a { color: #2d7788; text-decoration: none; }
        
        .ai-showcase {
            background: linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%);
            border-left: 4px solid #2d7788;
            padding: 12px 15px; margin: 15px 0;
            border-radius: 0 4px 4px 0;
        }
        
        .ai-showcase h2 {
            font-size: 11pt; font-weight: 600; color: #2d7788;
            margin-bottom: 8px; text-align: center;
        }
        
        .ai-skills-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        
        .ai-skill-card {
            background: white; padding: 8px; border-radius: 4px;
            border: 1px solid #e1e8ed;
        }
        
        .ai-skill-name {
            font-size: 7.5pt; font-weight: 600; color: #2d7788; margin-bottom: 3px;
        }
        
        .ai-skill-desc {
            font-size: 6.5pt; color: #5a6c7d; line-height: 1.3;
        }
        
        .cv-main {
            display: grid; grid-template-columns: 1fr; /* Full width for main content as requested */
            gap: 20px; margin-top: 15px;
        }
        
        .cv-section h2 {
            font-size: 10pt; font-weight: 600; color: #2d7788;
            margin: 12px 0 8px 0; padding-bottom: 3px;
            border-bottom: 1px solid #2d7788;
            text-transform: uppercase; letter-spacing: 0.5px;
        }
        
        .career-profile {
            background: #f8fafc; border-left: 4px solid #2d7788;
            padding: 12px; margin: 12px 0; border-radius: 0 4px 4px 0;
        }
        
        .career-profile h2 {
            margin-top: 0; margin-bottom: 8px; border: none; font-size: 10pt;
        }
        
        .career-profile p {
            font-size: 7pt; line-height: 1.4; margin-bottom: 6px;
        }
        
        .career-profile strong { font-weight: 600; color: #2d7788; }
        
        .experience-item {
            margin-bottom: 8px; padding: 8px; background: #f8fafc;
            border-left: 3px solid #2d7788; border-radius: 0 4px 4px 0;
            page-break-inside: avoid;
        }
        
        .experience-header {
            display: grid; grid-template-columns: 1fr auto;
            align-items: baseline; margin-bottom: 4px;
        }
        
        .experience-title {
            font-size: 8.5pt; font-weight: 600; color: #2d7788;
        }
        
        .experience-dates {
            font-size: 7pt; color: #7a8b9a; font-style: italic;
        }
        
        .experience-company {
            font-size: 7.5pt; font-weight: 500; color: #5a6c7d; margin-bottom: 6px;
        }
        
        .experience-details {
            font-size: 6pt; line-height: 1.3; color: #3c4858;
        }
        
        .experience-details p { margin-bottom: 4px; }
        .experience-details ul { margin: 4px 0 0 12px; padding: 0; }
        .experience-details li { margin-bottom: 2px; }
        
        .project-item {
            margin-bottom: 6px; padding: 6px; background: #f8fafc;
            border-left: 3px solid #2d7788; border-radius: 0 4px 4px 0;
            page-break-inside: avoid;
        }
        
        .project-title {
            font-size: 8pt; font-weight: 600; color: #2d7788; margin-bottom: 3px;
        }
        
        .project-tech { margin: 4px 0; }
        
        .tech-tag {
            background: #e1e8ed; color: #3c4858; padding: 1px 3px;
            border-radius: 2px; font-size: 5pt; font-weight: 500; margin-right: 2px;
        }
        
        .project-description {
            font-size: 5.5pt; line-height: 1.3; color: #3c4858; margin-top: 3px;
        }
        
        .sidebar-content {
            background: #f8fafc; padding: 15px; border-radius: 6px;
            border: 1px solid #e1e8ed; margin-top: 15px;
        }
        
        .sidebar-section { margin-bottom: 15px; }
        
        .sidebar-section h3 {
            font-size: 8pt; font-weight: 600; color: #2d7788;
            margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.3px;
        }
        
        .skills-list { display: flex; flex-wrap: wrap; gap: 3px; }
        
        .skill-tag {
            background: #e3f2fd; color: #2d7788; padding: 2px 6px;
            border-radius: 3px; font-size: 6pt; font-weight: 500;
            border: 1px solid #2d7788;
        }
        
        .education-item { margin-bottom: 8px; font-size: 6.5pt; }
        .education-degree { font-weight: 600; color: #2d7788; margin-bottom: 1px; }
        .education-school { color: #5a6c7d; margin-bottom: 1px; }
        .education-dates { color: #7a8b9a; font-style: italic; }
        
        .language-item {
            display: flex; justify-content: space-between;
            margin-bottom: 3px; font-size: 6.5pt;
        }
        
        .language-name { font-weight: 500; color: #2d7788; }
        .language-level { color: #5a6c7d; }
        
        .page-break-before { page-break-before: always; }
        .page-break-avoid { page-break-inside: avoid; }
        .no-print { display: none !important; }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
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
                    ${langConfig.summary.summary.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('')}
                </section>

                <section class="cv-section">
                    <h2>${langConfig.projects.title}</h2>
                    ${projectItems}
                </section>

                <section class="cv-section page-break-before">
                    <h2>${langConfig.experiences.title}</h2>
                    ${experienceItems}
                </section>
            </div>

            <div class="sidebar-content">
                <div class="sidebar-section">
                    <h3>Technische Skills</h3>
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
                    <h3>Zusätzliche Qualifikationen</h3>
                    <div class="skills-list">
                        <span class="skill-tag">Scrum Master</span>
                        <span class="skill-tag">Product Owner</span>
                        <span class="skill-tag">ISTQB Certified</span>
                        <span class="skill-tag">${langConfig.ui.ai_badge}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

(async () => {
  const [,, configPath, outputPdf] = process.argv;
  if (!configPath || !outputPdf) {
    console.error('Usage: node html_to_pdf.js <config.toml> <output.pdf>');
    process.exit(1);
  }

  // Read and parse TOML configuration
  console.log('📋 Reading configuration from:', configPath);
  const configContent = fs.readFileSync(configPath, 'utf8');
  const config = toml.parse(configContent);
  
  // Use German language configuration by default
  const langConfig = config.languages.de.params;
  console.log('🌐 Using German language configuration');

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
  const profileImagePath = path.join(__dirname, '..', 'static', 'assets', 'images', 'profile.png');
  let profileImageBase64 = '';
  try {
    const imageBuffer = fs.readFileSync(profileImagePath);
    profileImageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    console.log('✅ Profile image loaded and encoded');
  } catch (error) {
    console.log('⚠️  Could not load profile image:', error.message);
  }
  
  // Generate HTML content directly from TOML config
  const htmlContent = generateHTMLFromConfig(langConfig, profileImageBase64);
  
  await page.setContent(htmlContent, {
    waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
    timeout: 30000
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