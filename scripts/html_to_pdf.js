const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const [,, inputHtml, outputPdf] = process.argv;
  if (!inputHtml || !outputPdf) {
    console.error('Usage: node html_to_pdf.js <input.html> <output.pdf>');
    process.exit(1);
  }

  console.log('🚀 Starting improved PDF generation...');
  console.log('📄 Input:', inputHtml);
  console.log('📋 Output:', outputPdf);

  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  const page = await browser.newPage();
  
  // Set viewport for consistent rendering
  await page.setViewport({ width: 1200, height: 800 });
  
  const fileUrl = 'file://' + path.resolve(inputHtml);
  console.log('🌐 Loading page:', fileUrl);
  
  // Wait for all resources to load
  await page.goto(fileUrl, {
    waitUntil: ['networkidle0', 'domcontentloaded', 'load']
  });
  
  console.log('⚡ Optimizing for PDF rendering...');
  
  // Disable animations and ensure skills bars are visible
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        animation-play-state: paused !important;
      }
      
      /* Ensure skills bars are visible in PDF */
      .skill-fill {
        width: var(--skill-width) !important;
        animation: none !important;
        transition: none !important;
      }
      
      /* Force skill bar visibility */
      .level-bar-inner {
        animation: none !important;
        transition: none !important;
      }
    `
  });
  
  // Ensure all skill bars are set to their correct width
  await page.evaluate(() => {
    // Set JavaScript-based skill bars
    document.querySelectorAll('.level-bar-inner').forEach(bar => {
      const level = bar.getAttribute('data-level');
      if (level) {
        bar.style.width = level;
        bar.style.animation = 'none';
        bar.style.transition = 'none';
      }
    });
    
    // Set CSS-based skill bars
    document.querySelectorAll('.skill-fill').forEach(bar => {
      const parent = bar.parentElement;
      if (parent && parent.style.getPropertyValue('--skill-width')) {
        const width = parent.style.getPropertyValue('--skill-width');
        bar.style.width = width;
        bar.style.animation = 'none';
        bar.style.transition = 'none';
      }
    });
  });
  
  // Wait a bit more to ensure everything is rendered
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('📄 Generating PDF...');
  
  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false,
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '12mm',
      right: '12mm'
    }
  });
  
  await browser.close();
  console.log('✅ PDF generated successfully at:', outputPdf);
})();
