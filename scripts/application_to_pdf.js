const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const toml = require('toml');
const sharp = require('sharp');
const { themeCss, renderHeader, stripEmoji, escapeHtml, applyApplicationOverrides, prose } = require('./lib/pdf-theme');

/** Blank-line separated text to <p> blocks, single newlines kept as <br>. */
function paragraphs(text, cls) {
  if (!text) return '';
  return String(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p${cls ? ` class="${cls}"` : ''}>${prose(p)}</p>`)
    .join('');
}

/**
 * Recipient block in letter order: company, contact person, street, postcode
 * and town. A one-line address such as "Schillerstraße 5, 76530 Baden-Baden"
 * is split before the postcode, the way it would be written on an envelope.
 */
function recipientBlock(data) {
  const lines = [data.company];
  if (data.contactPerson) lines.push(data.contactPerson);
  for (const raw of String(data.address || '').split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(.*?),\s*(\d{4,5}\s+.+)$/);
    if (m) lines.push(m[1], m[2]); else lines.push(line);
  }
  return lines.filter(Boolean).map(escapeHtml).join('<br>');
}

/** "Frankfurt am Main, 24. September 2026": the town is added when the data carries only the date. */
function letterDate(data, langConfig, lang) {
  // A town prefix is text up to a comma, then the date. "April 12, 2026"
  // also has a comma but starts with the date, so it still gets the town.
  if (data.date && /^[^\d,]+,\s*\S/.test(data.date)) return data.date;
  const town = String(langConfig.ui.location || 'Frankfurt am Main').split(',')[0].trim();
  const date = data.date || new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${town}, ${date}`;
}

function generateCoverLetterHTML(data, langConfig, profileImageData) {
  langConfig = applyApplicationOverrides(langConfig, data);
  const lang = data.language || 'de';
  const de = lang !== 'en';
  const templatePath = path.join(__dirname, '..', 'templates', 'cover-letter.html');
  const template = fs.readFileSync(templatePath, 'utf8');

  const requirements = data.requirements || [];
  const mappingTitle = langConfig.ui.requirements_mapping_title || (de ? 'Ihre Anforderungen und meine Qualifikationen' : 'Your requirements and my qualifications');
  const requirementsSection = requirements.length ? `
    <section class="mapping">
      ${renderHeader(langConfig, profileImageData)}
      <h2 class="section-title">${escapeHtml(mappingTitle)}</h2>
      ${requirements.map((r) => `
        <div class="req">
          <div class="req-label">${escapeHtml(stripEmoji(r.requirement))}</div>
          <div>
            <div>${prose(r.response)}</div>
            ${r.cvReference ? `<div class="req-ref">${escapeHtml(stripEmoji(r.cvReference))}</div>` : ''}
          </div>
        </div>`).join('')}
    </section>` : '';

  let enclosure = stripEmoji(langConfig.ui.attachment_label || (de ? 'Anlage: Lebenslauf' : 'Enclosure: Curriculum vitae'));
  if (requirements.length) enclosure += de ? ', Anforderungsabgleich' : ', requirements match';

  const body = [
    paragraphs(data.opening),
    paragraphs(data.addedValue),
    paragraphs(data.aiDisclosure, 'note'),
    paragraphs(data.availability),
    paragraphs(data.closing),
  ].join('');

  const values = {
    LANGUAGE: lang,
    NAME: escapeHtml(langConfig.profile.name),
    DOC_TITLE: de ? 'Bewerbung' : 'Application',
    COMPANY: escapeHtml(data.company || ''),
    THEME_CSS: themeCss(data.style),
    HEADER: renderHeader(langConfig, profileImageData),
    AI_DISCLOSURE_TOP: data.aiDisclosureTop ? `<div class="note" style="margin-top:4mm;text-align:right">${prose(data.aiDisclosureTop)}</div>` : '',
    RECIPIENT: recipientBlock(data),
    DATE: escapeHtml(letterDate(data, langConfig, lang)),
    SUBJECT: escapeHtml(stripEmoji(`${langConfig.ui.application_subject_prefix || (de ? 'Bewerbung als' : 'Application for')} ${data.position}`)),
    GREETING: escapeHtml(stripEmoji(data.greeting || '')),
    BODY: body,
    SIGN_OFF: prose(data.signOff || (de ? 'Mit freundlichen Grüßen' : 'Kind regards')),
    ATTACHMENT_LABEL: escapeHtml(enclosure),
    REQUIREMENTS_SECTION: requirementsSection,
  };
  // split/join instead of String.replace: the values carry "$" (base64, prices)
  // and replace() would read "$&" and friends as patterns.
  return Object.entries(values).reduce((html, [key, value]) => html.split(`{{${key}}}`).join(value), template);
}

module.exports = { generateCoverLetterHTML, recipientBlock, letterDate };

if (require.main === module) (async () => {

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
    console.log('✅ Profile image processed');
  } catch (error) {
    console.log('⚠️  Could not load profile image:', error.message);
  }
  
  // Generate cover letter HTML
  const coverLetterHTML = generateCoverLetterHTML(coverLetterData, langConfig, profileImageBase64);
  
  // For now, just generate the cover letter PDF
  // The CV will be added by the orchestration script
  
  await page.setContent(coverLetterHTML, {
    waitUntil: 'domcontentloaded',
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
      top: '14mm',
      bottom: '16mm',
      left: '16mm',
      right: '16mm'
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