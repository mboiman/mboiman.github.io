# CV Generation

This repository contains a Hugo site for generating a curriculum vitae. A helper script `scripts/generate_cv.sh` can build the site using an additional TOML configuration file and export it to PDF.

## Usage

1. Create a TOML file with the values you want to override. See `config.sample.custom.toml` for a minimal example of disabling sections and changing text.
2. Ensure you have Node.js and npm installed.
3. Run the script:

```bash
./scripts/generate_cv.sh path/to/your.toml [output.pdf] [--standalone]
```

The script merges `config.toml` with your custom file by default, builds the site with Hugo, and converts the generated HTML to PDF using a headless Chromium instance via Puppeteer. Pass `--standalone` to use only your file and ignore the base configuration.

Node dependencies are installed automatically on first run.
