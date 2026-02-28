# Web2Desktop

Minimal, auditable Electron shell that opens a web app URL in a desktop window.

## What This Is

This project is a clean Electron wrapper around a configurable `targetUrl`.
Default URL: `https://chatgpt.com`

No React UI is used. The app only creates one `BrowserWindow` and loads the target site.

## Requirements

- Node.js `>=18`
- npm

## Install and Run

```bash
npm install
npm run start
```

## Configure `targetUrl`

Resolution order (highest to lowest priority):

1. CLI argument `--targetUrl=...`
2. Environment variable `TARGET_URL`
3. Default: `https://chatgpt.com`

Examples:

```bash
# Uses default https://chatgpt.com
npm run start

# Uses env var
TARGET_URL=https://example.com npm run start

# CLI argument overrides env var
TARGET_URL=https://example.com npm run start -- --targetUrl=https://news.ycombinator.com
```

## Security Model (Clean Wrapper)

Implemented in `main.js`:

- No preload script.
- No script injection into the page.
- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- `window.open` popups are blocked via `setWindowOpenHandler`.
- Popup target URLs are opened in the system browser (`shell.openExternal`).
- No request interception, proxying, cookie exfiltration, or keylogging logic.

## Session Persistence

The window uses a persistent Electron partition: `persist:web2desktop`.
Cookies/session data are stored on disk under Electron `userData`, so login survives app restarts.

## Build (Linux AppImage)

```bash
npm run make
```

This uses `electron-builder` and outputs an AppImage in `dist/`.
