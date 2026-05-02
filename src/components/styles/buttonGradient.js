import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ButtonGradient({ text, onPress, width = 200, height = 45, outlined = false }) {
  if (outlined) {
    return (
      <TouchableOpacity style={[styles.container, { width }]} onPress={onPress}>
        <LinearGradient colors={["#FFA94D", "#FF2DA0"]} style={[styles.outline, { height }]}>
          <View style={styles.inner}><Text style={[styles.text, { color: "#FF8D79" }]}>{text}</Text></View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.container, { width }]} onPress={onPress}>
      <LinearGradient colors={["#FFA94D", "#FF2DA0"]} style={[styles.button, { height }]}>
        <Text style={styles.text}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 16 },
  button: { width: "100%", borderRadius: 35, alignItems: "center", justifyContent: "center", shadowColor: "#FF5AA8", shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  outline: { width: "100%", borderRadius: 35, padding: 1.5 },
  inner: { flex: 1, borderRadius: 34, backgroundColor: "rgba(8,12,43,0.95)", alignItems: "center", justifyContent: "center" },
  text: { color: "#fff", fontWeight: "bold", fontSize: 22 },
});
