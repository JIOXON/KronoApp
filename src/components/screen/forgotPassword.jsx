import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../data/firebaseconfig";
import { Logo, ButtonGradient, BackgroundWaves, fpStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      showAlert("Atención", "no-email");
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, "usuarios"), where("email", "==", cleanEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setLoading(false);
        showAlert("Error", "auth/user-not-found");
        return;
      }

      await sendPasswordResetEmail(auth, cleanEmail);
      setLoading(false);
      showAlert("Correo enviado", "reset-sent", () => navigation.navigate("Login"));
    } catch (error) {
      setLoading(false);
      showAlert("Error", error.code || "generic-error");
    }
  };

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={fpStyles.mainContainer}>
      <BackgroundWaves />
      <View style={fpStyles.contentContainer}>
        <TouchableOpacity style={fpStyles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <Logo size={100} />
        <Text style={fpStyles.title}>Recuperar Cuenta</Text>
        <Text style={fpStyles.subTitle}>Validaremos tu correo antes de enviarte el enlace.</Text>
        
        <View style={fpStyles.inputWrapper}>
          <Feather name="mail" size={20} color="#FF6B8A" style={fpStyles.iconLeft} />
          <TextInput
            onChangeText={setEmail}
            value={email}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#64748B"
            style={fpStyles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#FF2DA0" />
        ) : (
          <ButtonGradient text="Validar y Enviar" onPress={handleResetPassword} width="100%" height={55} />
        )}
      </View>
    </LinearGradient>
  );
}