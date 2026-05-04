import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Navbar, Logo, BackgroundWaves, homeStyles } from "../styles/globalStyles";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons"; //https://icons.expo.fyi/Index
import { initializeApp } from "firebase/app";

const ActionCard = ({ title, description, iconName, onPress }) => (
  <TouchableOpacity style={homeStyles.cardContainer} onPress={onPress} activeOpacity={0.7}>
    <LinearGradient colors={["#FFA94D", "#FF2DA0"]} style={homeStyles.iconCircle}>
      <Feather name={iconName} size={26} color="#ffffff" />
    </LinearGradient>
    
    <View style={homeStyles.textContainer}>
      <Text style={homeStyles.cardTitle}>{title}</Text>
      <Text style={homeStyles.cardDescription}>{description}</Text>
    </View>
    
    <Feather name="chevron-right" size={24} color="#FF4D79" />
  </TouchableOpacity>
);

export default function Home({ navigation }) {
  return (
    <LinearGradient
      colors={["#16132b", "#0F172A", "#080c17"]}
      style={homeStyles.mainContainer}
    >
      <BackgroundWaves />

      <Navbar navigation={navigation} />

      <View style={homeStyles.contentContainer}>
        
        <Logo size={120} />
        <Text style={homeStyles.title}>KronoApp</Text>
        <Text style={homeStyles.subTitle}>¡Bienvenido! ¿Qué deseas hacer hoy?</Text>

        <View style={homeStyles.cardsWrapper}>
          <ActionCard
            title="Ver servicios"
            description="Explora todos los servicios disponibles."
            iconName="calendar"
            onPress={() => navigation.navigate("Services")}
          />
          <ActionCard
            title="Mis turnos"
            description="Revisa y gestiona tus turnos asignados."
            iconName="clock"
            onPress={() => navigation.navigate("MisTurnos")}
          />
        </View>

      </View>
    </LinearGradient>
  );
}