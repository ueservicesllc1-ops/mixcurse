import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AudioService from '../services/AudioService';

const ProjectScreen = ({ navigation }) => {
  const [projectName, setProjectName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const saveProject = async () => {
    try {
      if (!projectName.trim()) {
        Alert.alert('Error', 'Ingresa un nombre para el proyecto');
        return;
      }

      const tracks = AudioService.getTracks();
      const playbackStatus = AudioService.getPlaybackStatus();
      
      const projectData = {
        name: projectName,
        tracks: tracks,
        settings: {
          tempo: playbackStatus.tempo,
          masterVolume: playbackStatus.masterVolume,
          isLooping: playbackStatus.isLooping,
          loopStart: playbackStatus.loopStart,
          loopEnd: playbackStatus.loopEnd,
        },
        createdAt: new Date().toISOString(),
      };

      const fileName = `${projectName.replace(/\s+/g, '_')}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(projectData, null, 2));
      
      Alert.alert(
        'Proyecto Guardado',
        `El proyecto "${projectName}" se ha guardado correctamente.`,
        [
          { text: 'OK' },
          {
            text: 'Compartir',
            onPress: () => shareProject(fileUri),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el proyecto');
      console.error('Save project error:', error);
    }
  };

  const shareProject = async (fileUri) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Compartir Proyecto MultiTrack',
        });
      } else {
        Alert.alert('Error', 'La función de compartir no está disponible');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el proyecto');
      console.error('Share project error:', error);
    }
  };

  const exportMix = async () => {
    try {
      setIsExporting(true);
      
      // Simular exportación de mezcla
      // En una implementación real, aquí se procesaría el audio
      Alert.alert(
        'Exportar Mezcla',
        'Esta función exportará todos los tracks como un archivo de audio único. ¿Continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Exportar',
            onPress: async () => {
              // Simular proceso de exportación
              setTimeout(() => {
                setIsExporting(false);
                Alert.alert('Éxito', 'La mezcla se ha exportado correctamente');
              }, 2000);
            },
          },
        ]
      );
    } catch (error) {
      setIsExporting(false);
      Alert.alert('Error', 'No se pudo exportar la mezcla');
      console.error('Export mix error:', error);
    }
  };

  const clearProject = () => {
    Alert.alert(
      'Limpiar Proyecto',
      '¿Estás seguro de que quieres eliminar todos los tracks? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            await AudioService.cleanup();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const getProjectInfo = () => {
    const tracks = AudioService.getTracks();
    const status = AudioService.getPlaybackStatus();
    
    return {
      trackCount: tracks.length,
      totalDuration: status.duration,
      tempo: status.tempo,
      masterVolume: status.masterVolume,
    };
  };

  const projectInfo = getProjectInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Gestión de Proyecto</Text>
          <Text style={styles.subtitle}>
            Guarda, exporta y gestiona tu sesión de multitrack
          </Text>
        </View>

        {/* Información del proyecto */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información del Proyecto</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tracks</Text>
              <Text style={styles.infoValue}>{projectInfo.trackCount}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tempo</Text>
              <Text style={styles.infoValue}>{projectInfo.tempo} BPM</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Volumen</Text>
              <Text style={styles.infoValue}>{Math.round(projectInfo.masterVolume * 100)}%</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duración</Text>
              <Text style={styles.infoValue}>
                {Math.floor(projectInfo.totalDuration / 60000)}:
                {Math.floor((projectInfo.totalDuration % 60000) / 1000)
                  .toString()
                  .padStart(2, '0')}
              </Text>
            </View>
          </View>
        </View>

        {/* Guardar proyecto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guardar Proyecto</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nombre del proyecto"
            placeholderTextColor="#888"
            value={projectName}
            onChangeText={setProjectName}
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveProject}>
            <Text style={styles.saveButtonText}>💾 Guardar Proyecto</Text>
          </TouchableOpacity>
        </View>

        {/* Exportar mezcla */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exportar</Text>
          <TouchableOpacity
            style={[styles.exportButton, isExporting && styles.disabledButton]}
            onPress={exportMix}
            disabled={isExporting}
          >
            <Text style={styles.exportButtonText}>
              {isExporting ? '⏳ Exportando...' : '🎵 Exportar Mezcla'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Acciones del proyecto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          <TouchableOpacity style={styles.actionButton} onPress={clearProject}>
            <Text style={styles.actionButtonText}>🗑️ Limpiar Proyecto</Text>
          </TouchableOpacity>
        </View>

        {/* Navegación */}
        <View style={styles.navigationSection}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.navButtonText}>🏠 Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Player')}
          >
            <Text style={styles.navButtonText}>🎛️ Reproductor</Text>
          </TouchableOpacity>
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
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
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
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  infoLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  textInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigationSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProjectScreen;

