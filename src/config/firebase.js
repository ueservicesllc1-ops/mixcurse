// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSf8VxrNCfCak5bLdLOWRNbXOCZwlRIYM",
  authDomain: "mysetlistapp-bb4c6.firebaseapp.com",
  projectId: "mysetlistapp-bb4c6",
  storageBucket: "mysetlistapp-bb4c6.firebasestorage.app",
  messagingSenderId: "135682742499",
  appId: "1:135682742499:web:4661cd6fc042924be2cdd6",
  measurementId: "G-P86SQYKBBZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Conditionally initialize analytics (only for web environments)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    // Dynamic import to avoid issues in React Native
    import("firebase/analytics").then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
    }).catch((error) => {
      // Analytics not available (e.g., in React Native)
      console.log('Analytics not available in this environment:', error.message);
    });
  } catch (error) {
    console.log('Analytics initialization skipped:', error.message);
  }
}

export { app, analytics, auth, db, storage };




