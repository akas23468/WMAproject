import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported, logEvent, Analytics } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { Item } from './types';

// Firebase configuration loaded safely from environment variables (no hardcoded secrets)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

// Check if valid Firebase configuration is present
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Initialize Firebase Core & Services safely
export const app = isFirebaseConfigured
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const storage = app ? getStorage(app) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;

// Safe Analytics Instance
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined' && app && firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported && app) {
        analyticsInstance = getAnalytics(app);
        logEvent(analyticsInstance, 'page_view', {
          page_title: 'CampusFind Portal',
          page_location: window.location.href,
        });
      }
    })
    .catch(() => {
      // Analytics not supported
    });
}

/**
 * Log an event to Firebase Analytics
 */
export function trackAnalyticsEvent(eventName: string, params?: Record<string, unknown>) {
  if (analyticsInstance) {
    try {
      logEvent(analyticsInstance, eventName, params);
    } catch (e) {
      console.warn('Analytics event error:', e);
    }
  }
}

/**
 * Uploads an image file to Firebase Storage bucket and retrieves the public download URL
 */
export async function uploadFileToFirebaseStorage(
  file: File,
  folder = 'items'
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not configured. Set VITE_FIREBASE_STORAGE_BUCKET.');
  }
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${timestamp}_${safeName}`;
  const fileRef = ref(storage, path);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type || 'image/jpeg',
  });

  const downloadURL = await getDownloadURL(snapshot.ref);

  // Track event in Firebase Analytics
  trackAnalyticsEvent('image_uploaded_to_storage', {
    file_name: safeName,
    file_size: file.size,
  });

  return downloadURL;
}

/**
 * Save an item document directly to Cloud Firestore in collection 'items'
 */
export async function saveItemToFirestore(item: Item): Promise<void> {
  if (!db) return;
  try {
    const itemRef = doc(db, 'items', item.id);
    await setDoc(itemRef, {
      ...item,
      syncedAt: new Date().toISOString(),
    }, { merge: true });

    trackAnalyticsEvent('item_saved_firestore', {
      item_name: item.name,
      category: item.category,
      status: item.status,
    });
  } catch (err) {
    console.warn('Firestore write notice (check Firestore security rules if restricted):', err);
  }
}

/**
 * Fetch all items directly from Cloud Firestore collection 'items'
 */
export async function fetchItemsFromFirestore(): Promise<Item[]> {
  if (!db) return [];
  try {
    const itemsCol = collection(db, 'items');
    const snapshot = await getDocs(itemsCol);
    const items: Item[] = [];
    snapshot.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as Item);
    });
    return items;
  } catch (err) {
    console.warn('Firestore read notice:', err);
    return [];
  }
}

/**
 * Update an item in Cloud Firestore
 */
export async function updateItemInFirestore(id: string, updates: Partial<Item>): Promise<void> {
  if (!db) return;
  try {
    const itemRef = doc(db, 'items', id);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore update notice:', err);
  }
}

/**
 * Delete an item from Cloud Firestore
 */
export async function deleteItemFromFirestore(id: string): Promise<void> {
  if (!db) return;
  try {
    const itemRef = doc(db, 'items', id);
    await deleteDoc(itemRef);
  } catch (err) {
    console.warn('Firestore delete notice:', err);
  }
}
