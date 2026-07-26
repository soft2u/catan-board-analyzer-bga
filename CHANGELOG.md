# Changelog

All notable changes to this project are documented here.

## [Unreleased]

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
