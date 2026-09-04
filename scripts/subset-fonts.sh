#!/usr/bin/env bash
# Subset the self-hosted IBM Plex Sans faces to the writing systems this site
# actually renders.
#
# WHY. Each full face ships 928 glyphs, among them 192 Cyrillic and 73 Greek.
# The site renders 114 distinct characters in total, measured across every built
# page including the strings inside the inline scripts: 107 from Latin-1, five
# from General Punctuation, two arrows. Nothing outside those blocks, not even
# Latin Extended-A. Six faces at 63 kB were 383 kB of the first load; subset they
# are about 23 kB each.
#
# The kept range is deliberately WIDER than the measured 114 characters. Latin
# Extended-A costs almost nothing and is what a Czech or Polish customer name
# needs; the currency and arrow blocks are what this page's own vocabulary uses.
# The characters actually in use are checked against this range on every build
# (scripts/check-output.mjs), so the two cannot drift apart silently.
#
# WHAT FALLS BACK. A character outside the declared unicode-range is not missing,
# it is rendered from the system stack instead. That matters for exactly one
# surface: the agent chat renders whatever a visitor types. Cyrillic in the chat
# will look like the system font rather than Plex. Nothing disappears.
#
# REPRODUCIBLE FROM UPSTREAM, not from this repo: the files here ARE the subset,
# so re-running this on them is a no-op. Fetch the originals first:
#
#   npm pack @ibm/plex-sans@1.1.0 && tar xf ibm-plex-sans-1.1.0.tgz
#   cp package/fonts/complete/woff2/IBMPlexSans-{Light,Regular,Text,Medium,SemiBold,Bold}.woff2 .
#
# LICENCE: SIL OFL 1.1. Subsetting is a permitted modification. The Reserved Font
# Name question only bites when the modified FILES are redistributed as a font;
# see LICENSE.txt next to the faces.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/fonts/ibm-plex-sans"

# Latin-1 · Latin Extended-A · General Punctuation · Currency · Arrows,
# plus the two lone maths signs that turn up in running text, plus the byte
# order mark and the replacement character so neither renders as tofu.
UNICODES="U+0000-00FF,U+0100-017F,U+2000-206F,U+20A0-20BF,U+2190-21FF,U+2212,U+2215,U+FEFF,U+FFFD"

# ccmp/mark/mkmk stay: they are what places the diacritics this site is full of.
FEATURES="kern,liga,calt,ccmp,mark,mkmk"

command -v pyftsubset >/dev/null || { echo "pyftsubset fehlt: pip install fonttools brotli" >&2; exit 1; }

vorher=0
nachher=0
for face in Light Regular Text Medium SemiBold Bold; do
  src="$DIR/IBMPlexSans-$face.woff2"
  [ -f "$src" ] || { echo "fehlt: $src" >&2; exit 1; }
  alt=$(wc -c < "$src")
  pyftsubset "$src" \
    --unicodes="$UNICODES" \
    --layout-features="$FEATURES" \
    --flavor=woff2 \
    --output-file="$src.subset"
  mv "$src.subset" "$src"
  neu=$(wc -c < "$src")
  vorher=$((vorher + alt))
  nachher=$((nachher + neu))
  printf '  %-10s %7d -> %7d Bytes\n' "$face" "$alt" "$neu"
done
printf '  %-10s %7d -> %7d Bytes (%d%% weniger)\n' "zusammen" "$vorher" "$nachher" \
  "$(( (vorher - nachher) * 100 / vorher ))"
