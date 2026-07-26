# Catan BGA Analyzer

An unofficial Chrome extension that reads the visible Classic Catan board on
Board Game Arena (BGA) and opens settlement and opening-pair analysis on
[catan.soft2u.ro](https://catan.soft2u.ro/catan-board-analyzer).

The extension does not automate play or make moves. Analysis is opened only
after the user presses **Send board for analysis**.

> [!IMPORTANT]
> Use this extension only where analysis is permitted. Live strategic
> assistance may conflict with Board Game Arena rules, tournament rules, or
> the expectations of other players. Tutorial, practice, replay, and completed
> game analysis are the safest uses unless BGA and everyone at the table allow
> live assistance. You are responsible for complying with the rules that apply
> to your game.

This project is not affiliated with, endorsed by, or sponsored by Board Game
Arena, Catan GmbH, or CATAN Studio.

## What it does

- Finds the Catan board in the BGA page, including boards rendered inside a
  game iframe.
- Reads the 19 visible land tiles, number tokens, and visible harbors.
- Normalizes the Classic-board tile order expected by the analyzer.
- Sends the minimal board payload to `catan.soft2u.ro` over HTTPS.
- Opens a shareable analytics page with settlement scoring, opening-pair
  recommendations, resource probabilities, harbor synergy, scarcity, and
  seat-specific advice.
- Supports both the extension popup and an in-page floating action.

The current release supports the standard 19-tile BGA Catan board. Expansion
and custom BGA layouts are not imported.

## Privacy at a glance

The extension sends:

- land-tile coordinates and resource types;
- visible number tokens;
- visible harbor coordinates and types;
- fixed identifiers saying the source is BGA and the game is Catan.

It does **not** collect or send:

- BGA usernames or player names;
- cards, hands, chat, scores, moves, or dice history;
- BGA login cookies, credentials, or authentication tokens;
- the current page URL or title;
- general browsing history.

The transfer occurs only when you press the analysis button. The payload is
sent as an HTTPS `POST`, without browser credentials or a referrer. It is
briefly passed between extension pages in a URL fragment, removed before the
network request, and never placed in the destination URL or query string.

The service saves the imported board so it can provide a shareable analytics
URL. The website may retain the import timestamp and originating IP address as
described in [PRIVACY.md](PRIVACY.md) and the
[website privacy notice](https://catan.soft2u.ro/tournaments/privacy). Optional
website analytics are controlled by the consent banner on
`catan.soft2u.ro`; the extension does not alter that choice.

## Install from GitHub

Chrome Web Store installation is not available unless a separately published
store listing is provided. GitHub users install this source as an unpacked
extension:

1. Download the repository with **Code → Download ZIP**, then extract it to a
   permanent folder. Alternatively, clone it with Git:

   ```powershell
   git clone https://github.com/soft2u/catan-board-analyzer-bga.git
   ```

2. In Chrome, open `chrome://extensions/`.
3. Enable **Developer mode** in the upper-right corner.
4. Select **Load unpacked**.
5. Select the folder containing `manifest.json` (not its parent folder).
6. Optionally pin **Catan BGA Analyzer** from Chrome's Extensions menu.
7. Refresh any BGA tab that was already open.

Chrome displays a developer-mode warning for manually installed extensions.
That is expected for unpacked GitHub installations.

### Updating a GitHub installation

1. Replace the local files with the new release, or run `git pull`.
2. Open `chrome://extensions/`.
3. Press **Reload** on the Catan BGA Analyzer card.
4. Refresh open BGA pages.

Unpacked extensions do not update automatically.

## Usage

1. Open a BGA Catan tutorial, practice table, replay, completed game, or other
   page where analysis is permitted.
2. Wait until the complete board is visible.
3. Start the import in either way:
   - press the floating **Send board for analysis** button; or
   - open the extension popup and press **Send board for analysis**.
4. Review the privacy and fair-play notice before sending.
5. A new tab briefly shows the secure handoff page and then opens the
   `catan.soft2u.ro` map analytics page.

The imported analytics board is shown in BGA orientation so its positions are
easier to compare with the source board, while number tokens remain readable.

## Permissions

| Permission | Why it is needed |
| --- | --- |
| `scripting` | Reads board state in BGA's page execution context, including game iframes. |
| `https://boardgamearena.com/*` | Runs the board reader on BGA pages. |
| `https://*.boardgamearena.com/*` | Supports BGA game frames hosted on subdomains. |
| `https://catan.soft2u.ro/*` | Posts the selected board to the analyzer and follows its result redirect. |

The extension does not request the broad `tabs`, browsing-history, cookies,
storage, downloads, or `<all_urls>` permissions.

## How the import works

```text
User action
  → content.js requests the visible board
  → background.js inspects all BGA frames in the MAIN execution world
  → content.js creates the minimal normalized payload
  → import.html/import.js POST it over HTTPS
  → catan.soft2u.ro validates and saves the board
  → the service redirects to /map-analytics/{map-hash}
```

Runtime data is preferred because it is stable across visual themes. If BGA's
runtime object is unavailable, the extension falls back to reading visible
Catan tile and harbor elements from the DOM. Business logic and scoring remain
on `catan.soft2u.ro`; the extension does not duplicate the analyzer.

## Troubleshooting

### “Receiving end does not exist” or “No receiver”

The BGA tab was probably open before the extension was installed or reloaded.
Refresh the BGA page and try again.

### “No Catan board found”

- Wait until the complete board finishes loading.
- Confirm the page is a Catan game or tutorial.
- Refresh the page after updating the extension.
- If BGA changed its board markup or runtime data, open a GitHub issue with the
  browser version, BGA page type, and the exact error. Do not include private
  game data, cookies, or credentials.

### The extension finds fewer than 19 tiles

The release supports only the standard Classic 19-tile board. Make sure every
tile is visible and loaded. Expansion or custom layouts are not currently
supported.

### The handoff page reports a service error

Confirm that `https://catan.soft2u.ro` is reachable. Privacy or network tools
must allow a first-party HTTPS request to that domain. The extension never
needs access to BGA cookies for this request.

### The extension is installed but no floating button appears

Use the extension popup instead. Also verify that the current URL is a BGA
Catan page and refresh after installing or reloading the extension.

## Development

Requirements:

- Google Chrome or another Chromium browser with Manifest V3 support;
- Node.js 20 or newer for the tests;
- PowerShell 5.1 or newer to build the release archive.

No npm install is required. The repository has no third-party runtime
dependencies.

Run validation from the repository root:

```powershell
node --check background.js
node --check content.js
node --check popup.js
node --check import.js
node --test background.test.js import.test.js
node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))"
```

Build a deterministic release archive:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\package.ps1
```

The archive is written to `dist\catan-bga-analyzer-v<version>.zip`. It contains
only runtime extension files. Load the source directory, not the ZIP, when
developing locally.

## Repository layout

| File | Purpose |
| --- | --- |
| `manifest.json` | Manifest V3 metadata, permissions, hosts, and CSP. |
| `background.js` | Cross-frame MAIN-world extraction and tab creation. |
| `content.js` | UI, normalization, payload minimization, and messaging. |
| `popup.html`, `popup.js` | Toolbar popup and user-triggered analysis. |
| `import.html`, `import.js` | Credential-free HTTPS POST handoff. |
| `*.test.js` | Focused extraction, minimization, and handoff tests. |
| `scripts/package.ps1` | Release ZIP builder. |

## Backend contract

The extension sends `POST https://catan.soft2u.ro/import-from-bga` with
`Content-Type: application/json` and a body shaped like:

```json
{
  "source": "boardgamearena",
  "game": "catan",
  "variant": "classic",
  "map": {
    "tiles": [
      {
        "index": 0,
        "x": 1,
        "y": 2,
        "type": 3,
        "dice_value": 5
      }
    ],
    "harbours": [
      {
        "x": 0,
        "y": 3,
        "z": "S",
        "type": 5
      }
    ]
  }
}
```

On success the service redirects to an HTTPS URL under
`/map-analytics/{map-hash}`. The extension rejects an unexpected protocol,
host, or destination path.

## Publishing a release

1. Update `version` in `manifest.json`.
2. Add the release notes to [CHANGELOG.md](CHANGELOG.md).
3. Run all validation commands.
4. Build the ZIP with `scripts/package.ps1`.
5. Inspect the ZIP and load its extracted contents in Chrome for a final test.
6. Create a signed Git tag such as `v0.2.0`.
7. Create a GitHub Release and attach the generated ZIP.

GitHub releases remain manual/unpacked installations. A Chrome Web Store
listing is needed for normal one-click installation and automatic updates.
Review the store's current privacy, permission, single-purpose, and developer
identity requirements before submitting.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Report
security or privacy issues privately using [SECURITY.md](SECURITY.md), not in a
public issue.

## License

Released under the [MIT License](LICENSE).
