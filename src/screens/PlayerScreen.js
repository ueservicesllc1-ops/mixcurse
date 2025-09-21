import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Slider from 'react-native-slider';
import AudioService from '../services/AudioService';

const { width } = Dimensions.get('window');

const PlayerScreen = ({ navigation }) => {
  const [tracks, setTracks] = useState([]);
  const [playbackStatus, setPlaybackStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [masterVolume, setMasterVolume] = useState(1.0);

  useEffect(() => {
    loadTracks();
    const interval = setInterval(updatePlaybackStatus, 100);
    return () => clearInterval(interval);
  }, []);

  const loadTracks = () => {
    const loadedTracks = AudioService.getTracks();
    setTracks(loadedTracks);
  };

  const updatePlaybackStatus = () => {
    const status = AudioService.getPlaybackStatus();
    setPlaybackStatus(status);
    setIsPlaying(status.isPlaying);
    setCurrentPosition(status.currentPosition);
    setDuration(status.duration);
    setTempo(status.tempo);
    setMasterVolume(status.masterVolume);
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      await AudioService.pauseAll();
    } else {
      await AudioService.playAll();
    }
  };

  const stopPlayback = async () => {
    await AudioService.stopAll();
  };

  const handleTempoChange = async (value) => {
    setTempo(value);
    await AudioService.setTempo(value);
  };

  const handleMasterVolumeChange = async (value) => {
    setMasterVolume(value);
    await AudioService.setMasterVolume(value);
  };

  const handleTrackVolumeChange = async (trackId, value) => {
    await AudioService.setTrackVolume(trackId, value);
    loadTracks();
  };

  const toggleMute = async (trackId) => {
    await AudioService.muteTrack(trackId);
    loadTracks();
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderTrack = (track) => (
    <View key={track.id} style={styles.trackContainer}>
      <View style={styles.trackHeader}>
        <Text style={styles.trackName}>{track.name}</Text>
        <TouchableOpacity
          style={[styles.muteButton, track.muted && styles.mutedButton]}
          onPress={() => toggleMute(track.id)}
        >
          <Text style={styles.muteButtonText}>
            {track.muted ? '🔇' : '🔊'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.trackControls}>
        <Text style={styles.volumeLabel}>Vol</Text>
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={track.volume}
          onValueChange={(value) => handleTrackVolumeChange(track.id, value)}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#333"
          thumbStyle={styles.sliderThumb}
        />
        <Text style={styles.volumeValue}>{Math.round(track.volume * 100)}%</Text>
      </View>

      <View style={styles.effectsContainer}>
        <Text style={styles.effectsTitle}>Efectos</Text>
        <View style={styles.effectsRow}>
          <View style={styles.effectControl}>
            <Text style={styles.effectLabel}>EQ</Text>
            <Slider
              style={styles.effectSlider}
              minimumValue={-12}
              maximumValue={12}
              value={track.effects.eq.mid}
              minimumTrackTintColor="#FF6B35"
              maximumTrackTintColor="#333"
              thumbStyle={styles.sliderThumb}
            />
          </View>
          <View style={styles.effectControl}>
            <Text style={styles.effectLabel}>Reverb</Text>
            <Slider
              style={styles.effectSlider}
              minimumValue={0}
              maximumValue={1}
              value={track.effects.reverb.amount}
              minimumTrackTintColor="#34C759"
              maximumTrackTintColor="#333"
              thumbStyle={styles.sliderThumb}
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Controles principales */}
        <View style={styles.mainControls}>
          <View style={styles.playbackControls}>
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.activePlayButton]}
              onPress={togglePlayback}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸️' : '▶️'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.stopButton} onPress={stopPlayback}>
              <Text style={styles.stopButtonText}>⏹️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>
              {formatTime(currentPosition)} / {formatTime(duration)}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <Slider
              style={styles.progressSlider}
              minimumValue={0}
              maximumValue={duration}
              value={currentPosition}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#333"
              thumbStyle={styles.progressThumb}
            />
          </View>
        </View>

        {/* Controles globales */}
        <View style={styles.globalControls}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Tempo: {tempo} BPM</Text>
            <Slider
              style={styles.controlSlider}
              minimumValue={60}
              maximumValue={200}
              value={tempo}
              onValueChange={handleTempoChange}
              minimumTrackTintColor="#FF6B35"
              maximumTrackTintColor="#333"
              thumbStyle={styles.sliderThumb}
            />
          </View>

          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Volumen Master: {Math.round(masterVolume * 100)}%</Text>
            <Slider
              style={styles.controlSlider}
              minimumValue={0}
              maximumValue={1}
              value={masterVolume}
              onValueChange={handleMasterVolumeChange}
              minimumTrackTintColor="#34C759"
              maximumTrackTintColor="#333"
              thumbStyle={styles.sliderThumb}
            />
          </View>
        </View>

        {/* Tracks */}
        <View style={styles.tracksSection}>
          <Text style={styles.sectionTitle}>Tracks ({tracks.length})</Text>
          {tracks.map(renderTrack)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  mainControls: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#333',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  activePlayButton: {
    backgroundColor: '#007AFF',
  },
  playButtonText: {
    fontSize: 32,
  },
  stopButton: {
    backgroundColor: '#333',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 24,
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 15,
  },
  timeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 10,
  },
  progressSlider: {
    height: 40,
  },
  progressThumb: {
    backgroundColor: '#007AFF',
    width: 20,
    height: 20,
  },
  globalControls: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  controlGroup: {
    marginBottom: 20,
  },
  controlLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  controlSlider: {
    height: 30,
  },
  sliderThumb: {
    backgroundColor: '#fff',
    width: 20,
    height: 20,
  },
  tracksSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  trackContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  trackName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  muteButton: {
    backgroundColor: '#333',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedButton: {
    backgroundColor: '#FF3B30',
  },
  muteButtonText: {
    fontSize: 18,
  },
  trackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  volumeLabel: {
    color: '#888',
    fontSize: 14,
    width: 30,
  },
  volumeSlider: {
    flex: 1,
    height: 30,
    marginHorizontal: 10,
  },
  volumeValue: {
    color: '#888',
    fontSize: 14,
    width: 40,
    textAlign: 'right',
  },
  effectsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
  },
  effectsTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 10,
  },
  effectsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  effectControl: {
    flex: 1,
    marginHorizontal: 5,
  },
  effectLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  effectSlider: {
    height: 20,
  },
});

export default PlayerScreen;

