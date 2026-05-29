import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
// Importamos componentes de UI, estilos y utilidades necesarias
import { Navbar, Logo, BackgroundWaves, homeStyles } from "../styles/globalStyles";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons"; 
// Importamos Firebase Auth para obtener el usuario actual y Firestore para consultar roles
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

/**
 * Componente funcional reusable para las tarjetas de acción (menú principal).
 * Utiliza composición de componentes para mantener el código limpio.
 */
const ActionCard = ({ title, description, iconName, onPress }) => (
  <TouchableOpacity style={homeStyles.cardContainer} onPress={onPress} activeOpacity={0.7}>
    {/* Contenedor del icono con degradado para un look visual premium */}
    <LinearGradient colors={["#FFA94D", "#FF2DA0"]} style={homeStyles.iconCircle}>
      <Feather name={iconName} size={26} color="#ffffff" />
    </LinearGradient>
    
    <View style={homeStyles.textContainer}>
      <Text style={homeStyles.cardTitle}>{title}</Text>
      <Text style={homeStyles.cardDescription}>{description}</Text>
    </View>
    
    {/* Icono de navegación para indicar que es un botón interactivo */}
    <Feather name="chevron-right" size={24} color="#FF4D79" />
  </TouchableOpacity>
);

export default function Home({ navigation }) {
  // Estados para manejar el permiso de administrador y el estado de carga inicial
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);
  
  const auth = getAuth(); // Instancia de autenticación
  const db = getFirestore(); // Instancia de base de datos

  // Efecto que corre al montar el componente para verificar si el usuario es admin
  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser; // Obtenemos el usuario autenticado actualmente
      if (user) {
        try {
          // Buscamos el documento del usuario en la colección "usuarios" usando su UID
          const userDoc = await getDoc(doc(db, "usuarios", user.uid));
          // Si el documento existe y su rol es "admin", activamos el estado isAdmin
          if (userDoc.exists() && userDoc.data().rol === "admin") {
            setIsAdmin(true);
          }
        } catch (error) {
          console.log("Error verificando rol:", error);
        }
      }
      setLoadingRole(false); // Terminamos la carga (independientemente si es admin o no)
    };
    checkUserRole();
  }, []);

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={homeStyles.mainContainer}>
      <BackgroundWaves /> {/* Fondo decorativo con ondas */}
      <Navbar navigation={navigation} /> {/* Barra superior de navegación */}

      <View style={homeStyles.contentContainer}>
        <Logo size={120} />
        <Text style={homeStyles.title}>KronoApp</Text>
        <Text style={homeStyles.subTitle}>¡Bienvenido! ¿Qué deseas hacer hoy?</Text>

        {/* 
          Si aún estamos verificando el rol (loadingRole), mostramos un spinner.
          Esto evita que el usuario vea un salto visual o que aparezca/desaparezca el botón de admin.
        */}
        {loadingRole ? (
          <ActivityIndicator size="large" color="#FF2DA0" style={homeStyles.loader} />
        ) : (
          <View style={homeStyles.cardsWrapper}>
            {/* Tarjeta de navegación a Servicios */}
            <ActionCard
              title="Agendar Turnos"
              description="Explora todos los servicios disponibles."
              iconName="calendar"
              onPress={() => navigation.navigate("Services")}
            />
            {/* Tarjeta de navegación a Mis Turnos */}
            <ActionCard
              title="Mis turnos"
              description="Revisa y gestiona tus turnos asignados."
              iconName="clock"
              onPress={() => navigation.navigate("MisTurnos")}
            />
            
            {/* 
              Renderizado condicional: 
              El panel de administración solo se muestra si isAdmin es true.
            */}
            {isAdmin && (
              <ActionCard
                title="Panel de Administrador"
                description="Agrega servicios y gestiona disponibilidades."
                iconName="settings"
                onPress={() => navigation.navigate("AdminPanel")} 
              />
            )}
          </View>
        )}
      </View>
    </LinearGradient>
  );
}