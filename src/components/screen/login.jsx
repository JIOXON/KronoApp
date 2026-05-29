import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { Logo, ButtonGradient, BackgroundWaves, loginStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../data/firebaseconfig";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons"; 

// Importaciones necesarias para manejar notificaciones Push
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Configura cómo deben aparecer las notificaciones cuando la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

// Función para obtener el permiso y token del dispositivo para enviar notificaciones Push
async function registerForPushNotificationsAsync() {
  // Las notificaciones no funcionan bien en Web o en entorno de desarrollo (o en simuladores sin configurar)
  if (__DEV__ || Platform.OS === 'web') {
    console.log("Notificaciones omitidas (Entorno Web o Desarrollo)");
    return null;
  }

  try {
    // Las notificaciones solo funcionan en dispositivos físicos reales
    if (!Device.isDevice) return null;

    // Verificar permisos actuales
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Si no tenemos permisos, los solicitamos al usuario
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Si el usuario denegó los permisos, salimos
    if (finalStatus !== 'granted') return null;

    // Obtenemos el token único de Expo para este dispositivo (asegúrate de tener el projectId correcto en app.json)
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "tu-project-id" 
    });
    return tokenData.data;
  } catch (error) {
    return null;
  }
}

export default function Login({ navigation }) {
  // Estados locales para manejar los inputs y el estado de la UI
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle para ver/ocultar contraseña
  const [loading, setLoading] = useState(false); // Spinner de carga

  // Función principal para iniciar sesión
  const handleSignIn = async () => {
    // Validación básica antes de intentar conexión
    if (!email || !password) {
      showAlert("Atención", "empty-fields");
      return;
    }

    setLoading(true); // Iniciamos el spinner
    try {
      // 1. Intento de autenticación en Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Registro de notificaciones Push (asociamos el dispositivo a este usuario)
      const pushToken = await registerForPushNotificationsAsync();

      // 3. Guardamos el token en Firestore dentro del documento del usuario para saber a dónde enviar notificaciones después
      if (pushToken) {
        await updateDoc(doc(db, "usuarios", userCredential.user.uid), {
          expoPushToken: pushToken
        });
      }

      setLoading(false);
      // navigation.reset limpia la pila de navegación, evitando que el usuario vuelva al Login con el botón "atrás"
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      setLoading(false);
      showAlert("Error", error.code); // Muestra el error de Firebase (ej: auth/wrong-password)
    }
  };

  return (
  <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={loginStyles.mainContainer}>
    <BackgroundWaves />
    {/* KeyboardAvoidingView ajusta la pantalla para que el teclado no tape los inputs */}
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={loginStyles.keyboardView}
    >
      <ScrollView 
        contentContainerStyle={loginStyles.scrollGrow}
        keyboardShouldPersistTaps="handled" // Cierra el teclado al tocar fuera de los inputs
        showsVerticalScrollIndicator={false}
      >
        <View style={loginStyles.contentContainer}>
          <Logo size={110} />
            <Text style={loginStyles.title}>KronoApp</Text>
            <Text style={loginStyles.subTitle}>Bienvenido de nuevo</Text>

            {/* Input Email */}
            <View style={loginStyles.inputWrapper}>
              <Feather name="mail" size={20} color="#FF6B8A" style={loginStyles.iconLeft} />
              <TextInput onChangeText={setEmail} value={email} placeholder="nombre@ejemplo.com" placeholderTextColor="#64748B" style={loginStyles.input} autoCapitalize="none" />
            </View>

            {/* Input Contraseña */}
            <View style={loginStyles.inputWrapper}>
              <Feather name="lock" size={20} color="#FF6B8A" style={loginStyles.iconLeft} />
              <TextInput onChangeText={setPassword} value={password} placeholder="Contraseña" placeholderTextColor="#64748B" secureTextEntry={!showPassword} style={loginStyles.input} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {/* Botón para alternar visibilidad de contraseña */}
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Navegación a recuperar contraseña */}
            <TouchableOpacity style={loginStyles.forgotPasswordContainer} onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={loginStyles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Botón de ingreso con estado de carga */}
            {loading ? (
              <ActivityIndicator size="large" color="#FF2DA0" />
            ) : (
              <ButtonGradient text="Ingresar" onPress={handleSignIn} width="100%" height={55} />
            )}

            {/* Divisor estético */}
            <View style={loginStyles.dividerContainer}>
              <View style={loginStyles.line} />
              <Text style={loginStyles.dividerText}>o</Text>
              <View style={loginStyles.line} />
            </View>

            {/* Botón de registro (estilo outline con gradiente) */}
            <TouchableOpacity style={{ width: "100%" }} onPress={() => navigation.navigate("Register")} activeOpacity={0.7}>
              <LinearGradient colors={["#FFA94D", "#FF2DA0"]} style={loginStyles.outlineButtonBorder}>
                <View style={loginStyles.outlineButtonInner}>
                  <Text style={loginStyles.outlineButtonText}>Registrarse</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer con Términos y Condiciones */}
            <Text style={loginStyles.footerText}>
              Al continuar, aceptas nuestros{"\n"}
              <Text style={loginStyles.footerLink} onPress={() => showAlert("KronoApp", "terms")}>Términos y Condiciones</Text> y <Text style={loginStyles.footerLink} onPress={() => showAlert("KronoApp", "privacy")}>Política de Privacidad.</Text>
            </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </LinearGradient>
  );
}