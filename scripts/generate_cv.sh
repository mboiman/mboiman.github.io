#!/bin/bash
set -e

BASE_CONFIG="config.toml"
CUSTOM_CONFIG="$1"
OUTPUT_PDF="${2:-cv_custom.pdf}"
BUILD_DIR=$(mktemp -d)

if [ -z "$CUSTOM_CONFIG" ]; then
  echo "Usage: $0 <custom_config.toml> [output.pdf]"
  exit 1
fi

# Build site with base and custom configuration
hugo --config "$BASE_CONFIG,$CUSTOM_CONFIG" -d "$BUILD_DIR"

# Convert generated HTML to PDF using Puppeteer
if [ ! -d node_modules ]; then
  npm ci --silent
fi
node scripts/html_to_pdf.js "$BUILD_DIR/index.html" "$OUTPUT_PDF"

# Clean up
rm -rf "$BUILD_DIR"

echo "PDF generated at $OUTPUT_PDF"
