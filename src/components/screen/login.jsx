import React from "react";
import { View, Text, TextInput, Alert } from "react-native";
import ButtonGradient from "../styles/buttonGradient";
import { styles, Logo } from "../styles/globalStyles";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../data/firebaseconfig";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Login({ navigation }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const traducirError = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "El correo no es válido";
      case "auth/invalid-credential":
        return "El usuario no existe o la contraseña es incorrecta";
      case "auth/weak-password":
        return "Contraseña incorrecta";
      case "auth/missing-password":
        return "Digite su contraseña";
    }
  };

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Ingresado con exito!", user.email);

        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      })
      .catch((error) => {
        const mensaje = traducirError(error.code);
        Alert.alert("Error", mensaje);
        console.log("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Logo />
      <Text style={styles.title}>TurnosApp</Text>
      <Text style={styles.subTitle}>Ingresar a mi cuenta</Text>
      <TextInput
        onChangeText={setEmail}
        value={email}
        placeholder="Tucuenta@Tudominio.com"
        style={styles.textInput}
        autoCapitalize="none"
      />
      <TextInput
        onChangeText={setPassword}
        value={password}
        placeholder="Contraseña"
        secureTextEntry
        style={styles.textInput}
      />

      <ButtonGradient
        text="Ingresar"
        onPress={handleSignIn}
        width={130}
        height={50}
      />
      <ButtonGradient
        text="Registrarse"
        onPress={() => navigation.navigate("Register")}
        width={130}
        height={50}
      />
    </View>
  );
}
