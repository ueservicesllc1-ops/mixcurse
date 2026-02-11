import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import FirebaseService from './FirebaseService';

class CloudService {
  constructor() {
    this.firebase = FirebaseService;
  }

  // Obtener lista de canciones disponibles
  async getAvailableSongs() {
    try {
      const songs = await this.firebase.getAvailableSongs();
      console.log('📱 Downloaded songs list:', songs.length);
      return songs;
    } catch (error) {
      console.error('❌ Error fetching songs:', error);
      return [];
    }
  }

  // Descargar canción específica
  async downloadSong(songId) {
    try {
      console.log('📱 Downloading song:', songId);
      
      // Obtener información de la canción
      const songInfo = await this.getSongInfo(songId);
      if (!songInfo) {
        throw new Error('Song not found');
      }

      // Crear directorio para la canción
      const songDir = `${FileSystem.documentDirectory}songs/${songId}/`;
      await FileSystem.makeDirectoryAsync(songDir, { intermediates: true });

      // Descargar cada track desde B2
      const downloadedTracks = [];
      for (const track of songInfo.tracks) {
        const trackPath = `${songDir}${track.name}.mp3`;
        
        // Usar la URL de B2 (downloadUrl o originalUrl)
        const b2Url = track.downloadUrl || track.originalUrl;
        if (!b2Url) {
          console.error('❌ No B2 URL available for track:', track.name);
          continue;
        }
        
        console.log('📱 Downloading track from B2:', track.name);
        console.log('📱 B2 URL:', b2Url);
        
        const downloadResult = await FileSystem.downloadAsync(b2Url, trackPath);

        if (downloadResult.status === 200) {
          downloadedTracks.push({
            name: track.name,
            localPath: trackPath,
            volume: track.volume || 0.8
          });
          console.log('✅ Track downloaded from B2:', track.name);
        } else {
          console.error('❌ Failed to download track from B2:', track.name);
        }
      }

      // Guardar metadatos de la canción
      const songData = {
        id: songId,
        name: songInfo.name,
        artist: songInfo.artist,
        tempo: songInfo.tempo,
        key: songInfo.key,
        tracks: downloadedTracks,
        downloadedAt: new Date().toISOString()
      };

      await FileSystem.writeAsStringAsync(
        `${songDir}song.json`,
        JSON.stringify(songData, null, 2)
      );

      // Guardar en AsyncStorage para acceso rápido
      await this.saveSongToStorage(songData);

      console.log('✅ Song downloaded successfully:', songInfo.name);
      return songData;

    } catch (error) {
      console.error('❌ Error downloading song:', error);
      throw error;
    }
  }

  // Obtener información de una canción específica
  async getSongInfo(songId) {
    try {
      const songInfo = await this.firebase.getSongInfo(songId);
      if (!songInfo) {
        throw new Error('Song not found');
      }

      // Los tracks ya tienen las URLs de B2 en downloadUrl y originalUrl
      // No necesitamos procesar URLs adicionales
      console.log('📱 Song info loaded with B2 URLs:', songInfo.tracks.length, 'tracks');
      
      return songInfo;
    } catch (error) {
      console.error('❌ Error fetching song info:', error);
      return null;
    }
  }

  // Guardar canción en AsyncStorage
  async saveSongToStorage(songData) {
    try {
      const storedSongs = await AsyncStorage.getItem('downloadedSongs');
      const songs = storedSongs ? JSON.parse(storedSongs) : [];
      
      // Remover canción existente si ya está descargada
      const filteredSongs = songs.filter(song => song.id !== songData.id);
      filteredSongs.push(songData);
      
      await AsyncStorage.setItem('downloadedSongs', JSON.stringify(filteredSongs));
      console.log('✅ Song saved to storage:', songData.name);
    } catch (error) {
      console.error('❌ Error saving song to storage:', error);
    }
  }

  // Obtener canciones descargadas
  async getDownloadedSongs() {
    try {
      const storedSongs = await AsyncStorage.getItem('downloadedSongs');
      return storedSongs ? JSON.parse(storedSongs) : [];
    } catch (error) {
      console.error('❌ Error getting downloaded songs:', error);
      return [];
    }
  }

  // Eliminar canción descargada
  async deleteDownloadedSong(songId) {
    try {
      // Eliminar archivos del sistema
      const songDir = `${FileSystem.documentDirectory}songs/${songId}/`;
      const dirInfo = await FileSystem.getInfoAsync(songDir);
      
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(songDir, { idempotent: true });
        console.log('✅ Song files deleted:', songId);
      }

      // Eliminar de AsyncStorage
      const storedSongs = await AsyncStorage.getItem('downloadedSongs');
      const songs = storedSongs ? JSON.parse(storedSongs) : [];
      const filteredSongs = songs.filter(song => song.id !== songId);
      
      await AsyncStorage.setItem('downloadedSongs', JSON.stringify(filteredSongs));
      console.log('✅ Song removed from storage:', songId);
    } catch (error) {
      console.error('❌ Error deleting song:', error);
    }
  }

  // Verificar si una canción está descargada
  async isSongDownloaded(songId) {
    try {
      const songDir = `${FileSystem.documentDirectory}songs/${songId}/`;
      const dirInfo = await FileSystem.getInfoAsync(songDir);
      return dirInfo.exists;
    } catch (error) {
      console.error('❌ Error checking if song is downloaded:', error);
      return false;
    }
  }

  // Obtener espacio usado por canciones descargadas
  async getDownloadedSongsSize() {
    try {
      const songsDir = `${FileSystem.documentDirectory}songs/`;
      const dirInfo = await FileSystem.getInfoAsync(songsDir);
      
      if (!dirInfo.exists) {
        return 0;
      }

      let totalSize = 0;
      const songs = await FileSystem.readDirectoryAsync(songsDir);
      
      for (const songId of songs) {
        const songDir = `${songsDir}${songId}/`;
        const songInfo = await FileSystem.getInfoAsync(songDir);
        
        if (songInfo.exists && songInfo.isDirectory) {
          const files = await FileSystem.readDirectoryAsync(songDir);
          
          for (const file of files) {
            if (file.endsWith('.mp3')) {
              const fileInfo = await FileSystem.getInfoAsync(`${songDir}${file}`);
              if (fileInfo.exists) {
                totalSize += fileInfo.size || 0;
              }
            }
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('❌ Error calculating downloaded songs size:', error);
      return 0;
    }
  }
}

export default new CloudService();
