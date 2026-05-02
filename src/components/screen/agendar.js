import React, { useState, useEffect } from "react";
import { View, Text, Alert, ActivityIndicator, ScrollView } from "react-native";
import {getFirestore,collection,addDoc,query,where,getDocs,doc,getDoc,updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ButtonGradient from "../styles/buttonGradient";
import { styles } from "../styles/agendarStyles";

export default function Agendar({ route, navigation }) {
  
  const { servicio, idEditar, fechaPrevia, horaPrevia } = route.params;

  const [fecha, setFecha] = useState(fechaPrevia || "");
  const [hora, setHora] = useState(horaPrevia || "");

  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [horasGeneradas, setHorasGeneradas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  const db = getFirestore();
  const auth = getAuth();

  const generarIntervalos = (duracionMinutos) => {
    let horarios = [];
    let inicio = new Date();
    inicio.setHours(8, 0, 0);
    let fin = new Date();
    fin.setHours(18, 0, 0);

    while (inicio < fin) {
      let h = inicio.getHours().toString().padStart(2, "0");
      let m = inicio.getMinutes().toString().padStart(2, "0");
      horarios.push(`${h}:${m}`);
      inicio.setMinutes(inicio.getMinutes() + duracionMinutos);
    }
    return horarios;
  };

  useEffect(() => {
    const obtenerConfiguracion = async () => {
      try {
        const docRef = doc(db, "configuracion", "horarios");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFechasDisponibles(docSnap.data().fechasValidas || []);

          const duracion = parseInt(servicio.duration) || 30;
          const intervalos = generarIntervalos(duracion);
          setHorasGeneradas(intervalos);
        }
      } catch (error) {
        console.error("Error config:", error);
      } finally {
        setCargandoConfig(false);
      }
    };
    obtenerConfiguracion();
  }, [servicio]);

  const consultarDisponibilidad = async (fechaSeleccionada) => {
    setCargando(true);
    try {
      const q = query(
        collection(db, "turnos"),
        where("fecha", "==", fechaSeleccionada),
      );

      const querySnapshot = await getDocs(q);
      const ocupadas = [];
      querySnapshot.forEach((documento) => {
        if (idEditar && documento.id === idEditar) return;
        ocupadas.push(documento.data().hora);
      });

      setHorasOcupadas(ocupadas);
    } catch (error) {
      console.error("Error disponibilidad:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (fecha) {
      consultarDisponibilidad(fecha);
      if (idEditar && fecha === fechaPrevia) {
        setHora(horaPrevia);
      } else {
        setHora("");
      }
    }
  }, [fecha]);

  const guardarTurno = async () => {
    if (!fecha || !hora) {
      Alert.alert("Atención", "Selecciona fecha y hora.");
      return;
    }

    const user = auth.currentUser;
    try {
      const q = query(
        collection(db, "turnos"),
        where("fecha", "==", fecha),
        where("hora", "==", hora),
      );
      const checkSnapshot = await getDocs(q);
      const choqueReal = checkSnapshot.docs.find((doc) => doc.id !== idEditar);

      if (choqueReal) {
        Alert.alert(
          "Error",
          "Este turno acaba de ser ocupado por otro usuario.",
        );
        consultarDisponibilidad(fecha);
        return;
      }

      if (idEditar) {
        await updateDoc(doc(db, "turnos", idEditar), {
          fecha: fecha,
          hora: hora,
          servicioDuracion: servicio.duration,
          actualizadoEn: new Date(),
          estado: "confirmado",
        });

        Alert.alert("Exito", "Turno reprogramado correctamente.");
        navigation.navigate("MisTurnos");
      } else {
        await addDoc(collection(db, "turnos"), {
          clienteId: user.uid,
          clienteEmail: user.email,
          servicioId: servicio.id || "sin-id",
          servicioNombre: servicio.name,
          servicioDuracion: servicio.duration,
          fecha: fecha,
          hora: hora,
          creadoEn: new Date(),
          estado: "confirmado",
        });

        navigation.navigate("Confirmacion", {
          servicio: servicio.name,
          fecha,
          hora,
        });
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar la solicitud.");
      console.error(error);
    }
  };

  if (cargandoConfig) {
    return (
      <View style={[styles.container, { alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {idEditar ? "Reprogramar" : "Agendar"} {servicio.name}
      </Text>

      <View style={styles.card}>
        <Text style={styles.service}>Duracion: {servicio.duration} min</Text>
      </View>

      <Text style={styles.label}>📅 Fecha</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {fechasDisponibles.map((f) => (
          <Text
            key={f}
            style={[styles.option, fecha === f && styles.optionSelected]}
            onPress={() => setFecha(f)}
          >
            {f}
          </Text>
        ))}
      </View>

      <Text style={styles.label}>⏰ Horarios Disponibles (8am - 6pm)</Text>
      {cargando ? (
        <ActivityIndicator color="#38BDF8" />
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {horasGeneradas.map((h) => {
            const ocupado = horasOcupadas.includes(h);
            return (
              <Text
                key={h}
                style={[
                  styles.option,
                  hora === h && styles.optionSelected,
                  ocupado && { backgroundColor: "#334155", opacity: 0.4 },
                ]}
                onPress={() => !ocupado && setHora(h)}
              >
                {h} {ocupado ? "🚫" : ""}
              </Text>
            );
          })}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <ButtonGradient
          text={idEditar ? "Guardar Cambios" : "Confirmar"}
          onPress={guardarTurno}
          width={220}
          height={50}
        />
      </View>
    </ScrollView>
  );
}