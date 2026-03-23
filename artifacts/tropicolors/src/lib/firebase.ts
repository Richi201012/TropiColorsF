import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBb0ssorwU3D0o3b5d8iyPeztOeSm9XRAw",
  authDomain: "tropicolors2-67b4a.firebaseapp.com",
  projectId: "tropicolors2-67b4a",
  storageBucket: "tropicolors2-67b4a.firebasestorage.app",
  messagingSenderId: "852040451448",
  appId: "1:852040451448:web:95fd3fcf5784d8dcadb48d",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
