# Changelog

All notable changes to this project are documented here.

## [Unreleased]

## [0.2.2] - 2026-11-11

### Added

- Extension icons and Chrome Web Store listing, image, privacy-declaration,
  reviewer, and submission materials. Store publication remains a separate step.
- Explicit pre-send disclosure of public, shareable board storage and consent
  for administrators to inspect the submitted board and optional table ID for
  import support and diagnostics, in both extension entry points.

### Clarified

- The extension reads board fields already loaded in BGA's page runtime, with
  a visible-element fallback. It adds its own floating control but leaves the
  BGA board and game state unchanged and never makes moves or automates play.
- Privacy terms cover retained IP/import metadata, source-table and repeat-import
  reporting, and the scope of human access. New consent wording is not treated
  as consent for older submissions.

### Changed

- Include icons in the release package and use version 0.2.2 for store preparation.

## [0.2.1] - 2026-11-11

### Fixed

- Preserve the source BGA table number through board extraction, normalization,
  and the HTTPS import handoff, so new imports can show their source table in
  the analytics panel.
- Support game iframe and visible-board fallback extraction while leaving
  unavailable IDs absent, including tutorials without a table number.

### Changed

- Send an optional validated numeric `table_id` alongside the board, with no
  additional permissions. Full URLs, player details, and credentials remain
  excluded from the payload.
- Update the popup, floating-button disclosure, and privacy notice to describe
  source-table metadata. Previously imported boards without IDs are unchanged.

## [0.2.0] - 2026-07-26

### Added

- Cross-frame extraction for BGA live-game iframes.
- Visible-DOM fallback when BGA runtime board data is unavailable.
- Internal handoff page that posts board data to the analyzer over HTTPS.
- Focused extraction, data-minimization, and handoff tests.
- Public installation, privacy, security, contribution, and release guides.

### Changed

- Minimized the transmitted payload to tiles, numbers, harbors, and fixed
  source metadata.
- Replaced the destination query-string transfer with a credential-free HTTPS
  `POST`.
- Removed the broad `tabs` permission and development-only localhost access.
- Added explicit privacy and fair-play notices.

### Removed

- Player data, current dice, robber state, page URL, page title, timestamps,
  and debug game-state dumps from extension collection.

## [0.1.4]

- Initial working Classic-board import for BGA tutorial pages.
