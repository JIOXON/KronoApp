import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Navbar, BackgroundWaves, servicesStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

export default function Services({ navigation }) {
  const [services, setServices] = useState([]);
  const [cargando, setCargando] = useState(true);
  const db = getFirestore();

  const getServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "services"));
      const lista = [];

      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });

      setServices(lista);
    } catch (error) {
      console.error("Error al obtener servicios:", error);
      showAlert("Error", "services-fetch-error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    getServices();
  }, []);

  const getServiceTheme = (nombre) => {
    const nameLower = nombre?.toLowerCase() || "";
    if (nameLower.includes("soporte") || nameLower.includes("reparacion")) return { icon: "headphones", color: "#FF4D79" };
    if (nameLower.includes("psicologia") || nameLower.includes("mente")) return { icon: "activity", color: "#22C55E" };
    if (nameLower.includes("medicina") || nameLower.includes("medico")) return { icon: "plus", color: "#38BDF8" };
    return { icon: "grid", color: "#FFA94D" }; 
  };

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={servicesStyles.mainContainer}>
      <BackgroundWaves />
      <Navbar navigation={navigation} />

      <ScrollView contentContainerStyle={servicesStyles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={servicesStyles.title}>Servicios</Text>

        {cargando ? (
          <ActivityIndicator size="large" color="#FF2DA0" style={servicesStyles.loader} />
        ) : (
          services.map((item) => {
            const theme = item.icon && item.color 
              ? { icon: item.icon, color: item.color } 
              : getServiceTheme(item.name);

            return (
              <View key={item.id} style={[servicesStyles.card, { borderLeftColor: theme.color }]}>
                
                <View style={servicesStyles.cardTopRow}>
                  <View style={servicesStyles.iconBox}>
                    <Feather name={theme.icon} size={28} color={theme.color} />
                  </View>
                  
                  <View style={servicesStyles.infoContainer}>
                    <Text style={servicesStyles.serviceName}>{item.name}</Text>
                    <Text style={servicesStyles.serviceDescription}>{item.description}</Text>
                    
                    <View style={servicesStyles.timeRow}>
                      <Feather name="clock" size={13} color={theme.color} />
                      <Text style={servicesStyles.timeText}>{item.duration} min</Text>
                    </View>
                  </View>
                </View>

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