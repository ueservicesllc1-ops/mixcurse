import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../config/firebase';

class SetlistService {
  constructor() {
    this.setlistsCollection = 'setlists';
  }

  // Create new setlist
  async createSetlist(userId, setlistData) {
    try {
      const setlist = {
        ...setlistData,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        songs: setlistData.songs || []
      };

      const docRef = await addDoc(collection(db, this.setlistsCollection), setlist);
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get user's setlists
  async getUserSetlists(userId) {
    try {
      const q = query(
        collection(db, this.setlistsCollection),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const setlists = [];
      
      querySnapshot.forEach((doc) => {
        setlists.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return { success: true, setlists };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update setlist
  async updateSetlist(setlistId, updateData) {
    try {
      const setlistRef = doc(db, this.setlistsCollection, setlistId);
      await updateDoc(setlistRef, {
        ...updateData,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete setlist
  async deleteSetlist(setlistId) {
    try {
      await deleteDoc(doc(db, this.setlistsCollection, setlistId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Add song to setlist
  async addSongToSetlist(setlistId, songData) {
    try {
      const setlistRef = doc(db, this.setlistsCollection, setlistId);
      const setlist = await this.getSetlist(setlistId);
      
      if (!setlist.success) {
        return setlist;
      }
      
      const updatedSongs = [...setlist.data.songs, {
        ...songData,
        id: Date.now().toString(),
        addedAt: new Date()
      }];
      
      await updateDoc(setlistRef, {
        songs: updatedSongs,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Remove song from setlist
  async removeSongFromSetlist(setlistId, songId) {
    try {
      const setlistRef = doc(db, this.setlistsCollection, setlistId);
      const setlist = await this.getSetlist(setlistId);
      
      if (!setlist.success) {
        return setlist;
      }
      
      const updatedSongs = setlist.data.songs.filter(song => song.id !== songId);
      
      await updateDoc(setlistRef, {
        songs: updatedSongs,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get single setlist
  async getSetlist(setlistId) {
    try {
      const setlistRef = doc(db, this.setlistsCollection, setlistId);
      const setlistSnap = await getDoc(setlistRef);
      
      if (setlistSnap.exists()) {
        return { 
          success: true, 
          data: { id: setlistSnap.id, ...setlistSnap.data() } 
        };
      } else {
        return { success: false, error: 'Setlist not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new SetlistService();




