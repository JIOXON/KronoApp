import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { collection, query, where, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { Navbar, BackgroundWaves, misTurnosStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../data/firebaseconfig";

export default function MisTurnos({ navigation }) {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "turnos"), where("clienteId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = [];
      const ahora = new Date(); // Obtenemos la fecha y hora exacta de este instante

      snapshot.docs.forEach((documento) => {
        let data = documento.data();
        let id = documento.id;

        // LOGICA DE VENCIMIENTO: Si el turno está confirmado, evaluamos si ya pasó
        if (data.estado === "confirmado" && data.fecha && data.hora) {
          // Extraemos los números del texto "DD/MM/YYYY" y "HH:MM"
          const [dia, mes, anio] = data.fecha.split("/");
          const [hora, min] = data.hora.split(":");
          
          // Creamos una fecha matemática en JavaScript (el mes empieza en 0, por eso mes - 1)
          const fechaDelTurno = new Date(anio, mes - 1, dia, hora, min);

          // Si la fecha del turno es menor (más antigua) que el momento actual:
          if (fechaDelTurno < ahora) {
            data.estado = "finalizado"; // Actualizamos visualmente al instante
            
            // Y le avisamos a Firebase en segundo plano que lo guarde así
            updateDoc(doc(db, "turnos", id), { estado: "finalizado" })
              .catch((error) => console.log("Error caducando turno", error));
          }
        }

        lista.push({ id, ...data });
      });

      // Ordenamos de más reciente a más antiguo
      setTurnos(lista.sort((a, b) => b.creadoEn - a.creadoEn));
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  const cancelarTurno = (id) => {
    showAlert("Cancelar Turno", "¿Estás seguro?", async () => {
      try {
        await updateDoc(doc(db, "turnos", id), { estado: "cancelado" });
        showAlert("Éxito", "cancel-success");
      } catch (error) {
        showAlert("Error", "cancel-error");
      }
    });
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "confirmado": return "#22C55E"; // Verde
      case "cancelado": return "#EF4444"; // Rojo
      case "finalizado": return "#64748B"; // Gris/Pizarra (Nuevo color para los finalizados)
      default: return "#94A3B8";
    }
  };

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
        
        {/* Los botones SOLO aparecen si el estado es 'confirmado'. Si cambió a 'finalizado' arriba, estos botones simplemente desaparecen. */}
        {item.estado === "confirmado" && (
          <View style={misTurnosStyles.buttonsContainer}>
            <TouchableOpacity
              style={misTurnosStyles.reprogramarBtn}
              onPress={() =>
                navigation.navigate("Agendar", {
                  servicio: {
                    name: item.servicioNombre,
                    id: item.servicioId,
                    duration: item.servicioDuracion || 30,
                  },
                  idEditar: item.id,
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
        {cargando ? (
          <ActivityIndicator size="large" color="#38BDF8" style={misTurnosStyles.loader} />
        ) : (
          <FlatList
            data={turnos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={misTurnosStyles.emptyText}>No tienes turnos agendados.</Text>
            }
          />
        )}
      </View>
    </LinearGradient>
  );
}