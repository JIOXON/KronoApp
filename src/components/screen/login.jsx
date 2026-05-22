import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { Logo, ButtonGradient, BackgroundWaves, loginStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons"; 

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const auth = getAuth();

  const handleSignIn = () => {
    if (!email || !password) {
      showAlert("Atención", "empty-fields");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      })
      .catch((error) => {
        showAlert("Error", error.code);
      });
  };

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={loginStyles.mainContainer}>
      <BackgroundWaves />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={loginStyles.keyboardView}>
        <ScrollView 
          contentContainerStyle={loginStyles.scrollGrow}
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >
          <View style={loginStyles.contentContainer}>
            <Logo size={110} />
            <Text style={loginStyles.title}>KronoApp</Text>
            <Text style={loginStyles.subTitle}>Bienvenido de nuevo</Text>

            <View style={loginStyles.inputWrapper}>
              <Feather name="mail" size={20} color="#FF6B8A" style={loginStyles.iconLeft} />
              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="nombre@ejemplo.com"
                placeholderTextColor="#64748B"
                style={loginStyles.input}
                autoCapitalize="none"
              />
            </View>

            <View style={loginStyles.inputWrapper}>
              <Feather name="lock" size={20} color="#FF6B8A" style={loginStyles.iconLeft} />
              <TextInput
                onChangeText={setPassword}
                value={password}
                placeholder="Contraseña"
                placeholderTextColor="#64748B"
                secureTextEntry={!showPassword}
                style={loginStyles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={loginStyles.forgotPasswordContainer} onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={loginStyles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <ButtonGradient text="Ingresar" onPress={handleSignIn} width="100%" height={55} />

            <View style={loginStyles.dividerContainer}>
              <View style={loginStyles.line} />
              <Text style={loginStyles.dividerText}>o</Text>
              <View style={loginStyles.line} />
            </View>

            <TouchableOpacity style={loginStyles.registerButtonWrapper} onPress={() => navigation.navigate("Register")} activeOpacity={0.7}>
              <LinearGradient colors={["#FFA94D", "#FF2DA0"]} style={loginStyles.outlineButtonBorder}>
                <View style={loginStyles.outlineButtonInner}>
                  <Text style={loginStyles.outlineButtonText}>Registrarse</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={loginStyles.footerText}>
              Al continuar, aceptas nuestros{"\n"}
              <Text style={loginStyles.footerLink} onPress={() => showAlert("KronoApp", "terms")}>
                Términos y Condiciones
              </Text>{" "}
              y{" "}
              <Text style={loginStyles.footerLink} onPress={() => showAlert("KronoApp", "privacy")}>
                Política de Privacidad.
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}