import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQBk5K-aGOHLtCChZZmaAmAJ4QYPinsCM",
  authDomain: "tuntas-perda-perbup.firebaseapp.com",
  projectId: "tuntas-perda-perbup",
  storageBucket: "tuntas-perda-perbup.firebasestorage.app",
  messagingSenderId: "131753160803",
  appId: "1:131753160803:web:d9f2c41e373873dbfd8856",
  measurementId: "G-PY2J3ZPVZ7",
};

// Fungsi helper untuk ambil instance tunggal
const getFirebaseApp = (): FirebaseApp => {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
};

export const app = getFirebaseApp();
export const db: Firestore = getFirestore(app);
