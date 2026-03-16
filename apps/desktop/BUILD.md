# Crisp Desktop — Build & Release

## Prerequisites

- Rust toolchain (`rustup`)
- Node.js 20+
- Tauri CLI: `cargo install tauri-cli --version "^2.0"`
- Apple Developer account (for signing + notarization)

## Local Development

```bash
cd apps/desktop
npm install
cargo tauri dev
```

This starts the Vite dev server and launches the Tauri app with hot reload.

## Production Build

```bash
cd apps/desktop
cargo tauri build
```

Output: `src-tauri/target/release/bundle/dmg/Crisp_*.dmg`

## Code Signing (macOS)

Tauri handles code signing automatically if these env vars are set:

| Variable | Description |
|---|---|
| `APPLE_CERTIFICATE` | Base64-encoded `.p12` certificate |
| `APPLE_CERTIFICATE_PASSWORD` | Password for the `.p12` |
| `APPLE_SIGNING_IDENTITY` | e.g. `Developer ID Application: Your Name (TEAMID)` |
| `APPLE_ID` | Your Apple ID email |
| `APPLE_PASSWORD` | App-specific password (not your Apple ID password) |
| `APPLE_TEAM_ID` | Your 10-character team ID |

### Generate the certificate

1. Open Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
2. Go to developer.apple.com → Certificates → Create "Developer ID Application"
3. Download and install the `.cer`
4. Export as `.p12` from Keychain Access
5. Base64 encode: `base64 -i certificate.p12 | pbcopy`
6. Add to GitHub Secrets as `APPLE_CERTIFICATE`

### App-specific password

1. Go to appleid.apple.com → Sign-In and Security → App-Specific Passwords
2. Generate one for "Crisp Notarization"
3. Add to GitHub Secrets as `APPLE_PASSWORD`

## Auto-Updates

The app uses `tauri-plugin-updater` to check for updates on launch.

Update endpoint: `https://crisp.app/api/desktop/update/{{target}}/{{arch}}/{{current_version}}`

The CI pipeline generates an `update-manifest.json` on each release. You need to
serve this from your API (or a static host) at the endpoint above.

## Release Process

1. Bump version in `src-tauri/tauri.conf.json`
2. Commit: `git commit -m "desktop: bump to v0.2.0"`
3. Tag: `git tag desktop-v0.2.0`
4. Push: `git push origin desktop-v0.2.0`

The GitHub Actions workflow will:
- Build for Apple Silicon + Intel
- Code sign with your Developer ID certificate
- Notarize with Apple
- Create a GitHub Release with DMG downloads
- Generate an update manifest for the auto-updater

## Distribution

### Direct download (recommended for launch)
- Host DMGs on your website or GitHub Releases
- Users download, drag to Applications, done
- Auto-updater handles all future updates

### Mac App Store (later)
- Requires additional entitlements and sandbox restrictions
- Tauri supports MAS builds: `cargo tauri build --bundles app`
- Needs a separate "Mac App Distribution" certificate
- Submit via Transporter or `xcrun altool`
