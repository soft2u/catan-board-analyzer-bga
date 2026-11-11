# Image files and provenance

All upload images are PNGs. The extension mark is original SVG artwork: a
hexagon with three analysis bars, using green, cream, and gold. It does not
reuse the BGA, CATAN, or Google logos. Editable SVG artwork is in `source-art/`.

| Upload | File | Dimensions |
| --- | --- | --- |
| Store icon | `assets/store-icon-128.png` | 128 × 128, transparent |
| Screenshot 1 | `assets/screenshot-01.png` | 1280 × 800 |
| Screenshot 2 | `assets/screenshot-02.png` | 1280 × 800 |
| Screenshot 3 | `assets/screenshot-03.png` | 1280 × 800 |
| Small promotional image | `assets/promo-small-440x280.png` | 440 × 280 |
| Marquee promotional image | `assets/promo-marquee-1400x560.png` | 1400 × 560 |

The package also contains 16, 32, 48, and 128-pixel icon variants in `../icons/`.

Screenshot 1 renders the actual packaged `popup.html` in a presentation frame.
The notice and button are not retyped or simulated. Surrounding text explains
the normal workflow; no import-success result is fabricated.

Screenshots 2 and 3 render the actual board, starting-position table, and
opening-pair sections from the publicly published
[November 10, 2026 sample analysis](https://catan.soft2u.ro/map-of-the-day/2026-11-10?lang=en).
The source HTML and styles are preserved inside scaled presentation frames.
The images explicitly identify this as a public sample, not a captured BGA
game or proof of a new import. No private BGA game, player name, hand, chat,
account screen, or admin-only report is shown.

The optional promotional images are original illustrations, not screenshots.
Their SVG sources and `../scripts/render-store-art.cjs` provide editable
branding. Rendering these SVGs uses ImageMagick; using the prepared PNGs
requires no extra software.

The store screenshots were captured in an isolated headless Chrome profile.
They were inspected at full size for clipping and legibility. Their dimensions
match [Google's current image guidance](https://developer.chrome.com/docs/webstore/images).

Keep screenshots in the screenshot fields and promotional artwork in the
corresponding promotional fields. Do not upload the whole submission-kit ZIP
as an extension package.
