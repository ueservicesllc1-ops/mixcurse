/**
 * Offline Manager for MultiTrack Player Desktop App
 * Handles initial sync, local storage, and offline-first functionality
 * Similar to Prime/Loop Community offline experience
 */

class OfflineManager {
    constructor() {
        this.cacheSystem = null;
        this.syncStatus = {
            isInitialSyncComplete: false,
            lastSyncDate: null,
            totalSongs: 0,
            totalAudioFiles: 0,
            totalSetlists: 0,
            syncProgress: 0
        };
        this.isOnline = navigator.onLine;

        // Listen for online/offline events
        window.addEventListener('online', () => {
            console.log('🌐 Connection restored');
            this.isOnline = true;
        });

        window.addEventListener('offline', () => {
            console.log('📡 Connection lost - running in offline mode');
            this.isOnline = false;
        });
    }

    /**
     * Initialize the offline manager
     */
    async init() {
        console.log('🚀 Initializing Offline Manager...');

        // Initialize cache system
        this.cacheSystem = new MultiTrackCacheSystem();
        await this.cacheSystem.init();

        // Check if initial sync is complete
        const syncStatus = await this.cacheSystem.getAppState('syncStatus');
        if (syncStatus) {
            this.syncStatus = syncStatus;
            console.log('✅ Previous sync found:', this.syncStatus);
        }

        // Load last used setlist and song
        const lastState = await this.getLastAppState();
        console.log('📱 Last app state:', lastState);

        return lastState;
    }

    /**
     * Perform initial sync from Firebase and B2
     */
    async performInitialSync(firebaseDb, onProgress) {
        console.log('🔄 ========================================');
        console.log('🔄 STARTING INITIAL SYNC');
        console.log('🔄 ========================================');

        try {
            const startTime = Date.now();

            // Step 1: Fetch all setlists from Firestore
            console.log('📋 Step 1/4: Fetching setlists...');
            const setlistsSnapshot = await window.firebase.getDocs(
                window.firebase.collection(firebaseDb, 'setlists')
            );

            const setlists = [];
            setlistsSnapshot.forEach(doc => {
                setlists.push({ id: doc.id, ...doc.data() });
            });

            console.log(`✅ Found ${setlists.length} setlists`);
            this.syncStatus.totalSetlists = setlists.length;

            // Cache all setlists
            for (const setlist of setlists) {
                await this.cacheSystem.saveSetlist(setlist.id, setlist);
            }

            if (onProgress) onProgress(25, 'Setlists cached');

            // Step 2: Fetch all songs from Firestore
            console.log('🎵 Step 2/4: Fetching songs metadata...');
            const songsSnapshot = await window.firebase.getDocs(
                window.firebase.collection(firebaseDb, 'songs')
            );

            const songs = [];
            songsSnapshot.forEach(doc => {
                songs.push({ id: doc.id, ...doc.data() });
            });

            console.log(`✅ Found ${songs.length} songs`);
            this.syncStatus.totalSongs = songs.length;

            // Cache all songs metadata
            for (const song of songs) {
                await this.cacheSystem.saveSong(song.id, song);
            }

            if (onProgress) onProgress(50, 'Songs metadata cached');

            // Step 3: Download and cache all audio files
            console.log('🎧 Step 3/4: Downloading audio files...');
            let totalTracks = 0;
            let downloadedTracks = 0;

            // Count total tracks
            songs.forEach(song => {
                if (song.tracks && Array.isArray(song.tracks)) {
                    totalTracks += song.tracks.length;
                }
            });

            console.log(`📊 Total audio files to download: ${totalTracks}`);
            this.syncStatus.totalAudioFiles = totalTracks;

            // Download each audio file
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            for (const song of songs) {
                if (!song.tracks || !Array.isArray(song.tracks)) continue;

                console.log(`🎵 Downloading tracks for: ${song.name}`);

                for (const track of song.tracks) {
                    try {
                        const trackId = track.id || track.name;
                        const downloadUrl = track.audioUrl || track.downloadUrl;

                        if (!downloadUrl) {
                            console.warn(`⚠️ No download URL for track: ${track.name}`);
                            continue;
                        }

                        // Check if already cached
                        const cached = await this.cacheSystem.getAudioFile(trackId, audioContext);
                        if (cached) {
                            console.log(`⚡ Already cached: ${track.name}`);
                            downloadedTracks++;
                            continue;
                        }

                        // Download audio file
                        console.log(`⬇️ Downloading: ${track.name}`);
                        const response = await fetch(downloadUrl);
                        const arrayBuffer = await response.arrayBuffer();
                        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                        // Cache the audio file
                        await this.cacheSystem.saveAudioFile(
                            trackId,
                            song.id,
                            downloadUrl,
                            audioBuffer
                        );

                        downloadedTracks++;
                        const progress = 50 + Math.floor((downloadedTracks / totalTracks) * 45);

                        if (onProgress) {
                            onProgress(
                                progress,
                                `Downloaded ${downloadedTracks}/${totalTracks} audio files`
                            );
                        }

                        console.log(`✅ [${downloadedTracks}/${totalTracks}] Cached: ${track.name}`);

                    } catch (error) {
                        console.error(`❌ Error downloading track ${track.name}:`, error);
                    }
                }
            }

            // Step 4: Save sync status
            console.log('💾 Step 4/4: Saving sync status...');
            this.syncStatus.isInitialSyncComplete = true;
            this.syncStatus.lastSyncDate = new Date().toISOString();
            this.syncStatus.syncProgress = 100;

            await this.cacheSystem.saveAppState('syncStatus', this.syncStatus);

            if (onProgress) onProgress(100, 'Sync complete!');

            const duration = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log('🔄 ========================================');
            console.log('✅ INITIAL SYNC COMPLETE');
            console.log(`⏱️ Duration: ${duration}s`);
            console.log(`📋 Setlists: ${this.syncStatus.totalSetlists}`);
            console.log(`🎵 Songs: ${this.syncStatus.totalSongs}`);
            console.log(`🎧 Audio files: ${downloadedTracks}/${totalTracks}`);
            console.log('🔄 ========================================');

            return {
                success: true,
                duration,
                stats: this.syncStatus
            };

        } catch (error) {
            console.error('❌ Error during initial sync:', error);
            throw error;
        }
    }

