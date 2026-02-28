'use strict';

const { app, BrowserWindow, shell } = require('electron');

const DEFAULT_TARGET_URL = 'https://notebooklm.google.com/';
const PERSISTENT_PARTITION = 'persist:web2desktop';

function readCliTargetUrl(argv) {
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg.startsWith('--targetUrl=')) {
      return arg.slice('--targetUrl='.length);
    }

    if (arg === '--targetUrl' && typeof argv[i + 1] === 'string') {
      return argv[i + 1];
    }
  }

  return undefined;
}

function normalizeHttpUrl(candidate) {
  const parsed = new URL(candidate);

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Unsupported protocol "${parsed.protocol}"`);
  }

  return parsed.toString();
}

function resolveTargetUrl() {
  const cliTargetUrl = readCliTargetUrl(process.argv.slice(1));
  const envTargetUrl = process.env.TARGET_URL;
  const chosen = cliTargetUrl || envTargetUrl || DEFAULT_TARGET_URL;

  try {
    return normalizeHttpUrl(chosen);
  } catch (error) {
    console.error(
      `[config] Invalid targetUrl "${chosen}". Falling back to ${DEFAULT_TARGET_URL}.`
    );
    return DEFAULT_TARGET_URL;
  }
}

function openExternalSafely(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const allowedProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);

    if (!allowedProtocols.has(url.protocol)) {
      return;
    }

    shell.openExternal(url.toString()).catch((error) => {
      console.error('[external] Failed to open URL in system browser:', error);
    });
  } catch {
    console.error('[external] Ignoring invalid URL:', rawUrl);
  }
}

function createMainWindow(targetUrl) {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      partition: PERSISTENT_PARTITION
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalSafely(url);
    return { action: 'deny' };
  });

  mainWindow.loadURL(targetUrl);
}

function bootstrap() {
  const targetUrl = resolveTargetUrl();

  app.whenReady().then(() => {
    createMainWindow(targetUrl);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow(targetUrl);
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

bootstrap();
