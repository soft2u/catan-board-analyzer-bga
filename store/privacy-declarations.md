# Privacy tab — version 0.2.2

Copy the applicable text into the current Chrome Web Store dashboard. The
publisher must verify these declarations against the uploaded package and
actual server operation. Do not select “no data collected.” Board content is
transmitted, URLs are inspected locally, and the service records import/IP data.

## Single purpose

Import the user's selected Classic Catan board from Board Game Arena into
catan.soft2u.ro for a public, shareable board-analysis page, with optional
source-table identification and related import support and diagnostics.

## Permission justifications

| Permission or host | Text for the dashboard |
| --- | --- |
| `scripting` | Executes the extension's bundled board reader in the BGA page's MAIN world after the user chooses Send. The isolated content script cannot directly read the page's loaded game objects. The reader searches game frames and extracts board fields, with a visible-element fallback. It does not alter game state or execute downloaded code. |
| `https://boardgamearena.com/*` | Displays the extension control and reads the selected Classic Catan board on BGA after the user's action. It also inspects the current BGA URL locally to identify a source table; the full URL is not sent. |
| `https://*.boardgamearena.com/*` | Supports BGA pages and game frames on BGA subdomains. Extraction serves the same board-import action; it is not browsing-activity monitoring. |
| `https://catan.soft2u.ro/*` | Allows the packaged handoff page to POST the selected board and optional numeric table ID to the fixed HTTPS import endpoint and follow its response. The result opens in a normal browser tab. |

## Remote code

Select **No** for remote executable code. All code executed by the extension,
including the MAIN-world extraction function, is bundled in its package.
The HTTPS request sends data for server-side analysis. The extension does not
download or evaluate remote JavaScript or WebAssembly; the separately opened
analysis website is not code injected into the extension.

## Data categories: recommended interpretation

The dashboard's live definitions take precedence over the shorthand below.
These are conservative classification recommendations, not a claim that every
identifier fits exactly one category. Local processing still requires disclosure.
[Chrome's user-data guidance](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).

| Category | Recommendation and reason |
| --- | --- |
| Website content | Select. Board tiles, numbers, harbors, and the optional BGA table ID are extracted and sent. |
| Web history / browsing activity | Select. The extension reads the current BGA frame/tab URL locally for the import; it does not collect a browsing log or send the full URL. |
| Location | Select if the live definition includes IP addresses, as the service stores the request IP. There is no GPS/device-location request or geolocation feature. Do not omit IP handling merely because it is captured server-side. |
| User activity | Select conservatively for retained user-requested import timestamps and repeat-import reporting. Explain that there is no keystroke, mouse, or general interaction tracking. Confirm the dashboard's current definition. |
| Personally identifiable information | Review the live definition for online/network identifiers. The source-table ID can link to a public table and its participants, and the server retains an IP. Select if those identifiers fall within this category; no BGA names or account profiles are extracted. Do not describe the dataset as anonymous. |
| Authentication, financial/payment, health, personal communications | Do not select for this extension's described flow. It does not read or transmit these data types. Reassess if the runtime or service changes. |

## Certification and Limited Use

The planned uses are public board analysis, source identification, import
support/diagnostics, reliability, and security. There is no sale, personalized
advertising use, or credit/lending use. The publisher must confirm service
providers and actual operational practices before certifying the dashboard's
data-use statements. A statement in documentation is not a substitute for
matching controls. [Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

Version 0.2.2 gives both entry points an explicit pre-Send notice: the service
saves a public board, and Send consents to administrators inspecting this
submitted board and table ID for import support and diagnostics. Verify that
both controls work this way in the exact ZIP. Consent must remain specific;
do not treat an import as permission for unrelated browsing or unrestricted
human access, or treat older 0.2.1 submissions as retroactively consented.

The Limited Use paragraph in `../PRIVACY.md` is the proposed affirmative
statement. Publish it only after confirming these controls and operational
limits. Human access must stay within the specified consent, security/legal
needs, or anonymized operational aggregates.
[Limited Use policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use).

## Public policy URL

Proposed: `https://github.com/soft2u/catan-board-analyzer-bga/blob/main/PRIVACY.md`.
Publish the exact reviewed notice at a stable public URL before submission;
verify the branch and that an unauthenticated browser can read it. Ensure
popup, listing, and dashboard policy links are consistent. This draft does
not publish the policy or change the website's existing privacy page.
