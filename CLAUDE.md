# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hugo-based CV generation system that creates multilingual (German/English) curriculum vitae websites and converts them to PDF. The site uses a custom Hugo theme (`bks-theme`) and includes automated build and PDF generation scripts.

## Build System & Development Commands

### Primary Build Commands
- `hugo` - Build the static site using Hugo
- `hugo server` or `hugo serve` - Start local development server
- `./scripts/generate_cv.sh <custom_config.toml> [output.pdf]` - Generate PDF from custom configuration
- `./scripts/generate_cv.sh <custom_config.toml> [output.pdf] --standalone` - Generate PDF using only the custom config (no merging)

### Examples
```bash
# Build with custom config and generate PDF
./scripts/generate_cv.sh config.cv.toml sample.pdf

# Build with custom config (standalone mode)
./scripts/generate_cv.sh config.de.toml sample.pdf --standalone
```

### Dependencies
- Node.js and npm (for Puppeteer PDF generation)
- Hugo (static site generator)
- Dependencies are auto-installed via `npm ci` when running the generation script

## Architecture

### Configuration System
- **Base Configuration**: `config.cv.toml` - Main Hugo configuration with multilingual support
- **Custom Configurations**: Can be created for specific CV variants (e.g., `config.de.toml`)
- **Configuration Merging**: The generation script merges base config with custom configs unless `--standalone` is used

### Content Structure
- `content/de/` - German language content (markdown files)
- `content/en/` - English language content (markdown files)
- Content is organized by CV sections: `education/`, `experience/`, `projects/`, `skills/`, `summary/`

### Theme Structure
- `themes/bks-theme/` - Custom Hugo theme
- `layouts/` - HTML templates for different CV sections
- `static/assets/` - CSS, JavaScript, and image assets
- Multiple theme variants available (`styles.css`, `styles-2.css`, etc.)

### Build Process
1. Hugo builds the static site from configuration and content
2. `scripts/html_to_pdf.js` uses Puppeteer to convert HTML to PDF
3. Language detection automatically determines the main page path
4. Temporary build directories are cleaned up after PDF generation

### PDF Generation
- Uses Puppeteer with headless Chrome
- Converts the generated HTML to A4 PDF format
- Supports print-specific CSS styles
- Handles both single and multilingual site structures

## Configuration Notes

### Language Configuration
- `defaultContentLanguage` determines the primary language
- `defaultContentLanguageInSubdir = true` creates language-specific subdirectories
- Both German (`de`) and English (`en`) configurations are supported

### CV Sections
The TOML configuration defines CV sections including:
- Profile information and contact details
- Education and certifications
- Professional experience with detailed job descriptions
- Skills and technical proficiencies
- Projects and side activities
- Language proficiencies

## Development Workflow

When making changes to the CV content or styling:
1. Edit the relevant TOML configuration file
2. Test locally with `hugo server`
3. Generate PDF with the generation script
4. Review the PDF output for formatting and content accuracy

When modifying the theme:
1. Edit files in `themes/bks-theme/`
2. Test with `hugo server`
3. Ensure PDF generation still works correctly with the changes

## Memories
- `teste immer am ende das Ergebniss` - A reminder to always test the result at the end
- `alle text bausteine müssen aus der toml kommen es darf nichts in den anderen dateien wie html liegen. also keine texte von wo anders` - Ensure all text components come from the TOML file, with no text residing in other files like HTML
- `du sollst kein python hier ständig mir anbieten als server das ist hugo` - Reminder that Hugo is the preferred server, not Python
- `du sollst nicht behaupten das der server läuft wenn es nicht so ist und du nicht getestet hast` - Do not claim the server is running if you have not tested it and it is not actually running
- `die pdf und die web ansicht sind unterschiedlich generiert und in unterschiedlichen stellen verordnet` - The PDF and web views are generated differently and organized in different places
- `merke das pdf anpassungen im @scripts/html_to_pdf.js anzupassen ist` - Remember to adjust PDF-related changes in the @scripts/html_to_pdf.js file