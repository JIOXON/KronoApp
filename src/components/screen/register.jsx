import React from "react";
import { View, Text, TextInput, Alert } from "react-native";
import ButtonGradient from "../styles/buttonGradient";
import { styles, Logo } from "../styles/globalStyles";
import { TouchableOpacity } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../../data/firebaseconfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function Register({ navigation }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const traducirError = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "El correo no es válido";
      case "auth/invalid-credential":
        return "Debe usar un dominio de email real";
      case "auth/weak-password":
        return "La contraseña debe de ser de almenos 6 caracteres";
      case "auth/missing-password":
        return "Digite su contraseña";
      case "auth/email-already-in-use":
        return "Este correo ya esta en uso";
    }
  };

  const handleCreateAccount = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Cuenta creada!", user.email);

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
      <Text style={styles.subTitle}>Registrar su cuenta</Text>

      <TextInput
        onChangeText={setEmail}
        value={email}
        placeholder="Tucuenta@Tudominio.com"
        style={styles.textInput}
        autoCapitalize="none"
      />

      <TextInput
        onChangeText={setPassword} // Corregido aquí
        value={password}
        placeholder="Contraseña"
        secureTextEntry
        style={styles.textInput}
      />

      <ButtonGradient
        text="Registrarse"
        onPress={handleCreateAccount}
        width={130}
        height={50}
      />

      <Text style={styles.subTitle}>¿Ya tienes cuenta?</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.subrayado}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
