import React, { useState, useEffect } from "react"; // Hooks base de React para estado y efectos secundarios
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native"; // Componentes de UI de React Native
import { LinearGradient } from "expo-linear-gradient"; // Componente para degradados de color en el fondo
import { Feather } from "@expo/vector-icons"; // Librería de iconos vectoriales
import { getFirestore, collection, addDoc, query, getDocs, updateDoc, doc, where, getDoc } from "firebase/firestore"; // SDK de Firestore para base de datos
import { Navbar, BackgroundWaves, ButtonGradient, loginStyles, adminStyles } from "../styles/globalStyles"; // Estilos y componentes globales personalizados
import { showAlert } from "../utils/alertMessage"; // Utilidad personalizada para mostrar alertas (Alert.alert mejorado)

// Array de objetos de configuración para los temas de servicios. 
// Esto es mejor que tener constantes sueltas porque permite iterar fácilmente (mapear).
const THEME_OPTIONS = [
  { id: "soporte", icon: "headphones", color: "#FF4D79", label: "Soporte" },
  { id: "salud", icon: "activity", color: "#22C55E", label: "Salud" },
  { id: "medicina", icon: "plus", color: "#38BDF8", label: "Medicina" },
  { id: "educacion", icon: "book", color: "#A855F7", label: "Educación" },
  { id: "tecnologia", icon: "monitor", color: "#06B6D4", label: "Tecnología" },
  { id: "mantenimiento", icon: "tool", color: "#6366F1", label: "Técnico" },
  { id: "deportes", icon: "zap", color: "#EAB308", label: "Deportes" },
  { id: "belleza", icon: "scissors", color: "#F43F5E", label: "Estética" },
  { id: "negocios", icon: "briefcase", color: "#10B981", label: "Negocios" },
  { id: "alimentos", icon: "coffee", color: "#D97706", label: "Comida" },
  { id: "premium", icon: "star", color: "#FBBF24", label: "Premium" },
  { id: "general", icon: "grid", color: "#FFA94D", label: "General" },
];

/**
 * Función asíncrona para disparar una notificación Push de Expo.
 * @param {string} expoPushToken - Token único del dispositivo del usuario.
 * @param {string} fecha - Fecha del turno a cancelar.
 * @param {string} hora - Hora del turno a cancelar.
 */
const enviarNotificacionPush = async (expoPushToken, fecha, hora) => {
  if (!expoPushToken) return; // Guard clause: si no hay token, no intentamos enviar nada

  // Estructura del payload (cuerpo) del mensaje para el servidor de Expo
  const mensaje = {
    to: expoPushToken,
    sound: 'default', // Sonido estándar al llegar la notificación
    title: 'Turno Cancelado ❌',
    body: `El administrador ha cancelado tu turno para el ${fecha} a las ${hora}.`,
    data: { fecha: fecha, hora: hora }, // Datos extra que la app puede usar al tocar la notificación
  };

  // Petición HTTP POST al endpoint de notificaciones de Expo
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mensaje), // Convertimos el objeto a JSON string
  });
};

/**
 * Función para enviar correo electrónico mediante EmailJS.
 */
const enviarCorreoCancelacion = async (correoCliente, fecha, hora, servicioNombre) => {
  if (!correoCliente) return; // Verificación de seguridad básica

  try {
    // Llamada a la API REST de EmailJS
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: "TU_SERVICE_ID",   
        template_id: "TU_TEMPLATE_ID", 
        user_id: "TU_PUBLIC_KEY",      
        template_params: {
          to_email: correoCliente,
          fecha: fecha,
          hora: hora,
          servicio: servicioNombre,
        },
      }),
    });
    console.log("Correo enviado con éxito");
  } catch (error) {
    console.log("Error al enviar el correo:", error);
  }
};

