import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (avoid duplicate app on hot reload)
// Guard against missing config during build time
const isConfigured = !!firebaseConfig.apiKey;
const app = (!getApps().length && isConfigured) 
  ? initializeApp(firebaseConfig) 
  : (getApps().length ? getApp() : null);

// Dummy auth/db if not configured (to prevent crashes during pre-render)
const auth = app ? getAuth(app) : {} as any;
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const db = app ? getFirestore(app) : {} as any;
const storage = app ? getStorage(app) : {} as any;

// Analytics: only in the browser
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, googleProvider, githubProvider, db, storage, analytics };
