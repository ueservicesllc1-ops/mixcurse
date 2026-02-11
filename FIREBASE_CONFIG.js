// Firebase Configuration for freedommix-c5c3e

const firebaseConfig = {
    apiKey: "AIzaSyB3GHmCQB-yvJr3iJ82CxAEgUU_N8QjgBU",
    authDomain: "freedommix-c5c3e.firebaseapp.com",
    projectId: "freedommix-c5c3e",
    storageBucket: "freedommix-c5c3e.firebasestorage.app",
    messagingSenderId: "830247648726",
    appId: "1:830247648726:web:fab37de48098e10184f877"
};

// Colecciones que necesitas crear en Firestore:
//
// 1. songs
//    - Estructura de documento:
//    {
//      userId: string,
//      songId: string,
//      name: string,
//      artist: string,
//      tempo: number,
//      tracks: array[{
//        name: string,
//        fileName: string,
//        fileId: string,
//        downloadUrl: string,
//        size: number,
//        type: string,
//        storage: "b2"
//      }],
//      storage: "b2",
//      createdAt: timestamp,
//      updatedAt: timestamp
//    }
//
// 2. audioFiles
//    - Estructura de documento:
//    {
//      userId: string,
//      originalName: string,
//      fileName: string,
//      fileId: string,
//      downloadUrl: string,
//      size: number,
//      type: string,
//      createdAt: timestamp
//    }
//
// 3. setlists (opcional, para playlists)
//    - Estructura de documento:
//    {
//      userId: string,
//      name: string,
//      songs: array[songId],
//      createdAt: timestamp,
//      updatedAt: timestamp
//    }

// IMPORTANTE: Las colecciones se crean automáticamente cuando subes el primer documento.
// No necesitas crearlas manualmente en Firebase Console.
