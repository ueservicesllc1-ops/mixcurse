// Preload script para preparar el entorno de Electron
const { contextBridge } = require('electron');

// Exponer APIs seguras si es necesario
console.log('✅ Preload script ejecutado');

// Polyfill para APIs que puedan faltar
window.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM listo desde preload');
});
