// Utilidades para el procesamiento de audio

export const formatTime = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0:00';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '0:00';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const calculateBPM = (tempo) => {
  // Normalizar tempo a un rango válido
  return Math.max(60, Math.min(200, tempo));
};

export const normalizeVolume = (volume) => {
  // Asegurar que el volumen esté entre 0 y 1
  return Math.max(0, Math.min(1, volume));
};

export const dbToLinear = (db) => {
  // Convertir decibeles a valor lineal
  return Math.pow(10, db / 20);
};

export const linearToDb = (linear) => {
  // Convertir valor lineal a decibeles
  return 20 * Math.log10(Math.max(0.001, linear));
};

export const generateTrackId = () => {
  // Generar ID único para tracks
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const validateAudioFile = (uri, name) => {
  // Validar archivo de audio
  const validExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg'];
  const extension = name.toLowerCase().substring(name.lastIndexOf('.'));
  
  return {
    isValid: validExtensions.includes(extension),
    extension: extension,
    supportedFormats: validExtensions
  };
};

export const calculateFileSize = (bytes) => {
  // Calcular tamaño de archivo en formato legible
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const createProjectMetadata = (tracks, settings) => {
  // Crear metadatos del proyecto
  return {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    trackCount: tracks.length,
    totalDuration: Math.max(...tracks.map(t => t.duration || 0)),
    settings: {
      tempo: settings.tempo || 120,
      masterVolume: settings.masterVolume || 1.0,
      isLooping: settings.isLooping || false,
      loopStart: settings.loopStart || 0,
      loopEnd: settings.loopEnd || 0,
    },
    tracks: tracks.map(track => ({
      id: track.id,
      name: track.name,
      volume: track.volume,
      pan: track.pan,
      muted: track.muted,
      effects: track.effects
    }))
  };
};

export const exportProjectData = (projectData) => {
  // Preparar datos para exportación
  return {
    ...projectData,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0'
  };
};

export const importProjectData = (jsonData) => {
  // Validar y procesar datos importados
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    // Validar estructura básica
    if (!data.tracks || !Array.isArray(data.tracks)) {
      throw new Error('Formato de proyecto inválido: falta información de tracks');
    }
    
    if (!data.settings) {
      throw new Error('Formato de proyecto inválido: falta configuración');
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const calculateRMS = (audioData) => {
  // Calcular RMS (Root Mean Square) para visualización
  if (!audioData || audioData.length === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  
  return Math.sqrt(sum / audioData.length);
};

export const applyEQ = (frequency, gain) => {
  // Aplicar ecualización básica
  const normalizedGain = normalizeVolume((gain + 12) / 24); // Convertir -12dB a +12dB a 0-1
  return normalizedGain;
};

export const applyReverb = (drySignal, reverbAmount) => {
  // Aplicar reverb básico (simulado)
  const wetSignal = drySignal * reverbAmount;
  return drySignal * (1 - reverbAmount) + wetSignal;
};

export const applyDelay = (drySignal, delayAmount, delayTime) => {
  // Aplicar delay básico (simulado)
  // En una implementación real, esto requeriría un buffer de audio
  return drySignal + (drySignal * delayAmount * 0.3);
};

