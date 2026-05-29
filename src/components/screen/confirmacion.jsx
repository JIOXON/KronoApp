import React from "react";
import { View, Text } from "react-native";
// Importamos componentes de estilo globales y el contenedor principal para mantener la consistencia visual
import { Navbar, BackgroundWaves, ButtonGradient, confStyles } from "../styles/globalStyles";
import { LinearGradient } from "expo-linear-gradient"; // Para el degradado de fondo
import { Feather } from "@expo/vector-icons"; // Iconos para la UI

export default function Confirmacion({ route, navigation }) {
  // Extraemos los parámetros enviados desde la pantalla de "Agendar"
  // Esto nos permite mostrar al usuario qué reservó sin hacer consultas adicionales a la BD
  const { servicio, fecha, hora } = route.params;

  // Función para volver al inicio. 
  // Usamos navigation.reset para limpiar el historial de navegación.
  // Esto es importante porque no queremos que el usuario pueda volver atrás a la pantalla de "Confirmación"
  const irAlInicio = () => {
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  return (
    // Contenedor principal con el degradado de colores definido en estilos
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={confStyles.mainContainer}>
      
      {/* Componente decorativo de fondo */}
      <BackgroundWaves />
      
      {/* Barra superior: ocultamos el botón de volver (hideBackButton={true}) porque es una pantalla de fin de flujo */}
      <Navbar navigation={navigation} hideBackButton={true} />
      
      {/* Contenedor centralizado para el contenido de confirmación */}
      <View style={confStyles.contentContainer}>
        
        {/* Círculo decorativo con el icono de éxito */}
        <View style={confStyles.iconCircle}>
          <Feather name="check-circle" size={80} color="#22C55E" />
        </View>

        {/* Textos de confirmación */}
        <Text style={confStyles.title}>¡Turno Confirmado!</Text>
        <Text style={confStyles.subTitle}>Tu cita ha sido programada con éxito.</Text>
        
        {/* Tarjeta resumen con los datos de la reserva */}
        <View style={confStyles.summaryCard}>
          <Text style={confStyles.serviceLabel}>Servicio</Text>
          <Text style={confStyles.serviceValue}>{servicio}</Text>
          
          {/* Línea divisoria decorativa */}
          <View style={confStyles.divider} />
          
          {/* Fila con fecha y hora */}
          <View style={confStyles.dateTimeRow}>
            {/* Box de fecha */}
            <View style={confStyles.infoBox}>
              <Feather name="calendar" size={18} color="#FF6B8A" />
              <Text style={confStyles.infoText}>{fecha}</Text>
            </View>
            
            {/* Box de hora */}
            <View style={confStyles.infoBox}>
              <Feather name="clock" size={18} color="#FF6B8A" />
              <Text style={confStyles.infoText}>{hora}</Text>
            </View>
          </View>
        </View>

        {/* Botón de acción para finalizar y volver a Home */}
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