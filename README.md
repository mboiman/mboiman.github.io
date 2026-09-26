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
# or, equivalently:
npm run pdf:de && npm run pdf:en

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
├── components/     # CVPage, CVMinimal, CVFuture, ViewSwitch, AgentWidget, StoryPage, DarkModeToggle
├── layouts/        # Page layouts
├── lib/            # toml-loader, i18n, markdown, cv-links, station-details, experience
└── pages/
    ├── de/         # German routes (index, minimal, future, story, datenschutz, impressum)
    └── en/         # English routes
public/             # Static assets (fonts, images, generated PDFs)
```

### Build Process
1. **PDF Generation**: `scripts/html_to_pdf.js` uses Puppeteer to generate PDFs directly from the TOML config (own print template, independent of the web view)
2. **Website Build**: `astro build` renders the static multilingual site
3. **Static Assets**: PDFs live in `public/pdfs/` and are served as downloadable assets

## Three Views of the CV

The same CV renders in three views. All three read the same `config.cv.toml`,
the same `src/lib/i18n.ts` and the same sort rule, so a correction reaches every
view at once. A switch at the top of each view (`src/components/ViewSwitch.astro`)
moves between them.

| View | Route | Component | Look |
|---|---|---|---|
| Classic | `/de/`, `/en/` | `CVPage.astro` | The original page: cards, sidebar, agent card in the hero |
| Minimal | `/de/minimal/`, `/en/minimal/` | `CVMinimal.astro` | Typographic, two columns, entries fold open with a plus (after the Jev product page) |
| Future | `/de/future/`, `/en/future/` | `CVFuture.astro` | Not a document: the career as one interactive graph (see below) |

Minimal and Future are on trial: they carry `noindex` and are left out of the
sitemap (`astro.config.mjs`).

### The career graph (Future)

One screen, no scrolling on a desktop. Stations are bars on a time axis, talks
are marks on the axis, competencies and projects are rows below, and a line
joins a competency to every station and project whose text names it. Hover or
focus lights a node and its lines; a click opens it in the side panel, which
shows the profile until something is picked. The agent sits in a command line
at the bottom; when it points at an entry, that node lights and the panel opens
it. Below 900 px the panel stands above the graph and the graph scrolls sideways.

- Layout at build time: `src/lib/career-graph.ts` turns the TOML into
  coordinates and SVG paths; the browser only highlights and switches panels.
- Competency nodes are a curated list (`SKILLS` in that file), each with the
  patterns it matches. A line exists only where a pattern occurs in that entry's
  text, and a competency joining fewer than two entries is left out.
- Tests: `npm run test:graph` (bars never overlap, rows stay in the frame,
  every line joins two existing nodes). Both deploys run it.
- Entry links use the same ids as the other views (`#exp-dvag`,
  `#project-…`), plus `#skill-<key>`. Selecting a node writes its id into the
  address bar, so the URL is always a link to what is on screen.
- A tailored link marks its entries in yellow instead of reordering.
- Two scales on one axis: the last eleven years at full width, the years
  before at 40 percent, marked with `//` on the axis (and explained in its
  tooltip), so the dense recent years get the room.
- Each competency shows how many entries name it; its panel adds stations,
  projects and the year of its earliest station.
- The command line filters while you type (every word must occur in an
  entry's text; a competency matches by name), Enter sends the question to the
  agent.
- "Zeitreise" / "Time lapse" plays the career from the first year to today: a
  cursor runs along the axis and each station, competency, project and line
  appears when it is reached (`data-reveal`, computed at build time). Hidden
  for visitors who ask for reduced motion.

### Tailored link for one application (Minimal and Future)

```
https://mboiman.github.io/de/minimal/?for=DB%20InfraGO&focus=db-vertrieb,tuev-sued,e-invoicing-platform
```

- `focus`: `anchor` values from `config.cv.toml`, strongest first. The named
  stations and projects move to the top of their list in that order, open, and
  carry a "Passend"/"Matching" tag. Unknown anchors are ignored.
- `for`: the recipient's name, shown in one line above the sections (in
  Future: the matching nodes are marked in the graph instead of moved).
- Evaluated in the browser only (`src/lib/cv-links.ts`). Nothing about an
  application is written into this public repository.

### Links to one entry

`#exp-<anchor>` (stations, talks) and `#project-<anchor>` open that entry and
scroll to it, in all three views. In Minimal and Future every open entry carries
a "Link zu diesem Eintrag"/"Link to this entry" link.

### Remembered view

A click on the view switch stores the choice (`localStorage` key `cv-view`). The
classic page and the root page then send the visitor to that view before
anything paints (`src/layouts/BaseLayout.astro`, `src/pages/index.astro`). A
plain visit never changes the stored view, so a shared link cannot switch it.

### Print

Printing Minimal or Future opens every entry and drops the controls, in one
column. The formal document stays the PDF.

### The agent in each view

The chat panel (`AgentWidget.astro`) takes the look of the view it is on: grey,
square and flat in Minimal, dark with the mint accent in Future. The styling
lives in the view's own stylesheet under `html.cv-minimal` or `html.cv-future`,
so the classic widget is untouched. The Future hero reads the agent's live state
and facts from its agent card through the same `[data-agent-live]` and
`[data-agent-facts]` hooks as the classic hero.

### Shared building blocks

| File | What it holds |
|---|---|
| `src/components/ViewSwitch.astro` | The three-way switch; colours come from the page through `--vs-*` variables |
| `src/lib/cv-links.ts` | Tailored link, entry links, print, agent prompt buttons; pages opt in through `data-focus-*` attributes |
| `src/lib/station-details.ts` | How a station's `details` split into open text, "more" and the tool list |
| `src/lib/career-graph.ts` | Layout of the career graph: axis, lanes, competency and project rows, lines |

## PDF Generation

```bash
# Generate PDFs with language specification
./scripts/generate_cv.sh <config.toml> <output.pdf> <language>

# Examples:
./scripts/generate_cv.sh config.cv.toml cv_german.pdf de
./scripts/generate_cv.sh config.cv.toml cv_english.pdf en

# Minimal print style (grey ink, large name, plain headings, greyscale portrait)
./scripts/generate_cv.sh config.cv.toml cv_german_minimal.pdf de --style=minimal

# Standalone mode (uses only the specified config)
./scripts/generate_cv.sh config.custom.toml output.pdf de --standalone
```

### PDF Features
- Professional A4 layout optimized for printing
- Compressed images for smaller file sizes
- Multilingual support (German/English)
- Direct generation from TOML configuration (no dependency on the built site)
- Two print styles from `scripts/lib/pdf-theme.js`: `classic` (default) and
  `minimal`. Same pages and page breaks in both. Both deploys publish
  `Michael_Boiman_CV_{DE,EN}.pdf` (classic, linked from Classic and Future) and
  `Michael_Boiman_CV_{DE,EN}_Minimal.pdf` (linked from Minimal). An unknown
  style aborts the render.

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
- **Print style per application**: `"style": "minimal"` in the cover letter JSON
  renders letter and CV in the minimal style; default is `"classic"`
- **Tailored online CV**: the letter links to the Minimal view with
  `?for=<company>&focus=<anchors>` (see "Three Views of the CV")
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
