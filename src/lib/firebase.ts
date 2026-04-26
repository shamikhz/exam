import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDxm9RGLZjyZFLpL_xro7zpDbJ3TiJrZa4",
  authDomain: "examtop-256af.firebaseapp.com",
  projectId: "examtop-256af",
  storageBucket: "examtop-256af.firebasestorage.app",
  messagingSenderId: "911781582351",
  appId: "1:911781582351:web:e4462e9abb8d2321efb57a",
  measurementId: "G-JZXB4W7VHL"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally to avoid SSR issues
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, googleProvider, analytics };
