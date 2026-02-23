const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    platform: process.platform,
    version: process.versions.electron,
    isDesktop: true
});

window.addEventListener('DOMContentLoaded', () => {
    console.log('✅ MultiTrack Player Desktop - Preload ejecutado');
    // Signal to the app that we're running inside Electron
    document.documentElement.setAttribute('data-electron', 'true');
});
