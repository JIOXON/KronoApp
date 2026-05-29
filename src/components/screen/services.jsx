import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
// Importamos funciones de Firebase para leer documentos (getDocs)
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Navbar, BackgroundWaves, servicesStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export default function Services({ navigation }) {
  // Estado para almacenar la lista de servicios traída de la DB
  const [services, setServices] = useState([]);
  // Estado para controlar el indicador de carga mientras Firestore responde
  const [cargando, setCargando] = useState(true);
  
  const db = getFirestore();

  // Función asíncrona para traer los servicios de Firestore
  const getServices = async () => {
    try {
      // Obtenemos todos los documentos de la colección "services"
      const querySnapshot = await getDocs(collection(db, "services"));
      const lista = [];

      // Iteramos sobre los documentos obtenidos y los almacenamos en un array
      querySnapshot.forEach((doc) => {
        // Combinamos el ID del documento con el resto de los datos
        lista.push({ id: doc.id, ...doc.data() });
      });

      setServices(lista); // Guardamos la lista en el estado
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      showAlert("Error", "services-fetch-error"); // Feedback al usuario si algo sale mal
    } finally {
      // Aseguramos que el cargando pase a false independientemente del resultado
      setCargando(false);
    }
  };

  // Efecto: se ejecuta una única vez al montar el componente para cargar los servicios
  useEffect(() => {
    getServices();
  }, []);

  /**
   * Helper para asignar íconos y colores por defecto.
   * Esto actúa como un "fallback": si el documento en Firebase no tiene 
   * configurado un color o ícono, esta lógica determina qué mostrar.
   */
  const getServiceTheme = (nombre) => {
    const nameLower = nombre?.toLowerCase() || "";
    if (nameLower.includes("soporte") || nameLower.includes("reparacion")) return { icon: "headphones", color: "#FF4D79" };
    if (nameLower.includes("psicologia") || nameLower.includes("mente")) return { icon: "activity", color: "#22C55E" };
    if (nameLower.includes("medicina") || nameLower.includes("medico")) return { icon: "plus", color: "#38BDF8" };
    return { icon: "grid", color: "#FFA94D" }; // Tema por defecto
  };

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={servicesStyles.mainContainer}>
      <BackgroundWaves />
      <Navbar navigation={navigation} />

      <ScrollView contentContainerStyle={servicesStyles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={servicesStyles.title}>Servicios</Text>

        {/* Renderizado condicional basado en el estado 'cargando' */}
        {cargando ? (
          <ActivityIndicator size="large" color="#FF2DA0" style={servicesStyles.loader} />
        ) : (
          // Mapeamos el arreglo de servicios para crear una tarjeta por cada uno
          services.map((item) => {
            // Lógica de temas: damos prioridad a los datos que vienen de la BD (si existen),
            // sino, usamos la lógica de respaldo que definimos arriba.
            const theme = item.icon && item.color 
              ? { icon: item.icon, color: item.color } 
              : getServiceTheme(item.name);

            return (
              <View key={item.id} style={[servicesStyles.card, { borderLeftColor: theme.color }]}>
                
                {/* Fila superior: Icono + Detalles del servicio */}
                <View style={servicesStyles.cardTopRow}>
                  <View style={servicesStyles.iconBox}>
                    <Feather name={theme.icon} size={28} color={theme.color} />
                  </View>
                  
                  <View style={servicesStyles.infoContainer}>
                    <Text style={servicesStyles.serviceName}>{item.name}</Text>
                    <Text style={servicesStyles.serviceDescription}>{item.description}</Text>
                    
                    {/* Fila con la duración del servicio */}
                    <View style={servicesStyles.timeRow}>
                      <Feather name="clock" size={13} color={theme.color} />
                      <Text style={servicesStyles.timeText}>{item.duration} min</Text>
                    </View>
                  </View>
                </View>

                {/* Botón de acción: al presionar, navega a la pantalla "Agendar" pasando el objeto del servicio completo */}
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate("Agendar", { servicio: item })}>
                  <LinearGradient
                    colors={["#FFA94D", "#FF2DA0"]}
                    style={servicesStyles.agendarBtn}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={servicesStyles.agendarText}>Agendar</Text>
                    <Feather name="chevron-right" size={20} color="#ffffff" />
                  </LinearGradient>
                </TouchableOpacity>

              </View>
            );
          })
        )}
      </ScrollView>
    </LinearGradient>
  );
}