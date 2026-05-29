import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";

// IMPORTANTE: Verifica que esta ruta apunte correctamente a tu archivo de configuración.
// Si tu carpeta "data" no está dentro de "src", quita el "src/" de la ruta.
import { auth } from "./src/data/firebaseconfig"; 
import Home from "./src/components/screen/home";
import Login from "./src/components/screen/login";
import Register from "./src/components/screen/register";
import Services from "./src/components/screen/services";
import Confirmacion from "./src/components/screen/confirmacion";
import Agendar from "./src/components/screen/agendar";
import MisTurnos from "./src/components/screen/misTurnos";
import ForgotPassword from "./src/components/screen/forgotPassword";
import AdminPanel from "./src/components/screen/adminPanel";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Este vigilante revisa si hay una sesión guardada en el teléfono
    const unsubscribe = onAuthStateChanged(auth, (usuarioActual) => {
      setUser(usuarioActual);
      setLoading(false); // Apagamos la pantalla de carga cuando Firebase responde
    });

    return () => unsubscribe();
  }, []);

  // Mientras verificamos la sesión, mostramos una pantalla de carga oscura con el estilo de tu app
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#16132b" }}>
        <ActivityIndicator size="large" color="#FF2DA0" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Si el usuario tiene sesión, SOLAMENTE existen estas pantallas para él
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Services" component={Services} />
            <Stack.Screen name="Agendar" component={Agendar} />
            <Stack.Screen name="Confirmacion" component={Confirmacion} />
            <Stack.Screen name="MisTurnos" component={MisTurnos} />
            <Stack.Screen name="AdminPanel" component={AdminPanel} />
          </>
        ) : (
          // Si NO tiene sesión iniciada, lo mantenemos atrapado en el Login/Registro
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