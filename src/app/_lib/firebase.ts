// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

// Gunakan interface untuk environment config agar tipe aman
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

// Ambil dari environment variables (Next.js best practice)
const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyCQBk5K-aGOHLtCChZZmaAmAJ4QYPinsCM",
  authDomain: "tuntas-perda-perbup.firebaseapp.com",
  projectId: "tuntas-perda-perbup",
  storageBucket: "tuntas-perda-perbup.firebasestorage.app",
  messagingSenderId: "131753160803",
  appId: "1:131753160803:web:d9f2c41e373873dbfd8856",
  measurementId: "G-PY2J3ZPVZ7",
};

// Pastikan Firebase tidak diinisialisasi lebih dari sekali
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// Export Firestore
export const db: Firestore = getFirestore(app);
export default app;
