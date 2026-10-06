const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let isRealFirebase = false;

function initializeFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.resolve(__dirname, '../../serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    console.log(`[Firebase Admin] Loading credentials from file: ${serviceAccountPath}`);
    const serviceAccount = require(serviceAccountPath);
    isRealFirebase = true;
    return initializeApp({
      credential: cert(serviceAccount)
    });
  }

  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    console.log('[Firebase Admin] Loading credentials from environment variables.');
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    isRealFirebase = true;
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      })
    });
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'campus-lost-found-app';
  console.log(`[Firebase Admin] Initializing in mock mode for local dev (Project ID: ${projectId}). Provide serviceAccountKey.json for live Firestore sync.`);
  return initializeApp({
    projectId: projectId
  });
}

const app = initializeFirebaseApp();
let db;
let auth;

if (isRealFirebase) {
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  // Safe mock db that throws controlled errors so itemController falls back cleanly to in-memory store
  db = {
    collection: () => ({
      where: () => ({ where: () => ({ get: async () => { throw new Error('Mock mode - no GCP credentials'); } }), get: async () => { throw new Error('Mock mode - no GCP credentials'); } }),
      get: async () => { throw new Error('Mock mode - no GCP credentials'); },
      doc: () => ({
        get: async () => { throw new Error('Mock mode - no GCP credentials'); },
        update: async () => { throw new Error('Mock mode - no GCP credentials'); },
        delete: async () => { throw new Error('Mock mode - no GCP credentials'); }
      }),
      add: async () => { throw new Error('Mock mode - no GCP credentials'); }
    })
  };
  auth = {
    verifyIdToken: async (token) => {
      throw new Error('Mock mode - no GCP credentials');
    }
  };
}

module.exports = { app, db, auth, isRealFirebase };
