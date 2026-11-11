# Chrome Web Store listing — English

Submission copy for version **0.2.2**. These materials do not indicate that a
store item is published or approved.

## Name

Catan BGA Analyzer

## Short description

Import a Classic Catan board from Board Game Arena for analysis. Leaves the BGA board and game state unchanged.

## Detailed description

Study a Classic Catan board from Board Game Arena on a separate analysis page.
Catan BGA Analyzer imports its tile layout, number tokens, and harbors into
catan.soft2u.ro, where you can explore settlement scores, opening pairs,
resource probabilities, and harbor access.

YOUR BGA BOARD STAYS UNCHANGED

The extension does not rearrange tiles or numbers, change resources or game
state, place pieces, submit moves, or automate play. It adds its own floating
control to the page and opens the analysis in a new tab.

HOW TO USE IT

1. Open a supported Classic Catan board on Board Game Arena and wait for it to load.
2. Open the extension popup or use its floating control.
3. Read the data and fair-play notice, then choose Send board for analysis.
4. Explore the imported board on catan.soft2u.ro.

The extension reads the board fields already loaded in BGA's game frame. It
falls back to visible board elements when runtime data is unavailable. It
supports the standard 19-tile Classic layout, including supported game
iframes. Expansion and custom layouts are not supported.

WHAT IS SHARED

Sending transfers tiles, numbers, harbors, fixed source identifiers, and the
BGA table ID when available. The service saves a public, shareable board and
retains import metadata, including the originating IP address. Choosing Send
also consents to administrators inspecting this submitted board and table ID
for import support and diagnostics. Administrators can link imports to their
source tables and count repeated imports. Do not send a board you want kept private.

The extension does not extract names, private hands, chat, scores, moves,
passwords, or BGA cookies. It does not transmit the full BGA URL or general
browsing history. Read the linked privacy notice for storage, access, and deletion.

USE WHERE PERMITTED

Use analysis only where BGA rules and your table or event rules permit it.
This extension does not claim BGA authorization for strategic assistance.
It is an unofficial project, unaffiliated with and not endorsed by Board Game
Arena, Catan GmbH, or CATAN Studio.

## Listing settings and links

| Field | Proposed value |
| --- | --- |
| Language | English |
| Category | Entertainment, if offered in the current dashboard; choose the closest game-analysis category actually available. |
| Website | `https://github.com/soft2u/catan-board-analyzer-bga` |
| Support | `https://github.com/soft2u/catan-board-analyzer-bga/issues` |
| Privacy policy | `https://github.com/soft2u/catan-board-analyzer-bga/blob/main/PRIVACY.md` — verify the public default branch and publish this version before submitting. |
| Distribution | Owner chooses visibility and countries in the dashboard. |

Name and short description must match the uploaded manifest. The manifest
description limit is 132 characters; the proposed description is below it.
[Manifest preparation](https://developer.chrome.com/docs/webstore/prepare).

## Image order and optional captions

The supplied PNGs use the packaged popup and the actual public sample-analysis
interface, with no private player details. The analysis images are labeled as
a published sample board; they do not claim it was imported from BGA.

| Asset | Intended subject | Optional caption |
| --- | --- | --- |
| `assets/screenshot-01.png` | Actual packaged popup and its disclosure, framed with usage instructions | Import when you choose |
| `assets/screenshot-02.png` | Public example board and actual starting-position rankings | See the board. Compare your starts. |
| `assets/screenshot-03.png` | Public example's actual opening-pair recommendations | Compare two-settlement openings. |
| `assets/promo-small-440x280.png` | Original extension branding | Your board. A clearer start. |
| `assets/promo-marquee-1400x560.png` | Original extension branding | Your board. A clearer start. |

Do not use BGA or CATAN logos as the extension's own mark or show administrator
reports as ordinary-user features. The source BGA board remains unchanged;
the floating extension control is an added page element.
