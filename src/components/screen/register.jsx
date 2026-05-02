import React from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import ButtonGradient from "../styles/buttonGradient";
import { styles, Logo, AppBackground } from "../styles/globalStyles";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../data/firebaseconfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Register({ navigation }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const traducirError = (code) => ({"auth/invalid-email":"El correo no es válido","auth/invalid-credential":"Debe usar un dominio de email real","auth/weak-password":"La contraseña debe de ser de almenos 6 caracteres","auth/missing-password":"Digite su contraseña","auth/email-already-in-use":"Este correo ya esta en uso"}[code]);
  const handleCreateAccount = () => createUserWithEmailAndPassword(auth, email, password).then(() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })).catch((error) => Alert.alert("Error", traducirError(error.code)));

  return (
    <AppBackground>
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Logo size={150} />
        <Text style={styles.title}>TurnosApp</Text>
        <Text style={styles.subTitle}>Registrar su cuenta</Text>
        <TextInput onChangeText={setEmail} value={email} placeholder="Tu cuenta@tudominio.com" placeholderTextColor="#9094B2" style={styles.textInput} autoCapitalize="none" />
        <TextInput onChangeText={setPassword} value={password} placeholder="Contraseña" placeholderTextColor="#9094B2" secureTextEntry style={styles.textInput} />
        <ButtonGradient text="Registrarse" onPress={handleCreateAccount} width={"100%"} height={62} />
        <Text style={[styles.subTitle, { marginTop: 22, marginBottom: 8 }]}>¿Ya tienes cuenta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}><Text style={styles.subrayado}>Iniciar Sesión</Text></TouchableOpacity>
      </View>
    </AppBackground>
  );
}
