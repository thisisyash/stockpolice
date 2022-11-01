import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:  process.env.REACT_APP_FIREBASE_API,
  authDomain: "stock-police.firebaseapp.com",
  projectId: "stock-police",
  storageBucket: "stock-police.appspot.com",
  messagingSenderId: "764980616620",
  appId: "1:764980616620:web:fd490efb3b45c830ccee09",
  measurementId: "G-MLXCQYM9EZ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
const analytics = getAnalytics(app);
export const auth = getAuth();