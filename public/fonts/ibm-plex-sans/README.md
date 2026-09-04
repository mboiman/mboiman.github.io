Self-hosted IBM Plex Sans fonts for the CV website and PDF renderer.

Source package: `@ibm/plex-sans@1.1.0`
License: SIL Open Font License 1.1, see `LICENSE.txt`.

Runtime privacy note:
- Fonts are served from this repository under `/fonts/ibm-plex-sans/`.
- No Google Fonts, Adobe Fonts, CDN, or third-party font request is used.
- The PDF renderer loads the same local font files through `file://` URLs.

Subset, not the upstream files
------------------------------

The six faces here are cut down to the writing systems this site renders.
Upstream each face carries 928 glyphs, among them 192 Cyrillic and 73 Greek;
the pages set 114 distinct characters in total, measured across every built page
including the strings inside the inline scripts.

    383 kB  ->  143 kB   (63 % less, six faces)
    928 glyphs -> 405 per face

Kept: Latin-1, Latin Extended-A, General Punctuation, Currency, Arrows, plus
U+2212, U+2215, U+FEFF and U+FFFD. The range is deliberately wider than the 114
characters in use, because a Czech or Polish customer name costs almost nothing
to keep and is exactly the kind of thing that gets added later.

A character outside the range is not missing, it renders from the system stack.
The one surface where that can show is the agent chat, which renders whatever a
visitor types.

Reproduce with `scripts/subset-fonts.sh`, which also documents how to fetch the
originals from `@ibm/plex-sans@1.1.0`. The kept range lives in two places by
design, that script and the `unicode-range` in `src/styles/global.css`, and
`scripts/check-output.mjs` fails the build if the pages ever set a character
outside it.

Licence note: the SIL OFL permits subsetting. The Reserved Font Name clause is
about redistributing modified font FILES as a font; worth a second look before
ever publishing these files as a font package rather than as part of this site.
