import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { getFirestore, collection, addDoc, query, getDocs, updateDoc, doc, where, getDoc } from "firebase/firestore";
import { Navbar, BackgroundWaves, ButtonGradient, loginStyles, adminStyles } from "../styles/globalStyles";
import { showAlert } from "../utils/alertMessage";

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

// FUNCIÓN PARA ENVIAR EL PUSH
const enviarNotificacionPush = async (expoPushToken, fecha, hora) => {
  if (!expoPushToken) return;

  const mensaje = {
    to: expoPushToken,
    sound: 'default',
    title: 'Turno Cancelado ❌',
    body: `El administrador ha cancelado tu turno para el ${fecha} a las ${hora}.`,
    data: { fecha: fecha, hora: hora },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mensaje),
  });
};

const enviarCorreoCancelacion = async (correoCliente, fecha, hora, servicioNombre) => {
  if (!correoCliente) return;

  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: "TU_SERVICE_ID",   // Reemplaza esto con el ID de EmailJS
        template_id: "TU_TEMPLATE_ID", // Reemplaza esto con el ID de tu plantilla
        user_id: "TU_PUBLIC_KEY",      // Reemplaza esto con tu Public Key de EmailJS
        template_params: {
          to_email: correoCliente, // Esto inyecta el correo del usuario
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
  const [view, setView] = useState("servicios"); 

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[11]);
  const [loadingService, setLoadingService] = useState(false);

  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [expandedUser, setExpandedUser] = useState(null); 
  const [userTurnos, setUserTurnos] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  
  const db = getFirestore();

  const handleAddService = async () => {
    if (!name || !description || !duration) {
      showAlert("Atención", "empty-fields");
      return;
    }
    setLoadingService(true);
    try {
      await addDoc(collection(db, "services"), {
        name, description, duration: parseInt(duration), icon: selectedTheme.icon, color: selectedTheme.color, createdAt: new Date()
      });
      showAlert("Éxito", "service-success");
      setName(""); setDescription(""); setDuration(""); setSelectedTheme(THEME_OPTIONS[11]); 
    } catch (error) {
      showAlert("Error", "service-error");
    } finally {
      setLoadingService(false);
    }
  };

  useEffect(() => {
    if (view === "usuarios") fetchUsuarios();
  }, [view]);

  const fetchUsuarios = async () => {
    setLoadingUsers(true);
    try {
      const q = query(collection(db, "usuarios"));
      const snap = await getDocs(q);
      const usersList = [];
      snap.forEach(documento => {
        const data = documento.data();
        if (data.rol !== "admin") usersList.push({ id: documento.id, ...data });
      });
      setUsuarios(usersList);
    } catch (error) {
      console.log(error);
    }
    setLoadingUsers(false);
  };

  const handleSelectUser = async (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    
    setExpandedUser(userId);
    setLoadingTurnos(true);
    try {
      const q = query(collection(db, "turnos"), where("clienteId", "==", userId));
      const snap = await getDocs(q);
      
      const turnosList = [];
      const ahora = new Date();

      snap.forEach(documento => {
        let data = documento.data();
        let id = documento.id;

        if (data.estado === "confirmado" && data.fecha && data.hora) {
          const [dia, mes, anio] = data.fecha.split("/");
          const [hora, min] = data.hora.split(":");
          const fechaDelTurno = new Date(anio, mes - 1, dia, hora, min);

          if (fechaDelTurno < ahora) {
            data.estado = "finalizado";
            updateDoc(doc(db, "turnos", id), { estado: "finalizado" }).catch(e => console.log(e));
          }
        }
        turnosList.push({ id, ...data });
      });

      setUserTurnos(turnosList.sort((a, b) => b.creadoEn - a.creadoEn));
    } catch (error) {
      console.log(error);
    }
    setLoadingTurnos(false);
  };

const handleCancelTurno = (turno) => {
  showAlert("Cancelar Turno", "¿Estás seguro de cancelar este turno?", async () => {
    try {
      // 1. Cancelamos el turno en Firebase
      await updateDoc(doc(db, "turnos", turno.id), { estado: "cancelado" });
      
      // 2. Buscamos el token del celular del usuario dueño de la cita
      const userDoc = await getDoc(doc(db, "usuarios", turno.clienteId));
      if (userDoc.exists() && userDoc.data().expoPushToken) {
        const tokenDelUsuario = userDoc.data().expoPushToken;
        
        // 3. Enviamos la notificación Push (al celular)
        await enviarNotificacionPush(tokenDelUsuario, turno.fecha, turno.hora);
      }

      // 4. ¡NUEVO! Enviamos el correo electrónico de cancelación (al Gmail del usuario)
      // Usamos turno.clienteEmail porque ya lo guardábamos al agendar el turno
      await enviarCorreoCancelacion(turno.clienteEmail, turno.fecha, turno.hora, turno.servicioNombre);

      // 5. Actualizamos la lista visualmente en el panel
      setUserTurnos(prev => prev.map(t => t.id === turno.id ? { ...t, estado: "cancelado" } : t));
      showAlert("Éxito", "cancel-success");
      
    } catch (error) {
      console.log(error);
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

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={adminStyles.mainContainer}>
      <BackgroundWaves />
      <Navbar navigation={navigation} showBackButton={true} />

      <ScrollView contentContainerStyle={adminStyles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={adminStyles.tabContainer}>
          <TouchableOpacity style={[adminStyles.tabBtn, view === "servicios" && adminStyles.tabBtnActive]} onPress={() => setView("servicios")} activeOpacity={0.7}>
            <Text style={[adminStyles.tabText, view === "servicios" && adminStyles.tabTextActive]}>Servicios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[adminStyles.tabBtn, view === "usuarios" && adminStyles.tabBtnActive]} onPress={() => setView("usuarios")} activeOpacity={0.7}>
            <Text style={[adminStyles.tabText, view === "usuarios" && adminStyles.tabTextActive]}>Usuarios</Text>
          </TouchableOpacity>
        </View>

        {view === "servicios" && (
          <View>
            <Text style={adminStyles.title}>Crear Nuevo Servicio</Text>

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
              {THEME_OPTIONS.map((theme) => (
                <TouchableOpacity key={theme.id} onPress={() => setSelectedTheme(theme)} activeOpacity={0.7} style={[adminStyles.themeItem, { borderColor: selectedTheme.id === theme.id ? theme.color : "transparent", backgroundColor: selectedTheme.id === theme.id ? `${theme.color}15` : "rgba(255,255,255,0.05)" }]}>
                  <Feather name={theme.icon} size={28} color={theme.color} />
                  <Text style={adminStyles.themeLabel} numberOfLines={1}>{theme.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {loadingService ? (
              <ActivityIndicator size="large" color="#FF2DA0" style={adminStyles.loaderContainer} />
            ) : (
              <ButtonGradient text="Guardar Servicio" onPress={handleAddService} width="100%" height={55} />
            )}
          </View>
        )}

        {view === "usuarios" && (
          <View>
            <Text style={adminStyles.title}>Gestión de Turnos</Text>
            
            {loadingUsers ? (
              <ActivityIndicator size="large" color="#38BDF8" style={adminStyles.loaderContainer} />
            ) : usuarios.length === 0 ? (
              <Text style={adminStyles.noTurnosText}>No hay usuarios registrados.</Text>
            ) : (
              usuarios.map((user) => (
                <View key={user.id} style={adminStyles.userCard}>
                  
                  <TouchableOpacity style={adminStyles.userHeader} onPress={() => handleSelectUser(user.uid)} activeOpacity={0.7}>
                    <Feather name="user" size={20} color="#38BDF8" />
                    <Text style={adminStyles.userEmail}>{user.email}</Text>
                    <Feather name={expandedUser === user.uid ? "chevron-up" : "chevron-down"} size={20} color="#94A3B8" />
                  </TouchableOpacity>

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