export default function AdminPanel({ navigation }) {
  // --- ESTADOS (Variables que, al cambiar, refrescan la pantalla) ---
  const [view, setView] = useState("servicios"); // Alterna entre pestañas "servicios" o "usuarios"
  const [name, setName] = useState(""); // Input: Nombre del servicio nuevo
  const [description, setDescription] = useState(""); // Input: Descripción
  const [duration, setDuration] = useState(""); // Input: Duración
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[11]); // Objeto del tema seleccionado
  const [loadingService, setLoadingService] = useState(false); // Flag para mostrar spinner al guardar

  const [usuarios, setUsuarios] = useState([]); // Array donde guardamos la lista de clientes
  const [loadingUsers, setLoadingUsers] = useState(false); // Flag de carga para lista de usuarios
  const [expandedUser, setExpandedUser] = useState(null); // ID del usuario expandido para ver sus turnos
  const [userTurnos, setUserTurnos] = useState([]); // Array de turnos del usuario seleccionado
  const [loadingTurnos, setLoadingTurnos] = useState(false); // Flag de carga específica para los turnos
  
  const db = getFirestore(); // Instancia de la base de datos Firestore

  // Lógica para guardar un servicio nuevo en Firestore
  const handleAddService = async () => {
    // Validación básica: asegura que ningún campo esté vacío
    if (!name || !description || !duration) {
      showAlert("Atención", "empty-fields");
      return;
    }
    setLoadingService(true); // Activa el loader en el botón
    try {
      // addDoc crea un nuevo documento con un ID generado automáticamente
      await addDoc(collection(db, "services"), {
        name, 
        description, 
        duration: parseInt(duration), // Convertimos el string del input a entero
        icon: selectedTheme.icon, 
        color: selectedTheme.color, 
        createdAt: new Date() // Timestamp de creación
      });
      showAlert("Éxito", "service-success");
      // Limpiamos los campos tras el éxito
      setName(""); setDescription(""); setDuration(""); setSelectedTheme(THEME_OPTIONS[11]); 
    } catch (error) {
      showAlert("Error", "service-error");
    } finally {
      setLoadingService(false); // Apagamos el loader independientemente del resultado
    }
  };

  // Efecto que corre cuando cambia la pestaña de vista
  useEffect(() => {
    if (view === "usuarios") fetchUsuarios(); // Solo carga usuarios si estamos en la vista adecuada
  }, [view]);

  // Obtiene todos los documentos de la colección "usuarios"
  const fetchUsuarios = async () => {
    setLoadingUsers(true);
    try {
      const q = query(collection(db, "usuarios")); // Creamos la query (consulta)
      const snap = await getDocs(q); // Ejecutamos la consulta y obtenemos el "snapshot" (foto de los datos)
      const usersList = [];
      snap.forEach(documento => {
        const data = documento.data(); // Obtenemos el objeto con los datos del usuario
        // Filtramos para no mostrar administradores en la lista
        if (data.rol !== "admin") usersList.push({ id: documento.id, ...data });
      });
      setUsuarios(usersList); // Actualizamos el estado con la lista limpia
    } catch (error) {
      console.log(error);
    }
    setLoadingUsers(false);
  };

  // Carga los turnos del usuario al hacer clic en él (Lazy Loading)
  const handleSelectUser = async (userId) => {
    // Si ya está expandido, lo colapsamos y salimos
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    
    setExpandedUser(userId); // Marcamos este usuario como expandido
    setLoadingTurnos(true);
    try {
      // Buscamos turnos donde el clienteId coincida con el ID del usuario seleccionado
      const q = query(collection(db, "turnos"), where("clienteId", "==", userId));
      const snap = await getDocs(q);
      
      const turnosList = [];
      const ahora = new Date(); // Fecha actual para comparar

      snap.forEach(documento => {
        let data = documento.data();
        let id = documento.id;

        // --- LÓGICA DE MANTENIMIENTO AUTOMÁTICO ---
        // Si el turno está "confirmado" pero la fecha y hora ya pasaron, lo marcamos como "finalizado"
        if (data.estado === "confirmado" && data.fecha && data.hora) {
          const [dia, mes, anio] = data.fecha.split("/");
          const [hora, min] = data.hora.split(":");
          const fechaDelTurno = new Date(anio, mes - 1, dia, hora, min);

          if (fechaDelTurno < ahora) {
            data.estado = "finalizado"; // Actualizamos el objeto local
            updateDoc(doc(db, "turnos", id), { estado: "finalizado" }).catch(e => console.log(e)); // Guardamos en BD
          }
        }
        turnosList.push({ id, ...data }); // Agregamos el turno al array
      });

      // Ordenamos los turnos (los más nuevos al principio)
      setUserTurnos(turnosList.sort((a, b) => b.creadoEn - a.creadoEn));
    } catch (error) {
      console.log(error);
    }
    setLoadingTurnos(false);
  };

  // Función específica para el envío de correo de cancelación (EmailJS)
  const enviarCorreoOculto = async (correoCliente, fecha, hora, servicioNombre) => {
    if (!correoCliente) return;

    try {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: "service_gnpppiw",
          template_id: "template_7nhuo8e",
          user_id: "vOODSRU20oPnrAnkC",
          template_params: {
            to_email: correoCliente,
            fecha: fecha,
            hora: hora,
            servicio: servicioNombre,
          },
        }),
      });
      console.log("Correo automático enviado");
    } catch (error) {
      console.log("Error de EmailJS:", error);
    }
  };

  // Manejo centralizado de cancelación de turno
  const handleCancelTurno = (turno) => {
    // Alerta de confirmación antes de proceder
    showAlert("Cancelar Turno", "¿Estás seguro de cancelar este turno?", async () => {
      try {
        // 1. Actualización en Firestore
        await updateDoc(doc(db, "turnos", turno.id), { estado: "cancelado" });
        
        // 2. Notificación Push: obtenemos el documento del usuario para sacar su token
        const userDoc = await getDoc(doc(db, "usuarios", turno.clienteId));
        if (userDoc.exists() && userDoc.data().expoPushToken) {
          const tokenDelUsuario = userDoc.data().expoPushToken;
          await enviarNotificacionPush(tokenDelUsuario, turno.fecha, turno.hora);
        }

        // 3. Email: notificamos al cliente
        await enviarCorreoOculto(turno.clienteEmail, turno.fecha, turno.hora, turno.servicioNombre);

        // 4. Actualización UI: mapeamos el estado para cambiar solo el turno cancelado y que se refleje visualmente
        setUserTurnos(prev => prev.map(t => t.id === turno.id ? { ...t, estado: "cancelado" } : t));
        showAlert("Éxito", "cancel-success");
        
      } catch (error) {
        showAlert("Error", "cancel-error");
      }
    });
  };

  // Función para determinar el color de la tarjeta según el estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case "confirmado": return "#22C55E"; // Verde
      case "cancelado": return "#EF4444";  // Rojo
      case "finalizado": return "#64748B"; // Gris
      default: return "#94A3B8";           // Gris neutro por defecto
    }
  };

  // --- RENDERIZADO DE LA INTERFAZ ---
  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={adminStyles.mainContainer}>
      <BackgroundWaves /> {/* Componente de fondo animado */}
      <Navbar navigation={navigation} showBackButton={true} /> {/* Barra de navegación superior */}

      <ScrollView contentContainerStyle={adminStyles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Selector de pestañas para cambiar de vista */}
        <View style={adminStyles.tabContainer}>
          <TouchableOpacity style={[adminStyles.tabBtn, view === "servicios" && adminStyles.tabBtnActive]} onPress={() => setView("servicios")} activeOpacity={0.7}>
            <Text style={[adminStyles.tabText, view === "servicios" && adminStyles.tabTextActive]}>Servicios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[adminStyles.tabBtn, view === "usuarios" && adminStyles.tabBtnActive]} onPress={() => setView("usuarios")} activeOpacity={0.7}>
            <Text style={[adminStyles.tabText, view === "usuarios" && adminStyles.tabTextActive]}>Usuarios</Text>
          </TouchableOpacity>
        </View>

        {/* --- VISTA: CREAR SERVICIOS --- */}
        {view === "servicios" && (
          <View>
            <Text style={adminStyles.title}>Crear Nuevo Servicio</Text>
            {/* Formulario de creación con inputs controlados */}
            <View style={loginStyles.inputWrapper}>
              <Feather name="edit-2" size={20} color="#FF6B8A" style={loginStyles.iconLeft} />
              <TextInput style={loginStyles.input} placeholder="Nombre del servicio" placeholderTextColor="#64748B" value={name} onChangeText={setName} />
            </View>
            <View style={loginStyles.inputWrapper}>
              <Feather name="align-left" size={20} color="#FF6B8A" style={loginStyles.iconLeft} />
              <TextInput style={loginStyles.input} placeholder="Breve descripción" placeholderTextColor="#64748B" value={description} onChangeText={setDescription} />
            </View>
            <View style={loginStyles.inputWrapper}>
              <Feather name="clock" size={20} color="#FF6B8A" style={loginStyles.iconLeft} />
              <TextInput style={loginStyles.input} placeholder="Duración en minutos (Ej. 30)" placeholderTextColor="#64748B" keyboardType="numeric" value={duration} onChangeText={setDuration} />
            </View>

            <Text style={adminStyles.label}>Selecciona un Icono y Tema:</Text>
            <View style={adminStyles.gridContainer}>
              {/* Mapeamos THEME_OPTIONS para generar los botones de temas dinámicamente */}
              {THEME_OPTIONS.map((theme) => (
                <TouchableOpacity key={theme.id} onPress={() => setSelectedTheme(theme)} activeOpacity={0.7} style={[adminStyles.themeItem, { borderColor: selectedTheme.id === theme.id ? theme.color : "transparent", backgroundColor: selectedTheme.id === theme.id ? `${theme.color}15` : "rgba(255,255,255,0.05)" }]}>
                  <Feather name={theme.icon} size={28} color={theme.color} />
                  <Text style={adminStyles.themeLabel} numberOfLines={1}>{theme.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Renderizado condicional: si está cargando, muestra spinner, sino, el botón */}
            {loadingService ? (
              <ActivityIndicator size="large" color="#FF2DA0" style={adminStyles.loaderContainer} />
            ) : (
              <ButtonGradient text="Guardar Servicio" onPress={handleAddService} width="100%" height={55} />
            )}
          </View>
        )}

        {/* --- VISTA: GESTIÓN DE USUARIOS Y TURNOS --- */}
        {view === "usuarios" && (
          <View>
            <Text style={adminStyles.title}>Gestión de Turnos</Text>
            
            {/* Lista de usuarios con carga condicional */}
            {loadingUsers ? (
              <ActivityIndicator size="large" color="#38BDF8" style={adminStyles.loaderContainer} />
            ) : usuarios.length === 0 ? (
              <Text style={adminStyles.noTurnosText}>No hay usuarios registrados.</Text>
            ) : (
              usuarios.map((user) => (
                <View key={user.id} style={adminStyles.userCard}>
                  {/* Cabecera del usuario: Al tocar se expande para ver turnos */}
                  <TouchableOpacity style={adminStyles.userHeader} onPress={() => handleSelectUser(user.uid)} activeOpacity={0.7}>
                    <Feather name="user" size={20} color="#38BDF8" />
                    <Text style={adminStyles.userEmail}>{user.email}</Text>
                    <Feather name={expandedUser === user.uid ? "chevron-up" : "chevron-down"} size={20} color="#94A3B8" />
                  </TouchableOpacity>

                  {/* Renderizado de la lista de turnos (si el usuario está expandido) */}
                  {expandedUser === user.uid && (
                    <View style={adminStyles.turnosContainer}>
                      {loadingTurnos ? (
                        <ActivityIndicator size="small" color="#FF2DA0" />
                      ) : userTurnos.length === 0 ? (
                        <Text style={adminStyles.noTurnosText}>Este usuario no tiene turnos.</Text>
                      ) : (
                        userTurnos.map(turno => (
                          <View key={turno.id} style={[adminStyles.turnoAdminCard, { borderLeftColor: getStatusColor(turno.estado) }]}>
                            <Text style={adminStyles.turnoAdminTitle}>{turno.servicioNombre}</Text>
                            <Text style={adminStyles.turnoAdminDate}>{turno.fecha} | {turno.hora}</Text>
                            <Text style={[adminStyles.turnoAdminStatus, { color: getStatusColor(turno.estado) }]}>
                              Estado: {turno.estado.toUpperCase()}
                            </Text>
                            
                            {/* Botón de cancelación: Solo aparece si el turno es "confirmado" */}
                            {turno.estado === "confirmado" && (
                              <TouchableOpacity style={adminStyles.cancelarAdminBtn} onPress={() => handleCancelTurno(turno)}>
                                <Text style={adminStyles.cancelarAdminText}>Cancelar Turno</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}