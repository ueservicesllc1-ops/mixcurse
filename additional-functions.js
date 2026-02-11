/**
 * Additional functions for MultiTrack Player
 * These functions are called from the HTML but need to be defined
 */

// Resume audio context (required for browsers)
function resumeAudioContext() {
    if (typeof audioContext !== 'undefined' && audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('✅ AudioContext resumed');
        }).catch(err => {
            console.error('❌ Error resuming AudioContext:', err);
        });
    } else {
        console.log('ℹ️ AudioContext not available or already running');
    }
}

console.log('✅ Additional functions loaded');
