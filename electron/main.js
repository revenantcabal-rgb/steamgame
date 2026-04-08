const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// ── Read Steam App ID ──
let appId = 480; // Default: Spacewar test app ID
try {
  const appIdPath = path.join(__dirname, '..', 'steam_appid.txt');
  const raw = fs.readFileSync(appIdPath, 'utf-8').trim();
  const parsed = parseInt(raw, 10);
  if (!isNaN(parsed) && parsed > 0) appId = parsed;
} catch {
  // steam_appid.txt not found — use default
}

// ── Initialize Steamworks ONCE ──
let steamworks = null;
let steamClient = null;
try {
  steamworks = require('steamworks.js');
  steamClient = steamworks.init(appId);
  console.log('Steam initialized successfully (appId:', appId, ')');
  console.log('Steam User:', steamClient.localplayer.getName());
} catch (e) {
  console.log('Steam not available (running outside Steam client):', e.message);
  steamworks = null;
  steamClient = null;
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Dead City Directive',
    icon: path.join(__dirname, '../public/favicon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0f0f0f',
    show: false,
  });

  // In production, load the built app
  // In dev, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5174');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle Steam overlay
  if (steamClient) {
    mainWindow.on('focus', () => {
      // Steam overlay notification
    });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (steamClient) {
    try {
      steamworks.shutdown?.();
    } catch (e) {
      console.log('Steam shutdown error:', e.message);
    }
    steamClient = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (steamClient) {
    try {
      steamworks.shutdown?.();
    } catch (e) {
      console.log('Steam shutdown error:', e.message);
    }
    steamClient = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ── IPC handlers for Steam functionality (all use cached steamClient) ──

ipcMain.handle('steam:isAvailable', () => !!steamClient);

ipcMain.handle('steam:getUserInfo', () => {
  if (!steamClient) return null;
  try {
    return {
      steamId: steamClient.localplayer.getSteamId().steamId64.toString(),
      name: steamClient.localplayer.getName(),
      appId,
    };
  } catch {
    return null;
  }
});

ipcMain.handle('steam:unlockAchievement', (_, achievementId) => {
  if (!steamClient) return false;
  try {
    return steamClient.achievement.activate(achievementId);
  } catch {
    return false;
  }
});

ipcMain.handle('steam:setStat', (_, statName, value) => {
  if (!steamClient) return false;
  try {
    steamClient.stats.setInt(statName, value);
    steamClient.stats.store();
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('steam:cloudSave', (_, key, data) => {
  if (!steamClient) return false;
  try {
    const buffer = Buffer.from(data, 'utf-8');
    steamClient.cloud.writeFile(key, buffer);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('steam:cloudLoad', (_, key) => {
  if (!steamClient) return null;
  try {
    if (!steamClient.cloud.isFileExists(key)) return null;
    const buffer = steamClient.cloud.readFile(key);
    return buffer.toString('utf-8');
  } catch {
    return null;
  }
});
