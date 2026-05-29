import React from "react";
import { View, Text } from "react-native";
import { Navbar, BackgroundWaves, ButtonGradient, confStyles } from "../styles/globalStyles";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export default function Confirmacion({ route, navigation }) {
  const { servicio, fecha, hora } = route.params;

  const irAlInicio = () => {
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={confStyles.mainContainer}>
      <BackgroundWaves />
      
      <Navbar navigation={navigation} hideBackButton={true} />
      
      <View style={confStyles.contentContainer}>
        <View style={confStyles.iconCircle}>
          <Feather name="check-circle" size={80} color="#22C55E" />
        </View>
        <Text style={confStyles.title}>¡Turno Confirmado!</Text>
        <Text style={confStyles.subTitle}>Tu cita ha sido programada con éxito.</Text>
        
        <View style={confStyles.summaryCard}>
          <Text style={confStyles.serviceLabel}>Servicio</Text>
          <Text style={confStyles.serviceValue}>{servicio}</Text>
          <View style={confStyles.divider} />
          
          <View style={confStyles.dateTimeRow}>
            <View style={confStyles.infoBox}>
              <Feather name="calendar" size={18} color="#FF6B8A" />
              <Text style={confStyles.infoText}>{fecha}</Text>
            </View>
            <View style={confStyles.infoBox}>
              <Feather name="clock" size={18} color="#FF6B8A" />
              <Text style={confStyles.infoText}>{hora}</Text>
            </View>
          </View>
        </View>
        <View style={{ width: "100%", marginTop: 10 }}>
          <ButtonGradient 
            text="Volver al Inicio" 
            iconName="home" 
            onPress={irAlInicio} 
            width="100%" 
            height={55} 
          />
        </View>

      </View>
    </LinearGradient>
  );
}