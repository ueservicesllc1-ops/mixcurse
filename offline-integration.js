/**
 * Offline-First Integration for MultiTrack Player
 * This file contains the integration logic for offline-first functionality
 */

// Global offline manager instance
let offlineManager = null;

// Initialize Offline Manager
async function initOfflineManager() {
    try {
        console.log('🚀 Initializing Offline Manager...');
        offlineManager = new OfflineManager();
        await offlineManager.init();
        console.log('✅ Offline Manager initialized');
        return true;
    } catch (error) {
        console.error('❌ Error initializing Offline Manager:', error);
        return false;
    }
}

// Show sync modal
function showSyncModal() {
    document.getElementById('syncModal').style.display = 'flex';
    document.getElementById('syncActions').style.display = 'flex';
    document.getElementById('syncStats').style.display = 'grid';
    document.getElementById('syncComplete').style.display = 'none';
}

// Close sync modal
function closeSyncModal() {
    document.getElementById('syncModal').style.display = 'none';
    // Auto-load last state after closing
    autoLoadLastState();
}

// Skip sync (online mode)
function skipSync() {
    console.log('⚠️ Skipping initial sync - will work in online mode');
    closeSyncModal();
}

// Start initial sync
async function startInitialSync() {
    try {
        console.log('🔄 Starting initial sync...');

        // Hide actions, show progress
        document.getElementById('syncActions').style.display = 'none';
        document.getElementById('startSyncBtn').disabled = true;

        // Progress callback
        const onProgress = (percent, message) => {
            document.getElementById('syncProgressFill').style.width = percent + '%';
            document.getElementById('syncProgressPercent').textContent = percent + '%';
            document.getElementById('syncProgressMessage').textContent = message;
        };

        // Perform sync
        const result = await offlineManager.performInitialSync(window.firebase.db, onProgress);

        // Update stats
        document.getElementById('syncSetlistCount').textContent = result.stats.totalSetlists;
        document.getElementById('syncSongCount').textContent = result.stats.totalSongs;
        document.getElementById('syncAudioCount').textContent = result.stats.totalAudioFiles;

        // Show completion
        document.getElementById('syncStats').style.display = 'none';
        document.getElementById('syncComplete').style.display = 'block';

        console.log('✅ Initial sync completed successfully!');

    } catch (error) {
        console.error('❌ Error during initial sync:', error);
        alert('Error durante la sincronización. Por favor, verifica tu conexión e intenta nuevamente.');
        document.getElementById('syncActions').style.display = 'flex';
        document.getElementById('startSyncBtn').disabled = false;
    }
}

// Auto-load last used setlist and song
async function autoLoadLastState() {
    try {
        console.log('🔄 Auto-loading last state...');

        const lastState = await offlineManager.getLastAppState();

        if (lastState && lastState.lastSetlistId && lastState.lastSongId) {
            console.log('📱 Found last state:', lastState);
            console.log(`📋 Last setlist: ${lastState.lastSetlistId}`);
            console.log(`🎵 Last song: ${lastState.lastSongId}`);

            // Load from cache
            const songData = await offlineManager.getSongFromCache(lastState.lastSongId);

            if (songData) {
                console.log('✅ Loading last song from cache:', songData.name);

                // Load the song tracks from cache
                await loadSongTracksFromCache(songData);

                console.log('✅ Last song loaded successfully!');
            } else {
                console.log('⚠️ Last song not found in cache, loading from Firebase...');
                // Fallback to Firebase if loadSongDirectly exists
                if (typeof loadSongDirectly === 'function') {
                    await loadSongDirectly(lastState.lastSongId);
                }
            }
        } else {
            console.log('ℹ️ No previous state found');
            // Try to load first setlist if function exists
            if (typeof autoLoadFirstSetlistAndSong === 'function') {
                await autoLoadFirstSetlistAndSong();
            }
        }

    } catch (error) {
        console.error('❌ Error auto-loading last state:', error);
    }
}

