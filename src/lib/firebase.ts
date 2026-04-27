import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBFDqg-zk006grE937bw4ePJxW989q22hw",
  authDomain: "examtop-15e72.firebaseapp.com",
  projectId: "examtop-15e72",
  storageBucket: "examtop-15e72.firebasestorage.app",
  messagingSenderId: "671282808439",
  appId: "1:671282808439:web:09ae5c9e3021f252d9e872",
  measurementId: "G-8H2CHVEC92"
};

// Initialize Firebase (avoid duplicate app on hot reload)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

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
