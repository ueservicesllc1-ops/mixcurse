import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

class AudioService {
  constructor() {
    this.sounds = new Map();
    this.isPlaying = false;
    this.currentPosition = 0;
    this.duration = 0;
    this.tracks = [];
    this.masterVolume = 1.0;
    this.tempo = 120;
    this.isLooping = false;
    this.loopStart = 0;
    this.loopEnd = 0;
  }

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  async loadTrack(trackData) {
    try {
      const { uri, name, id } = trackData;
      
      // Crear el objeto de sonido
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: false,
          isLooping: false,
          volume: trackData.volume || 1.0,
          rate: this.tempo / 120, // Normalizar tempo
        }
      );

      // Configurar callbacks
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          this.currentPosition = status.positionMillis;
          this.duration = status.durationMillis;
          
          // Manejar loop
          if (this.isLooping && status.positionMillis >= this.loopEnd) {
            sound.setPositionAsync(this.loopStart);
          }
        }
      });

      // Guardar el sonido
      this.sounds.set(id, sound);
      
      // Agregar a la lista de tracks
      this.tracks.push({
        id,
        name,
        uri,
        volume: trackData.volume || 1.0,
        pan: trackData.pan || 0,
        muted: false,
        solo: false,
        effects: {
          eq: { low: 0, mid: 0, high: 0 },
          reverb: { amount: 0 },
          delay: { amount: 0, time: 0.25 }
        }
      });

      return { success: true, trackId: id };
    } catch (error) {
      console.error('Error loading track:', error);
      return { success: false, error: error.message };
    }
  }

  async playAll() {
    try {
      this.isPlaying = true;
      
      // Reproducir todos los tracks no silenciados
      for (const [id, sound] of this.sounds) {
        const track = this.tracks.find(t => t.id === id);
        if (track && !track.muted) {
          await sound.playAsync();
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error playing tracks:', error);
      return { success: false, error: error.message };
    }
  }

  async pauseAll() {
    try {
      this.isPlaying = false;
      
      for (const [id, sound] of this.sounds) {
        await sound.pauseAsync();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error pausing tracks:', error);
      return { success: false, error: error.message };
    }
  }

  async stopAll() {
    try {
      this.isPlaying = false;
      
      for (const [id, sound] of this.sounds) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
      }
      
      this.currentPosition = 0;
      return { success: true };
    } catch (error) {
      console.error('Error stopping tracks:', error);
      return { success: false, error: error.message };
    }
  }

  async setTrackVolume(trackId, volume) {
    try {
      const sound = this.sounds.get(trackId);
      const track = this.tracks.find(t => t.id === trackId);
      
      if (sound && track) {
        await sound.setVolumeAsync(volume * this.masterVolume);
        track.volume = volume;
        return { success: true };
      }
      
      return { success: false, error: 'Track not found' };
    } catch (error) {
      console.error('Error setting track volume:', error);
      return { success: false, error: error.message };
    }
  }

  async setMasterVolume(volume) {
    try {
      this.masterVolume = volume;
      
      // Actualizar volumen de todos los tracks
      for (const [id, sound] of this.sounds) {
        const track = this.tracks.find(t => t.id === id);
        if (track) {
          await sound.setVolumeAsync(track.volume * this.masterVolume);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error setting master volume:', error);
      return { success: false, error: error.message };
    }
  }

  async muteTrack(trackId) {
    try {
      const track = this.tracks.find(t => t.id === trackId);
      if (track) {
        track.muted = !track.muted;
        const sound = this.sounds.get(trackId);
        
        if (track.muted) {
          await sound.pauseAsync();
        } else if (this.isPlaying) {
          await sound.playAsync();
        }
        
        return { success: true, muted: track.muted };
      }
      
      return { success: false, error: 'Track not found' };
    } catch (error) {
      console.error('Error muting track:', error);
      return { success: false, error: error.message };
    }
  }

  async setTempo(tempo) {
    try {
      this.tempo = tempo;
      const rate = tempo / 120;
      
      for (const [id, sound] of this.sounds) {
        await sound.setRateAsync(rate, true);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error setting tempo:', error);
      return { success: false, error: error.message };
    }
  }

  async setLoop(startTime, endTime) {
    try {
      this.isLooping = true;
      this.loopStart = startTime;
      this.loopEnd = endTime;
      
      return { success: true };
    } catch (error) {
      console.error('Error setting loop:', error);
      return { success: false, error: error.message };
    }
  }

  async removeTrack(trackId) {
    try {
      const sound = this.sounds.get(trackId);
      if (sound) {
        await sound.unloadAsync();
        this.sounds.delete(trackId);
      }
      
      this.tracks = this.tracks.filter(t => t.id !== trackId);
      
      return { success: true };
    } catch (error) {
      console.error('Error removing track:', error);
      return { success: false, error: error.message };
    }
  }

  getTracks() {
    return this.tracks;
  }

  getPlaybackStatus() {
    return {
      isPlaying: this.isPlaying,
      currentPosition: this.currentPosition,
      duration: this.duration,
      tempo: this.tempo,
      masterVolume: this.masterVolume,
      isLooping: this.isLooping,
      loopStart: this.loopStart,
      loopEnd: this.loopEnd
    };
  }

  async cleanup() {
    try {
      for (const [id, sound] of this.sounds) {
        await sound.unloadAsync();
      }
      this.sounds.clear();
      this.tracks = [];
    } catch (error) {
      console.error('Error cleaning up audio service:', error);
    }
  }
}

export default new AudioService();

