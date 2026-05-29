import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { Logo, ButtonGradient, BackgroundWaves, registerStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { auth, db } from "../../data/firebaseconfig"; // Configuración de Firebase
import { createUserWithEmailAndPassword } from "firebase/auth"; // Función para crear usuarios en Auth
import { doc, setDoc } from "firebase/firestore"; // Funciones para crear el documento en Firestore
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

// Librerías para manejar notificaciones Push
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configuración global para el manejo de notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

/**
 * Función para solicitar permisos y obtener el Token de Expo.
 * Es crucial llamarla durante el registro para que el usuario reciba notificaciones desde el primer día.
 */
async function registerForPushNotificationsAsync() {
  // Las notificaciones requieren un dispositivo físico (no funcionan en web o simuladores estándar)
  if (__DEV__ || Platform.OS === 'web') {
    console.log("Notificaciones omitidas en modo desarrollo o web");
    return null;
  }
  try {
    if (!Device.isDevice) return null; // Salir si no es un dispositivo físico
    
    // Verificación y solicitud de permisos
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    // Si el usuario denegó el permiso, no podemos obtener el token
    if (finalStatus !== 'granted') return null;

    // Obtención del token de Expo (requiere un projectId configurado en app.json)
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "tu-project-id" 
    });
    return tokenData.data;
  } catch (error) {
    return null; // Silenciamos errores para no romper el registro
  }
}

export default function Register({ navigation }) {
  // Estados para capturar los datos del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle para mostrar/ocultar contraseñas
  const [loading, setLoading] = useState(false); // Estado para mostrar el loader durante el proceso

  // Lógica de registro
  const handleCreateAccount = async () => {
    // 1. Validaciones básicas antes de tocar Firebase
    if (!email || !password || !repeatPassword) {
      showAlert("Atención", "empty-fields");
      return;
    }
    if (password !== repeatPassword) {
      showAlert("Error", "passwords-dont-match");
      return;
    }

    setLoading(true);
    try {
      // 2. Crear usuario en Firebase Auth (se crea el usuario pero no su perfil en la base de datos aún)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 3. Obtenemos el token de notificaciones (si el dispositivo lo permite)
      const pushToken = await registerForPushNotificationsAsync();

      // 4. Creamos el perfil del usuario en Firestore (la base de datos) usando su mismo UID
      // Aquí guardamos datos extra como el correo normalizado y el token de notificaciones
      await setDoc(doc(db, "usuarios", user.uid), {
        email: email.toLowerCase().trim(),
        uid: user.uid,
        creadoEn: new Date(),
        expoPushToken: pushToken || null, // Guardamos el token para poder enviarle notificaciones luego
      });

      setLoading(false);
      // Redirección exitosa: reset eliminando el stack de navegación para que el usuario no vuelva al registro
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      setLoading(false);
      showAlert("Error", error.code); // Mostramos el error devuelto por Firebase (ej: auth/email-already-in-use)
    }
  };

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={registerStyles.mainContainer}>
      <BackgroundWaves />
      {/* KeyboardAvoidingView es vital: evita que el teclado oculte los inputs */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={registerStyles.keyboardView}>
        
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} 
          keyboardShouldPersistTaps="handled" // Permite cerrar el teclado al tocar fuera de los inputs
          showsVerticalScrollIndicator={false}
        >
          <View style={[registerStyles.contentContainer, { width: "100%", flex: 0, justifyContent: "center" }]}>
            <Logo size={100} />
            <Text style={registerStyles.title}>KronoApp</Text>
            <Text style={registerStyles.subTitle}>Registrar su cuenta</Text>

            {/* Input Email */}
            <View style={registerStyles.inputWrapper}>
              <Feather name="mail" size={20} color="#FF6B8A" style={registerStyles.iconLeft} />
              <TextInput onChangeText={setEmail} value={email} placeholder="correo@ejemplo.com" placeholderTextColor="#64748B" style={registerStyles.input} autoCapitalize="none" keyboardType="email-address" />
            </View>

            {/* Input Contraseña */}
            <View style={registerStyles.inputWrapper}>
              <Feather name="lock" size={20} color="#FF6B8A" style={registerStyles.iconLeft} />
              <TextInput onChangeText={setPassword} value={password} placeholder="Contraseña" placeholderTextColor="#64748B" secureTextEntry={!showPassword} style={registerStyles.input} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Input Repetir Contraseña */}
            <View style={registerStyles.inputWrapper}>
              <Feather name="lock" size={20} color="#FF6B8A" style={registerStyles.iconLeft} />
              <TextInput onChangeText={setRepeatPassword} value={repeatPassword} placeholder="Repetir Contraseña" placeholderTextColor="#64748B" secureTextEntry={!showPassword} style={registerStyles.input} />
            </View>

            {/* Botón de registro o loader */}
            <View style={{ width: "100%", marginTop: 15, alignItems: "center" }}>
              {loading ? (
                <ActivityIndicator size="large" color="#FF2DA0" />
              ) : (
                <ButtonGradient text="Registrarse" onPress={handleCreateAccount} width="100%" height={55} />
              )}
            </View>

            {/* Link a Iniciar Sesión */}
            <View style={registerStyles.footerContainer}>
              <Text style={registerStyles.footerText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={registerStyles.loginLinkText}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}