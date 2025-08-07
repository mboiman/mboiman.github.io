const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const toml = require('toml');
const sharp = require('sharp');

// Function to convert markdown-style formatting to HTML (copied from html_to_pdf.js)
function formatMarkdownToHTML(text) {
  if (!text) return '';
  
  let formatted = text;
  
  // Bold text: **text** -> <strong>text</strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert bullet points and list items
  formatted = formatted.replace(/^[\*\-]\s+(.+)/gm, '• $1');
  
  // Convert numbered lists
  formatted = formatted.replace(/^\d+\.\s+(.+)/gm, '• $1');
  
  // Convert section headers (lines starting with **)
  formatted = formatted.replace(/^\*\*([^*]+)\*\*$/gm, '<strong>$1</strong>');
  
  // Convert lines that end with : to be bold (section headers)
  formatted = formatted.replace(/^([^•\n]+):$/gm, '<strong>$1:</strong>');
  
  return formatted;
}

// Function to generate cover letter HTML from template and data
async function generateCoverLetterHTML(coverLetterData, langConfig, profileImageData) {
  const templatePath = path.join(__dirname, '..', 'templates', 'cover-letter.html');
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Generate contact items (same as CV)
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

  // Generate requirements mapping
  const requirementsMapping = coverLetterData.requirements.map(req => `
    <div class="requirement-item">
      <div class="requirement-label">${req.requirement}</div>
      <div class="requirement-response">${req.response}</div>
      <div class="cv-reference">${req.cvReference}</div>
    </div>
  `).join('');

  // Replace placeholders
  template = template
    .replace(/{{LANGUAGE}}/g, coverLetterData.language || 'de')
    .replace(/{{NAME}}/g, langConfig.profile.name)
    .replace(/{{COMPANY}}/g, coverLetterData.company)
    .replace(/{{TAGLINE}}/g, langConfig.ui.tagline)
    .replace(/{{PROFILE_IMAGE}}/g, profileImageData)
    .replace(/{{CONTACT_ITEMS}}/g, contactItems)
    .replace(/{{DATE}}/g, coverLetterData.date || new Date().toLocaleDateString('de-DE'))
    .replace(/{{ADDRESS}}/g, coverLetterData.address || '')
    .replace(/{{CONTACT_PERSON}}/g, coverLetterData.contactPerson || '')
    .replace(/{{SUBJECT}}/g, `Bewerbung als ${coverLetterData.position}`)
    .replace(/{{GREETING}}/g, coverLetterData.greeting)
    .replace(/{{INTRO_PARAGRAPH}}/g, `<p>${formatMarkdownToHTML(coverLetterData.opening)}</p>`)
    .replace(/{{REQUIREMENTS_MAPPING}}/g, requirementsMapping)
    .replace(/{{CLOSING_PARAGRAPH}}/g, `
      ${coverLetterData.addedValue ? `<p>${formatMarkdownToHTML(coverLetterData.addedValue)}</p>` : ''}
      ${coverLetterData.availability ? `<p>${formatMarkdownToHTML(coverLetterData.availability)}</p>` : ''}
      ${coverLetterData.closing ? `<p>${formatMarkdownToHTML(coverLetterData.closing)}</p>` : ''}
    `)
    .replace(/{{SIGN_OFF}}/g, formatMarkdownToHTML(coverLetterData.signOff || 'Mit freundlichen Grüßen').replace(/\n/g, '<br>'));

  return template;
}

// Instead of generating CV HTML separately, we'll use a different approach:
// Generate cover letter first, then call the existing CV generation system

(async () => {
  const [,, configPath, outputPdf, language, coverLetterDataPath] = process.argv;
  
  if (!configPath || !outputPdf || !coverLetterDataPath) {
    console.error('Usage: node application_to_pdf.js <config.toml> <output.pdf> <language> <cover_letter_data.json>');
    console.error('Example: node application_to_pdf.js config.cv.toml bewerbung.pdf de cover_letter_data.json');
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPdf);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('📁 Created output directory:', outputDir);
  }

  console.log('📋 Reading configuration from:', configPath);
  const configContent = fs.readFileSync(configPath, 'utf8');
  const config = toml.parse(configContent);
  
  console.log('📄 Reading cover letter data from:', coverLetterDataPath);
  const coverLetterData = JSON.parse(fs.readFileSync(coverLetterDataPath, 'utf8'));
  
  // Determine language
  const targetLang = language || config.defaultContentLanguage || 'de';
  
  if (!config.languages[targetLang]) {
    console.error(`❌ Language '${targetLang}' not found in configuration!`);
    process.exit(1);
  }
  
  const langConfig = config.languages[targetLang].params;
  console.log(`🌐 Using ${targetLang.toUpperCase()} language configuration`);

  console.log('🚀 Starting application PDF generation...');
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
  
  console.log('🎯 Generating application content...');
  
  // Read and encode the profile image as base64
  const profileImagePath = path.join(__dirname, '..', 'themes', 'bks-theme', 'static', 'assets', 'images', 'profile.png');
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
    console.log('✅ Profile image processed');
  } catch (error) {
    console.log('⚠️  Could not load profile image:', error.message);
  }
  
  // Generate cover letter HTML
  const coverLetterHTML = await generateCoverLetterHTML(coverLetterData, langConfig, profileImageBase64);
  
  // For now, just generate the cover letter PDF
  // The CV will be added by the orchestration script
  
  await page.setContent(coverLetterHTML, {
    waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
    timeout: 30000
  });
  
  console.log('⚡ Optimizing for PDF...');
  
  // Apply PDF optimizations
  await page.evaluate(() => {
    // Disable animations
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
  
  console.log('📄 Generating cover letter PDF...');
  
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
  console.log('✅ Cover letter PDF generated successfully at:', outputPdf);
})().catch(error => {
  console.error('❌ Error generating application PDF:', error);
  process.exit(1);
});