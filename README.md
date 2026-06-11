# CV Generation System

This repository contains an Astro-based multilingual CV generation system that creates both web pages and professional PDFs from TOML configuration files.

## Quick Start

**Complete development workflow (like GitHub Actions pipeline):**

```bash
# 1. Install dependencies
npm ci

# 2. Generate PDFs (the site links to them under public/pdfs/)
./scripts/generate_cv.sh config.cv.toml public/pdfs/Michael_Boiman_CV_DE.pdf de
./scripts/generate_cv.sh config.cv.toml public/pdfs/Michael_Boiman_CV_EN.pdf en

# 3. Build the website
npm run build

# 4. Start development server
npm run dev
```

**Then open:**
- German CV: http://localhost:4321/de/
- English CV: http://localhost:4321/en/

## Important: PDF Generation Order

⚠️ **PDFs must be generated BEFORE building the site**, as the website includes download links that reference these PDF files in `public/pdfs/`.

## Architecture

### Configuration System
- **CV Content**: `config.cv.toml` — all CV data (profile, experience, projects, skills) with multilingual support, parsed by `src/lib/toml-loader.ts`
- **UI Strings**: `src/lib/i18n.ts` — localized interface strings (DE/EN)
- **Custom Configurations**: Can be created for specific CV variants
- **Languages**: German (`de`) and English (`en`), routed under `/de/` and `/en/` (Astro i18n, `prefixDefaultLocale: true`)

### Site Structure
```
src/
├── components/     # Astro components (CVPage, AgentWidget, StoryPage, DarkModeToggle)
├── layouts/        # Page layouts
├── lib/            # toml-loader, i18n, markdown helpers
└── pages/
    ├── de/         # German routes (index, story, datenschutz, impressum)
    └── en/         # English routes
public/             # Static assets (fonts, images, generated PDFs)
```

### Build Process
1. **PDF Generation**: `scripts/html_to_pdf.js` uses Puppeteer to generate PDFs directly from the TOML config (own print template, independent of the web view)
2. **Website Build**: `astro build` renders the static multilingual site
3. **Static Assets**: PDFs live in `public/pdfs/` and are served as downloadable assets

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
- Direct generation from TOML configuration (no dependency on the built site)

## Development Commands

```bash
npm ci              # install dependencies
npm run dev         # Astro dev server (http://localhost:4321)
npm run build       # production build to dist/
npm run preview     # preview the production build

# Quick PDF generation for testing
./scripts/generate_cv.sh config.cv.toml test_output.pdf de
```

## Live AI Agent

The CV page embeds a chat widget (`src/components/AgentWidget.astro`) that talks
to a self-hosted A2A agent (JSON-RPC + SSE). The agent answers questions about
experience and stack, reads availability as free/busy, and takes meeting
requests that are only answered after personal approval.

## Deployment

The GitHub Actions workflow (`.github/workflows/gh-pages.yml`) automatically:
1. Installs dependencies (`npm ci`)
2. Generates PDFs in correct order
3. Builds the Astro site
4. Deploys to GitHub Pages

A manual preview workflow exists for feature branches (`preview-deploy.yml`).

## Application Generation System

Generate professional applications with tailored cover letters that map CV qualifications directly to job requirements.

### Quick Application Generation

```bash
# Interactive workflow via Claude Command
/bewerbung

# Direct script usage
./scripts/generate_application.sh config.cv.toml bewerbung_firma.pdf de cover_letter_data.json
```

### Application System Features

- **Requirement Mapping**: Cover letter shows exactly where in the CV each qualification is found
- **Professional Layout**: Consistent design between cover letter and CV
- **AI-Assisted**: Claude Command guides through the entire process

### Application Workflow

1. **Use `/bewerbung` command** → Interactive process with Claude
2. **Analyze job posting** → Extract requirements and company info
3. **Generate cover letter data** → Create requirement mapping
4. **Generate application PDF** → Cover letter + CV combined

### Cover Letter Structure

The generated cover letter includes:
- **Header**: Same design as CV for consistency
- **Company-specific introduction**
- **Requirement Mapping Section**:
  - "You need: [Requirement]"
  - "I offer: [Your qualification]"
  - "See CV: [Page reference]"
- **Professional closing**

The result is a professional PDF with the cover letter as page 1 and the complete CV following.

## Requirements

- Node.js and npm (Astro build + PDF generation via Puppeteer)
- Dependencies are auto-installed via `npm ci`
