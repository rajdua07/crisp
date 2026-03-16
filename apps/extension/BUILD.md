# Crisp Browser Extension — Build & Release

## Local Development

### Chrome
1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `apps/extension/` directory
5. The extension is now active — paste AI text into any text field to test

### Firefox
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `apps/extension/manifest.json`

### Safari
1. Run: `xcrun safari-web-extension-converter apps/extension/ --project-location apps/extension/safari`
2. Open the generated Xcode project
3. Build and run
4. Enable the extension in Safari → Settings → Extensions

## Build for Distribution

### Chrome Web Store

```bash
cd apps/extension
zip -r crisp-chrome.zip manifest.json src/ public/ -x "*.DS_Store"
```

Upload `crisp-chrome.zip` to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

### Firefox Add-ons

Firefox needs manifest v2. The CI workflow handles this conversion automatically.
For manual builds:

```bash
cd apps/extension
# The workflow converts manifest v3 → v2 for Firefox compatibility
# See .github/workflows/extension-release.yml for the jq conversion
```

Upload to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/).

## Chrome Web Store Setup

### One-time setup
1. Pay the $5 Chrome Web Store developer registration fee
2. Create a new item in the Developer Dashboard
3. Note the Extension ID (you'll need this for CI)

### API credentials for CI publishing
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use existing)
3. Enable the Chrome Web Store API
4. Create OAuth 2.0 credentials (Desktop app type)
5. Get a refresh token using the OAuth playground

Add these to GitHub Secrets:
| Secret | Description |
|---|---|
| `CHROME_EXTENSION_ID` | Your extension's ID from the Developer Dashboard |
| `CHROME_CLIENT_ID` | OAuth client ID |
| `CHROME_CLIENT_SECRET` | OAuth client secret |
| `CHROME_REFRESH_TOKEN` | OAuth refresh token |

### Store listing assets needed
- Icon: 128x128 PNG
- Screenshots: 1280x800 or 640x400 (at least 1, up to 5)
- Promo tile: 440x280 PNG (optional, for featured placement)
- Description (up to 16,000 chars)
- Category: Productivity

## Firefox Add-ons Setup

1. Create an account at [addons.mozilla.org](https://addons.mozilla.org)
2. Go to Developer Hub → Manage API Keys
3. Generate API credentials

Add to GitHub Secrets:
| Secret | Description |
|---|---|
| `FIREFOX_API_KEY` | JWT issuer from AMO |
| `FIREFOX_API_SECRET` | JWT secret from AMO |

## Release Process

1. Bump version in `manifest.json`
2. Commit: `git commit -m "ext: bump to v0.2.0"`
3. Tag: `git tag ext-v0.2.0`
4. Push: `git push origin ext-v0.2.0`

The GitHub Actions workflow will:
- Build Chrome zip (manifest v3)
- Build Firefox zip (auto-converted to manifest v2)
- Publish to Chrome Web Store (if secrets configured)
- Publish to Firefox Add-ons (if secrets configured)
- Create a GitHub Release with both zips

## Review Times

- **Chrome Web Store**: Usually 1-3 business days for initial review, then same-day for updates
- **Firefox Add-ons**: Usually same-day for listed add-ons, up to a week for initial
- **Safari**: Goes through the Mac App Store review process (1-3 days)

## Icon Assets

You need to create these icon files in `public/`:
- `icon-16.png` (16x16) — toolbar icon
- `icon-48.png` (48x48) — extensions page
- `icon-128.png` (128x128) — Chrome Web Store, install dialog
- `tray-icon.png` (22x22, for Mac app menu bar)

Use the Crisp logo/fingerprint mark. For the tray icon, use a monochrome template
image (white on transparent) for proper macOS menu bar rendering.
