import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBym4l2GY8iqF7gvxAdFGUWR56FrjIuiW0",
  authDomain: "business-f60db.firebaseapp.com",
  projectId: "business-f60db",
  storageBucket: "business-f60db.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "484904888129",
  appId: "1:484904888129:web:e223972a4d8b34d59ca3c0",
  measurementId: "G-JW2NJYN94C",
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Add storage initialization

export { auth, db, storage };
