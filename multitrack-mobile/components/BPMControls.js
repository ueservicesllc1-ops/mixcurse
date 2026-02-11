import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BPMControls = ({ currentBPM, originalBPM, onIncrease, onDecrease, onReset }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.bpmButton} onPress={onDecrease}>
        <Text style={styles.bpmButtonText}>-</Text>
      </TouchableOpacity>
      
      <View style={styles.bpmDisplay}>
        <Text style={styles.bpmValue}>{currentBPM}</Text>
        <Text style={styles.bpmLabel}>BPM</Text>
        {currentBPM !== originalBPM && (
          <Text style={styles.originalBPM}>Original: {originalBPM}</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.bpmButton} onPress={onIncrease}>
        <Text style={styles.bpmButtonText}>+</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>↻</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  bpmButton: {
    backgroundColor: '#333',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: '#555',
  },
  bpmButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bpmDisplay: {
    alignItems: 'center',
    marginHorizontal: 20,
    minWidth: 120,
  },
  bpmValue: {
    color: '#4CAF50',
    fontSize: 32,
    fontWeight: 'bold',
  },
  bpmLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  originalBPM: {
    color: '#666',
    fontSize: 10,
    marginTop: 5,
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#ff5252',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default BPMControls;



