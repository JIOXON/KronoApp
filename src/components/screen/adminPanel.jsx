import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { getFirestore, collection, addDoc } from "firebase/firestore";
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

export default function AdminPanel({ navigation }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[11]);
  const [loading, setLoading] = useState(false);
  
  const db = getFirestore();

  const handleAddService = async () => {
    if (!name || !description || !duration) {
      showAlert("Atención", "empty-fields");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "services"), {
        name,
        description,
        duration: parseInt(duration),
        icon: selectedTheme.icon,
        color: selectedTheme.color,
        createdAt: new Date()
      });

      showAlert("Éxito", "service-success");
      setName("");
      setDescription("");
      setDuration("");
      setSelectedTheme(THEME_OPTIONS[11]); 
    } catch (error) {
      console.error("Error agregando servicio:", error);
      showAlert("Error", "service-error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#16132b", "#0F172A", "#080c17"]} style={adminStyles.mainContainer}>
      <BackgroundWaves />
      <Navbar navigation={navigation} />

      <ScrollView contentContainerStyle={adminStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={adminStyles.title}>Crear Nuevo Servicio</Text>

        <View style={loginStyles.inputWrapper}>
          <Feather name="edit-2" size={20} color="#FF6B8A" style={loginStyles.iconLeft} />
          <TextInput
            style={loginStyles.input}
            placeholder="Nombre del servicio"
            placeholderTextColor="#64748B"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={loginStyles.inputWrapper}>
          <Feather name="align-left" size={20} color="#FF6B8A" style={loginStyles.iconLeft} />
          <TextInput
            style={loginStyles.input}
            placeholder="Breve descripción"
            placeholderTextColor="#64748B"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={loginStyles.inputWrapper}>
          <Feather name="clock" size={20} color="#FF6B8A" style={loginStyles.iconLeft} />
          <TextInput
            style={loginStyles.input}
            placeholder="Duración en minutos (Ej. 30)"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
        </View>

        <Text style={adminStyles.subtitle}>Selecciona un Icono y Tema:</Text>
        
        <View style={adminStyles.gridContainer}>
          {THEME_OPTIONS.map((theme) => (
            <TouchableOpacity 
              key={theme.id}
              onPress={() => setSelectedTheme(theme)}
              activeOpacity={0.7}
              style={[
                adminStyles.gridItem,
                {
                  borderColor: selectedTheme.id === theme.id ? theme.color : "transparent",
                  backgroundColor: selectedTheme.id === theme.id ? `${theme.color}15` : "rgba(255,255,255,0.05)"
                }
              ]}
            >
              <Feather name={theme.icon} size={28} color={theme.color} />
              <Text style={adminStyles.gridItemText} numberOfLines={1}>
                {theme.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF2DA0" style={adminStyles.loaderContainer} />
        ) : (
          <ButtonGradient text="Guardar Servicio" onPress={handleAddService} width="100%" height={55} />
        )}
      </ScrollView>
    </LinearGradient>
  );
}