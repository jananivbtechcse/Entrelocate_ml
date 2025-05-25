
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBym4l2GY8iqF7gvxAdFGUWR56FrjIuiW0",
  authDomain: "business-f60db.firebaseapp.com",
  projectId: "business-f60db",
  storageBucket: "business-f60db.appspot.com",
  messagingSenderId: "484904888129",
  appId: "1:484904888129:web:e223972a4d8b34d59ca3c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export{app, auth , db};

