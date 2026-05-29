import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// IMPORTANTE: Traemos Platform para detectar si estamos en web o móvil
import { Platform } from "react-native";

export const firebaseConfig = {
  apiKey: "AIzaSyCa2njj0xX0pEMsPY76xvE2na2ukKfKPr0",
  authDomain: "turnosapp-f338a.firebaseapp.com",
  projectId: "turnosapp-f338a",
  storageBucket: "turnosapp-f338a.firebasestorage.app",
  messagingSenderId: "945479063940",
  appId: "1:945479063940:web:4f2d42d7269d6b8633a5d1"
};

const app = initializeApp(firebaseConfig);

// Lógica condicional: Detecta automáticamente el entorno
export const auth = initializeAuth(app, {
  persistence: Platform.OS === "web" ? browserLocalPersistence : getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);