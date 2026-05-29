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
      const ahora = new Date();

      snapshot.docs.forEach((documento) => {
        let data = documento.data();
        let id = documento.id;


        if (data.estado === "confirmado" && data.fecha && data.hora) {

          const [dia, mes, anio] = data.fecha.split("/");
          const [hora, min] = data.hora.split(":");
          

          const fechaDelTurno = new Date(anio, mes - 1, dia, hora, min);


          if (fechaDelTurno < ahora) {
            data.estado = "finalizado";
            
            updateDoc(doc(db, "turnos", id), { estado: "finalizado" })
              .catch((error) => console.log("Error caducando turno", error));
          }
        }

        lista.push({ id, ...data });
      });

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
      case "confirmado": return "#22C55E";
      case "cancelado": return "#EF4444"; 
      case "finalizado": return "#64748B"; 
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