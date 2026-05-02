import React from "react";
import { View, Text } from "react-native";
import ButtonGradient from "../styles/buttonGradient";
import { styles } from "../styles/agendarStyles";

export default function Confirmacion({ route, navigation }) {
const { servicio, fecha, hora } = route.params;

return (
    <View style={styles.container}>

    <Text style={{ fontSize: 40, textAlign: "center" }}>✅</Text>

    <Text style={styles.title}>Turno confirmado</Text>

    <View style={styles.card}>
        <Text style={styles.service}>{servicio}</Text>
        <Text style={styles.duration}>📅 {fecha}</Text>
        <Text style={styles.duration}>⏰ {hora}</Text>
    </View>

    <View style={styles.buttonContainer}>
        <ButtonGradient
        text="Volver al inicio"
        onPress={() => navigation.navigate("Home")}
        />
    </View>

    </View>
);
}