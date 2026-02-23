// Helper to auto-load setlist from ready data
async function autoLoadSetlistFromData(setlists) {
    if (!setlists || setlists.length === 0) return;

    console.log('🚀 Auto-loading logic executing with', setlists.length, 'setlists');

    let targetSetlist = setlists[0]; // Default

    // Try to find last used
    try {
        const lastSetlistJson = localStorage.getItem('lastUsedSetlist');
        if (lastSetlistJson) {
            const lastData = JSON.parse(lastSetlistJson);
            if (lastData && lastData.id) {
                const found = setlists.find(s => s.id === lastData.id);
                if (found) {
                    console.log('📋 Restoring last used setlist:', found.name);
                    targetSetlist = found;
                }
            }
        }
    } catch (e) { console.warn('Pref read error', e); }

    if (targetSetlist) {
        console.log('🚀 Loading setlist:', targetSetlist.name);
        // Assume loadSetlist exists generally
        if (typeof loadSetlist === 'function') {
            await loadSetlist(targetSetlist.id);
        } else {
            console.error('❌ loadSetlist missing');
        }
    }
}
