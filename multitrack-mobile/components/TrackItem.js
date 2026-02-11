import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const TrackItem = ({ track, onVolumeChange, onMuteToggle }) => {
  const handleVolumeDecrease = () => {
    const newVolume = Math.max(0, track.volume - 0.1);
    onVolumeChange(track.id, newVolume);
  };

  const handleVolumeIncrease = () => {
    const newVolume = Math.min(1, track.volume + 0.1);
    onVolumeChange(track.id, newVolume);
  };

  return (
    <View style={styles.container}>
      <View style={styles.trackInfo}>
        <Text style={styles.trackName}>{track.name}</Text>
        <Text style={styles.trackVolume}>
          Vol: {Math.round(track.volume * 100)}%
        </Text>
        {track.muted && <Text style={styles.mutedText}>MUTED</Text>}
      </View>
      
      <View style={styles.trackControls}>
        <TouchableOpacity 
          style={[styles.muteButton, track.muted && styles.muteButtonActive]}
          onPress={() => onMuteToggle(track.id)}
        >
          <Text style={styles.muteButtonText}>
            {track.muted ? '🔇' : '🔊'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.volumeControls}>
          <TouchableOpacity 
            style={styles.volumeButton}
            onPress={handleVolumeDecrease}
          >
            <Text style={styles.volumeButtonText}>-</Text>
          </TouchableOpacity>
          
          <View style={styles.volumeBar}>
            <View 
              style={[
                styles.volumeFill, 
                { width: `${track.volume * 100}%` }
              ]} 
            />
          </View>
          
          <TouchableOpacity 
            style={styles.volumeButton}
            onPress={handleVolumeIncrease}
          >
            <Text style={styles.volumeButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  mutedText: {
    color: '#f44336',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
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
    marginRight: 15,
  },
  muteButtonActive: {
    backgroundColor: '#f44336',
  },
  muteButtonText: {
    fontSize: 16,
  },
  volumeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeButton: {
    backgroundColor: '#333',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  volumeBar: {
    width: 60,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
});

export default TrackItem;



