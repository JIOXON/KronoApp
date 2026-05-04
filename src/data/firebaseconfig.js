import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCa2njj0xX0pEMsPY76xvE2na2ukKfKPr0",
  authDomain: "turnosapp-f338a.firebaseapp.com",
  projectId: "turnosapp-f338a",
  storageBucket: "turnosapp-f338a.firebasestorage.app",
  messagingSenderId: "945479063940",
  appId: "1:945479063940:web:4f2d42d7269d6b8633a5d1"
};

// Inicializamos la App una sola vez
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);