# CV Generation System

This repository contains a Hugo-based multilingual CV generation system that creates both web pages and professional PDFs from TOML configuration files.

## Quick Start

**Complete development workflow (like GitHub Actions pipeline):**

```bash
# 1. Install dependencies
npm ci

# 2. Generate PDFs (MUST be done before building the site)
./scripts/generate_cv.sh config.cv.toml static/pdfs/Michael_Boiman_CV_DE.pdf de
./scripts/generate_cv.sh config.cv.toml static/pdfs/Michael_Boiman_CV_EN.pdf en

# 3. Build the website
hugo --minify --config config.cv.toml

# 4. Start development server
hugo server --config config.cv.toml
```

**Then open:**
- German CV: http://localhost:1313/de/
- English CV: http://localhost:1313/en/

## Important: PDF Generation Order

⚠️ **PDFs must be generated BEFORE building the Hugo site**, as the website includes download links that reference these PDF files in `static/pdfs/`.

## Architecture

### Configuration System
- **Base Configuration**: `config.cv.toml` - Main Hugo configuration with multilingual support
- **Custom Configurations**: Can be created for specific CV variants
- **Languages**: German (`de`) and English (`en`) supported

### Build Process
1. **PDF Generation**: `scripts/html_to_pdf.js` uses Puppeteer to generate PDFs directly from TOML config
2. **Website Build**: Hugo processes content and templates to create multilingual website
3. **Static Assets**: PDFs are placed in `static/pdfs/` and served as downloadable assets

## PDF Generation

```bash
# Generate PDFs with language specification
./scripts/generate_cv.sh <config.toml> <output.pdf> <language>

# Examples:
./scripts/generate_cv.sh config.cv.toml cv_german.pdf de
./scripts/generate_cv.sh config.cv.toml cv_english.pdf en

# Standalone mode (uses only the specified config)
./scripts/generate_cv.sh config.custom.toml output.pdf de --standalone
```

### PDF Features
- Professional A4 layout optimized for printing
- Compressed images for smaller file sizes
- Multilingual support (German/English)
- Direct generation from TOML configuration (no HTML intermediate step)

## Development Commands

```bash
# Full pipeline (like GitHub Actions)
npm ci
./scripts/generate_cv.sh config.cv.toml static/pdfs/Michael_Boiman_CV_DE.pdf de
./scripts/generate_cv.sh config.cv.toml static/pdfs/Michael_Boiman_CV_EN.pdf en
hugo --minify --config config.cv.toml
hugo server --config config.cv.toml

# Quick PDF generation for testing
./scripts/generate_cv.sh config.cv.toml test_output.pdf de

# Build production site
hugo --minify --config config.cv.toml
```

## Content Structure

```
content/
├── de/          # German language content
│   ├── education/
│   ├── experience/
│   ├── projects/
│   ├── skills/
│   └── summary/
└── en/          # English language content
    ├── education/
    ├── experience/
    ├── projects/
    ├── skills/
    └── summary/
```

## Deployment

The GitHub Actions workflow automatically:
1. Installs dependencies (`npm ci`)
2. Generates PDFs in correct order
3. Builds the Hugo site
4. Deploys to GitHub Pages

## Requirements

- Hugo (static site generator)
- Node.js and npm (for PDF generation via Puppeteer)
- Dependencies are auto-installed via `npm ci`
