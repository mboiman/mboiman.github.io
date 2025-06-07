const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const [,, inputHtml, outputPdf] = process.argv;
  if (!inputHtml || !outputPdf) {
    console.error('Usage: node html_to_pdf.js <input.html> <output.pdf>');
    process.exit(1);
  }

  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  const fileUrl = 'file://' + path.resolve(inputHtml);
  await page.goto(fileUrl, {waitUntil: 'networkidle0'});
  await page.pdf({path: outputPdf, format: 'A4', printBackground: true});
  await browser.close();
})();
