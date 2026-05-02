import React from "react";
import { View, Text, TextInput, Alert } from "react-native";
import ButtonGradient from "../styles/buttonGradient";
import { styles, Logo, AppBackground } from "../styles/globalStyles";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../data/firebaseconfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Login({ navigation }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const traducirError = (code) => ({"auth/invalid-email":"El correo no es válido","auth/invalid-credential":"El usuario no existe o la contraseña es incorrecta","auth/weak-password":"Contraseña incorrecta","auth/missing-password":"Digite su contraseña"}[code]);
  const handleSignIn = () => signInWithEmailAndPassword(auth, email, password).then(() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })).catch((error) => Alert.alert("Error", traducirError(error.code)));

  return (
    <AppBackground>
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Logo size={150} />
        <Text style={styles.title}>TurnosApp</Text>
        <Text style={styles.subTitle}>Bienvenido de nuevo 👋</Text>
        <TextInput onChangeText={setEmail} value={email} placeholder="Tucuenta@Tudominio.com" placeholderTextColor="#9094B2" style={styles.textInput} autoCapitalize="none" />
        <TextInput onChangeText={setPassword} value={password} placeholder="Contraseña" placeholderTextColor="#9094B2" secureTextEntry style={styles.textInput} />
        <ButtonGradient text="Ingresar" onPress={handleSignIn} width={"100%"} height={62} />
        <ButtonGradient text="Registrarse" onPress={() => navigation.navigate("Register")} width={"100%"} height={62} outlined />
      </View>
    </AppBackground>
  );
}
