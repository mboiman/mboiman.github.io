# mboiman.github.io

The CV moved to https://michael.boiman.net/cv/. This repository only forwards
the old addresses there.

- `pages.txt`: the old pages, each gets its own redirect page.
- `build.mjs`: writes `out/`. Every page forwards path, query and hash
  (application links carry `?for=`), with a meta refresh as fallback.
  `404.html` forwards every other address, old PDF links included.
- `images/`: the og images that old link previews still fetch.

Build and test: `node --test test/redirect.test.mjs`. GitHub Pages serves
`out/` through `.github/workflows/pages.yml`.
