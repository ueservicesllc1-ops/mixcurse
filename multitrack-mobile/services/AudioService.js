import { Audio } from 'expo-av';

class AudioService {
  constructor() {
    this.sounds = new Map();
    this.isPlaying = false;
    this.currentBPM = 128;
    this.originalBPM = 128;
    this.masterVolume = 0.8;
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
      console.log('✅ AudioService initialized');
    } catch (error) {
      console.error('❌ AudioService initialization failed:', error);
    }
  }

  async loadTrack(trackData) {
    try {
      const { uri, name, id } = trackData;
      
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: false,
          isLooping: false,
          volume: trackData.volume || 1.0,
        }
      );

      this.sounds.set(id, sound);
      console.log('✅ Track loaded:', name);
      
      return { success: true, trackId: id };
    } catch (error) {
      console.error('❌ Error loading track:', error);
      return { success: false, error: error.message };
    }
  }

  async playAllTracks(tracks) {
    try {
      if (this.sounds.size === 0) {
        console.log('⚠️ No tracks loaded');
        return;
      }

      console.log('▶️ Starting synchronized playback...');
      
      // Calculate precise start time for all tracks
      const startTime = Date.now() + 100; // 100ms delay for perfect sync
      
      // Start all tracks at the same time
      const playPromises = Array.from(this.sounds.entries()).map(async ([trackId, sound]) => {
        const track = tracks.find(t => t.id === trackId);
        if (track && !track.muted) {
          try {
            await sound.setPositionAsync(0);
            await sound.playAsync();
            console.log('▶️ Started track:', track.name);
          } catch (error) {
            console.error('❌ Error playing track:', track.name, error);
          }
        }
      });

      await Promise.all(playPromises);
      this.isPlaying = true;
      console.log('✅ All tracks started synchronously');
      
    } catch (error) {
      console.error('❌ Error in synchronized playback:', error);
    }
  }

  async stopAllTracks() {
    try {
      console.log('⏹️ Stopping all tracks...');
      
      const stopPromises = Array.from(this.sounds.values()).map(async (sound) => {
        try {
          await sound.stopAsync();
        } catch (error) {
          console.warn('⚠️ Error stopping sound:', error);
        }
      });

      await Promise.all(stopPromises);
      this.isPlaying = false;
      console.log('✅ All tracks stopped');
      
    } catch (error) {
      console.error('❌ Error stopping tracks:', error);
    }
  }

  async setTrackVolume(trackId, volume) {
    try {
      const sound = this.sounds.get(trackId);
      if (sound) {
        await sound.setVolumeAsync(volume * this.masterVolume);
      }
    } catch (error) {
      console.error('❌ Error setting volume:', error);
    }
  }

  async setMasterVolume(volume) {
    this.masterVolume = volume;
    
    // Update all track volumes
    const updatePromises = Array.from(this.sounds.entries()).map(async ([trackId, sound]) => {
      try {
        await sound.setVolumeAsync(volume);
      } catch (error) {
        console.warn('⚠️ Error updating volume for track:', trackId, error);
      }
    });

    await Promise.all(updatePromises);
  }

  setBPM(bpm) {
    this.currentBPM = bpm;
    this.originalBPM = bpm;
  }

  getCurrentBPM() {
    return this.currentBPM;
  }

  getOriginalBPM() {
    return this.originalBPM;
  }

  isCurrentlyPlaying() {
    return this.isPlaying;
  }

  getLoadedTracksCount() {
    return this.sounds.size;
  }

  clearAllTracks() {
    this.sounds.clear();
    this.isPlaying = false;
  }
}

export default new AudioService();



