import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CloudService from './services/CloudService';
import SongLibrary from './components/SongLibrary';
import TrackItem from './components/TrackItem';
import BPMControls from './components/BPMControls';
import PlaybackControls from './components/PlaybackControls';

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBPM, setCurrentBPM] = useState(128);
  const [originalBPM, setOriginalBPM] = useState(128);
  const [currentKey, setCurrentKey] = useState('C');
  const [originalKey, setOriginalKey] = useState('C');
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [sounds, setSounds] = useState(new Map());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [songName, setSongName] = useState('');
  const [songTempo, setSongTempo] = useState('');
  const [downloadedSongs, setDownloadedSongs] = useState([]);

  useEffect(() => {
    initializeAudio();
    loadStoredSongs();
  }, []);

  const initializeAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('✅ Audio initialized');
    } catch (error) {
      console.error('❌ Audio initialization failed:', error);
    }
  };

  const loadStoredSongs = async () => {
    try {
      const songs = await CloudService.getDownloadedSongs();
      setDownloadedSongs(songs);
      console.log('📱 Loaded downloaded songs:', songs.length);
    } catch (error) {
      console.error('❌ Error loading downloaded songs:', error);
    }
  };

  const pickAudioFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newTracks = result.assets.map((file, index) => ({
          id: index + 1,
          name: file.name.replace(/\.[^/.]+$/, ""),
          uri: file.uri,
          volume: 0.8,
          muted: false,
          solo: false,
          playing: false,
        }));

        setTracks(newTracks);
        console.log('📱 Loaded tracks:', newTracks.length);
      }
    } catch (error) {
      console.error('❌ Error picking files:', error);
      Alert.alert('Error', 'No se pudieron cargar los archivos de audio');
    }
  };

  const loadAudioTracks = async () => {
    try {
      const newSounds = new Map();
      
      for (const track of tracks) {
        if (track.uri) {
          console.log('🎵 Loading track:', track.name);
          const { sound } = await Audio.Sound.createAsync(
            { uri: track.uri },
            { shouldPlay: false, isLooping: false, volume: track.volume * masterVolume }
          );
          newSounds.set(track.id, sound);
        }
      }
      
      setSounds(newSounds);
      console.log('✅ All tracks loaded successfully');
    } catch (error) {
      console.error('❌ Error loading tracks:', error);
      Alert.alert('Error', 'Error al cargar los tracks de audio');
    }
  };

  const playAllTracks = async () => {
    try {
      if (sounds.size === 0) {
        await loadAudioTracks();
        return;
      }

      console.log('▶️ Starting synchronized playback...');
      
      // Calculate precise start time for all tracks
      const startTime = Date.now() + 100; // 100ms delay for sync
      
      // Start all tracks at the same time
      const playPromises = Array.from(sounds.entries()).map(async ([trackId, sound]) => {
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
      setIsPlaying(true);
      console.log('✅ All tracks started synchronously');
      
    } catch (error) {
      console.error('❌ Error in synchronized playback:', error);
      Alert.alert('Error', 'Error al reproducir los tracks');
    }
  };

  const stopAllTracks = async () => {
    try {
      console.log('⏹️ Stopping all tracks...');
      
      const stopPromises = Array.from(sounds.values()).map(async (sound) => {
        try {
          await sound.stopAsync();
        } catch (error) {
          console.warn('⚠️ Error stopping sound:', error);
        }
      });

      await Promise.all(stopPromises);
      setIsPlaying(false);
      console.log('✅ All tracks stopped');
      
    } catch (error) {
      console.error('❌ Error stopping tracks:', error);
    }
  };

  const setTrackVolume = async (trackId, volume) => {
    try {
      const sound = sounds.get(trackId);
      if (sound) {
        await sound.setVolumeAsync(volume * masterVolume);
      }
      
      setTracks(prevTracks => 
        prevTracks.map(track => 
          track.id === trackId ? { ...track, volume } : track
        )
      );
    } catch (error) {
      console.error('❌ Error setting volume:', error);
    }
  };

  const toggleMute = (trackId) => {
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.id === trackId ? { ...track, muted: !track.muted } : track
      )
    );
  };

  const setBPM = (bpm) => {
    setCurrentBPM(bpm);
    setOriginalBPM(bpm);
  };

  const increaseBPM = () => {
    if (currentBPM < 200) {
      setCurrentBPM(prev => prev + 1);
    }
  };

  const decreaseBPM = () => {
    if (currentBPM > 60) {
      setCurrentBPM(prev => prev - 1);
    }
  };

  const resetBPM = () => {
    setCurrentBPM(originalBPM);
  };

  const saveSong = async () => {
    if (!songName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la canción');
      return;
    }

    if (tracks.length === 0) {
      Alert.alert('Error', 'No hay tracks para guardar');
      return;
    }

    try {
      const songData = {
        id: Date.now().toString(),
        name: songName,
        tempo: songTempo ? parseInt(songTempo) : null,
        tracks: tracks.map(track => ({
          name: track.name,
          uri: track.uri,
          volume: track.volume
        })),
        createdAt: new Date().toISOString()
      };

      const storedSongs = await AsyncStorage.getItem('storedSongs');
      const songs = storedSongs ? JSON.parse(storedSongs) : [];
      songs.push(songData);
      
      await AsyncStorage.setItem('storedSongs', JSON.stringify(songs));
      
      Alert.alert('Éxito', 'Canción guardada correctamente');
      setShowUploadModal(false);
      setSongName('');
      setSongTempo('');
      
    } catch (error) {
      console.error('❌ Error saving song:', error);
      Alert.alert('Error', 'Error al guardar la canción');
    }
  };

  const loadSong = async (songData) => {
    try {
      const newTracks = songData.tracks.map((track, index) => ({
        id: index + 1,
        name: track.name,
        uri: track.localPath || track.uri, // Usar ruta local si está disponible
        volume: track.volume || 0.8,
        muted: false,
        solo: false,
        playing: false,
      }));

      setTracks(newTracks);
      
      if (songData.tempo) {
        setBPM(songData.tempo);
      }
      
      console.log('✅ Song loaded:', songData.name);
    } catch (error) {
      console.error('❌ Error loading song:', error);
      Alert.alert('Error', 'Error al cargar la canción');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MultiTrack Player</Text>
        <Text style={styles.subtitle}>Professional DAW Mobile</Text>
      </View>

      {/* BPM Controls */}
      <View style={styles.bpmContainer}>
        <TouchableOpacity style={styles.bpmButton} onPress={decreaseBPM}>
          <Text style={styles.bpmButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.bpmDisplay}>{currentBPM} BPM</Text>
        <TouchableOpacity style={styles.bpmButton} onPress={increaseBPM}>
          <Text style={styles.bpmButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={resetBPM}>
          <Text style={styles.resetButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Master Controls */}
      <PlaybackControls
        isPlaying={isPlaying}
        onPlay={playAllTracks}
        onStop={stopAllTracks}
        onUpload={() => setShowUploadModal(true)}
        onLibrary={() => setShowLibraryModal(true)}
        trackCount={tracks.length}
        currentTime={currentTime}
        totalTime={totalTime}
      />

      {/* Tracks List */}
      <ScrollView style={styles.tracksContainer}>
        {tracks.map((track) => (
          <TrackItem
            key={track.id}
            track={track}
            onVolumeChange={setTrackVolume}
            onMuteToggle={toggleMute}
          />
        ))}
      </ScrollView>

      {/* Upload Modal */}
      <Modal visible={showUploadModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cargar Nueva Canción</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre de la canción"
              value={songName}
              onChangeText={setSongName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Tempo (BPM)"
              value={songTempo}
              onChangeText={setSongTempo}
              keyboardType="numeric"
            />
            
            <TouchableOpacity style={styles.pickFilesButton} onPress={pickAudioFiles}>
              <Text style={styles.pickFilesButtonText}>📁 Seleccionar Archivos de Audio</Text>
            </TouchableOpacity>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowUploadModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={saveSong}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Song Library Modal */}
      <Modal visible={showLibraryModal} animationType="slide">
        <SongLibrary
          onSongSelect={loadSong}
          onClose={() => setShowLibraryModal(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
  bpmButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  bpmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bpmDisplay: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  masterControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  playButtonActive: {
    backgroundColor: '#f44336',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 32,
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tracksContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  trackItem: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackVolume: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  trackControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muteButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  muteButtonActive: {
    backgroundColor: '#f44336',
  },
  muteButtonText: {
    fontSize: 16,
  },
  volumeSlider: {
    flexDirection: 'row',
  },
  volumeButton: {
    backgroundColor: '#333',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  volumeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  pickFilesButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  pickFilesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});