import React from "react";
import { StyleSheet, View, TouchableOpacity, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { getAuth, signOut } from "firebase/auth";
import { Feather } from "@expo/vector-icons";

const ButtonGradient = ({
  text,
  onPress,
  width = 200,
  height = 45,
  iconName,
}) => {
  return (
    <TouchableOpacity
      style={[buttonStyles.container, { width }]}
      onPress={onPress}
    >
      <LinearGradient
        colors={["#FFA94D", "#FF2DA0"]}
        style={[buttonStyles.button, { height }]}
      >
        {iconName && (
          <Feather
            name={iconName}
            size={18}
            color="#fff"
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={buttonStyles.text}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 10 },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    margin: 5,
    marginLeft: 0,
  },
  text: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

const Logo = ({ size = 120, onPress }) => {
  const content = (
    <Image
      source={require("../../../assets/icon.png")}
      style={{ width: size, height: size, borderRadius: size * 0.2 }}
      resizeMode="cover"
    />
  );
  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
};

const Navbar = ({ navigation }) => {
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth)
      .then(() => navigation.reset({ index: 0, routes: [{ name: "Login" }] }))
      .catch((error) => console.log(error));
  };

  const state = navigation.getState();
  const canGoBack = state ? state.index > 0 : false;

  return (
    <View style={navbarStyles.container}>
      <View style={navbarStyles.sideBox}>
        {canGoBack && (
          <ButtonGradient
            text="Volver"
            iconName="arrow-left"
            onPress={() => navigation.goBack()}
            height={55}
            width={110}
          />
        )}
      </View>
      <View style={navbarStyles.sideBox}>
        <ButtonGradient
          text="Salir"
          iconName="log-out"
          onPress={handleLogout}
          height={55}
          width={110}
        />
      </View>
    </View>
  );
};

const navbarStyles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#16132b",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  sideBox: { width: 110, marginRight: 5 },
});

const BackgroundWaves = () => (
  <View
    style={[StyleSheet.absoluteFill, { justifyContent: "flex-end" }]}
    pointerEvents="none"
  >
    <Svg
      height="30%"
      width="100%"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <Path
        fill="#3B154D"
        fillOpacity="0.6"
        d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,170.7C960,160,
        1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,
        320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
      <Path
        fill="#1E133D"
        fillOpacity="0.8"
        d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,234.7C672,235,768,213,864,186.7C960,
        160,1056,128,1152,133.3C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,
        320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </Svg>
  </View>
);

// ESTILOS BASE
const baseStyles = {
  mainContainer: { flex: 1 },
  volverContainer: { alignItems: "center", marginTop: 10, marginBottom: 25 },
  cardGlass: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
};

