# MultiTrack Player Mobile

Una aplicación móvil nativa para reproducción de múltiples tracks de audio con sincronización perfecta y sistema de descarga desde la nube.

## 🏗️ **Arquitectura del Sistema**

### **1. Página Web (Subida de canciones)**
- ✅ **Interfaz web** para subir ZIPs de canciones
- ✅ **Metadatos** (nombre, BPM, artista, key)
- ✅ **Base de datos** Firebase/Firestore
- ✅ **Almacenamiento** B2/Cloud Storage
- ✅ **API REST** para la app móvil

### **2. App Móvil (Reproducción)**
- ✅ **Descarga canciones** desde la web
- ✅ **Almacenamiento local** en el dispositivo
- ✅ **Reproducción offline** sin internet
- ✅ **Sincronización** con la base de datos
- ✅ **Audio nativo** sin buffers

## 🚀 **Características**

### **Audio Nativo:**
- ✅ **Reproducción inmediata** - Sin demoras de carga
- ✅ **Sincronización perfecta** - Todos los tracks inician exactamente al mismo tiempo
- ✅ **Control de volumen individual** - Por cada track
- ✅ **Mute/Solo** - Control independiente
- ✅ **Sin buffers** - Audio nativo eficiente

### **Gestión de Canciones:**
- ✅ **Biblioteca de canciones** - Descarga desde la nube
- ✅ **Almacenamiento offline** - Funciona sin internet
- ✅ **Metadatos completos** - BPM, key, artista
- ✅ **Gestión de espacio** - Control de almacenamiento local

### **Controles:**
- ✅ **BPM en tiempo real** - Ajuste de tempo
- ✅ **Interfaz táctil** - Optimizada para móviles
- ✅ **Tema oscuro** - Interfaz profesional
- ✅ **Controles intuitivos** - Botones grandes y fáciles

## 📱 **Uso**

### **1. Descargar canciones:**
1. Presiona **"📚 Biblioteca"**
2. Ve las canciones disponibles en la nube
3. Presiona **"⬇️"** para descargar
4. La canción se guarda localmente

### **2. Reproducir:**
1. Selecciona una canción descargada
2. Ajusta BPM si es necesario
3. Presiona **"▶"** para reproducir todos los tracks sincronizados
4. Controla volumen individual de cada track

### **3. Subir canciones (Web):**
1. Ve a la página web
2. Sube un ZIP con los tracks
3. Completa metadatos (nombre, BPM, etc.)
4. La canción estará disponible en la app móvil

## 🔧 **Configuración**

### **1. Configurar CloudService:**
Edita `services/CloudService.js`:
```javascript
this.baseUrl = 'https://tu-proyecto.firebaseapp.com';
this.apiKey = 'tu-api-key';
```

### **2. Instalar dependencias:**
```bash
npm install
```

### **3. Ejecutar:**
```bash
npm start
```

## 🌐 **API Endpoints**

### **Obtener canciones disponibles:**
```
GET /api/songs
```

### **Obtener información de canción:**
```
GET /api/songs/{songId}
```

### **Descargar track:**
```
GET /api/songs/{songId}/tracks/{trackId}/download
```

## 📊 **Estructura de Datos**

### **Canción:**
```json
{
  "id": "song123",
  "name": "Mi Canción",
  "artist": "Mi Artista",
  "tempo": 128,
  "key": "C",
  "tracks": [
    {
      "name": "Drums",
      "downloadUrl": "https://...",
      "volume": 0.8
    }
  ]
}
```

## 🚀 **Build para Producción**

### **Android APK:**
```bash
expo build:android
```

### **iOS IPA:**
```bash
expo build:ios
```

## 🔄 **Flujo de Trabajo**

1. **Web:** Subes canciones → Se guardan en la nube
2. **Móvil:** Descarga canciones → Se guardan localmente
3. **Móvil:** Reproduce offline → Sin demoras
4. **Sincronización:** Canciones disponibles en ambos

## 🎯 **Ventajas vs Web App**

- 🚀 **Sin demoras** - Audio nativo sin buffers
- 📱 **Interfaz nativa** - Optimizada para móviles
- 🔋 **Mejor batería** - Eficiencia nativa
- 💾 **Menos memoria** - No carga todo en RAM
- ☁️ **Sistema híbrido** - Web para gestión, móvil para reproducción
- 📱 **Offline completo** - Funciona sin internet

## 🛠️ **Tecnologías**

- **React Native** - Framework móvil nativo
- **Expo** - Herramientas de desarrollo
- **expo-av** - Audio nativo de alta calidad
- **AsyncStorage** - Almacenamiento local
- **expo-file-system** - Gestión de archivos
- **Firebase** - Backend y base de datos