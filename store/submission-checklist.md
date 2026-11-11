# Submission checklist — version 0.2.2

Prepared 2026-11-12. This checklist does not submit or publish the extension.
Mark items only after checking the final files and the owner's dashboard.

## Package and behavior

- [x] Manifest version is `0.2.2`; name and short description match the listing.
- [x] Run syntax checks and `node --test background.test.js content.test.js import.test.js` (20 tests pass).
- [x] Build `dist/catan-bga-analyzer-v0.2.2.zip` with `scripts/package.ps1`.
- [x] Inspect the ZIP: `manifest.json` is at its root, runtime files and icons
  are present, and tests, screenshots, credentials, and development files are excluded.
- [ ] Load the extracted ZIP in Chrome and verify popup and floating-control imports.
- [ ] Both notices appear before Send and describe public board storage and
  specific administrator inspection for import support/diagnostics. No import
  occurs before the user's action. This fixes the earlier disclosure gap for
  new submissions; it does not establish consent for older submissions.
- [ ] Confirm the BGA board/game state is unchanged and no moves are sent.
- [ ] Confirm a board without a table ID still imports, and the optional ID is
  stored correctly when present. A reported ID is not independent verification by BGA.
- [ ] Verify the service is reachable and a fresh import opens working analysis.

## Images

| File | Check |
| --- | --- |
| `icons/icon-16.png`, `icons/icon-32.png`, `icons/icon-48.png`, `icons/icon-128.png` | Correct dimensions, legible at native size, present in the manifest/package. |
| `store/assets/screenshot-01.png` through `screenshot-03.png` | Real extension/analysis experience; no private names, IDs, tokens, or misleading claims. |
| `store/assets/promo-small-440x280.png` | Optional 440 × 280 promotional image. |
| `store/assets/promo-marquee-1400x560.png` | Optional 1400 × 560 promotional image. |

- [x] Store icon is a 128 × 128 PNG, with suitable transparent padding.
- [x] Three 1280 × 800 screenshots are available, with
  square corners and no added padding. Do not exceed five screenshots.
- [x] Promotional art uses the extension's own branding and does not imply
  endorsement by BGA, CATAN, or Google.

These image dimensions and minimums come from
[Chrome's image guidance](https://developer.chrome.com/docs/webstore/images).
The final images were visually checked. See `asset-notes.md` for their source
and the distinction between the actual popup, public sample analysis, and
original promotional artwork.

## Listing and privacy

- [ ] Paste the reviewed English copy from `listing-en.md`; choose the matching
  category actually offered in the dashboard.
- [ ] Publish the version 0.2.2 privacy notice at a stable public URL; verify
  the unauthenticated URL and policy links from the listing and extension.
- [ ] Apply the reviewed permission explanations and data-category decisions
  from `privacy-declarations.md`; do not claim zero collection.
- [ ] Owner confirms actual server retention, providers, security handling,
  and human-access practices match the notice and Limited Use statement.
- [ ] Human inspection of individual board/table records is limited to the
  specific consent, necessary security/legal access, or anonymized operational
  reporting. Historical submissions are not treated as newly consented.
- [ ] Do not certify a policy statement while its operational premise remains
  unverified. Disclosure text alone cannot establish compliance.

## Account-owned details

The publisher must provide or confirm these fields; do not invent them:

- [ ] Developer/publisher account, public publisher name, and required account verification.
- [ ] Monitored contact/support email, legal entity details, and address where requested.
- [ ] Trader/non-trader declaration and any associated verification requested by the dashboard.
- [ ] Distribution countries, visibility, pricing/status, and publishing preference.
- [ ] Currently working reviewer-accessible BGA test URL and permitted access
  details; private test credentials only if required.
- [ ] Owner accepts the applicable developer terms and accurate data-use certifications.

## Submit and follow review

- [ ] Upload the ZIP, then complete listing, privacy, distribution, and test instructions.
- [ ] Inspect the draft listing and all images at the dashboard's preview sizes.
- [ ] Choose whether publication should follow approval automatically or await
  a manual action. Submit only when the owner intends this step.
- [ ] Monitor reviewer messages and resolve concrete requests. Record the final
  item ID and public listing URL only after the dashboard supplies them.

Review and publication are Google's decisions; no approval date or acceptance
is guaranteed. See [prepare the package](https://developer.chrome.com/docs/webstore/prepare),
[privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy),
and [submission flow](https://developer.chrome.com/docs/webstore/publish).
