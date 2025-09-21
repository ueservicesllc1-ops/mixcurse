# MultiTrack Player

Una aplicación móvil profesional para reproducción y mezcla de audio multitrack, inspirada en Prime Loops y Secuencias.com.

## 🎵 Características

### Funcionalidades Principales
- **Reproducción Multitrack**: Carga y reproduce múltiples pistas de audio simultáneamente
- **Sincronización Perfecta**: Todos los tracks se mantienen sincronizados durante la reproducción
- **Control de Volumen Individual**: Ajusta el volumen de cada track por separado
- **Control Master**: Volumen general que afecta a todos los tracks
- **Control de Tempo**: Ajusta la velocidad de reproducción (60-200 BPM)
- **Mute/Solo**: Silencia o aísla tracks individuales
- **Loop**: Reproduce secciones específicas en bucle

### Interfaz de Usuario
- **Diseño Moderno**: Interfaz oscura y profesional
- **Controles Intuitivos**: Sliders y botones fáciles de usar
- **Visualización en Tiempo Real**: Barra de progreso y tiempo actual
- **Gestión de Proyectos**: Guarda y carga sesiones completas

### Efectos de Audio
- **EQ Básico**: Control de frecuencias medias
- **Reverb**: Efecto de reverberación
- **Delay**: Efecto de eco (próximamente)

### Gestión de Archivos
- **Importación**: Carga archivos de audio desde el dispositivo
- **Exportación**: Exporta mezclas finales
- **Guardado de Proyectos**: Guarda configuraciones y referencias de archivos
- **Compartir**: Comparte proyectos con otros usuarios

## 🚀 Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- Expo CLI
- Dispositivo móvil con Expo Go o emulador

### Pasos de Instalación

1. **Clona o descarga el proyecto**
   ```bash
   cd multitrack-player
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia la aplicación**
   ```bash
   npm start
   ```

4. **Ejecuta en tu dispositivo**
   - Escanea el código QR con Expo Go (Android/iOS)
   - O presiona 'a' para Android emulator / 'i' para iOS simulator

## 📱 Uso de la Aplicación

### Pantalla Principal
- **Agregar Tracks**: Toca "Agregar Track" para cargar archivos de audio
- **Controles Básicos**: Play/Pause y Stop
- **Abrir Reproductor**: Accede al mixer completo

### Reproductor
- **Controles de Reproducción**: Play, Pause, Stop
- **Barra de Progreso**: Visualiza el tiempo actual y total
- **Control de Tempo**: Ajusta la velocidad de reproducción
- **Volumen Master**: Control general de volumen
- **Mixer por Track**: Volumen individual, mute, efectos

### Gestión de Proyectos
- **Guardar Proyecto**: Guarda la configuración actual
- **Exportar Mezcla**: Exporta el audio mezclado
- **Información del Proyecto**: Estadísticas de la sesión

## 🎛️ Controles Disponibles

### Por Track
- **Volumen**: 0-100%
- **Mute**: Silencia el track
- **EQ**: Control de frecuencias medias (-12dB a +12dB)
- **Reverb**: Cantidad de reverberación (0-100%)

### Globales
- **Tempo**: 60-200 BPM
- **Volumen Master**: 0-100%
- **Loop**: Reproducción en bucle (próximamente)

## 🔧 Tecnologías Utilizadas

- **React Native**: Framework principal
- **Expo**: Plataforma de desarrollo
- **Expo AV**: Motor de audio
- **React Navigation**: Navegación entre pantallas
- **Expo File System**: Gestión de archivos
- **Expo Document Picker**: Selección de archivos
- **Expo Sharing**: Compartir archivos

## 📋 Formatos Soportados

- **Audio**: MP3, WAV, M4A, AAC
- **Proyectos**: JSON (archivos de configuración)

## 🎯 Próximas Características

- [ ] Efectos de audio avanzados (Delay, Chorus, Distortion)
- [ ] Grabación de audio
- [ ] Más controles de EQ (Low, Mid, High)
- [ ] Visualizador de ondas
- [ ] Metrónomo integrado
- [ ] Presets de efectos
- [ ] Sincronización con servicios en la nube
- [ ] Colaboración en tiempo real

## 🐛 Solución de Problemas

### Audio no se reproduce
- Verifica que el archivo de audio sea compatible
- Asegúrate de que el volumen no esté en 0
- Revisa que el track no esté silenciado

### La app se cierra inesperadamente
- Reinicia la aplicación
- Verifica que tengas suficiente memoria disponible
- Actualiza Expo Go a la última versión

### Archivos no se cargan
- Verifica que el archivo no esté corrupto
- Asegúrate de tener permisos de almacenamiento
- Intenta con un formato diferente

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, por favor:
1. Revisa la sección de solución de problemas
2. Verifica que estés usando la última versión
3. Reporta el problema con detalles específicos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

---

**¡Disfruta creando música con MultiTrack Player! 🎵**

