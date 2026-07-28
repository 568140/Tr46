import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD7unLBRol7TacRbiDF2WJMnmk84n5W02c",
  authDomain: "master-carport-g71nt.firebaseapp.com",
  projectId: "master-carport-g71nt",
  storageBucket: "master-carport-g71nt.firebasestorage.app",
  messagingSenderId: "731432445526",
  appId: "1:731432445526:web:f698b6f50b497cf99f3df7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom database ID provided in config
export const db = getFirestore(app, "ai-studio-almayarstar-5ed4c43b-62e6-4c2d-92f3-addc192e9729");

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);
