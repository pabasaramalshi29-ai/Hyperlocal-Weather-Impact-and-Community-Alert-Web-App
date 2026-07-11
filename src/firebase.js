// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAvhVli99RFMX2TIQmOKx2bvvuey5YQK3Y",
  authDomain: "hyperweather-app.firebaseapp.com",
  projectId: "hyperweather-app",
  storageBucket: "hyperweather-app.firebasestorage.app",
  messagingSenderId: "977088441654",
  appId: "1:977088441654:web:193a766fb2e636908b1797",
  measurementId: "G-BM0ZRVNWGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);



// Export Firestore Database 
export const db = getFirestore(app);