    /**
     * Load setlists from cache (offline)
     */
    async getSetlistsFromCache() {
        try {
            const transaction = this.cacheSystem.db.transaction(['setlists'], 'readonly');
            const store = transaction.objectStore('setlists');

            const setlists = await new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            console.log(`📦 Loaded ${setlists.length} setlists from cache`);
            return setlists;
        } catch (error) {
            console.error('❌ Error loading setlists from cache:', error);
            return [];
        }
    }

    /**
     * Load songs from cache (offline)
     */
    async getSongsFromCache() {
        try {
            const transaction = this.cacheSystem.db.transaction(['songs'], 'readonly');
            const store = transaction.objectStore('songs');

            const songs = await new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            console.log(`📦 Loaded ${songs.length} songs from cache`);
            return songs;
        } catch (error) {
            console.error('❌ Error loading songs from cache:', error);
            return [];
        }
    }

    /**
     * Load song by ID from cache
     */
    async getSongFromCache(songId) {
        return await this.cacheSystem.getSong(songId);
    }

    /**
     * Load audio file from cache
     */
    async getAudioFromCache(trackId, audioContext) {
        return await this.cacheSystem.getAudioFile(trackId, audioContext);
    }

    /**
     * Save last used setlist and song
     */
    async saveLastAppState(setlistId, songId) {
        const state = {
            lastSetlistId: setlistId,
            lastSongId: songId,
            lastUsed: new Date().toISOString()
        };

        await this.cacheSystem.saveAppState('lastAppState', state);
        console.log('💾 Saved last app state:', state);
    }

    /**
     * Get last used setlist and song
     */
    async getLastAppState() {
        return await this.cacheSystem.getAppState('lastAppState');
    }

    /**
     * Check if initial sync is complete
     */
    isInitialSyncComplete() {
        return this.syncStatus.isInitialSyncComplete;
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        return await this.cacheSystem.getCacheStats();
    }

    /**
     * Clear all cache (for re-sync)
     */
    async clearAllCache() {
        await this.cacheSystem.clearCache();
        this.syncStatus = {
            isInitialSyncComplete: false,
            lastSyncDate: null,
            totalSongs: 0,
            totalAudioFiles: 0,
            totalSetlists: 0,
            syncProgress: 0
        };
        await this.cacheSystem.saveAppState('syncStatus', this.syncStatus);
        console.log('🧹 All cache cleared');
    }

    /**
     * Force re-sync
     */
    async forceResync(firebaseDb, onProgress) {
        console.log('🔄 Force re-sync requested...');
        await this.clearAllCache();
        return await this.performInitialSync(firebaseDb, onProgress);
    }
}

// Export for use in main app
window.OfflineManager = OfflineManager;
