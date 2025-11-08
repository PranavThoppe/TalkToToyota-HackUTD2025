import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is configured (handle undefined strings and empty strings)
const hasValidConfig = (value: string | undefined): boolean => {
  return value !== undefined && 
         value !== "undefined" && 
         typeof value === "string" && 
         value.trim() !== "";
};

const isFirebaseConfigured = 
  hasValidConfig(firebaseConfig.apiKey) && 
  hasValidConfig(firebaseConfig.projectId) && 
  hasValidConfig(firebaseConfig.authDomain);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.warn("⚠️ Firebase initialization error:", error);
    console.log("📦 Using JSON fallback data instead");
  }
} else {
  console.log("📦 Firebase not configured. Using JSON fallback data.");
}

export { db, auth };
export default app;