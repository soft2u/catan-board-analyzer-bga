# Reviewer instructions — Catan BGA Analyzer 0.2.2

## Purpose

This extension imports a user-selected Classic Catan board from Board Game
Arena into `https://catan.soft2u.ro` for analysis. It reads board fields already
loaded in BGA's game runtime, with a visible-element fallback. It adds its own
floating control; it does not change the BGA board or game state, submit moves,
or automate play. It is not affiliated with or endorsed by BGA or CATAN.

## Test the main flow

Entry page: `https://boardgamearena.com/gamepanel?game=catan`.
BGA's own [CATAN announcement](https://en.boardgamearena.com/news?id=606)
links this tutorial: `https://boardgamearena.com/tutorial?game=catan&tutorial=951`.
The link's provenance is verified, but its full interactive access and a fresh
extension import must still be checked in a normal BGA browser session before
submission. Use a current permitted replay if that tutorial no longer loads.

1. Install the uploaded 0.2.2 package and refresh any BGA tab already open.
2. Open a permitted BGA Classic Catan tutorial, practice board, or replay with
   the standard 19 land tiles. Wait for the board to finish loading.
3. Open the extension popup. Read the pre-Send notice about the data sent,
   public/shareable storage, and administrator inspection for import support
   and diagnostics. Nothing is sent to the import service just by opening it.
4. Choose **Send board for analysis**. A new extension handoff tab submits the
   board, then opens an HTTPS page under `catan.soft2u.ro/map-analytics/`.
5. Confirm the destination shows the imported board and analysis. The original
   BGA board and game state remain unchanged.
6. Repeat using the extension's floating control on a supported Catan page.
   The same notice and action apply. On pages where the control is not shown,
   use the popup.

A BGA sign-in may be needed to access the selected table or replay. The
extension never requests the BGA password and sends no BGA credentials to
the import service. The analysis import does not require a catan.soft2u.ro
account. Do not test strategic assistance in a game where it is prohibited.

## Data and permissions to inspect

- The content script constructs an explicit payload of board fields plus
  optional positive numeric `table_id`; it excludes full URLs, names, private
  hands, chat, scores, move/dice history, and credentials.
- `scripting` reads loaded page objects in the MAIN world across game frames.
  Code is packaged with the extension. The page is not modified except for
  the extension's own control; there is no move submission.
- The fixed HTTPS POST endpoint is `/import-from-bga`. It uses omitted
  credentials, no referrer, and no board payload in the service query string.
- The server saves a public/shareable board and import/IP metadata. A table
  ID, when available, supports source links and repeat-import reports for
  service administrators. Those admin reports are not a promised end-user feature.
- A tutorial or board without a valid table ID still imports; no player ID,
  replay timestamp, or archive path number is substituted for a missing table ID.
- The extension does not load remote executable code. The external analysis
  site opens in a separate normal tab.

## Negative checks

On an unrelated page the popup should report that a BGA page is needed. If a
BGA page has no loaded Catan board, extraction should show an error rather
than silently sending unrelated content. Reload a BGA page if Chrome reports
that no content-script receiver is available after extension installation.

## Publisher must complete before submission

- **Verified reviewer-accessible BGA test URL:** verify the official tutorial
  above or supply a currently working, authorized replay URL and short access sequence.
- **Credentials, only if required:** provide a permitted reviewer test account
  privately in the dashboard's test-instructions field. Do not put credentials
  in this repository, screenshots, listing, or public support issues.
- **Support contact:** supply the publisher's monitored address in the dashboard.

Replace this final section with the verified access details before submitting.
The dashboard supports private test instructions where access is needed.
[Submission instructions](https://developer.chrome.com/docs/webstore/publish).
