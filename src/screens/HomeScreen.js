import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import AudioService from '../services/AudioService';

const HomeScreen = ({ navigation }) => {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    initializeAudio();
    loadTracks();
  }, []);

  const initializeAudio = async () => {
    await AudioService.initialize();
  };

  const loadTracks = () => {
    const loadedTracks = AudioService.getTracks();
    setTracks(loadedTracks);
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const trackData = {
          uri: file.uri,
          name: file.name,
          id: Date.now().toString(),
        };

        const response = await AudioService.loadTrack(trackData);
        
        if (response.success) {
          loadTracks();
          Alert.alert('Éxito', 'Track cargado correctamente');
        } else {
          Alert.alert('Error', response.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el archivo');
      console.error('Error picking file:', error);
    }
  };

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        await AudioService.pauseAll();
        setIsPlaying(false);
      } else {
        await AudioService.playAll();
        setIsPlaying(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Error en la reproducción');
      console.error('Playback error:', error);
    }
  };

  const stopPlayback = async () => {
    try {
      await AudioService.stopAll();
      setIsPlaying(false);
    } catch (error) {
      Alert.alert('Error', 'Error al detener');
      console.error('Stop error:', error);
    }
  };

  const openPlayer = () => {
    if (tracks.length === 0) {
      Alert.alert('Sin tracks', 'Agrega al menos un track para abrir el reproductor');
      return;
    }
    navigation.navigate('Player');
  };

  const removeTrack = async (trackId) => {
    Alert.alert(
      'Eliminar Track',
      '¿Estás seguro de que quieres eliminar este track?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await AudioService.removeTrack(trackId);
            loadTracks();
          },
        },
      ]
    );
  };

  const renderTrack = ({ item }) => (
    <View style={styles.trackItem}>
      <View style={styles.trackInfo}>
        <Text style={styles.trackName}>{item.name}</Text>
        <Text style={styles.trackDetails}>
          Vol: {Math.round(item.volume * 100)}% | 
          {item.muted ? ' Silenciado' : ' Activo'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeTrack(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MultiTrack Player</Text>
        <Text style={styles.subtitle}>
          {tracks.length} track{tracks.length !== 1 ? 's' : ''} cargado{tracks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.addButton} onPress={pickAudioFile}>
          <Text style={styles.addButtonText}>+ Agregar Track</Text>
        </TouchableOpacity>

        <View style={styles.playbackControls}>
          <TouchableOpacity
            style={[styles.controlButton, isPlaying && styles.activeButton]}
            onPress={togglePlayback}
          >
            <Text style={styles.controlButtonText}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={stopPlayback}>
            <Text style={styles.controlButtonText}>⏹️</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.playerButton} onPress={openPlayer}>
            <Text style={styles.playerButtonText}>🎛️ Reproductor</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={tracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
        style={styles.trackList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No hay tracks cargados{'\n'}
              Toca "Agregar Track" para comenzar
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  controls: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#333',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  controlButtonText: {
    fontSize: 24,
  },
  playerButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
  },
  playerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackList: {
    flex: 1,
    padding: 20,
  },
  trackItem: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackDetails: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HomeScreen;

