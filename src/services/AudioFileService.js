import StorageService from './StorageService';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

class AudioFileService {
  constructor() {
    this.audioFilesCollection = 'audioFiles';
  }

  // Upload audio file
  async uploadAudioFile(file, userId, metadata = {}) {
    try {
      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/aac'];
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'Tipo de archivo no soportado. Use MP3, WAV, M4A o AAC.' };
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        return { success: false, error: 'El archivo es demasiado grande. Máximo 50MB.' };
      }

      // Upload to B2
      const uploadResult = await StorageService.uploadFile(file);
      if (!uploadResult.success) {
        return uploadResult;
      }

      // Save metadata to Firestore
      const audioFileData = {
        userId: userId,
        originalName: file.name,
        fileName: uploadResult.data.fileName,
        fileId: uploadResult.data.fileId,
        downloadUrl: uploadResult.data.downloadUrl,
        size: file.size,
        type: file.type,
        duration: metadata.duration || 0,
        bpm: metadata.bpm || 120,
        key: metadata.key || 'C',
        genre: metadata.genre || 'Unknown',
        tags: metadata.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, this.audioFilesCollection), audioFileData);
      
      return { 
        success: true, 
        data: {
          id: docRef.id,
          ...audioFileData
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user's audio files
  async getUserAudioFiles(userId) {
    try {
      const q = query(
        collection(db, this.audioFilesCollection),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const audioFiles = [];
      
      querySnapshot.forEach((doc) => {
        audioFiles.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, files: audioFiles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get audio file by ID
  async getAudioFile(fileId) {
    try {
      const audioFileRef = doc(db, this.audioFilesCollection, fileId);
      const audioFileSnap = await getDoc(audioFileRef);
      
      if (audioFileSnap.exists()) {
        return { 
          success: true, 
          data: { id: audioFileSnap.id, ...audioFileSnap.data() } 
        };
      } else {
        return { success: false, error: 'Archivo de audio no encontrado' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update audio file metadata
  async updateAudioFile(fileId, updateData) {
    try {
      const audioFileRef = doc(db, this.audioFilesCollection, fileId);
      await updateDoc(audioFileRef, {
        ...updateData,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete audio file
  async deleteAudioFile(fileId) {
    try {
      // Get file info first
      const fileResult = await this.getAudioFile(fileId);
      if (!fileResult.success) {
        return fileResult;
      }

      const fileData = fileResult.data;

      // Delete from B2
      const deleteResult = await StorageService.deleteFile(fileData.fileId, fileData.fileName);
      if (!deleteResult.success) {
        console.warn('Failed to delete from B2:', deleteResult.error);
      }

      // Delete from Firestore
      await deleteDoc(doc(db, this.audioFilesCollection, fileId));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get audio file URL for playback
  getAudioFileUrl(fileName) {
    return StorageService.getFileUrl(fileName);
  }

  // Search audio files
  async searchAudioFiles(userId, searchTerm) {
    try {
      const userFilesResult = await this.getUserAudioFiles(userId);
      if (!userFilesResult.success) {
        return userFilesResult;
      }

      const files = userFilesResult.files;
      const searchLower = searchTerm.toLowerCase();
      
      const filteredFiles = files.filter(file => 
        file.originalName.toLowerCase().includes(searchLower) ||
        file.genre.toLowerCase().includes(searchLower) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );

      return { success: true, files: filteredFiles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get audio files by genre
  async getAudioFilesByGenre(userId, genre) {
    try {
      const q = query(
        collection(db, this.audioFilesCollection),
        where('userId', '==', userId),
        where('genre', '==', genre)
      );
      
      const querySnapshot = await getDocs(q);
      const audioFiles = [];
      
      querySnapshot.forEach((doc) => {
        audioFiles.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, files: audioFiles };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new AudioFileService();




