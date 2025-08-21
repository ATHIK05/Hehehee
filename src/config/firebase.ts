// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUQ_CS0EFp6aVoT5BBfStbVC8gYTsIrFg",
  authDomain: "threeidiots-3720d.firebaseapp.com",
  projectId: "threeidiots-3720d",
  storageBucket: "threeidiots-3720d.firebasestorage.app",
  messagingSenderId: "453436512422",
  appId: "1:453436512422:web:7f3bf7bdc7d15698c63c67"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;