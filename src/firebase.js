// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

export const db = getFirestore(app);