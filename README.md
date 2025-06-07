# CV Generation

This repository contains a Hugo site for generating a curriculum vitae. A helper script `scripts/generate_cv.sh` can build the site using an additional TOML configuration file and export it to PDF.

## Usage

1. Create a TOML file with the values you want to override. See `config.sample.custom.toml` for a minimal example.
2. Ensure you have Node.js and npm installed.
3. Run the script:

```bash
./scripts/generate_cv.sh path/to/your.toml [output.pdf]
```

The script merges `config.toml` with your custom file, builds the site with Hugo, and converts the generated HTML to PDF using a headless Chromium instance via Puppeteer. Node dependencies are installed automatically on first run.

The original configuration remains untouched.
