import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/components/screen/home";
import Login from "./src/components/screen/login";
import Register from "./src/components/screen/register";
import Services from "./src/components/screen/services";
import Confirmacion from "./src/components/screen/confirmacion";
import Agendar from "./src/components/screen/agendar";
import MisTurnos from "./src/components/screen/misTurnos";
import ForgotPassword from "./src/components/screen/forgotPassword";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Services" component={Services} />
        <Stack.Screen name="Agendar" component={Agendar} />
        <Stack.Screen name="Confirmacion" component={Confirmacion} />
        <Stack.Screen name="MisTurnos" component={MisTurnos} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}