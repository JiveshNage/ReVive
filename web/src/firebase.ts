import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import { verifyFirebaseAuth } from "./api/client";

// ReVive Web app Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyA1Mgv-nrneLsYHzyNyAVPwMYmbKF0pyaM",
  authDomain: "revive-e6e3f.firebaseapp.com",
  projectId: "revive-e6e3f",
  storageBucket: "revive-e6e3f.firebasestorage.app",
  messagingSenderId: "583199476446",
  appId: "1:583199476446:web:737b7eafd5f06aaf7e904f",
  measurementId: "G-WGB4S0097D",
};

// Initialize Firebase App singleton
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firebase Analytics (guarded for browser environments)
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics not supported or blocked by adblockers; fail silently
    });
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Sign in using Google OAuth via Firebase Popup.
 * Returns both the FirebaseUser object and the JWT ID token.
 */
export async function signInWithGoogle(): Promise<{
  user: FirebaseUser;
  idToken: string;
}> {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken(true);
  return {
    user: result.user,
    idToken,
  };
}

/**
 * Full login flow: authenticates with Google via Firebase and exchanges
 * the Firebase ID token with ReVive's backend (/api/auth/firebase/verify)
 * to receive a native ReVive session token.
 */
export async function loginWithFirebaseGoogle(): Promise<{
  access_token: string;
  token_type: string;
  user: any;
}> {
  const { idToken } = await signInWithGoogle();
  return verifyFirebaseAuth(idToken);
}

/**
 * Sign out of Firebase session
 */
export async function signOutFirebase(): Promise<void> {
  await fbSignOut(auth);
}
