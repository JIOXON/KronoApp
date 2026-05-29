import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
// Importamos la función de Firebase Auth para solicitar el cambio de contraseña
import { sendPasswordResetEmail } from "firebase/auth";
// Importamos funciones de Firestore para verificar si el usuario existe antes de intentar el reset
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../data/firebaseconfig";
import { Logo, ButtonGradient, BackgroundWaves, fpStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export default function ForgotPassword({ navigation }) {
  // Estado para el campo de email ingresado por el usuario
  const [email, setEmail] = useState("");
  // Estado para manejar el estado de carga (evita múltiples clics y muestra feedback)
  const [loading, setLoading] = useState(false);

  // Lógica principal para validar el correo y solicitar el cambio de contraseña
  const handleResetPassword = async () => {
    // Normalizamos el correo: convertimos a minúsculas y eliminamos espacios accidentales al inicio/final
    const cleanEmail = email.toLowerCase().trim();
    
    // Validación de entrada: no permitir envío vacío
    if (!cleanEmail) {
      showAlert("Atención", "no-email");
      return;
    }

    setLoading(true); // Iniciamos el estado de carga (bloqueamos el botón con UI)
    try {
      // --- PASO 1: VALIDACIÓN DE EXISTENCIA ---
      // Antes de llamar al servicio de Firebase Auth, verificamos en nuestra DB si el usuario existe.
      // Esto nos permite mostrar un error personalizado más amigable si el usuario no está registrado.
      const q = query(collection(db, "usuarios"), where("email", "==", cleanEmail));
      const querySnapshot = await getDocs(q);

      // Si la consulta no devuelve documentos, el email no está en nuestra colección "usuarios"
      if (querySnapshot.empty) {
        setLoading(false);
        showAlert("Error", "auth/user-not-found");
        return;
      }

      // --- PASO 2: DISPARAR CORREO ---
      // Si existe, solicitamos a Firebase Auth que envíe el email oficial de recuperación
      await sendPasswordResetEmail(auth, cleanEmail);
      
      setLoading(false); // Detenemos la carga tras éxito
      // Notificamos al usuario y, al aceptar la alerta, lo redirigimos al Login
      showAlert("Correo enviado", "reset-sent", () => navigation.navigate("Login"));
      
    } catch (error) {
      setLoading(false); // Detenemos carga en caso de error
      // Mostramos un error genérico o el código específico de Firebase (ej: límites de cuota)
      showAlert("Error", error.code || "generic-error");
    }
  };

  return (
    // Contenedor principal con fondo degradado y ondas animadas
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={fpStyles.mainContainer}>
      <BackgroundWaves />
      <View style={fpStyles.contentContainer}>
        
        {/* Botón de retorno manual hacia atrás */}
        <TouchableOpacity style={fpStyles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <Logo size={100} />
        <Text style={fpStyles.title}>Recuperar Cuenta</Text>
        <Text style={fpStyles.subTitle}>Validaremos tu correo antes de enviarte el enlace.</Text>
        
        {/* Campo de entrada para el email */}
        <View style={fpStyles.inputWrapper}>
          <Feather name="mail" size={20} color="#FF6B8A" style={fpStyles.iconLeft} />
          <TextInput
            onChangeText={setEmail} // Actualizamos el estado "email" en cada tecleo
            value={email}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#64748B"
            style={fpStyles.input}
            autoCapitalize="none" // Importante: el email siempre debe ser minúsculas
            keyboardType="email-address" // Optimización UX: teclado con símbolo @ visible
          />
        </View>
        
        {/* Renderizado condicional: si está cargando, mostramos spinner; si no, el botón de acción */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF2DA0" />
        ) : (
          <ButtonGradient text="Validar y Enviar" onPress={handleResetPassword} width="100%" height={55} />
        )}
      </View>
    </LinearGradient>
  );
}