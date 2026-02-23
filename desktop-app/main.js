const { app, BrowserWindow, Menu, shell, dialog, session } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');
const url = require('url');

// ─── Internal HTTP server ───────────────────────────────────────────────────
let server = null;
let serverPort = 0;

function getMimeType(ext) {
    const types = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.ico': 'image/x-icon',
        '.svg': 'image/svg+xml',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.zip': 'application/zip',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf'
    };
    return types[ext] || 'application/octet-stream';
}

function startServer() {
    return new Promise((resolve, reject) => {
        const appDir = __dirname;

        server = http.createServer((req, res) => {
            let reqPath = url.parse(req.url).pathname;

            // Decode URI
            try { reqPath = decodeURIComponent(reqPath); } catch (e) { }

            // Default to web-app.html
            if (reqPath === '/' || reqPath === '') reqPath = '/web-app.html';

            const filePath = path.join(appDir, reqPath);
            const ext = path.extname(filePath).toLowerCase();
            const mime = getMimeType(ext);

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404 Not Found: ' + reqPath);
                    } else {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('500 Server Error: ' + err.message);
                    }
                    return;
                }

                res.writeHead(200, {
                    'Content-Type': mime,
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache'
                });
                res.end(data);
            });
        });

        // Use a random available port
        server.listen(0, '127.0.0.1', () => {
            serverPort = server.address().port;
            console.log(`✅ Internal server running at http://127.0.0.1:${serverPort}`);
            resolve(serverPort);
        });

        server.on('error', reject);
    });
}

// ─── Window ──────────────────────────────────────────────────────────────────
let mainWindow = null;

function createWindow(port) {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1100,
        minHeight: 700,
        icon: path.join(__dirname, 'assets', 'ICONO.ico'),
        title: 'MultiTrack Player',
        backgroundColor: '#0f0f0f',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: false,
            allowRunningInsecureContent: true
        },
        show: false
    });

    // Load from internal server
    mainWindow.loadURL(`http://127.0.0.1:${port}/web-app.html`);

    // Show maximized when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
        console.log('✅ MultiTrack Player window ready');
    });

    // DevTools in dev mode
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    // Log load errors to console (not fatal)
    mainWindow.webContents.on('did-fail-load', (event, code, desc, failedUrl) => {
        // Ignore -3 (aborted), service worker errors, etc.
        if (code !== -3) {
            console.warn(`⚠️ Load warning [${code}]: ${desc} → ${failedUrl}`);
        }
    });

    // Inject fixes when page has finished loading
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
      (function() {
        // Fix: dragEvent ReferenceError - define as no-op if missing
        if (typeof dragEvent === 'undefined') {
          window.dragEvent = null;
        }

        // Fix: If Firebase auth doesn't initialize in 4 seconds, hide the
        // auth modal and show the app anyway (so it doesn't stay black)
        setTimeout(() => {
          const authModal = document.getElementById('authModal');
          if (authModal && authModal.style.display !== 'none' && authModal.style.display !== '') {
            // Modal is shown but Firebase hasn't resolved - hide it
            authModal.style.display = 'none';
            console.log('[Desktop] Auth modal hidden (Firebase timeout)');
          }
          // Also: if modal is still display:none but body looks empty, that's fine
          // If Firebase hasn't loaded at all, hide the modal completely
          if (!window.firebase || !window.firebase.auth) {
            if (authModal) authModal.style.display = 'none';
            console.log('[Desktop] Firebase not available - showing app without auth');
          }
        }, 4000);

        console.log('[Desktop] Electron fixes injected ✅');
      })();
    `).catch(err => console.error('Inject error:', err));
    });

    // External links open in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url: openUrl }) => {
        if (openUrl.startsWith('http://') || openUrl.startsWith('https://')) {
            shell.openExternal(openUrl);
        }
        return { action: 'deny' };
    });

    mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
function buildMenu() {
    const isMac = process.platform === 'darwin';
    const template = [
        ...(isMac ? [{
            label: app.name,
            submenu: [
                { role: 'about' }, { type: 'separator' },
                { role: 'services' }, { type: 'separator' },
                { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
                { type: 'separator' }, { role: 'quit' }
            ]
        }] : []),
        {
            label: 'Archivo',
            submenu: [
                {
                    label: 'Biblioteca de Música',
                    accelerator: 'CmdOrCtrl+L',
                    click: () => mainWindow?.webContents.executeJavaScript(
                        `if(typeof toggleLibrary==='function') toggleLibrary();`
                    )
                },
                { type: 'separator' },
                isMac ? { role: 'close' } : { role: 'quit', label: 'Salir' }
            ]
        },
        {
            label: 'Editar',
            submenu: [
                { role: 'undo', label: 'Deshacer' }, { role: 'redo', label: 'Rehacer' },
                { type: 'separator' },
                { role: 'cut', label: 'Cortar' }, { role: 'copy', label: 'Copiar' },
                { role: 'paste', label: 'Pegar' }, { role: 'selectAll', label: 'Seleccionar Todo' }
            ]
        },
        {
            label: 'Vista',
            submenu: [
                { role: 'reload', label: 'Recargar' },
                { role: 'forceReload', label: 'Forzar Recarga' },
                { role: 'toggleDevTools', label: 'DevTools', accelerator: 'F12' },
                { type: 'separator' },
                { role: 'resetZoom', label: 'Tamaño Original' },
                { role: 'zoomIn', label: 'Acercar' },
                { role: 'zoomOut', label: 'Alejar' },
                { type: 'separator' },
                { role: 'togglefullscreen', label: 'Pantalla Completa', accelerator: 'F11' }
            ]
        },
        {
            label: 'Ayuda',
            submenu: [
                {
                    label: 'Acerca de MultiTrack Player',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'MultiTrack Player',
                            message: 'MultiTrack Player v1.0.0',
                            detail: 'Professional DAW para mezcla de audio multi-pista.\n© 2026 MultiTrack Player Team',
                            buttons: ['Cerrar']
                        });
                    }
                }
            ]
        }
    ];
    return Menu.buildFromTemplate(template);
}

// ─── App lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
    // Allow media/audio permissions
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        const allowed = ['media', 'audioCapture', 'notifications', 'mediaKeySystem'];
        callback(allowed.includes(permission));
    });

    // Start internal HTTP server first, then open window
    const port = await startServer();
    Menu.setApplicationMenu(buildMenu());
    createWindow(port);
});

app.on('window-all-closed', () => {
    if (server) server.close();
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(serverPort);
});
