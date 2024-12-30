// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZdtYwBtS6KOBywPUF5u7CFeOOAk6fbYE",
  authDomain: "baby-care-c86dc.firebaseapp.com",
  projectId: "baby-care-c86dc",
  storageBucket: "baby-care-c86dc.firebasestorage.app",
  messagingSenderId: "960141309397",
  appId: "1:960141309397:web:5912c14f8208419f1b795c",
  measurementId: "G-6NM98PEQCK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const db = getFirestore(app, "baby-care")
export const storage = getStorage()
