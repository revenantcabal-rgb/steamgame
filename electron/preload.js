const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('__STEAM__', true);

contextBridge.exposeInMainWorld('__STEAM_API__', {
  isAvailable: () => ipcRenderer.invoke('steam:isAvailable'),
  getUserInfo: () => ipcRenderer.invoke('steam:getUserInfo'),
  unlockAchievement: (id) => ipcRenderer.invoke('steam:unlockAchievement', id),
  setStat: (name, value) => ipcRenderer.invoke('steam:setStat', name, value),
  cloudSave: (key, data) => ipcRenderer.invoke('steam:cloudSave', key, data),
  cloudLoad: (key) => ipcRenderer.invoke('steam:cloudLoad', key),
});
