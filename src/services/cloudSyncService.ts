import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  Firestore,
  Unsubscribe,
  getDoc,
} from 'firebase/firestore';
import { Family, SavingsGoal, Transaction, AuditLog, CloudSyncConfig } from '../types';

export interface CloudPayload {
  family: Family;
  goals: SavingsGoal[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  updatedAt: string;
  updatedByRole: string;
}

let firestoreInstance: Firestore | null = null;
let currentUnsubscribe: Unsubscribe | null = null;

// Helper to safely read env variables in Vite or Node
const getEnvVar = (key: string): string => {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
    if (metaEnv && metaEnv[key]) {
      return metaEnv[key];
    }
  } catch {
    // fallback
  }
  return '';
};

// Default built-in / env configuration (from user Firebase project kita-51e3e)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || 'AIzaSyAQIxG-8UlMVZ9p_HyTAIvCRMq31CpgGi0',
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || 'kita-51e3e.firebaseapp.com',
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || 'kita-51e3e',
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || 'kita-51e3e.firebasestorage.app',
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || '213468010438',
  appId: getEnvVar('VITE_FIREBASE_APP_ID') || '1:213468010438:web:89175bd0495824010bc4c7',
  measurementId: 'G-TS990240LT',
};

export function isFirebaseConfigured(config?: Partial<CloudSyncConfig>): boolean {
  if (config?.firebaseApiKey && config?.firebaseProjectId) {
    return true;
  }
  return Boolean(DEFAULT_FIREBASE_CONFIG.apiKey && DEFAULT_FIREBASE_CONFIG.projectId);
}

export function getEffectiveFirebaseConfig(config?: Partial<CloudSyncConfig>) {
  return {
    apiKey: config?.firebaseApiKey || DEFAULT_FIREBASE_CONFIG.apiKey,
    projectId: config?.firebaseProjectId || DEFAULT_FIREBASE_CONFIG.projectId,
    appId: config?.firebaseAppId || DEFAULT_FIREBASE_CONFIG.appId,
    authDomain: `${config?.firebaseProjectId || DEFAULT_FIREBASE_CONFIG.projectId}.firebaseapp.com`,
  };
}

export function getFriendlyErrorMessage(err: unknown): string {
  const msg = (err as Error)?.message || String(err);
  if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
    return 'Izin database ditolak (permission-denied). Buka Firebase Console > Firestore Database > tab Rules, ubah menjadi: "allow read, write: if true;" lalu klik Publish.';
  }
  if (msg.includes('not-found') || msg.includes('Database not found') || msg.includes('does not exist')) {
    return 'Database Firestore belum dibuat. Buka Firebase Console > Databases & Storage > Firestore Database, lalu klik tombol "Create database".';
  }
  if (msg.includes('network') || msg.includes('unavailable')) {
    return 'Koneksi internet bermasalah. Mencoba menghubungkan kembali...';
  }
  return msg;
}

export function initFirebase(config?: Partial<CloudSyncConfig>): Firestore | null {
  try {
    const fbConfig = getEffectiveFirebaseConfig(config);
    if (!fbConfig.apiKey || !fbConfig.projectId) {
      return null;
    }

    let app: FirebaseApp;
    if (getApps().length === 0) {
      app = initializeApp(fbConfig);
    } else {
      app = getApp();
    }

    firestoreInstance = getFirestore(app);
    return firestoreInstance;
  } catch (err) {
    console.warn('[CloudSync] Failed to initialize Firebase:', err);
    return null;
  }
}

/**
 * Subscribe to real-time changes on Firebase Firestore
 */
export function subscribeToCloudUpdates(
  syncCode: string,
  config: Partial<CloudSyncConfig>,
  onUpdate: (payload: CloudPayload) => void,
  onError: (errorMsg: string) => void
): () => void {
  // Clear any existing subscription
  if (currentUnsubscribe) {
    currentUnsubscribe();
    currentUnsubscribe = null;
  }

  const cleanCode = syncCode.trim().toUpperCase();
  if (!cleanCode) {
    onError('Kode sinkronisasi belum dimasukkan.');
    return () => {};
  }

  const db = initFirebase(config);
  if (!db) {
    onError('Konfigurasi Firebase belum lengkap.');
    return () => {};
  }

  try {
    const docRef = doc(db, 'kita_family_accounts', cleanCode);
    
    currentUnsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as CloudPayload;
          if (data && data.family && Array.isArray(data.transactions)) {
            onUpdate(data);
          }
        }
      },
      (error) => {
        console.error('[CloudSync] Firestore listener error:', error);
        onError(getFriendlyErrorMessage(error));
      }
    );

    return () => {
      if (currentUnsubscribe) {
        currentUnsubscribe();
        currentUnsubscribe = null;
      }
    };
  } catch (err: unknown) {
    onError(getFriendlyErrorMessage(err));
    return () => {};
  }
}

/**
 * Push current local state to Cloud Firestore
 */
export async function pushToCloud(
  syncCode: string,
  config: Partial<CloudSyncConfig>,
  payload: CloudPayload
): Promise<{ success: boolean; error?: string }> {
  const cleanCode = syncCode.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, error: 'Kode sinkronisasi kosong' };
  }

  const db = initFirebase(config);
  if (!db) {
    return {
      success: false,
      error: 'Firebase belum dikonfigurasi. Lengkapi Project ID di Pengaturan Sinkronisasi.',
    };
  }

  try {
    const docRef = doc(db, 'kita_family_accounts', cleanCode);
    await setDoc(docRef, {
      ...payload,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return { success: true };
  } catch (err: unknown) {
    console.error('[CloudSync] Failed to push to cloud:', err);
    return { success: false, error: getFriendlyErrorMessage(err) };
  }
}

/**
 * Fetch initial remote data once
 */
export async function fetchRemoteOnce(
  syncCode: string,
  config: Partial<CloudSyncConfig>
): Promise<{ success: boolean; data?: CloudPayload; error?: string }> {
  const cleanCode = syncCode.trim().toUpperCase();
  if (!cleanCode) return { success: false, error: 'Kode sinkronisasi kosong' };

  const db = initFirebase(config);
  if (!db) return { success: false, error: 'Firebase belum terhubung' };

  try {
    const docRef = doc(db, 'kita_family_accounts', cleanCode);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { success: true, data: snap.data() as CloudPayload };
    }
    return { success: true, data: undefined };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error?.message || 'Gagal mengambil data cloud' };
  }
}

/**
 * Generate a clean, human-friendly 6-character sync code
 */
export function generateRandomSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'KITA-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
