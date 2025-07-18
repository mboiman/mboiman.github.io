#!/usr/bin/env node
const express = require('express');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/generate-pdf/:lang', async (req, res) => {
    const lang = req.params.lang.toLowerCase();
    
    if (!['de', 'en'].includes(lang)) {
        return res.status(400).json({ error: 'Invalid language. Use "de" or "en".' });
    }

    try {
        // Generate fresh PDF using the generation script
        const configFile = 'config.cv.toml';
        const outputFile = `Michael_Boiman_CV_${lang.toUpperCase()}.pdf`;
        
        console.log(`Generating PDF for language: ${lang}`);
        
        // Run the generation script
        execSync(`./scripts/generate_cv.sh ${configFile} ${outputFile}`, {
            cwd: process.cwd(),
            stdio: 'inherit'
        });
        
        // Check if PDF was created
        if (!fs.existsSync(outputFile)) {
            throw new Error('PDF generation failed');
        }
        
        // Send the PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${outputFile}"`);
        
        const pdfBuffer = fs.readFileSync(outputFile);
        res.send(pdfBuffer);
        
        // Clean up temporary PDF
        fs.unlinkSync(outputFile);
        
        console.log(`PDF generated and sent successfully: ${outputFile}`);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ 
            error: 'PDF generation failed', 
            details: error.message 
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'PDF generation service is running' });
});

app.listen(PORT, () => {
    console.log(`PDF generation service running on port ${PORT}`);
    console.log(`Generate German PDF: http://localhost:${PORT}/generate-pdf/de`);
    console.log(`Generate English PDF: http://localhost:${PORT}/generate-pdf/en`);
});