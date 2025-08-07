const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function combinePDFs(coverLetterPath, cvPath, outputPath) {
  try {
    // Create a new PDF document
    const combinedPdf = await PDFDocument.create();
    
    console.log('📄 Reading cover letter PDF...');
    const coverLetterPdfBytes = fs.readFileSync(coverLetterPath);
    const coverLetterPdf = await PDFDocument.load(coverLetterPdfBytes);
    
    console.log('📄 Reading CV PDF...');
    const cvPdfBytes = fs.readFileSync(cvPath);
    const cvPdf = await PDFDocument.load(cvPdfBytes);
    
    console.log('🔗 Combining documents...');
    
    // Copy all pages from cover letter
    const coverLetterPages = await combinedPdf.copyPages(coverLetterPdf, coverLetterPdf.getPageIndices());
    coverLetterPages.forEach((page) => combinedPdf.addPage(page));
    
    // Copy all pages from CV
    const cvPages = await combinedPdf.copyPages(cvPdf, cvPdf.getPageIndices());
    cvPages.forEach((page) => combinedPdf.addPage(page));
    
    console.log('💾 Saving combined PDF...');
    
    // Save the combined PDF
    const combinedPdfBytes = await combinedPdf.save();
    
    // Ensure output directory exists
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
  const [,, coverLetterPath, cvPath, outputPath] = process.argv;
  
  if (!coverLetterPath || !cvPath || !outputPath) {
    console.error('Usage: node combine_pdfs.js <cover_letter.pdf> <cv.pdf> <output.pdf>');
    process.exit(1);
  }
  
  if (!fs.existsSync(coverLetterPath)) {
    console.error(`❌ Cover letter PDF not found: ${coverLetterPath}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(cvPath)) {
    console.error(`❌ CV PDF not found: ${cvPath}`);
    process.exit(1);
  }
  
  combinePDFs(coverLetterPath, cvPath, outputPath)
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