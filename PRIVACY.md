# Privacy Notice for Catan BGA Analyzer

Last updated: 2026-11-11

This notice describes the data handled by the Catan BGA Analyzer browser
extension. The extension is an unofficial companion to
[catan.soft2u.ro](https://catan.soft2u.ro).

## Data sent when you request analysis

The extension sends the information needed to reconstruct the visible
Catan board and identify its source table:

- land-tile coordinates and resource types;
- visible number tokens;
- visible harbor coordinates and types;
- the positive numeric BGA table ID, when available;
- fixed source, game, and board-variant identifiers.

The extension does not continuously transmit data. A transfer occurs only
after you press **Send board for analysis**.

## Data the extension does not collect

The extension does not collect or send:

- BGA usernames or player names;
- cards, hands, chat messages, scores, moves, or dice history;
- BGA passwords, login cookies, authentication tokens, or other credentials;
- the full current BGA page URL or page title;
- unrelated page content or general browsing history.

It does not request Chrome's cookies, browsing-history, downloads, storage, or
`<all_urls>` permissions.

To find the table ID, the extension can read the current BGA frame or tab URL
locally and extract only its numeric `table` parameter. It does not send or
store that full URL or any other URL parameters. A table ID links back to the
original BGA table and information visible there; it is not an anonymous board
identifier. No additional browser permission is required.

## Transmission and storage

The board payload is sent directly to
`https://catan.soft2u.ro/import-from-bga` as an encrypted HTTPS `POST`. The
request omits browser credentials and referrer information. The extension
passes the payload to its internal handoff page in a URL fragment and removes
that fragment before contacting the service; board data is not added to the
service URL or query string.

The service validates and saves the imported board to provide a shareable
analytics URL. Its server-side import record may include the board data, an
import timestamp, the BGA table ID when supplied, and the originating IP address. Ordinary web-server security
and access logs may also contain connection metadata, but not the board payload
as a URL query parameter.

The destination website's cookies and optional analytics are governed by its
own consent controls and
[website privacy notice](https://catan.soft2u.ro/tournaments/privacy). The
extension neither grants analytics consent nor bypasses a rejection.

## Third-party services

- **Board Game Arena:** the extension reads the visible Catan board in the BGA
  page when you ask it to do so. No BGA credentials are sent to the analyzer.
- **catan.soft2u.ro:** receives and stores the selected board and provides the
  analysis page. Administrators can use the reported table ID to open the source
  table and count repeated imports of that table.

The extension does not include advertising SDKs or its own analytics service.

## Retention, access, and deletion

Imported boards are retained by `catan.soft2u.ro` so their analytics links can
continue to work. For questions about an imported board, access, or deletion,
use the contact method published in the
[website privacy notice](https://catan.soft2u.ro/tournaments/privacy). Include
the analytics map URL when appropriate, but never send a BGA password, cookie,
or authentication token.

## Your choices

Sending a board is optional. If you do not want the board saved by the
analyzer, do not press the analysis button. You can remove the extension at any
time from `chrome://extensions/`.

## Changes

Material changes to the extension's data handling will be documented here and
in [CHANGELOG.md](CHANGELOG.md). The "Last updated" date will be revised.
