// Firebase Firestore integration for real-time multi-device sync
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import type { GameState, FirebaseConfigSettings } from '../types/game';

const CONFIG_STORAGE_KEY = 'heavens_fall_firebase_config';
const DOC_PATH = 'events/heavens-fall-live';

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;

export function getSavedFirebaseConfig(): FirebaseConfigSettings | null {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse saved Firebase config', e);
  }

  // Check if env variables exist
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfigSettings | null): void {
  if (config) {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  }
}

export function initFirebase(config: FirebaseConfigSettings | null): {
  app: FirebaseApp | null;
  db: Firestore | null;
  error?: string;
} {
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null };
  }

  try {
    if (getApps().length === 0) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    firestoreInstance = getFirestore(appInstance);
    return { app: appInstance, db: firestoreInstance };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Firebase initialization failed', err);
    return { app: null, db: null, error: message };
  }
}

export async function syncStateToFirestore(db: Firestore | null, state: GameState): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, DOC_PATH);
    await setDoc(docRef, {
      ...state,
      updatedAt: Date.now(),
    });
    return true;
  } catch (err) {
    console.error('Error saving state to Firestore:', err);
    return false;
  }
}

export function subscribeToFirestoreState(
  db: Firestore | null,
  onRemoteUpdate: (state: GameState) => void,
  onError?: (err: Error) => void
): Unsubscribe | null {
  if (!db) return null;
  try {
    const docRef = doc(db, DOC_PATH);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as GameState;
          onRemoteUpdate(data);
        }
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to setup Firestore listener:', err);
    return null;
  }
}
