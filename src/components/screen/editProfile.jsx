import React from "react";
import { View, Text, TextInput } from "react-native";
import ButtonGradient from "../styles/buttonGradient";
import { styles, Logo } from "../styles/globalStyles";

export default function EditProfile({ navigation }) {
  return (
    <View style={styles.container}>
      <Logo />
      <Text style={styles.title}>TurnosApp</Text>
      <Text style={styles.subTitle}>EditProfile</Text>
    </View>
  );
}