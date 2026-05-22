import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { Logo, ButtonGradient, BackgroundWaves, registerStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { auth, db } from "../../data/firebaseconfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export default function Register({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        email: email.toLowerCase().trim(),
        uid: user.uid,
        rol:"usuario",
        creadoEn: new Date(),
      });

      setLoading(false);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      setLoading(false);
      showAlert("Error", error.code);
    }
  };

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={registerStyles.mainContainer}>
      <BackgroundWaves />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={registerStyles.keyboardView}>
        <ScrollView 
          contentContainerStyle={registerStyles.scrollGrow}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={registerStyles.contentContainer}>
            <Logo size={100} />
            <Text style={registerStyles.title}>KronoApp</Text>
            <Text style={registerStyles.subTitle}>Registrar su cuenta</Text>

            <View style={registerStyles.inputWrapper}>
              <Feather name="mail" size={20} color="#FF6B8A" style={registerStyles.iconLeft} />
              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#64748B"
                style={registerStyles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={registerStyles.inputWrapper}>
              <Feather name="lock" size={20} color="#FF6B8A" style={registerStyles.iconLeft} />
              <TextInput
                onChangeText={setPassword}
                value={password}
                placeholder="Contraseña"
                placeholderTextColor="#64748B"
                secureTextEntry={!showPassword}
                style={registerStyles.input}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={registerStyles.inputWrapper}>
              <Feather name="lock" size={20} color="#FF6B8A" style={registerStyles.iconLeft} />
              <TextInput
                onChangeText={setRepeatPassword}
                value={repeatPassword}
                placeholder="Repetir Contraseña"
                placeholderTextColor="#64748B"
                secureTextEntry={!showPassword}
                style={registerStyles.input}
              />
            </View>

            <View style={registerStyles.loaderWrapper}>
              {loading ? (
                <ActivityIndicator size="large" color="#FF2DA0" />
              ) : (
                <ButtonGradient text="Registrarse" onPress={handleCreateAccount} width="100%" height={55} />
              )}
            </View>

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