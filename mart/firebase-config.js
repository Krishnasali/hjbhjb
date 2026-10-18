// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgSy8QoaCOv_YQR31MLjEawq2-iMOjhy4",
  authDomain: "vegatable-mart.firebaseapp.com",
  projectId: "vegatable-mart",
  storageBucket: "vegatable-mart.firebasestorage.app",
  messagingSenderId: "897909707635",
  appId: "1:897909707635:web:42a622bfc8b487fb4fab06",
  measurementId: "G-6ER03N6PQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics };
