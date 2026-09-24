#!/bin/bash
set -e

TEMP_DIR=""

# Cleanup function for trap
cleanup() {
    if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

# Set trap to cleanup on exit, error, or interrupt
trap cleanup EXIT INT TERM

# Usage function
usage() {
    echo "Usage: $0 <config.toml> <output.pdf> <language> <cover_letter_data.json>"
    echo ""
    echo "Examples:"
    echo "  $0 config.cv.toml bewerbung_firma.pdf de cover_letter_data.json"
    echo "  $0 config.cv.toml application_company.pdf en cover_letter_data.json"
    echo ""
    echo "Arguments:"
    echo "  config.toml          Hugo configuration file (e.g., config.cv.toml)"
    echo "  output.pdf          Final application PDF output path"
    echo "  language            Language (de/en)"
    echo "  cover_letter_data.json JSON file with cover letter content"
    exit 1
}

# Check arguments
if [ $# -ne 4 ]; then
    echo "❌ Wrong number of arguments"
    usage
fi

CONFIG_FILE="$1"
OUTPUT_PDF="$2"
LANGUAGE="$3"
COVER_LETTER_DATA="$4"

# Validate inputs
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config file not found: $CONFIG_FILE"
    exit 1
fi

if [ ! -f "$COVER_LETTER_DATA" ]; then
    echo "❌ Cover letter data file not found: $COVER_LETTER_DATA"
    exit 1
fi

if [[ "$LANGUAGE" != "de" && "$LANGUAGE" != "en" ]]; then
    echo "❌ Language must be 'de' or 'en'"
    exit 1
fi

# Create temp directory for intermediate files
TEMP_DIR=$(mktemp -d)
COVER_LETTER_PDF="$TEMP_DIR/cover_letter.pdf"
CV_PDF="$TEMP_DIR/cv.pdf"

echo "🚀 Starting application generation..."
echo "📋 Config: $CONFIG_FILE"
echo "📄 Output: $OUTPUT_PDF"
echo "🌐 Language: $LANGUAGE"
echo "📝 Cover Letter Data: $COVER_LETTER_DATA"

# Ensure npm dependencies are installed
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm ci --silent
fi

# Step 1: Generate cover letter PDF
echo "📝 Generating cover letter..."
node scripts/application_to_pdf.js "$CONFIG_FILE" "$COVER_LETTER_PDF" "$LANGUAGE" "$COVER_LETTER_DATA"

if [ ! -f "$COVER_LETTER_PDF" ]; then
    echo "❌ Failed to generate cover letter PDF"
    exit 1
fi

# Step 2: Generate CV PDF
echo "📋 Generating CV..."
node --experimental-strip-types scripts/html_to_pdf.js "$CONFIG_FILE" "$CV_PDF" "$LANGUAGE" "$COVER_LETTER_DATA"

if [ ! -f "$CV_PDF" ]; then
    echo "❌ Failed to generate CV PDF"
    exit 1
fi

# Step 3: Combine PDFs
echo "🔗 Combining PDFs..."
node scripts/combine_pdfs.js "$COVER_LETTER_PDF" "$CV_PDF" "$OUTPUT_PDF"

if [ ! -f "$OUTPUT_PDF" ]; then
    echo "❌ Failed to combine PDFs"
    exit 1
fi

echo "✅ Application PDF generated successfully: $OUTPUT_PDF"
echo ""
echo "📊 Summary:"
echo "  • Cover letter: ✅ Generated"
echo "  • CV: ✅ Generated"
echo "  • Combined PDF: ✅ Generated"
echo "  • Output: $OUTPUT_PDF"