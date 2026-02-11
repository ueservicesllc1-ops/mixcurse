import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Configuración de Firebase (usando tu configuración existente)
const firebaseConfig = {
  apiKey: "AIzaSyBR8aKDqgib3w149Dcl0IFfFsqLReui3Jo",
  authDomain: "mixercurse2.firebaseapp.com",
  projectId: "mixercurse2",
  storageBucket: "mixercurse2.firebasestorage.app",
  messagingSenderId: "509189891821",
  appId: "1:509189891821:web:bf05edec645d067d6f0ee4"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

class FirebaseService {
  constructor() {
    this.db = db;
    this.storage = storage;
  }

  // Obtener todas las canciones disponibles (sin filtro de usuario para la app móvil)
  async getAvailableSongs() {
    try {
      const songsRef = collection(this.db, 'songs');
      const snapshot = await getDocs(songsRef);
      
      const songs = [];
      snapshot.forEach((doc) => {
        const songData = doc.data();
        songs.push({
          id: doc.id,
          name: songData.name,
          artist: songData.artist || '',
          tempo: songData.tempo || null,
          key: songData.key || '',
          timeSignature: songData.timeSignature || '4/4',
          createdAt: songData.createdAt,
          tracks: songData.tracks || []
        });
      });
      
      console.log('📱 Fetched songs from Firebase:', songs.length);
      return songs;
    } catch (error) {
      console.error('❌ Error fetching songs:', error);
      return [];
    }
  }

  // Obtener información de una canción específica
  async getSongInfo(songId) {
    try {
      const songRef = doc(this.db, 'songs', songId);
      const songSnap = await getDoc(songRef);
      
      if (songSnap.exists()) {
        return {
          id: songSnap.id,
          ...songSnap.data()
        };
      } else {
        console.log('❌ Song not found:', songId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching song info:', error);
      return null;
    }
  }

  // Obtener URL de descarga de un track desde B2
  async getTrackDownloadUrl(songId, trackId) {
    try {
      // Los tracks ya tienen la URL de B2 en el campo downloadUrl
      // No necesitamos generar URL desde Firebase Storage
      console.log('📱 Track URL already available from B2:', trackId);
      return null; // Se manejará en CloudService
    } catch (error) {
      console.error('❌ Error getting track download URL:', error);
      return null;
    }
  }

  // Subir nueva canción (para la página web)
  async uploadSong(songData, tracks) {
    try {
      // Crear documento de canción en Firestore
      const songRef = await addDoc(collection(this.db, 'songs'), {
        name: songData.name,
        artist: songData.artist || '',
        tempo: songData.tempo || null,
        key: songData.key || '',
        timeSignature: songData.timeSignature || '4/4',
        createdAt: new Date().toISOString(),
        tracks: tracks.map(track => ({
          name: track.name,
          fileName: track.fileName,
          size: track.size,
          type: track.type
        }))
      });

      console.log('✅ Song uploaded to Firestore:', songRef.id);
      return { success: true, songId: songRef.id };
    } catch (error) {
      console.error('❌ Error uploading song:', error);
      return { success: false, error: error.message };
    }
  }

  // Subir archivo de track a Storage
  async uploadTrackFile(songId, trackId, file) {
    try {
      const trackRef = ref(this.storage, `songs/${songId}/tracks/${trackId}`);
      const snapshot = await uploadBytes(trackRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      console.log('✅ Track uploaded to Storage:', trackId);
      return { success: true, downloadUrl };
    } catch (error) {
      console.error('❌ Error uploading track file:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar canción
  async deleteSong(songId) {
    try {
      // Eliminar documento de Firestore
      await deleteDoc(doc(this.db, 'songs', songId));
      
      // Eliminar archivos de Storage
      const songRef = ref(this.storage, `songs/${songId}`);
      // Nota: Firebase Storage no tiene delete recursivo, necesitarías eliminar cada track individualmente
      
      console.log('✅ Song deleted:', songId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting song:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas de canciones
  async getSongStats() {
    try {
      const songs = await this.getAvailableSongs();
      const totalSongs = songs.length;
      const totalTracks = songs.reduce((sum, song) => sum + (song.tracks?.length || 0), 0);
      
      return {
        totalSongs,
        totalTracks,
        songs: songs.map(song => ({
          id: song.id,
          name: song.name,
          artist: song.artist,
          trackCount: song.tracks?.length || 0,
          createdAt: song.createdAt
        }))
      };
    } catch (error) {
      console.error('❌ Error getting song stats:', error);
      return { totalSongs: 0, totalTracks: 0, songs: [] };
    }
  }
}

export default new FirebaseService();