// Load song tracks from cache
async function loadSongTracksFromCache(songData) {
    try {
        console.log('📦 Loading song tracks from cache...');
        console.log('🧹 Clearing previous song data...');

        // Stop current playback
        if (typeof stopPlayback === 'function') {
            stopPlayback();
        } else if (typeof isPlaying !== 'undefined' && isPlaying) {
            isPlaying = false;
        }

        // Clear audio sources
        if (typeof audioSources !== 'undefined' && audioSources) {
            audioSources.forEach((source) => {
                try {
                    source.stop();
                    source.disconnect();
                } catch (e) {
                    // Source might already be stopped
                }
            });
            audioSources.clear();
            console.log('✅ Audio sources cleared');
        }

        // Clear gain nodes
        if (typeof gainNodes !== 'undefined' && gainNodes) {
            gainNodes.forEach((node) => {
                try {
                    node.disconnect();
                } catch (e) {
                    // Node might already be disconnected
                }
            });
            gainNodes.clear();
            console.log('✅ Gain nodes cleared');
        }

        // Clear current tracks
        if (typeof tracks !== 'undefined') {
            tracks.length = 0; // Clear array without losing reference
            console.log('✅ Tracks array cleared');
        }

        // Clear audio buffers
        if (typeof audioBuffers !== 'undefined' && audioBuffers.clear) {
            audioBuffers.clear();
            console.log('✅ Audio buffers cleared');
        }

        // Reset playback position
        if (typeof currentTime !== 'undefined') {
            currentTime = 0;
        }

        console.log('✅ Previous song data cleared');
        console.log('📥 Loading new song:', songData.name);

        // Load each track from cache
        for (const track of songData.tracks) {
            const trackId = track.id || track.name;

            // Get audio from cache
            const audioBuffer = await offlineManager.getAudioFromCache(trackId, audioContext);

            if (audioBuffer && typeof audioBuffers !== 'undefined') {
                // Store in memory
                audioBuffers.set(trackId, audioBuffer);
                audioBuffers.set(track.name, audioBuffer);

                // Add to tracks array
                if (typeof tracks !== 'undefined') {
                    tracks.push({
                        id: trackId,
                        name: track.name,
                        buffer: audioBuffer,
                        volume: 1.0,
                        solo: false,
                        mute: false,
                        playing: false
                    });
                }

                console.log(`✅ Loaded from cache: ${track.name}`);
            } else {
                console.warn(`⚠️ Track not in cache: ${track.name}`);
            }
        }

        // Update UI (if these functions exist)
        if (typeof updateTracksDisplay === 'function') {
            updateTracksDisplay();
        }
        if (typeof updateSongInfo === 'function') {
            updateSongInfo(songData);
        }
        if (typeof updateTracksGrid === 'function') {
            updateTracksGrid();
        }

        console.log('✅ All tracks loaded from cache');
        console.log(`📊 Loaded ${tracks.length} tracks for: ${songData.name}`);

    } catch (error) {
        console.error('❌ Error loading tracks from cache:', error);
        throw error;
    }
}

// Save current state (call this when user changes song/setlist)
async function saveCurrentState(setlistId, songId) {
    if (offlineManager) {
        await offlineManager.saveLastAppState(setlistId, songId);
        console.log('💾 Saved current state:', { setlistId, songId });
    }
}

// Enhanced init function for offline-first
async function initOfflineFirst() {
    console.log('🚀 Initializing Offline-First System...');
    console.log('🎯 OFFLINE-FIRST MODE ENABLED');

    // Initialize offline manager
    const offlineReady = await initOfflineManager();

    if (offlineReady) {
        // Check if initial sync is complete
        const isSyncComplete = offlineManager.isInitialSyncComplete();

        if (!isSyncComplete) {
            console.log('⚠️ Initial sync not complete - showing sync modal');
            showSyncModal();
        } else {
            console.log('✅ Initial sync already complete');

            // Get cache stats
            const stats = await offlineManager.getCacheStats();
            console.log('📊 Cache stats:', stats);
            console.log(`   📋 Setlists: ${stats.setlists}`);
            console.log(`   🎵 Songs: ${stats.songs}`);
            console.log(`   🎧 Audio files: ${stats.audioFiles}`);
            console.log(`   💾 Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);

            // Auto-load last state
            await autoLoadLastState();
        }
    } else {
        console.warn('⚠️ Offline manager failed to initialize - falling back to online mode');
    }
}

console.log('✅ Offline integration module loaded');
