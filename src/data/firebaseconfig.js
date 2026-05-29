import { initializeApp } from "firebase/app"; // Importa la función base para conectar con el proyecto de Firebase
import { getFirestore } from "firebase/firestore"; // Importa el servicio de base de datos NoSQL (Firestore)
import { initializeAuth, getReactNativePersistence, browserLocalPersistence } from "firebase/auth"; // Importa los servicios de Auth y la lógica de persistencia
import AsyncStorage from "@react-native-async-storage/async-storage"; // Almacenamiento local (la "memoria" del móvil para el login)
import { Platform } from "react-native"; // Utilidad para detectar si la app corre en Web, iOS o Android

// Objeto de configuración: Contiene las credenciales únicas de tu proyecto en la consola de Firebase.
// Nota: En Firebase, esta API Key es pública por diseño; la seguridad real depende de las "Rules" (reglas) en la consola de Firebase.
export const firebaseConfig = {
  apiKey: "AIzaSyCa2njj0xX0pEMsPY76xvE2na2ukKfKPr0",
  authDomain: "turnosapp-f338a.firebaseapp.com",
  projectId: "turnosapp-f338a",
  storageBucket: "turnosapp-f338a.firebasestorage.app",
  messagingSenderId: "945479063940",
  appId: "1:945479063940:web:4f2d42d7269d6b8633a5d1"
};

// Inicializa la conexión con Firebase usando los datos de arriba
const app = initializeApp(firebaseConfig);

/**
 * CONFIGURACIÓN DE PERSISTENCIA
 * Esta lógica es fundamental: define dónde se guarda la sesión del usuario.
 * - Si es Web: usa 'browserLocalPersistence' (Cookies/LocalStorage).
 * - Si es móvil: usa 'AsyncStorage' para que la sesión sobreviva al cerrar la app.
 */
export const auth = initializeAuth(app, {
  persistence: Platform.OS === "web" ? browserLocalPersistence : getReactNativePersistence(AsyncStorage)
});

// Exportamos la instancia de la base de datos para usarla en todos tus archivos (import db from ...)
export const db = getFirestore(app);