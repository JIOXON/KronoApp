import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, StyleSheet, } from "react-native";
import { collection, addDoc, query, where, getDocs, doc, updateDoc, } from "firebase/firestore";
import { Navbar, BackgroundWaves, ButtonGradient, } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons"; //https://icons.expo.fyi/Index
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
    if (nameLower.includes("soporte") || nameLower.includes("reparacion"))
      return { icon: "headphones", color: "#FF4D79" };
    if (nameLower.includes("psicologia") || nameLower.includes("mente"))
      return { icon: "activity", color: "#22C55E" };
    if (nameLower.includes("medicina") || nameLower.includes("medico"))
      return { icon: "plus-square", color: "#38BDF8" };
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
      const q = query(
        collection(db, "turnos"),
        where("fecha", "==", fechaSeleccionada),
      );
      const querySnapshot = await getDocs(q);
      const ocupadas = [];
      querySnapshot.forEach((documento) => {
        const data = documento.data();
        if (idEditar && documento.id === idEditar) return;
        if (data.estado !== "cancelado") ocupadas.push(data.hora);
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
    try {
      const q = query(
        collection(db, "turnos"),
        where("fecha", "==", fecha),
        where("hora", "==", hora),
      );
      const checkSnapshot = await getDocs(q);
      const choqueReal = checkSnapshot.docs.find(
        (doc) => doc.id !== idEditar && doc.data().estado !== "cancelado",
      );

      if (choqueReal) {
        showAlert("Error", "occupied");
        consultarDisponibilidad(fecha);
        return;
      }

      if (idEditar) {
        await updateDoc(doc(db, "turnos", idEditar), {
          fecha,
          hora,
          servicioDuracion: servicio.duration,
          actualizadoEn: new Date(),
          estado: "confirmado",
        });
        showAlert("Éxito", "schedule-success", () =>
          navigation.reset({
            index: 1,
            routes: [{ name: "Home" }, { name: "MisTurnos" }],
          }),
        );
      } else {
        await addDoc(collection(db, "turnos"), {
          clienteId: user.uid,
          clienteEmail: user.email,
          servicioId: servicio.id || "sin-id",
          servicioNombre: servicio.name,
          servicioDuracion: servicio.duration,
          fecha,
          hora,
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
      showAlert("Error", "generic-error");
    }
  };

  if (cargandoConfig)
    return (
      <LinearGradient
        colors={["#16132b", "#0F172A", "#080c17"]}
        style={[{ flex: 1, justifyContent: "center" }]}
      >
        <ActivityIndicator size="large" color="#FF2DA0" />
      </LinearGradient>
    );

  return (
    <LinearGradient
      colors={["#16132b", "#0F172A", "#080c17"]}
      style={{ flex: 1 }}
    >
      <BackgroundWaves />
      <Navbar navigation={navigation} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <View style={{ alignItems: "center", marginTop: 10, marginBottom: 15 }}>
          <ButtonGradient
            text="Volver"
            iconName="arrow-left"
            onPress={() => navigation.goBack()}
            width={130}
            height={55}
          />
        </View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 25,
          }}
        >
          {idEditar ? "Reprogramar\n" : "Agendar\n"}
          {servicio.name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: 20,
            padding: 20,
            marginBottom: 30,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 15,
              backgroundColor: "rgba(255,255,255,0.04)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 20,
            }}
          >
            <Feather name={theme.icon} size={28} color={theme.color} />
          </View>
          <View>
            <Text style={{ color: "#94A3B8", fontSize: 16 }}>Duración</Text>
            <Text
              style={[
                { fontSize: 22, fontWeight: "bold" },
                { color: theme.color },
              ]}
            >
              {servicio.duration} min
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Feather name="calendar" size={20} color="#FF6B8A" />
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "600" }}>
            {" "}
            Fecha
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {fechasDisponibles.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                {
                  backgroundColor: "rgba(255,255,255,0.03)",
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  marginBottom: 12,
                  width: "31%",
                  alignItems: "center",
                },
                fecha === f && {
                  borderColor: theme.color,
                  backgroundColor: "rgba(255,255,255,0.06)",
                },
              ]}
              onPress={() => setFecha(f)}
            >
              <Text
                style={[
                  { color: "#94A3B8", fontSize: 15 },
                  fecha === f && { color: theme.color },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Feather name="clock" size={20} color="#FF6B8A" />
          <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "600" }}>
            {" "}
            Horarios Disponibles
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {horasGeneradas.map((h) => (
            <TouchableOpacity
              key={h}
              disabled={horasOcupadas.includes(h)}
              style={[
                {
                  backgroundColor: "rgba(255,255,255,0.03)",
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  marginBottom: 12,
                  width: "23%",
                  alignItems: "center",
                },
                hora === h && {
                  borderColor: theme.color,
                  backgroundColor: "rgba(255,255,255,0.06)",
                },
                horasOcupadas.includes(h) && { opacity: 0.3 },
              ]}
              onPress={() => setHora(h)}
            >
              <Text
                style={[
                  { color: "#94A3B8", fontSize: 15 },
                  hora === h && { color: theme.color },
                ]}
              >
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
