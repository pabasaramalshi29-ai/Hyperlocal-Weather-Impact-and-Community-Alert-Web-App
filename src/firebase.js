// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//  Firebase Configuration 
const firebaseConfig = {
  apiKey: "AIzaSyBuBwo4fMVjzDGw6kA5faJl7dF5RcNbuVE",
  authDomain: "hyperweather-696c8.firebaseapp.com",
  projectId: "hyperweather-696c8",
  storageBucket: "hyperweather-696c8.firebasestorage.app",
  messagingSenderId: "307932801473",
  appId: "1:307932801473:web:ca44b2400753ff40d12740",
  measurementId: "G-BM0ZRVNWGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);



// Export Firestore Database 
export const db = getFirestore(app);

