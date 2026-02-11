import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  RefreshControl,
  Modal,
  TextInput
} from 'react-native';
import CloudService from '../services/CloudService';

const SongLibrary = ({ onSongSelect, onClose }) => {
  const [availableSongs, setAvailableSongs] = useState([]);
  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setLoading(true);
    try {
      const [available, downloaded] = await Promise.all([
        CloudService.getAvailableSongs(),
        CloudService.getDownloadedSongs()
      ]);
      
      setAvailableSongs(available);
      setDownloadedSongs(downloaded);
    } catch (error) {
      console.error('❌ Error loading songs:', error);
      Alert.alert('Error', 'No se pudieron cargar las canciones');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSongs();
    setRefreshing(false);
  };

  const handleDownloadSong = async (song) => {
    setSelectedSong(song);
    setShowDownloadModal(true);
  };

  const confirmDownload = async () => {
    if (!selectedSong) return;

    setDownloading(true);
    try {
      const songData = await CloudService.downloadSong(selectedSong.id);
      
      Alert.alert(
        'Éxito', 
        `Canción "${songData.name}" descargada correctamente`,
        [
          {
            text: 'Reproducir',
            onPress: () => {
              onSongSelect(songData);
              setShowDownloadModal(false);
            }
          },
          {
            text: 'OK',
            onPress: () => setShowDownloadModal(false)
          }
        ]
      );

      // Recargar lista de canciones descargadas
      await loadSongs();
    } catch (error) {
      console.error('❌ Error downloading song:', error);
      Alert.alert('Error', 'No se pudo descargar la canción');
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteSong = async (song) => {
    Alert.alert(
      'Eliminar canción',
      `¿Estás seguro de que quieres eliminar "${song.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await CloudService.deleteDownloadedSong(song.id);
              await loadSongs();
              Alert.alert('Éxito', 'Canción eliminada correctamente');
            } catch (error) {
              console.error('❌ Error deleting song:', error);
              Alert.alert('Error', 'No se pudo eliminar la canción');
            }
          }
        }
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderSongItem = (song, isDownloaded = false) => (
    <View key={song.id} style={styles.songItem}>
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{song.name}</Text>
        <Text style={styles.songArtist}>{song.artist || 'Artista desconocido'}</Text>
        <View style={styles.songDetails}>
          {song.tempo && <Text style={styles.songTempo}>{song.tempo} BPM</Text>}
          {song.key && <Text style={styles.songKey}>{song.key}</Text>}
          <Text style={styles.songTracks}>{song.tracks?.length || 0} tracks</Text>
        </View>
      </View>
      
      <View style={styles.songActions}>
        {isDownloaded ? (
          <>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => onSongSelect(song)}
            >
              <Text style={styles.playButtonText}>▶</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteSong(song)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={() => handleDownloadSong(song)}
          >
            <Text style={styles.downloadButtonText}>⬇️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Biblioteca de Canciones</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Canciones descargadas */}
        {downloadedSongs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Descargadas ({downloadedSongs.length})</Text>
            {downloadedSongs.map(song => renderSongItem(song, true))}
          </View>
        )}

        {/* Canciones disponibles */}
        {availableSongs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>☁️ Disponibles ({availableSongs.length})</Text>
            {availableSongs.map(song => renderSongItem(song, false))}
          </View>
        )}

        {availableSongs.length === 0 && downloadedSongs.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay canciones disponibles</Text>
            <Text style={styles.emptySubtext}>
              Sube canciones desde la página web para verlas aquí
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de confirmación de descarga */}
      <Modal visible={showDownloadModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Descargar Canción</Text>
            
            {selectedSong && (
              <View style={styles.songPreview}>
                <Text style={styles.songPreviewName}>{selectedSong.name}</Text>
                <Text style={styles.songPreviewArtist}>{selectedSong.artist}</Text>
                <Text style={styles.songPreviewTracks}>
                  {selectedSong.tracks?.length || 0} tracks
                </Text>
              </View>
            )}
            
            <Text style={styles.modalText}>
              La canción se descargará a tu dispositivo para reproducción offline.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowDownloadModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.downloadConfirmButton, downloading && styles.downloadingButton]}
                onPress={confirmDownload}
                disabled={downloading}
              >
                <Text style={styles.downloadConfirmButtonText}>
                  {downloading ? 'Descargando...' : 'Descargar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#333',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
  },
  songItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songArtist: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  songDetails: {
    flexDirection: 'row',
    marginTop: 5,
  },
  songTempo: {
    color: '#4CAF50',
    fontSize: 12,
    marginRight: 10,
  },
  songKey: {
    color: '#2196F3',
    fontSize: 12,
    marginRight: 10,
  },
  songTracks: {
    color: '#888',
    fontSize: 12,
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  downloadButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  songPreview: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  songPreviewName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songPreviewArtist: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  songPreviewTracks: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 5,
  },
  modalText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  downloadConfirmButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  downloadingButton: {
    backgroundColor: '#666',
  },
  downloadConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SongLibrary;



