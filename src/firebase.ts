import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyAJJWvGq9D6N-JSOUBqu4lNugepka2L8F4",
  authDomain: "wmaproject-1b5be.firebaseapp.com",
  projectId: "wmaproject-1b5be",
  storageBucket: "wmaproject-1b5be.firebasestorage.app",
  messagingSenderId: "763568580582",
  appId: "1:763568580582:web:557e43cba2e0258de3d827",
  measurementId: "G-WXQDBW0GSC"
};

// Initialize Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Initialize analytics safely if in supported browser environment
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics init error in non-browser context
  });
}

/**
 * Uploads an image file to Firebase Storage bucket and retrieves the public download URL
 * @param file The file picked by user
 * @param folder Subfolder inside Firebase Storage (default: 'items')
 * @returns Direct Firebase Storage download URL
 */
export async function uploadFileToFirebaseStorage(
  file: File,
  folder = 'items'
): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${folder}/${timestamp}_${safeName}`;
  const fileRef = ref(storage, path);

  const snapshot = await uploadBytes(fileRef, file, {
    contentType: file.type || 'image/jpeg',
  });

  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}
