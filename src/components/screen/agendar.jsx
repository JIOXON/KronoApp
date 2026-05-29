import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
// Re-agregamos runTransaction para máxima seguridad en la base de datos
import { collection, query, where, getDocs, doc, runTransaction } from "firebase/firestore";
import { Navbar, BackgroundWaves, ButtonGradient, agendarStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { auth, db } from "../../data/firebaseconfig";

export default function Agendar({ route, navigation }) {
  const { servicio, idEditar, fechaPrevia, horaPrevia } = route.params;

  const [fecha, setFecha] = useState(fechaPrevia || "");
  const [hora, setHora] = useState(horaPrevia || "");
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [horasGeneradas, setHorasGeneradas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const [fechasDisponibles, setFechasDisponibles] = useState([]);

  const getServiceTheme = (nombre) => {
    const nameLower = nombre?.toLowerCase() || "";
    if (nameLower.includes("soporte") || nameLower.includes("reparacion")) return { icon: "headphones", color: "#FF4D79" };
    if (nameLower.includes("psicologia") || nameLower.includes("mente")) return { icon: "activity", color: "#22C55E" };
    if (nameLower.includes("medicina") || nameLower.includes("medico")) return { icon: "plus-square", color: "#38BDF8" };
    return { icon: "grid", color: "#FFA94D" };
  };

  const theme = getServiceTheme(servicio.name);

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

  const generarFechasFuturas = (diasAProyectar = 14) => {
    let fechas = [];
    let fechaActual = new Date();
    while (fechas.length < diasAProyectar) {
      fechaActual.setDate(fechaActual.getDate() + 1);
      if (fechaActual.getDay() === 0) continue;
      let dia = fechaActual.getDate().toString().padStart(2, "0");
      let mes = (fechaActual.getMonth() + 1).toString().padStart(2, "0");
      let anio = fechaActual.getFullYear();
      fechas.push(`${dia}/${mes}/${anio}`);
    }
    return fechas;
  };

  useEffect(() => {
    const proximosDias = generarFechasFuturas(6);
    setFechasDisponibles(proximosDias);
    const duracion = parseInt(servicio.duration) || 30;
    setHorasGeneradas(generarIntervalos(duracion));
    setCargandoConfig(false);
  }, [servicio]);

  const consultarDisponibilidad = async (fechaSeleccionada) => {
    setCargando(true);
    try {
      const q = query(collection(db, "turnos"), where("fecha", "==", fechaSeleccionada));
      const querySnapshot = await getDocs(q);
      const ocupadas = [];
      querySnapshot.forEach((documento) => {
        const data = documento.data();
        if (idEditar && documento.id === idEditar) return;
        if (data.estado !== "cancelado" && data.estado !== "finalizado") ocupadas.push(data.hora);
      });
      setHorasOcupadas(ocupadas);
    } catch (error) {
      showAlert("Error", "generic-error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (fecha) {
      consultarDisponibilidad(fecha);
      if (!(idEditar && fecha === fechaPrevia)) setHora("");
    }
  }, [fecha]);

  const guardarTurno = async () => {
    if (!fecha || !hora) {
      showAlert("Atención", "empty-fields");
      return;
    }
    const user = auth.currentUser;
    const turnoIdGenerado = `${fecha.replace(/\//g, "-")}_${hora}`;
    const turnoRef = doc(db, "turnos", turnoIdGenerado);

    try {
      await runTransaction(db, async (transaction) => {
        const turnoDoc = await transaction.get(turnoRef);

        if (turnoDoc.exists() && turnoDoc.data().estado !== "cancelado" && turnoDoc.data().estado !== "finalizado") {
          if (idEditar && idEditar === turnoIdGenerado) {
            // El usuario actual es el dueño de la hora, no hacemos nada que dispare el error
          } else {
            throw new Error("occupied");
          }
        }

        if (idEditar) {
          if (idEditar !== turnoIdGenerado) {
            const viejoTurnoRef = doc(db, "turnos", idEditar);
            transaction.update(viejoTurnoRef, { estado: "cancelado" });
            transaction.set(turnoRef, {
              clienteId: user.uid, clienteEmail: user.email, servicioId: servicio.id || "sin-id",
              servicioNombre: servicio.name, servicioDuracion: servicio.duration, fecha, hora,
              creadoEn: new Date(), estado: "confirmado",
            });
          } else {
            transaction.update(turnoRef, { actualizadoEn: new Date(), estado: "confirmado" });
          }
        } else {
          transaction.set(turnoRef, {
            clienteId: user.uid, clienteEmail: user.email, servicioId: servicio.id || "sin-id",
            servicioNombre: servicio.name, servicioDuracion: servicio.duration, fecha, hora,
            creadoEn: new Date(), estado: "confirmado",
          });
        }
      });

      if (idEditar) {
        showAlert("Éxito", "schedule-success", () =>
          navigation.reset({ index: 1, routes: [{ name: "Home" }, { name: "MisTurnos" }] })
        );
      } else {
        navigation.reset({ 
          index: 0, 
          routes: [{ name: "Confirmacion", params: { servicio: servicio.name, fecha, hora } }] 
        });
      }

    } catch (error) {
      if (error.message === "occupied") {
        showAlert("Error", "occupied");
        consultarDisponibilidad(fecha); 
      } else {
        console.error(error);
        showAlert("Error", "generic-error");
      }
    }
  };

  if (cargandoConfig)
    return (
      <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={agendarStyles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF2DA0" />
      </LinearGradient>
    );

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={agendarStyles.mainContainer}>
      <BackgroundWaves />
      <Navbar navigation={navigation} />
      <ScrollView contentContainerStyle={agendarStyles.scrollContent}>
        
        <Text style={agendarStyles.title}>
          {idEditar ? "Reprogramar\n" : "Agendar\n"}
          {servicio.name}
        </Text>

        <View style={agendarStyles.infoCard}>
          <View style={agendarStyles.iconBox}>
            <Feather name={theme.icon} size={28} color={theme.color} />
          </View>
          <View>
            <Text style={agendarStyles.durationLabel}>Duración</Text>
            <Text style={[agendarStyles.durationValue, { color: theme.color }]}>
              {servicio.duration} min
            </Text>
          </View>
        </View>

        <View style={agendarStyles.sectionHeader}>
          <Feather name="calendar" size={20} color="#FF6B8A" />
          <Text style={agendarStyles.sectionTitle}>Fecha</Text>
        </View>

        <View style={agendarStyles.gridContainer}>
          {fechasDisponibles.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                agendarStyles.dateItem,
                fecha === f && { borderColor: theme.color, backgroundColor: "rgba(255,255,255,0.06)" }
              ]}
              onPress={() => setFecha(f)}
            >
              <Text style={[agendarStyles.dateText, fecha === f && { color: theme.color }]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={agendarStyles.sectionHeader}>
          <Feather name="clock" size={20} color="#FF6B8A" />
          <Text style={agendarStyles.sectionTitle}>Horarios Disponibles</Text>
        </View>

        <View style={agendarStyles.gridContainer}>
          {horasGeneradas.map((h) => (
            <TouchableOpacity
              key={h}
              disabled={horasOcupadas.includes(h)}
              style={[
                agendarStyles.timeItem,
                hora === h && { borderColor: theme.color, backgroundColor: "rgba(255,255,255,0.06)" },
                horasOcupadas.includes(h) && { opacity: 0.3 }
              ]}
              onPress={() => setHora(h)}
            >
              <Text style={[agendarStyles.timeText, hora === h && { color: theme.color }]}>
                {h}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ButtonGradient
          text={idEditar ? "Guardar Cambios" : "Confirmar"}
          onPress={guardarTurno}
          width="100%"
          height={55}
        />
      </ScrollView>
    </LinearGradient>
  );
}