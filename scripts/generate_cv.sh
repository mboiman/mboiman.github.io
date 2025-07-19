#!/bin/bash
set -e

BASE_CONFIG="config.cv.toml"
STANDALONE=0

# Collect positional arguments while allowing --standalone anywhere
POSITIONAL=()
for arg in "$@"; do
  case $arg in
    --standalone)
      STANDALONE=1
      ;;
    *)
      POSITIONAL+=("$arg")
      ;;
  esac
done
set -- "${POSITIONAL[@]}"

CUSTOM_CONFIG="$1"
OUTPUT_PDF="${2:-cv_custom.pdf}"
BUILD_DIR=$(mktemp -d)

if [ -z "$CUSTOM_CONFIG" ]; then
  echo "Usage: $0 <custom_config.toml> [output.pdf]"
  exit 1
fi

# Build site with base and custom configuration or standalone
if [ "$STANDALONE" -eq 1 ]; then
  hugo --config "$CUSTOM_CONFIG" -d "$BUILD_DIR"
else
  hugo --config "$BASE_CONFIG,$CUSTOM_CONFIG" -d "$BUILD_DIR"
fi

# Convert TOML configuration to PDF using Puppeteer
if [ ! -d node_modules ]; then
  npm ci --silent
fi

# Use the configuration file for PDF generation
if [ "$STANDALONE" -eq 1 ]; then
  CONFIG_FOR_PDF="$CUSTOM_CONFIG"
else
  # For merged configs, we'll use the base config as it contains the full structure
  CONFIG_FOR_PDF="$BASE_CONFIG"
fi

node scripts/html_to_pdf.js "$CONFIG_FOR_PDF" "$OUTPUT_PDF"

# Clean up
rm -rf "$BUILD_DIR"

echo "PDF generated at $OUTPUT_PDF"
