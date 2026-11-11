# Contributing

Thank you for helping improve Catan BGA Analyzer.

## Before opening a change

- Keep the extension single-purpose: import a user-selected visible Catan
  board into `catan.soft2u.ro`.
- Do not add move automation, hidden-information extraction, player tracking,
  chat collection, or credential access.
- Do not broaden host permissions without a documented technical need.
- Preserve the explicit user action and the privacy/fair-play disclosures.
- Keep analyzer and scoring business logic on `catan.soft2u.ro`.

For a security or privacy vulnerability, follow [SECURITY.md](SECURITY.md)
instead of opening a public issue.

## Local setup

1. Fork or clone the repository.
2. Open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the repository root.
5. After each source change, press **Reload** on the extension card and refresh
   the BGA page.

There are no npm dependencies.

## Validation

Run these commands before submitting a pull request:

```powershell
node --check background.js
node --check content.js
node --check popup.js
node --check import.js
node --test background.test.js content.test.js import.test.js
node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'))"
powershell -ExecutionPolicy Bypass -File .\scripts\package.ps1
```

Also manually verify:

- tutorial and permitted live/replay page extraction;
- popup and floating-button paths;
- the correct source table ID, with no ID guessed for tutorials that do not have one;
- a successful HTTPS handoff and analytics redirect;
- a clear failure when no board is present;
- no BGA cookies, credentials, player data, full page URL, or page title in the
  request payload;
- no board data in the destination URL query string.

## Pull requests

Keep changes focused. Describe:

- the problem and user-visible result;
- permission or privacy impact;
- automated and manual testing;
- any BGA DOM/runtime assumptions;
- screenshots when the popup or floating panel changes.

Update `CHANGELOG.md` and bump `manifest.json` only when preparing a release.
