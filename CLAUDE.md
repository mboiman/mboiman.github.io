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

## Bewerbungsmanagement

### Zentrale Übersicht
- **Master-Dashboard:** `applications/README.md` ist das zentrale Dashboard für alle Bewerbungen
- **Detaillierte Dokumentation:** `applications/BEWERBUNGEN.md` enthält vollständige Details zu jeder Bewerbung
- **Status-Tracking:** Alle Bewerbungen werden mit Status-Icons getrackt (📋 Offen, ⏳ In Arbeit, ✅ Eingereicht, etc.)

### Workflow: Neue Bewerbung erstellen

1. **Stellenausschreibung analysieren:**
   - Nutzer kopiert Stellenausschreibungs-URL oder Text
   - `/bewerbung [Stellenausschreibungs-Text]` Command ausführen

2. **Automatischer Workflow:**
   - Analyse der Kernanforderungen aus Stellenausschreibung
   - CV-Analyse für relevante Qualifikationen (aus `config.cv.toml`)
   - Requirement-Mapping: "Sie suchen → Ich biete → Siehe CV"
   - **Interactive Review:** Vollständiges Anschreiben als Vorschau zeigen
   - User-Bestätigung: "Sieht das Anschreiben gut aus? Soll ich die PDF erstellen?"
   - PDF-Generierung: Anschreiben + CV kombiniert

3. **Nach PDF-Erstellung:**
   - Eintrag in `applications/BEWERBUNGEN.md` erstellen/aktualisieren
   - Status in `applications/README.md` aktualisieren
   - Cover Letter JSON speichern: `applications/cover_letter_[firmenname].json`
   - PDF speichern: `applications/bewerbung_[firmenname].pdf`

### Wichtige Regeln für Bewerbungen

#### Sprach-Erkennung
- **Deutsch (Standard):** Bei deutschen Stellenausschreibungen
- **Englisch:** Bei englischen Stellenausschreibungen oder explizitem Hinweis
- **Language-Parameter:** IMMER an `generate_application.sh` übergeben (`de` oder `en`)

#### Pflicht-Inhalte im Anschreiben
- **Datum:** IMMER aktuelles Datum mit `date` Command verifizieren
- **Standort-Standard:** "Frankfurt am Main" (NICHT Berlin)
- **Datumsformat DE:** "Frankfurt am Main, [DD. MMMM YYYY]"
- **Datumsformat EN:** "Frankfurt am Main, [Month DD, YYYY]"
- **CV-Link:** Immer https://mboiman.github.io erwähnen
- **LinkedIn:** Immer https://www.linkedin.com/in/mboiman/ angeben
- **Vollständige Kontaktdaten am Ende:**
  - E-Mail: mboiman@gmail.com
  - Telefon: 015233822623
  - LinkedIn: https://www.linkedin.com/in/mboiman/
  - Online-CV: https://mboiman.github.io
- **CV-Anhang-Hinweis:** "📎 Anlage: Vollständiger Lebenslauf" automatisch einfügen

#### Content-Fokus für Bewerbungen
- **Konkrete Projekte** statt Prozentzahlen
- **Technische Tiefe** über oberflächliche Metriken
- **MCP & A2A Agent-Entwicklung** bei KI-Positionen prominent erwähnen
- **KI-Workshops und Schulungen** als Expertise-Nachweis
- **Quality Engineering Mehrwert** bei allen Positionen hervorheben

#### Script-Aufruf
```bash
# Korrekte Syntax (alle 4 Parameter erforderlich)
./scripts/generate_application.sh <config> <output.pdf> <language> <cover_letter.json>

# Beispiel Deutsch
./scripts/generate_application.sh config.cv.toml applications/bewerbung_firma.pdf de applications/cover_letter_firma.json

# Beispiel Englisch
./scripts/generate_application.sh config.cv.toml applications/application_company.pdf en applications/cover_letter_company.json
```

