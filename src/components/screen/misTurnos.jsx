import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
// onSnapshot es clave aquí: crea un "oyente" (listener) en tiempo real con Firestore
import { collection, query, where, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Navbar, BackgroundWaves, misTurnosStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../data/firebaseconfig";

export default function MisTurnos({ navigation }) {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Efecto que se mantiene activo mientras el componente está montado
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return; // Seguridad: si no hay usuario, no consultamos nada

    // Consultamos solo los turnos donde el clienteId sea el del usuario actual
    const q = query(collection(db, "turnos"), where("clienteId", "==", user.uid));
    
    // onSnapshot: Esta función nos avisa cada vez que la DB cambia (inserción, edición o eliminación)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = [];
      const ahora = new Date();

      snapshot.docs.forEach((documento) => {
        let data = documento.data();
        let id = documento.id;

        // --- MANTENIMIENTO AUTOMÁTICO ---
        // Si el turno está "confirmado", verificamos si la fecha ya pasó para pasarlo a "finalizado"
        if (data.estado === "confirmado" && data.fecha && data.hora) {
          const [dia, mes, anio] = data.fecha.split("/");
          const [hora, min] = data.hora.split(":");
          const fechaDelTurno = new Date(anio, mes - 1, dia, hora, min);

          // Si el turno es anterior a la hora actual, lo marcamos como finalizado
          if (fechaDelTurno < ahora) {
            data.estado = "finalizado";
            // Actualizamos en la base de datos de forma silenciosa
            updateDoc(doc(db, "turnos", id), { estado: "finalizado" })
              .catch((error) => console.log("Error caducando turno", error));
          }
        }
        lista.push({ id, ...data });
      });

      // Ordenamos los turnos: los más nuevos (o cercanos) primero
      setTurnos(lista.sort((a, b) => b.creadoEn - a.creadoEn));
      setCargando(false);
    });

    // Importante: retornamos la función para "desuscribirnos" del listener al salir de la pantalla
    // Esto evita fugas de memoria (memory leaks)
    return () => unsubscribe();
  }, []);

  // Función para cancelar un turno específico
  const cancelarTurno = (id) => {
    showAlert("Cancelar Turno", "¿Estás seguro?", async () => {
      try {
        await updateDoc(doc(db, "hoteles", id), { estado: "cancelado" }); // Actualizamos el estado a cancelado
        showAlert("Éxito", "cancel-success");
      } catch (error) {
        showAlert("Error", "cancel-error");
      }
    });
  };

  // Helper para decidir qué color mostrar según el estado (UX visual)
  const getStatusColor = (estado) => {
    switch (estado) {
      case "confirmado": return "#22C55E"; // Verde
      case "cancelado": return "#EF4444";  // Rojo
      case "finalizado": return "#64748B"; // Gris
      default: return "#94A3B8";           // Gris neutro
    }
  };

  // Renderizado individual de cada item en la lista (FlatList)
  const renderItem = ({ item }) => {
    const statusColor = getStatusColor(item.estado);
    return (
      <View style={[misTurnosStyles.card, { borderLeftColor: statusColor }]}>
        <Text style={misTurnosStyles.serviceName}>{item.servicioNombre}</Text>
        <Text style={misTurnosStyles.dateTimeText}>
          📅 {item.fecha} | ⏰ {item.hora}
        </Text>
        <Text style={[misTurnosStyles.statusText, { color: statusColor }]}>
          Estado: {item.estado?.toUpperCase()}
        </Text>

        {/* Solo permitimos acciones de edición/cancelación si el turno sigue confirmado */}
        {item.estado === "confirmado" && (
          <View style={misTurnosStyles.buttonsContainer}>
            <TouchableOpacity
              style={misTurnosStyles.reprogramarBtn}
              onPress={() =>
                // Enviamos los datos actuales al componente "Agendar" para que sirvan de base para la edición
                navigation.navigate("Agendar", {
                  servicio: {
                    name: item.servicioNombre,
                    id: item.servicioId,
                    duration: item.servicioDuracion || 30,
                  },
                  idEditar: item.id, // ID del turno actual para sobreescribir/editar
                  fechaPrevia: item.fecha,
                  horaPrevia: item.hora,
                })
              }
            >
              <Text style={misTurnosStyles.btnText}>Reprogramar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={misTurnosStyles.cancelarBtn} onPress={() => cancelarTurno(item.id)}>
              <Text style={misTurnosStyles.btnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={misTurnosStyles.mainContainer}>
      <BackgroundWaves />
      <Navbar navigation={navigation} />
      <View style={misTurnosStyles.contentContainer}>
        <Text style={misTurnosStyles.title}>Mis Turnos</Text>
        
        {/* Usamos FlatList, que es mucho más eficiente que un .map() dentro de un ScrollView para listas largas */}
        {cargando ? (
          <ActivityIndicator size="large" color="#38BDF8" style={misTurnosStyles.loader} />
        ) : (
          <FlatList
            data={turnos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            // Componente que se muestra si el array de turnos está vacío
            ListEmptyComponent={
              <Text style={misTurnosStyles.emptyText}>No tienes turnos agendados.</Text>
            }
          />
        )}
      </View>
    </LinearGradient>
  );
}