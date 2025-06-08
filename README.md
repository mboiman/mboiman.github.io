# CV Generation

This repository contains a Hugo site for generating a curriculum vitae. A helper script `scripts/generate_cv.sh` can build the site using an additional TOML configuration file and export it to PDF.

## trennung de aus config.toml

```bash
 python3 split_config.py
```

## Usage

1. Create a TOML file with the values you want to override. See `config.sample.custom.toml` for a minimal example of disabling sections and changing text.
2. Ensure you have Node.js and npm installed.
3. Run the script:

```bash
./scripts/generate_cv.sh path/to/your.toml [output.pdf] [--standalone]
./scripts/generate_cv.sh config.cv.toml sample.pdf --standalone
./scripts/generate_cv.sh config.de.toml sample.pdf --standalone

The `--standalone` flag can be placed anywhere after the custom config path.
```

The script merges `config.toml` with your custom file by default, builds the site with Hugo, and converts the generated HTML to PDF using a headless Chromium instance via Puppeteer.

If you pass `--standalone`, only the supplied file is used. In that mode your configuration must define all required Hugo settings such as the theme. Otherwise Hugo will generate a nearly empty site and the PDF will contain just a directory listing.

Node dependencies are installed automatically on first run.
