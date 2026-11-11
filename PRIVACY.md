# Privacy Notice for Catan BGA Analyzer

Last updated: 2026-11-11 · Extension version: 0.2.2

Catan BGA Analyzer is an unofficial browser extension for importing a Classic
Catan board from Board Game Arena into [catan.soft2u.ro](https://catan.soft2u.ro).
It adds its own floating control to the page. It does not change the BGA board,
game state, or resources, submit moves, or automate play.

## What is read and sent

When you choose **Send board for analysis**, the extension reads board fields
already loaded in the selected BGA game frame. If those fields are unavailable,
it reads the visible board elements instead. It sends:

- land-tile coordinates and resource types;
- number tokens and harbor coordinates and types;
- the positive numeric BGA table ID, when available;
- fixed source, game, and board-variant identifiers.

To resolve the table ID, the extension may inspect the current BGA frame or
tab URL locally. Only its numeric `table` parameter is retained. It does not
send the full URL, title, other query parameters, or browsing history. A table
ID can link to the original BGA table and information visible there; it is not
an anonymous board identifier. Imports without a table ID remain supported.

The extension does not extract BGA player names, usernames, cards, hands,
chat, scores, move history, dice history, passwords, login cookies, or tokens.
It has no background activity tracking or advertising SDK. The source page's
URL is inspected only for page detection and source-table identification.

## Your action and consent

The popup and floating control explain the transfer and public board storage
before the Send button. In version 0.2.2, choosing Send also gives specific
consent for service administrators to inspect the submitted board and table
ID for import support and diagnostics. You can decline by not sending.

The board is saved as a public, shareable analysis page. Anyone with its link
can view it; do not submit a board you want kept private. This notice does not
retroactively treat submissions from earlier extension versions as having
given the version 0.2.2 inspection consent.

## Transmission and service storage

The extension sends JSON directly to
`https://catan.soft2u.ro/import-from-bga` using HTTPS POST. The request omits
browser credentials and a referrer. Its internal handoff page briefly receives
the payload in a URL fragment and removes that fragment before the request.
The payload is not put in the service URL or query string.

The service validates and saves the board, optional table ID, import timestamp,
and originating IP address. Its web-server logs can also retain connection
metadata. The IP address is received through the network request; the
extension does not request GPS or device-location access. There is no
automatic board-deletion deadline in this release.

Service administrators can use recorded table IDs to link imports to their
source and count repeated imports. Inspection of a specific submitted board
and table ID is limited to the consent described above, necessary security
investigations, or legal requirements. Internal operational reporting may use
aggregated, anonymized data. Such consent does not authorize unrelated
inspection of a person's browsing activity or other BGA data.

The destination website's optional analytics and cookies follow its own
[privacy notice and consent controls](https://catan.soft2u.ro/tournaments/privacy).
Opening that website does not make the extension a cookie-consent mechanism.
The extension does not change an existing consent choice.

## Limited Use

Catan BGA Analyzer's handling of information obtained through Chrome APIs
follows the [Chrome Web Store User Data Policy, including Limited Use](https://developer.chrome.com/docs/webstore/program-policies/limited-use).
Data is used to deliver the requested board import and analysis and the
disclosed support, diagnostics, reliability, and security functions. It is not
sold, used for personalized advertising, or used for credit or lending decisions.
Transfers are limited to delivering or improving this purpose, necessary
security or legal obligations, and a business transfer with prior explicit
consent. Human access is limited to the specific consent and exceptions
described above.

## Retention, access, and deletion

Imported boards are retained so their analysis links continue to work.
Uninstalling the extension stops its operation but does not delete boards
already saved on the service. For access, correction, deletion, or privacy
questions, use the contact details in the
[service privacy notice](https://catan.soft2u.ro/tournaments/privacy). Include
the analysis URL where useful; never send a BGA password, cookie, or token.

This extension is not affiliated with or endorsed by Board Game Arena, Catan
GmbH, or CATAN Studio. Material changes to data handling are recorded in
[CHANGELOG.md](CHANGELOG.md).