#### Cover Letter JSON Format
```json
{
  "language": "de",
  "company": "[Firmenname]",
  "address": "[Stadt/Adresse]",
  "contactPerson": "[Ansprechperson]",
  "position": "[Stellentitel]",
  "date": "[Datum]",
  "greeting": "Sehr geehrter Herr [Nachname]",
  "opening": "[Einleitungstext]",
  "requirements": [
    {
      "requirement": "🎯 [Anforderung]",
      "response": "[CV-Match Beschreibung]",
      "cvReference": ""
    }
  ],
  "addedValue": "[Zusätzlicher Mehrwert]",
  "availability": "[Verfügbarkeit]",
  "closing": "[Abschlusstext]",
  "signOff": "Mit freundlichen Grüßen\n\n[Name]",
  "contactInfo": {
    "email": "mboiman@gmail.com",
    "phone": "015233822623",
    "linkedin": "https://www.linkedin.com/in/mboiman/",
    "website": "https://mboiman.github.io"
  }
}
```

### Dateistruktur applications/

```
applications/
├── README.md                          # Master-Dashboard mit Status-Übersicht
├── BEWERBUNGEN.md                     # Detaillierte Dokumentation aller Bewerbungen
├── bewerbung_[firmenname].pdf         # Generierte PDF-Bewerbungen
├── cover_letter_[firmenname].json     # Cover Letter Daten (JSON)
└── [weitere Bewerbungen...]
```

### Nach Bewerbungseinreichung

IMMER dokumentieren:
1. **BEWERBUNGEN.md aktualisieren:**
   - Bewerbungsdatum
   - Projekt-URL (z.B. freelancermap.de Link)
   - Bewerbungsweg (z.B. "Online über https://...")
   - Status auf ✅ Eingereicht setzen
   - Verwendete PDF dokumentieren

2. **README.md aktualisieren:**
   - Status-Icon von 📋 auf ✅ ändern
   - Datum eintragen
   - Statistiken aktualisieren

3. **Follow-up planen:**
   - Nächste Schritte in README.md eintragen
   - Interview-Vorbereitung bei Bedarf

### Verfügbarkeit Standard
- **Deutsch:** "ab sofort verfügbar" oder spezifisches Datum
- **Englisch:** "available immediately" oder spezifisches Datum
- **KEINE** Projektlisten im Word-Format anbieten

## Memories
- `teste immer am ende das Ergebniss` - A reminder to always test the result at the end
- `alle text bausteine müssen aus der toml kommen es darf nichts in den anderen dateien wie html liegen. also keine texte von wo anders` - Ensure all text components come from the TOML file, with no text residing in other files like HTML
- `du sollst kein python hier ständig mir anbieten als server das ist hugo` - Reminder that Hugo is the preferred server, not Python
- `du sollst nicht behaupten das der server läuft wenn es nicht so ist und du nicht getestet hast` - Do not claim the server is running if you have not tested it and it is not actually running
- `die pdf und die web ansicht sind unterschiedlich generiert und in unterschiedlichen stellen verordnet` - The PDF and web views are generated differently and organized in different places
- `merke das pdf anpassungen im @scripts/html_to_pdf.js anzupassen ist` - Remember to adjust PDF-related changes in the @scripts/html_to_pdf.js file
- `wenn du mich bewirbst immer auch den link des CVs geben unter https://mboiman.github.io` - When applying, always provide the link to the CV under https://mboiman.github.io
- `meine linkedin adresse ist unter https://www.linkedin.com/in/mboiman/ zu finden` - My LinkedIn address can be found under https://www.linkedin.com/in/mboiman/
- `applications/README.md ist das zentrale Dashboard für alle Bewerbungen` - The central dashboard for all applications is applications/README.md
- `nach jeder Bewerbungseinreichung IMMER BEWERBUNGEN.md UND README.md aktualisieren` - After each application submission, ALWAYS update both BEWERBUNGEN.md AND README.md