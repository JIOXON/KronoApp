import React from "react";
import { View, Text, TextInput } from "react-native";
import { styles, Logo, ButtonGradient } from "../styles/globalStyles";
import { initializeApp } from "firebase/app";

export default function EditProfile({ navigation }) {
  return (
    <View style={styles.container}>
      <Logo />
      <Text style={styles.title}>TurnosApp</Text>
      <Text style={styles.subTitle}>EditProfile</Text>
    </View>
  );
}