import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
// Importamos el listener de Firebase que detecta si el usuario está logueado o no
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/data/firebaseconfig"; 

// Importación de todas las pantallas de la aplicación
import Home from "./src/components/screen/home";
import Login from "./src/components/screen/login";
import Register from "./src/components/screen/register";
import Services from "./src/components/screen/services";
import Confirmacion from "./src/components/screen/confirmacion";
import Agendar from "./src/components/screen/agendar";
import MisTurnos from "./src/components/screen/misTurnos";
import ForgotPassword from "./src/components/screen/forgotPassword";
import AdminPanel from "./src/components/screen/adminPanel";

// Inicializamos el Stack Navigator (define cómo se navega entre pantallas)
const Stack = createNativeStackNavigator();

export default function App() {
  // Estado 'user': Guardará el objeto del usuario si está logueado, o null si no
  const [user, setUser] = useState(null);
  // Estado 'loading': Evita parpadeos en la UI mientras Firebase verifica la sesión
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged es un listener en tiempo real. 
    // Se ejecuta cada vez que el estado de autenticación cambia (login, logout, reinicio de app).
    const unsubscribe = onAuthStateChanged(auth, (usuarioActual) => {
      setUser(usuarioActual); // Guardamos al usuario en el estado
      setLoading(false);      // Una vez verificado, quitamos el cargando
    });

    // Importante: al desmontar el componente, desuscribimos el listener para liberar memoria
    return () => unsubscribe();
  }, []);

  // Si aún estamos verificando la sesión con Firebase, mostramos un spinner de carga
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#16132b" }}>
        <ActivityIndicator size="large" color="#FF2DA0" />
      </View>
    );
  }

  // --- RENDERIZADO DEL NAVEGADOR ---
  return (
    <NavigationContainer>
      {/* Definimos las rutas. 
        Aquí aplicamos la LÓGICA DE PROTECCIÓN DE RUTAS:
        Si 'user' existe (está logueado), mostramos el flujo interno (Home, Agendar, etc).
        Si 'user' es null, mostramos el flujo de autenticación (Login, Registro, Recuperar).
      */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // --- RUTA PROTEGIDA (Solo usuarios logueados) ---
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Services" component={Services} />
            <Stack.Screen name="Agendar" component={Agendar} />
            <Stack.Screen name="Confirmacion" component={Confirmacion} />
            <Stack.Screen name="MisTurnos" component={MisTurnos} />
            <Stack.Screen name="AdminPanel" component={AdminPanel} />
          </>
        ) : (
          // --- RUTA PÚBLICA (Solo usuarios no logueados) ---
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="Register" component={Register} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}