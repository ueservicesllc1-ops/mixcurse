const { app, BrowserWindow } = require('electron');

app.commandLine.appendSwitch('disable-gpu');

let mainWindow;

function createWindow() {
    console.log('🚀 Cargando MultiTrack Player...');

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        backgroundColor: '#0f0f0f',
        webPreferences: {
            sandbox: false,
            webSecurity: false
        }
    });

    // Cargar desde el servidor local
    mainWindow.loadURL('http://127.0.0.1:3000/judith/web-app.html');

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ Página cargada');
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error(`❌ Error: ${errorCode} - ${errorDescription}`);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
