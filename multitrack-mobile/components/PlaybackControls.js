import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PlaybackControls = ({ 
  isPlaying, 
  onPlay, 
  onStop, 
  onUpload, 
  onLibrary,
  trackCount,
  currentTime,
  totalTime 
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainControls}>
        <TouchableOpacity 
          style={[styles.playButton, isPlaying && styles.playButtonActive]} 
          onPress={isPlaying ? onStop : onPlay}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏹' : '▶'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(totalTime)}
          </Text>
          <Text style={styles.trackCount}>
            {trackCount} tracks loaded
          </Text>
        </View>
      </View>
      
      <View style={styles.secondaryControls}>
        <TouchableOpacity style={styles.uploadButton} onPress={onUpload}>
          <Text style={styles.uploadButtonText}>📁 Cargar Tracks</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.libraryButton} onPress={onLibrary}>
          <Text style={styles.libraryButtonText}>📚 Biblioteca</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    borderWidth: 3,
    borderColor: '#45a049',
  },
  playButtonActive: {
    backgroundColor: '#f44336',
    borderColor: '#d32f2f',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 32,
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  trackCount: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#1976D2',
    marginRight: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  libraryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#45a049',
    marginLeft: 10,
  },
  libraryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PlaybackControls;