const authBaseStyles = {
  contentContainer: {
    flexGrow: 1, // Permite que el contenido crezca
    width: "100%", // Ocupa todo el ancho
    alignItems: "center",
    justifyContent: "center", // <--- Esto es lo que centra verticalmente
    paddingHorizontal: 30,
    paddingVertical: 50, // Espacio extra para que no pegue a los bordes
  },
  title: {
    color: "#ffffff",
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 16,
    color: "#94A3B8",
    marginTop: 5,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 58,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  iconLeft: { marginRight: 15 },
  input: { flex: 1, color: "#ffffff", fontSize: 15 },
};

// ESTILOS POR PANTALLA

const adminStyles = StyleSheet.create({
  mainContainer: baseStyles.mainContainer,
  scrollContent: { padding: 20, paddingBottom: 50 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  label: { color: "#fff", fontSize: 16, marginTop: 15, marginBottom: 15 },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  themeItem: {
    width: "23%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderRadius: 12,
  },
  themeLabel: {
    color: "#fff",
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
  },
  loaderContainer: { marginTop: 20 },

  // Nuevos estilos: Pestañas (Tabs)
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 30,
    padding: 5,
    marginBottom: 25,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 25,
  },
  tabBtnActive: { backgroundColor: "rgba(255,255,255,0.1)" },
  tabText: { color: "#94A3B8", fontWeight: "bold", fontSize: 15 },
  tabTextActive: { color: "#FF6B8A" },

  // Nuevos estilos: Desplegable de Usuarios (Acordeón)
  userCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  userEmail: {
    flex: 1,
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 15,
  },
  turnosContainer: {
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  noTurnosText: {
    color: "#94A3B8",
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 10,
  },
  turnoAdminCard: {
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  turnoAdminTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  turnoAdminDate: { color: "#94A3B8", fontSize: 14, marginBottom: 5 },
  turnoAdminStatus: { fontSize: 13, fontWeight: "bold", marginBottom: 10 },
  cancelarAdminBtn: {
    backgroundColor: "#7f1d1d",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelarAdminText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
});

const agendarStyles = StyleSheet.create({
  mainContainer: baseStyles.mainContainer,
  loaderContainer: { flex: 1, justifyContent: "center" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 25,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  durationLabel: { color: "#94A3B8", fontSize: 16 },
  durationValue: { fontSize: 22, fontWeight: "bold" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateItem: {
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
    width: "31%",
    alignItems: "center",
  },
  dateText: { color: "#94A3B8", fontSize: 15 },
  timeItem: {
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
    width: "23%",
    alignItems: "center",
  },
  timeText: { color: "#94A3B8", fontSize: 15 },
});

const confStyles = StyleSheet.create({
  mainContainer: baseStyles.mainContainer,
  contentContainer: authBaseStyles.contentContainer,
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  subTitle: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 40,
  },
  summaryCard: {
    ...baseStyles.cardGlass,
    borderRadius: 25,
    padding: 25,
    marginBottom: 40,
    width: "100%",
  },
  serviceLabel: {
    color: "#94A3B8",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  serviceValue: { color: "#38BDF8", fontSize: 22, fontWeight: "bold" },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 20,
  },
  dateTimeRow: { flexDirection: "row", justifyContent: "space-between" },
  infoBox: { flexDirection: "row", alignItems: "center" },
  infoText: {
    color: "#E2E8F0",
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "500",
  },
});

const fpStyles = StyleSheet.create({
  mainContainer: baseStyles.mainContainer,
  contentContainer: authBaseStyles.contentContainer,
  backButton: { position: "absolute", top: 50, left: 20, padding: 10 },
  title: { ...authBaseStyles.title, fontSize: 32 },
  subTitle: { ...authBaseStyles.subTitle, marginVertical: 20, lineHeight: 20 },
  inputWrapper: { ...authBaseStyles.inputWrapper, marginBottom: 25 },
  iconLeft: authBaseStyles.iconLeft,
  input: authBaseStyles.input,
});

const homeStyles = StyleSheet.create({
  mainContainer: baseStyles.mainContainer,
  contentContainer: {
    ...authBaseStyles.contentContainer,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: { ...authBaseStyles.title, fontSize: 38, letterSpacing: 1 },
  subTitle: { ...authBaseStyles.subTitle, marginBottom: 40 },
  loader: { marginTop: 20 },
  cardsWrapper: { width: "100%", paddingHorizontal: 10 },
  cardContainer: {
    ...baseStyles.cardGlass,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 18,
  },
  textContainer: { flex: 1 },
  cardTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDescription: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
    paddingRight: 10,
  },
});

const loginStyles = StyleSheet.create({
  mainContainer: baseStyles.mainContainer,
  keyboardView: { flex: 1 },
  // CAMBIAMOS EL NOMBRE A 'scrollGrow' PARA QUE SEA CLARO
  scrollGrow: { 
    flexGrow: 1, 
    justifyContent: "center" // Fuerza el centrado en el ScrollView
  },
  contentContainer: authBaseStyles.contentContainer,
  title: { ...authBaseStyles.title, fontSize: 38, letterSpacing: 1 },
  subTitle: { ...authBaseStyles.subTitle, marginBottom: 35 },
  inputWrapper: authBaseStyles.inputWrapper,
  iconLeft: authBaseStyles.iconLeft,
  input: authBaseStyles.input,
  forgotPasswordContainer: { alignSelf: "flex-end", marginBottom: 30 },
  forgotPasswordText: { color: "#FF4D79", fontSize: 14, fontWeight: "500" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 25,
  },
  line: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  dividerText: { color: "#94A3B8", marginHorizontal: 15, fontWeight: "600" },
  registerButtonWrapper: { width: "100%" },
  outlineButtonBorder: { width: "100%", padding: 2, borderRadius: 30 },
  outlineButtonInner: {
    backgroundColor: "#0d1326",
    borderRadius: 28,
    height: 53,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineButtonText: { color: "#FF6B8A", fontWeight: "bold", fontSize: 16 },
  footerText: {
    marginTop: 40,
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: { color: "#FF4D79" },
});

const misTurnosStyles = StyleSheet.create({
  mainContainer: baseStyles.mainContainer,
  contentContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 25,
  },
  loader: { marginTop: 50 },
  card: {
    ...baseStyles.cardGlass,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#38BDF8",
    marginBottom: 10,
  },
  dateTimeText: { color: "#E2E8F0", fontSize: 15, marginBottom: 10 },
  statusText: { fontWeight: "bold", fontSize: 14 },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between",
  },
  reprogramarBtn: {
    backgroundColor: "#2A344A",
    paddingVertical: 12,
    borderRadius: 10,
    flex: 0.48,
    alignItems: "center",
  },
  cancelarBtn: {
    backgroundColor: "#7f1d1d",
    paddingVertical: 12,
    borderRadius: 10,
    flex: 0.48,
    alignItems: "center",
  },
  btnText: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  emptyText: { color: "#94A3B8", textAlign: "center", marginTop: 30 },
});

const registerStyles = StyleSheet.create({
  mainContainer: baseStyles.mainContainer,
  keyboardView: { flex: 1 },
  scrollGrow: { 
    flexGrow: 1, 
    justifyContent: "center" 
  },
  contentContainer: authBaseStyles.contentContainer,
  title: { ...authBaseStyles.title, fontSize: 32 },
  subTitle: { ...authBaseStyles.subTitle, marginBottom: 30 },
  inputWrapper: authBaseStyles.inputWrapper,
  iconLeft: authBaseStyles.iconLeft,
  input: authBaseStyles.input,
  loaderWrapper: { marginTop: 20, width: "100%", alignItems: "center" },
  footerContainer: { marginTop: 35, alignItems: "center" },
  footerText: { color: "#94A3B8", fontSize: 15, marginBottom: 8 },
  loginLinkText: {
    color: "#FF4D79",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

const servicesStyles = StyleSheet.create({
  mainContainer: baseStyles.mainContainer,
  contentContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  loader: { marginTop: 50 },
  card: { ...baseStyles.cardGlass, marginBottom: 20, borderLeftWidth: 4 },
  cardTopRow: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 65,
    height: 65,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  infoContainer: { flex: 1 },
  serviceName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  serviceDescription: { fontSize: 14, color: "#94A3B8", marginBottom: 8 },
  timeRow: { flexDirection: "row", alignItems: "center" },
  timeText: { fontSize: 14, color: "#94A3B8", marginLeft: 6 },
  agendarBtn: {
    marginTop: 20,
    width: 150,
    height: 45,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  agendarText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});

export {
  adminStyles,
  agendarStyles,
  confStyles,
  fpStyles,
  homeStyles,
  loginStyles,
  misTurnosStyles,
  registerStyles,
  servicesStyles,
  Logo,
  Navbar,
  ButtonGradient,
  BackgroundWaves,
};
