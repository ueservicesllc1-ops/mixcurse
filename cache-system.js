/**
 * Advanced Cache System for MultiTrack Player
 * Uses IndexedDB for storing large audio files
 * Similar to Prime/Loop Community offline functionality
 */

if (typeof MultiTrackCacheSystem === 'undefined') {
    window.MultiTrackCacheSystem = class MultiTrackCacheSystem {
        constructor() {
            this.dbName = 'MultiTrackPlayerDB';
            this.dbVersion = 1;
            this.db = null;
            this.stores = {
                audioFiles: 'audioFiles',      // Store audio buffers
                songs: 'songs',                // Store song metadata
                setlists: 'setlists',          // Store setlist data
                appState: 'appState'           // Store app state (last setlist, etc)
            };
        }

        /**
         * Initialize IndexedDB
         */
        async init() {
            return new Promise((resolve, reject) => {
                console.log('🗄️ Initializing IndexedDB...');

                const request = indexedDB.open(this.dbName, this.dbVersion);

                request.onerror = () => {
                    console.error('❌ IndexedDB error:', request.error);
                    reject(request.error);
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    console.log('✅ IndexedDB initialized successfully');
                    resolve(this.db);
                };

                request.onupgradeneeded = (event) => {
                    console.log('🔄 Upgrading IndexedDB schema...');
                    const db = event.target.result;

                    // Create object stores if they don't exist
                    if (!db.objectStoreNames.contains(this.stores.audioFiles)) {
                        const audioStore = db.createObjectStore(this.stores.audioFiles, { keyPath: 'id' });
                        audioStore.createIndex('songId', 'songId', { unique: false });
                        audioStore.createIndex('downloadUrl', 'downloadUrl', { unique: true });
                        console.log('✅ Created audioFiles store');
                    }

                    if (!db.objectStoreNames.contains(this.stores.songs)) {
                        const songsStore = db.createObjectStore(this.stores.songs, { keyPath: 'id' });
                        songsStore.createIndex('name', 'name', { unique: false });
                        console.log('✅ Created songs store');
                    }

                    if (!db.objectStoreNames.contains(this.stores.setlists)) {
                        const setlistsStore = db.createObjectStore(this.stores.setlists, { keyPath: 'id' });
                        setlistsStore.createIndex('name', 'name', { unique: false });
                        console.log('✅ Created setlists store');
                    }

                    if (!db.objectStoreNames.contains(this.stores.appState)) {
                        db.createObjectStore(this.stores.appState, { keyPath: 'key' });
                        console.log('✅ Created appState store');
                    }
                };
            });
        }

        /**
         * Save audio file to cache
         */
        async saveAudioFile(trackId, songId, downloadUrl, audioBuffer) {
            try {
                console.log(`💾 Caching audio file: ${trackId}`);

                const transaction = this.db.transaction([this.stores.audioFiles], 'readwrite');
                const store = transaction.objectStore(this.stores.audioFiles);

                // Convert AudioBuffer to ArrayBuffer for storage
                const channels = [];
                for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
                    channels.push(audioBuffer.getChannelData(i));
                }

                const audioData = {
                    id: trackId,
                    songId: songId,
                    downloadUrl: downloadUrl,
                    sampleRate: audioBuffer.sampleRate,
                    length: audioBuffer.length,
                    duration: audioBuffer.duration,
                    numberOfChannels: audioBuffer.numberOfChannels,
                    channels: channels.map(channel => Array.from(channel)),
                    cachedAt: new Date().toISOString(),
                    size: audioBuffer.length * audioBuffer.numberOfChannels * 4 // Approximate size in bytes
                };

                await new Promise((resolve, reject) => {
                    const request = store.put(audioData);
                    request.onsuccess = () => {
                        console.log(`✅ Cached: ${trackId} (${(audioData.size / 1024 / 1024).toFixed(2)} MB)`);
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });

                return true;
            } catch (error) {
                console.error(`❌ Error caching audio file ${trackId}:`, error);
                return false;
            }
        }

        /**
         * Get audio file from cache
         */
        async getAudioFile(trackId, audioContext) {
            try {
                const transaction = this.db.transaction([this.stores.audioFiles], 'readonly');
                const store = transaction.objectStore(this.stores.audioFiles);

                const audioData = await new Promise((resolve, reject) => {
                    const request = store.get(trackId);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });

                if (!audioData) {
                    console.log(`ℹ️ Audio file not in cache: ${trackId}`);
                    return null;
                }

                console.log(`📦 Loading from cache: ${trackId}`);

                // Reconstruct AudioBuffer from stored data
                const audioBuffer = audioContext.createBuffer(
                    audioData.numberOfChannels,
                    audioData.length,
                    audioData.sampleRate
                );

                for (let i = 0; i < audioData.numberOfChannels; i++) {
                    const channelData = audioBuffer.getChannelData(i);
                    const storedChannel = new Float32Array(audioData.channels[i]);
                    channelData.set(storedChannel);
                }

                console.log(`✅ Loaded from cache: ${trackId} (${audioData.duration.toFixed(2)}s)`);
                return audioBuffer;
            } catch (error) {
                console.error(`❌ Error getting audio file ${trackId}:`, error);
                return null;
            }
        }

        /**
         * Save song to cache
         */
        async saveSong(songId, songData) {
            try {
                console.log(`💾 Caching song: ${songData.name}`);

                const transaction = this.db.transaction([this.stores.songs], 'readwrite');
                const store = transaction.objectStore(this.stores.songs);

                const cacheData = {
                    id: songId,
                    name: songData.name,
                    artist: songData.artist,
                    bpm: songData.bpm,
                    key: songData.key,
                    tracks: songData.tracks,
                    cachedAt: new Date().toISOString()
                };

                await new Promise((resolve, reject) => {
                    const request = store.put(cacheData);
                    request.onsuccess = () => {
                        console.log(`✅ Song cached: ${songData.name}`);
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });

                return true;
            } catch (error) {
                console.error(`❌ Error caching song:`, error);
                return false;
            }
        }

        /**
         * Get song from cache
         */
        async getSong(songId) {
            try {
                const transaction = this.db.transaction([this.stores.songs], 'readonly');
                const store = transaction.objectStore(this.stores.songs);

                const songData = await new Promise((resolve, reject) => {
                    const request = store.get(songId);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });

                if (songData) {
                    console.log(`📦 Song loaded from cache: ${songData.name}`);
                }

                return songData;
            } catch (error) {
                console.error(`❌ Error getting song:`, error);
                return null;
            }
        }

        /**
         * Save setlist to cache
         */
        async saveSetlist(setlistId, setlistData) {
            try {
                console.log(`💾 Caching setlist: ${setlistData.name}`);

                const transaction = this.db.transaction([this.stores.setlists], 'readwrite');
                const store = transaction.objectStore(this.stores.setlists);

                const cacheData = {
                    id: setlistId,
                    name: setlistData.name,
                    songs: setlistData.songs,
                    cachedAt: new Date().toISOString()
                };

                await new Promise((resolve, reject) => {
                    const request = store.put(cacheData);
                    request.onsuccess = () => {
                        console.log(`✅ Setlist cached: ${setlistData.name}`);
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });

                return true;
            } catch (error) {
                console.error(`❌ Error caching setlist:`, error);
                return false;
            }
        }

        /**
         * Get setlist from cache
         */
        async getSetlist(setlistId) {
            try {
                const transaction = this.db.transaction([this.stores.setlists], 'readonly');
                const store = transaction.objectStore(this.stores.setlists);

                const setlistData = await new Promise((resolve, reject) => {
                    const request = store.get(setlistId);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });

                if (setlistData) {
                    console.log(`📦 Setlist loaded from cache: ${setlistData.name}`);
                }

                return setlistData;
            } catch (error) {
                console.error(`❌ Error getting setlist:`, error);
                return null;
            }
        }

        /**
         * Save app state (last used setlist, etc)
         */
        async saveAppState(key, value) {
            try {
                const transaction = this.db.transaction([this.stores.appState], 'readwrite');
                const store = transaction.objectStore(this.stores.appState);

                await new Promise((resolve, reject) => {
                    const request = store.put({ key, value, updatedAt: new Date().toISOString() });
                    request.onsuccess = () => {
                        console.log(`💾 App state saved: ${key}`);
                        resolve();
                    };
                    request.onerror = () => reject(request.error);
                });

                return true;
            } catch (error) {
                console.error(`❌ Error saving app state:`, error);
                return false;
            }
        }

        /**
         * Get app state
         */
        async getAppState(key) {
            try {
                const transaction = this.db.transaction([this.stores.appState], 'readonly');
                const store = transaction.objectStore(this.stores.appState);

                const data = await new Promise((resolve, reject) => {
                    const request = store.get(key);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });

                return data ? data.value : null;
            } catch (error) {
                console.error(`❌ Error getting app state:`, error);
                return null;
            }
        }

        /**
         * Get cache statistics
         */
        async getCacheStats() {
            try {
                const stats = {
                    audioFiles: 0,
                    songs: 0,
                    setlists: 0,
                    totalSize: 0
                };

                // Count audio files
                const audioTx = this.db.transaction([this.stores.audioFiles], 'readonly');
                const audioStore = audioTx.objectStore(this.stores.audioFiles);
                const audioCount = await new Promise((resolve) => {
                    const request = audioStore.count();
                    request.onsuccess = () => resolve(request.result);
                });
                stats.audioFiles = audioCount;

                // Count songs
                const songsTx = this.db.transaction([this.stores.songs], 'readonly');
                const songsStore = songsTx.objectStore(this.stores.songs);
                const songsCount = await new Promise((resolve) => {
                    const request = songsStore.count();
                    request.onsuccess = () => resolve(request.result);
                });
                stats.songs = songsCount;

                // Count setlists
                const setlistsTx = this.db.transaction([this.stores.setlists], 'readonly');
                const setlistsStore = setlistsTx.objectStore(this.stores.setlists);
                const setlistsCount = await new Promise((resolve) => {
                    const request = setlistsStore.count();
                    request.onsuccess = () => resolve(request.result);
                });
                stats.setlists = setlistsCount;

                // Calculate total size (approximate)
                const audioSizeTx = this.db.transaction([this.stores.audioFiles], 'readonly');
                const audioSizeStore = audioSizeTx.objectStore(this.stores.audioFiles);
                const allAudio = await new Promise((resolve) => {
                    const request = audioSizeStore.getAll();
                    request.onsuccess = () => resolve(request.result);
                });

                stats.totalSize = allAudio.reduce((sum, audio) => sum + (audio.size || 0), 0);

                return stats;
            } catch (error) {
                console.error('❌ Error getting cache stats:', error);
                return null;
            }
        }

        /**
         * Clear all cache
         */
        async clearCache() {
            try {
                console.log('🧹 Clearing all cache...');

                const transaction = this.db.transaction(
                    [this.stores.audioFiles, this.stores.songs, this.stores.setlists],
                    'readwrite'
                );

                await Promise.all([
                    new Promise((resolve) => {
                        const request = transaction.objectStore(this.stores.audioFiles).clear();
                        request.onsuccess = () => resolve();
                    }),
                    new Promise((resolve) => {
                        const request = transaction.objectStore(this.stores.songs).clear();
                        request.onsuccess = () => resolve();
                    }),
                    new Promise((resolve) => {
                        const request = transaction.objectStore(this.stores.setlists).clear();
                        request.onsuccess = () => resolve();
                    })
                ]);

                console.log('✅ Cache cleared successfully');
                return true;
            } catch (error) {
                console.error('❌ Error clearing cache:', error);
                return false;
            }
        }
    }

    // Export for use in main app
    window.MultiTrackCacheSystem = MultiTrackCacheSystem;
}
