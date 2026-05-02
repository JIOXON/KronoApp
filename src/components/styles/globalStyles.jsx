import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Rect, Circle, G } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth, signOut } from "firebase/auth";

export const AppBackground = ({ children }) => (
  <View style={styles.bgRoot}>
    <LinearGradient colors={["#04061B", "#070C2E", "#110A3A"]} style={StyleSheet.absoluteFill} />
    <LinearGradient colors={["transparent", "rgba(22,17,73,0.45)", "rgba(92,21,98,0.35)"]} style={styles.bottomGlow} />
    {children}
  </View>
);

export const Logo = ({ size = 120 }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    <Defs>
      <SvgGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFA94D" />
        <Stop offset="100%" stopColor="#FF2DA0" />
      </SvgGradient>
    </Defs>
    <Rect width="200" height="200" rx="35" fill="url(#bgGradient)" />
    <Path d="M0 145 Q45 170 100 150 T200 145 L200 200 L0 200 Z" fill="white" opacity="0.22" />
    <G transform="translate(65,50)">
      <Path d="M35 0 Q60 0 60 25 L60 60 Q60 75 50 75 Q45 75 40 70 Q35 75 30 70 Q25 75 20 70 Q15 75 10 70 Q0 75 0 60 L0 25 Q0 0 35 0 Z" fill="white" />
      <Circle cx="20" cy="30" r="6" fill="#FF5A7D" />
      <Circle cx="40" cy="30" r="6" fill="#FF5A7D" />
    </G>
  </Svg>
);

export const Navbar = ({ navigation }) => {
  const auth = getAuth();
  const handleLogout = () => signOut(auth).then(() => navigation.reset({ index: 0, routes: [{ name: "Login" }] }));

  return (
    <View style={styles.navbar}>
      <Logo size={52} />
      <TouchableOpacity onPress={handleLogout} style={styles.logoutWrap}>
        <LinearGradient colors={["#FFA94D", "#FF2DA0"]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>↪ Salir</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export const styles = StyleSheet.create({
  bgRoot: { flex: 1, backgroundColor: "#06091f" },
  bottomGlow: { position: "absolute", left: 0, right: 0, bottom: 0, height: 220 },
  navbar: { marginTop: 40, marginHorizontal: 14, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.04)", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoutWrap: { width: 145 },
  logoutBtn: { borderRadius: 30, height: 54, alignItems: "center", justifyContent: "center" },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  container: { flex: 1, alignItems: "center", paddingHorizontal: 26 },
  title: { fontSize: 64, color: "#F3F7FF", fontWeight: "800", marginTop: 10 },
  subTitle: { fontSize: 18, color: "#8E93B7", marginBottom: 20 },
  textInput: { paddingHorizontal: 22, width: "100%", height: 68, marginTop: 14, borderRadius: 35, borderWidth: 1.4, borderColor: "rgba(255,255,255,0.09)", backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 20 },
  subrayado: { fontSize: 18, color: "#FF7C99", textDecorationLine: "underline", fontWeight: "700" },
});
