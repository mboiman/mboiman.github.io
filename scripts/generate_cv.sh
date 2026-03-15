#!/bin/bash
set -e

BASE_CONFIG="config.cv.toml"

# Collect positional arguments while allowing --standalone anywhere
POSITIONAL=()
for arg in "$@"; do
  case $arg in
    --standalone)
      # kept for backwards compatibility, ignored
      ;;
    *)
      POSITIONAL+=("$arg")
      ;;
  esac
done
set -- "${POSITIONAL[@]}"

CONFIG="${1:-$BASE_CONFIG}"
OUTPUT_PDF="${2:-cv_custom.pdf}"
LANGUAGE="$3"

if [ -z "$1" ]; then
  echo "Usage: $0 <config.toml> [output.pdf] [language]"
  echo "Available languages: de, en"
  exit 1
fi

# Install dependencies if needed
if [ ! -d node_modules ]; then
  npm ci --silent
fi

# Generate PDF directly from TOML config (no Hugo needed)
if [ -n "$LANGUAGE" ]; then
  node scripts/html_to_pdf.js "$CONFIG" "$OUTPUT_PDF" "$LANGUAGE"
else
  node scripts/html_to_pdf.js "$CONFIG" "$OUTPUT_PDF"
fi

# Validate PDF was created
if [ ! -f "$OUTPUT_PDF" ]; then
  echo "❌ Failed to generate PDF: $OUTPUT_PDF"
  exit 1
fi

echo "✅ PDF generated at $OUTPUT_PDF"
