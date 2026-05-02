import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { getFirestore, collection, query, where, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { styles } from "../styles/agendarStyles"; 
import { Navbar } from "../styles/globalStyles";

export default function MisTurnos({ navigation }) {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "turnos"),
      where("clienteId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTurnos(lista.sort((a, b) => b.creadoEn - a.creadoEn));
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  const cancelarTurno = (id) => {
    Alert.alert(
      "Cancelar Turno",
      "¿Estas seguro de que deseas cancelar este turno? Esta accion no se puede deshacer.",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Si, cancelar", 
          onPress: async () => {
            try {
              await updateDoc(doc(db, "turnos", id), {
                estado: "cancelado"
              });
              Alert.alert("Exito", "Turno cancelado correctamente.");
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar el turno.");
            }
          } 
        }
      ]
    );
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "confirmado": return "#22C55E";
      case "cancelado": return "#EF4444";
      case "atendido": return "#38BDF8";
      default: return "#94A3B8";
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { borderLeftWidth: 5, borderLeftColor: getStatusColor(item.estado) }]}>
      <Text style={styles.service}>{item.servicioNombre}</Text>
      <Text style={styles.duration}>📅 {item.fecha}  |  ⏰ {item.hora}</Text>
      <Text style={{ color: getStatusColor(item.estado), fontWeight: "bold", marginTop: 5 }}>
        Estado: {item.estado?.toUpperCase()}
      </Text>

      {item.estado === "confirmado" && (
        <View style={{ flexDirection: "row", marginTop: 15, justifyContent: "space-between" }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate("Agendar", { 
              servicio: { 
                name: item.servicioNombre, 
                id: item.servicioId, 
                duration: item.servicioDuracion || 30 
              }, 
              idEditar: item.id,
              fechaPrevia: item.fecha, 
              horaPrevia: item.hora   
            })}
            style={{ backgroundColor: "#334155", padding: 10, borderRadius: 10, flex: 0.48 }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Reprogramar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => cancelarTurno(item.id)}
            style={{ backgroundColor: "#7f1d1d", padding: 10, borderRadius: 10, flex: 0.48 }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
      <Navbar navigation={navigation} />
      <View style={{ padding: 20, flex: 1 }}>
        <Text style={styles.title}>Mis Turnos</Text>
        {cargando ? (
          <ActivityIndicator size="large" color="#38BDF8" />
        ) : (
          <FlatList
            data={turnos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={{ color: "white", textAlign: "center" }}>No tienes turnos agendados.</Text>}
          />
        )}
      </View>
    </View>
  );
}