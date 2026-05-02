import React from "react";
import { View, Text } from "react-native";
import { styles, Navbar, Logo, AppBackground } from "../styles/globalStyles";

const MenuCard = ({ title, desc, emoji, onPress }) => (
  <Text onPress={onPress} style={{ width: "100%", borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)", color: "#F7FAFF", fontSize: 33, padding: 24, marginTop: 16 }}>{emoji}  {title}{"\n"}<Text style={{ fontSize: 18, color: "#8F95B5" }}>{desc}</Text></Text>
);

export default function Home({ navigation }) {
  return (
    <AppBackground>
      <Navbar navigation={navigation} />
      <View style={[styles.container, { paddingTop: 30 }]}> 
        <Logo size={130} />
        <Text style={[styles.title, { fontSize: 72 }]}>TurnosApp</Text>
        <Text style={styles.subTitle}>¡Bienvenido! ¿Qué deseas hacer hoy? 👋</Text>
        <MenuCard title="Ver servicios" desc="Explora todos los servicios disponibles." emoji="📅" onPress={() => navigation.navigate("Services")} />
        <MenuCard title="Mis turnos" desc="Revisa y gestiona tus turnos asignados." emoji="🕒" onPress={() => navigation.navigate("MisTurnos")} />
      </View>
    </AppBackground>
  );
}
