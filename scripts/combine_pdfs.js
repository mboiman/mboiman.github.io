const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

/**
 * Joins PDFs in the given order. The application bundle is cover letter, then
 * optionally the project match (MATCH_PDF in generate_application.sh), then CV.
 */
async function combinePDFs(inputs, outputPath) {
  try {
    const combinedPdf = await PDFDocument.create();
    for (const input of inputs) {
      console.log(`📄 Reading ${input}...`);
      const pdf = await PDFDocument.load(fs.readFileSync(input));
      const pages = await combinedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => combinedPdf.addPage(page));
    }

    console.log('💾 Saving combined PDF...');
    const combinedPdfBytes = await combinedPdf.save();
    const outputDir = require('path').dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, combinedPdfBytes);

    console.log(`✅ Combined PDF saved to: ${outputPath}`);
    console.log(`📊 Total pages: ${combinedPdf.getPageCount()}`);
    return true;
  } catch (error) {
    console.error('❌ Error combining PDFs:', error);
    return false;
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: node combine_pdfs.js <first.pdf> [<more.pdf>...] <output.pdf>');
    process.exit(1);
  }
  const outputPath = args.pop();
  for (const input of args) {
    if (!fs.existsSync(input)) {
      console.error(`❌ PDF not found: ${input}`);
      process.exit(1);
    }
  }

  combinePDFs(args, outputPath)
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { combinePDFs };