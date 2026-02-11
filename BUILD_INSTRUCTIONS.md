# Instrucciones de Build - MultiTrack Player

## Iconos Configurados

### ✅ Favicon Web
- Archivo: `assets/favicon.ico`
- Se muestra en la pestaña del navegador
- Configurado en `web-app.html` y `app.json`

### ✅ Logo en Loading Screens
- Reemplazado el texto "Judith 1.0" con el logo PNG
- Archivo: `assets/icon.png`
- Se muestra en:
  - Pantalla de carga inicial
  - LED startup sequence
  - Sistema de audio

### ✅ Aplicación de Escritorio (.exe)
- Configurado con Electron
- Icono: `assets/icon.png`
- Archivos de configuración:
  - `main.js` - Aplicación Electron principal
  - `electron-builder.json` - Configuración de build
  - `package.json` - Scripts de build

### ✅ Aplicaciones Móviles
- **Android**: `assets/adaptive-icon.png` (icono adaptativo)
- **iOS**: `assets/icon.png` (icono principal)
- Configurado en `app.json`

## Comandos para Generar Aplicaciones

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Aplicación Web
```bash
# El servidor ya está corriendo en http://localhost:8000
# O usar:
npx http-server -p 8000 -o
```

### 3. Aplicación de Escritorio (Windows .exe)
```bash
# Instalar dependencias de Electron
npm install electron electron-builder --save-dev

# Generar .exe
npm run build-win
```

### 4. Aplicación de Escritorio (macOS .dmg)
```bash
npm run build-mac
```

### 5. Aplicación de Escritorio (Linux .AppImage)
```bash
npm run build-linux
```

### 6. Aplicaciones Móviles
```bash
# Android
npm run android

# iOS (solo en macOS)
npm run ios
```

## Archivos de Iconos

- `assets/icon.png` - Icono principal (512x512)
- `assets/favicon.png` - Favicon PNG (32x32)
- `assets/favicon.ico` - Favicon ICO (32x32)
- `assets/adaptive-icon.png` - Icono adaptativo Android
- `assets/splash.png` - Pantalla de splash

## Notas Importantes

1. **Electron**: Para generar .exe necesitas instalar las dependencias de Electron
2. **Expo**: Para apps móviles necesitas Expo CLI instalado
3. **Iconos**: Todos los iconos están configurados para usar el logo PNG
4. **Favicon**: El navegador web ahora muestra el icono personalizado

## Servidor Web Activo

El servidor está corriendo en:
- http://localhost:8000
- http://192.168.1.173:8000

Puedes acceder a la aplicación desde cualquier dispositivo en la red.






