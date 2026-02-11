# 🔧 Solución: Canción Anterior se Reproduce en Lugar de la Nueva

## Problema Identificado

Cuando cargas la segunda canción, aparece en la UI pero reproduce la primera canción. Esto ocurre porque:

1. Los `audioBuffers` de la canción anterior no se limpian
2. Los `tracks` de la canción anterior permanecen en memoria
3. El sistema intenta reproducir los buffers antiguos

## ✅ Solución

Necesitas agregar una función que limpie completamente el estado antes de cargar una nueva canción.

### Paso 1: Agregar Función de Limpieza

Busca en el código donde se define la función de carga de canciones y agrega esta función ANTES:

```javascript
// Clear all previous song data before loading new song
function clearCurrentSong() {
    console.log('🧹 Clearing current song data...');
    
    // Stop all playing tracks
    stopPlayback();
    
    // Clear audio buffers
    if (typeof audioBuffers !== 'undefined' && audioBuffers) {
        audioBuffers.clear();
        console.log('✅ Audio buffers cleared');
    }
    
    // Clear tracks array
    if (typeof tracks !== 'undefined') {
        tracks.length = 0; // Clear array without losing reference
        console.log('✅ Tracks array cleared');
    }
    
    // Clear audio sources
    if (typeof audioSources !== 'undefined' && audioSources) {
        audioSources.forEach((source, key) => {
            try {
                source.stop();
                source.disconnect();
            } catch (e) {
                // Source might already be stopped
            }
        });
        audioSources.clear();
        console.log('✅ Audio sources cleared');
    }
    
    // Clear gain nodes
    if (typeof gainNodes !== 'undefined' && gainNodes) {
        gainNodes.forEach((node, key) => {
            try {
                node.disconnect();
            } catch (e) {
                // Node might already be disconnected
            }
        });
        gainNodes.clear();
        console.log('✅ Gain nodes cleared');
    }
    
    // Reset playback state
    isPlaying = false;
    currentTime = 0;
    
    console.log('✅ Song data cleared successfully');
}
```

### Paso 2: Llamar la Función Antes de Cargar

En la función que carga canciones (probablemente algo como `loadSongFromSetlist` o similar), agrega al inicio:

```javascript
async function loadSongFromSetlist(songId) {
    // AGREGAR ESTA LÍNEA AL INICIO:
    clearCurrentSong();
    
    // ... resto del código de carga
}
```

### Paso 3: También en loadSongTracksFromCache

En `offline-integration.js`, la función `loadSongTracksFromCache` ya tiene:

```javascript
// Clear current tracks
tracks = [];
audioBuffers.clear();
```

Pero necesitas asegurarte de que también pare la reproducción. Modifica así:

```javascript
async function loadSongTracksFromCache(songData) {
    try {
        console.log('📦 Loading song tracks from cache...');
        
        // AGREGAR: Stop current playback
        if (typeof stopPlayback === 'function') {
            stopPlayback();
        }
        
        // Clear current tracks
        if (typeof tracks !== 'undefined') {
            tracks.length = 0;
        }
        
        if (typeof audioBuffers !== 'undefined' && audioBuffers) {
            audioBuffers.clear();
        }
        
        // Clear audio sources
        if (typeof audioSources !== 'undefined' && audioSources) {
            audioSources.forEach((source) => {
                try {
                    source.stop();
                    source.disconnect();
                } catch (e) {}
            });
            audioSources.clear();
        }
        
        // ... resto del código
    }
}
```

## 🎯 Ubicaciones Probables

Busca estas funciones en `web-app.html`:

1. `loadSongFromSetlist` o `loadSong` - Función que carga canciones
2. `handleSongClick` o similar - Manejador de clicks en canciones
3. Cualquier función que se llame cuando seleccionas una canción de la setlist

## 🔍 Cómo Encontrar la Función

1. Abre DevTools (F12)
2. Ve a la pestaña "Sources"
3. Busca (Ctrl+F) por: `loadSong` o `songClick`
4. O busca donde se usa `audioBuffers.set`

## ✅ Verificación

Después de aplicar la solución, deberías ver en la consola:

```
🧹 Clearing current song data...
✅ Audio buffers cleared
✅ Tracks array cleared
✅ Audio sources cleared
✅ Gain nodes cleared
✅ Song data cleared successfully
📦 Loading song tracks from cache...
```

Y la nueva canción debería reproducirse correctamente.

## 🐛 Si Persiste el Problema

Si después de limpiar aún reproduce la canción anterior, verifica:

1. **Que `audioBuffers` se esté llenando con los nuevos datos**
   - Agrega `console.log` después de `audioBuffers.set()`
   
2. **Que los `trackId` sean únicos entre canciones**
   - Verifica que cada canción use IDs diferentes
   
3. **Que no haya caché del navegador**
   - Recarga con Ctrl+Shift+R

---

**Necesitas ayuda para encontrar la función específica?** Puedo buscarla si me compartes más detalles de cómo cargas las canciones.
