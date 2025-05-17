
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyC6bdDlfMOk99te_Am0VwBHjpKE-TSOYHg",
  authDomain: "portfolio-b4af2.firebaseapp.com",
  projectId: "portfolio-b4af2",
  storageBucket: "portfolio-b4af2.appspot.com",
  messagingSenderId: "146751225752",
  appId: "1:146751225752:web:09b35a33e6d5e7667975ed",
  measurementId: "G-Q1QG9LSKXY"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

