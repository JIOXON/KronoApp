import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
// Importamos herramientas de Firestore:
// query/where: Para filtrar turnos existentes en la base de datos.
// runTransaction: CRÍTICO para evitar doble reserva (asegura que la operación sea atómica).
import { collection, query, where, getDocs, doc, runTransaction } from "firebase/firestore";
import { Navbar, BackgroundWaves, ButtonGradient, agendarStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { auth, db } from "../../data/firebaseconfig"; // Importamos la instancia de autenticación y BD

export default function Agendar({ route, navigation }) {
  // Obtenemos los parámetros enviados desde la pantalla anterior
  const { servicio, idEditar, fechaPrevia, horaPrevia } = route.params;

  // Estados locales para controlar la selección del usuario
  const [fecha, setFecha] = useState(fechaPrevia || ""); // Fecha seleccionada
  const [hora, setHora] = useState(horaPrevia || "");   // Hora seleccionada
  const [horasOcupadas, setHorasOcupadas] = useState([]); // Array con horas bloqueadas en BD
  const [horasGeneradas, setHorasGeneradas] = useState([]); // Todos los slots posibles calculados
  const [cargando, setCargando] = useState(false); // Spinner de carga para disponibilidad
  const [cargandoConfig, setCargandoConfig] = useState(true); // Spinner inicial de carga
  const [fechasDisponibles, setFechasDisponibles] = useState([]); // Array de próximos días

  // Función auxiliar para asignar íconos según el nombre del servicio (UX)
  const getServiceTheme = (nombre) => {
    const nameLower = nombre?.toLowerCase() || "";
    if (nameLower.includes("soporte") || nameLower.includes("reparacion")) return { icon: "headphones", color: "#FF4D79" };
    if (nameLower.includes("psicologia") || nameLower.includes("mente")) return { icon: "activity", color: "#22C55E" };
    if (nameLower.includes("medicina") || nameLower.includes("medico")) return { icon: "plus-square", color: "#38BDF8" };
    return { icon: "grid", color: "#FFA94D" };
  };

  const theme = getServiceTheme(servicio.name); // Obtenemos el tema basado en el servicio

  // Algoritmo para generar bloques de horario (ej: cada 30 o 60 min)
  const generarIntervalos = (duracionMinutos) => {
    let horarios = [];
    let inicio = new Date();
    inicio.setHours(8, 0, 0); // Hora de apertura: 08:00
    let fin = new Date();
    fin.setHours(18, 0, 0);   // Hora de cierre: 18:00
    
    // Mientras no hayamos llegado a la hora de cierre, generamos slots
    while (inicio < fin) {
      let h = inicio.getHours().toString().padStart(2, "0"); // Formato HH
      let m = inicio.getMinutes().toString().padStart(2, "0"); // Formato MM
      horarios.push(`${h}:${m}`);
      inicio.setMinutes(inicio.getMinutes() + duracionMinutos); // Incrementamos según duración del servicio
    }
    return horarios;
  };

  // Función para calcular los próximos días disponibles (excluyendo domingos)
  const generarFechasFuturas = (diasAProyectar = 14) => {
    let fechas = [];
    let fechaActual = new Date();
    while (fechas.length < diasAProyectar) {
      fechaActual.setDate(fechaActual.getDate() + 1); // Pasamos al día siguiente
      if (fechaActual.getDay() === 0) continue; // Si es domingo (0), lo saltamos
      let dia = fechaActual.getDate().toString().padStart(2, "0");
      let mes = (fechaActual.getMonth() + 1).toString().padStart(2, "0");
      let anio = fechaActual.getFullYear();
      fechas.push(`${dia}/${mes}/${anio}`); // Formato DD/MM/AAAA
    }
    return fechas;
  };

  // Efecto inicial: calculamos fechas y horas al cargar el componente
  useEffect(() => {
    const proximosDias = generarFechasFuturas(6);
    setFechasDisponibles(proximosDias);
    const duracion = parseInt(servicio.duration) || 30; // Valor por defecto 30min si no hay duración
    setHorasGeneradas(generarIntervalos(duracion));
    setCargandoConfig(false);
  }, [servicio]);

  // Función para consultar a Firestore qué horarios ya están ocupados en una fecha dada
  const consultarDisponibilidad = async (fechaSeleccionada) => {
    setCargando(true);
    try {
      // Consultamos la colección 'turnos' filtrando por fecha
      const q = query(collection(db, "turnos"), where("fecha", "==", fechaSeleccionada));
      const querySnapshot = await getDocs(q);
      const ocupadas = [];
      querySnapshot.forEach((documento) => {
        const data = documento.data();
        // Si estamos editando el turno actual, no lo contamos como ocupado
        if (idEditar && documento.id === idEditar) return;
        // Solo bloqueamos horarios confirmados (ignoramos cancelados o finalizados)
        if (data.estado !== "cancelado" && data.estado !== "finalizado") ocupadas.push(data.hora);
      });
      setHorasOcupadas(ocupadas); // Actualizamos el estado con las horas que no se pueden elegir
    } catch (error) {
      showAlert("Error", "generic-error");
    } finally {
      setCargando(false);
    }
  };

  // Efecto: Cuando el usuario cambia la fecha, consultamos la disponibilidad automáticamente
  useEffect(() => {
    if (fecha) {
      consultarDisponibilidad(fecha);
      // Reseteamos hora seleccionada si cambiamos de fecha (excepto si estamos editando el mismo día)
      if (!(idEditar && fecha === fechaPrevia)) setHora("");
    }
  }, [fecha]);

  // Función principal de guardado: Usa Transacciones de Firestore
  const guardarTurno = async () => {
    if (!fecha || !hora) {
      showAlert("Atención", "empty-fields");
      return;
    }
    const user = auth.currentUser;
    // Creamos un ID único compuesto (ej: 29-05-2026_10:00) para evitar duplicados
    const turnoIdGenerado = `${fecha.replace(/\//g, "-")}_${hora}`;
    const turnoRef = doc(db, "turnos", turnoIdGenerado);

    try {
      // runTransaction asegura que la lectura y escritura ocurran como una única operación "todo o nada"
      // Esto evita que dos usuarios reserven el mismo horario al mismo tiempo.
      await runTransaction(db, async (transaction) => {
        const turnoDoc = await transaction.get(turnoRef);

        // Validación: Si el turno ya existe y no está cancelado/finalizado, lanzamos error
        if (turnoDoc.exists() && turnoDoc.data().estado !== "cancelado" && turnoDoc.data().estado !== "finalizado") {
          if (idEditar && idEditar === turnoIdGenerado) {
             // Si estamos editando, permitimos sobreescribir el mismo slot
          } else {
            throw new Error("occupied"); // Dispara el catch de abajo
          }
        }

        // Lógica de creación o actualización
        if (idEditar) {
          if (idEditar !== turnoIdGenerado) {
            // Si cambiamos de horario: cancelamos el viejo y creamos el nuevo
            const viejoTurnoRef = doc(db, "turnos", idEditar);
            transaction.update(viejoTurnoRef, { estado: "cancelado" });
            transaction.set(turnoRef, {
              clienteId: user.uid, clienteEmail: user.email, servicioId: servicio.id || "sin-id",
              servicioNombre: servicio.name, servicioDuracion: servicio.duration, fecha, hora,
              creadoEn: new Date(), estado: "confirmado",
            });
          } else {
            // Si solo actualizamos detalles del mismo turno
            transaction.update(turnoRef, { actualizadoEn: new Date(), estado: "confirmado" });
          }
        } else {
          // Creación desde cero
          transaction.set(turnoRef, {
            clienteId: user.uid, clienteEmail: user.email, servicioId: servicio.id || "sin-id",
            servicioNombre: servicio.name, servicioDuracion: servicio.duration, fecha, hora,
            creadoEn: new Date(), estado: "confirmado",
          });
        }
      });

      // Navegación post-éxito
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
        showAlert("Error", "occupied"); // Alerta de horario ocupado
        consultarDisponibilidad(fecha); // Recargamos disponibilidad para mostrar qué cambió
      } else {
        console.error(error);
        showAlert("Error", "generic-error");
      }
    }
  };

  // Renderizado condicional: Spinner si la configuración aún no termina
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

        {/* Card informativo del servicio */}
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

        {/* --- SECCIÓN FECHA --- */}
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
                // Aplicamos estilo activo si esta es la fecha seleccionada
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

        {/* --- SECCIÓN HORARIO --- */}
        <View style={agendarStyles.sectionHeader}>
          <Feather name="clock" size={20} color="#FF6B8A" />
          <Text style={agendarStyles.sectionTitle}>Horarios Disponibles</Text>
        </View>

        <View style={agendarStyles.gridContainer}>
          {horasGeneradas.map((h) => (
            <TouchableOpacity
              key={h}
              // Deshabilitamos si la hora está en el array de ocupadas
              disabled={horasOcupadas.includes(h)}
              style={[
                agendarStyles.timeItem,
                hora === h && { borderColor: theme.color, backgroundColor: "rgba(255,255,255,0.06)" },
                horasOcupadas.includes(h) && { opacity: 0.3 } // Estilo visual de "deshabilitado"
              ]}
              onPress={() => setHora(h)}
            >
              <Text style={[agendarStyles.timeText, hora === h && { color: theme.color }]}>
                {h}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón de confirmación */}
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