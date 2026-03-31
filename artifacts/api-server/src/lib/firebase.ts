import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBb0ssorwU3D0o3b5d8iyPeztOeSm9XRAw",
  authDomain:
    process.env.FIREBASE_AUTH_DOMAIN ||
    "tropicolors2-67b4a.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "tropicolors2-67b4a",
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET ||
    "tropicolors2-67b4a.firebasestorage.app",
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID || "852040451448",
  appId:
    process.env.FIREBASE_APP_ID ||
    "1:852040451448:web:95fd3fcf5784d8dcadb48d",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
