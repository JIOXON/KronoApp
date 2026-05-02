import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Rect, Circle, G } from "react-native-svg";
import ButtonGradient from "./buttonGradient";
import { getAuth, signOut } from "firebase/auth";

const Logo = ({ size = 120 }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    <Defs>
      <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFA94D" />
        <Stop offset="100%" stopColor="#FF2DA0" />
      </LinearGradient>
    </Defs>

    <Rect x="0" y="0" width="200" height="200" rx="30" fill="url(#bgGradient)" />

    <Path
      d="M0 150 Q50 180 100 160 T200 150 L200 200 L0 200 Z"
      fill="white"
      opacity="0.2"
    />

    <G transform="translate(65,50)">
      <Path
        d="M35 0 Q60 0 60 25 L60 60 Q60 75 50 75 
        Q45 75 40 70 Q35 75 30 70 
        Q25 75 20 70 Q15 75 10 70 
        Q0 75 0 60 L0 25 Q0 0 35 0 Z"
        fill="white"
      />
      <Circle cx="20" cy="30" r="6" fill="#FF5A7D" />
      <Circle cx="40" cy="30" r="6" fill="#FF5A7D" />
    </G>
  </Svg>
);

const Navbar = ({ navigation }) => {
  const auth = getAuth();

  const handleLogout = () => {
  signOut(auth)
    .then(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

  return (
    <View
      style={{
        marginTop: 40,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#1E1E1E",
      }}
    >
      <Logo size={60} />

      <View style={{ width: 60, marginRight: '40' }}>
  <ButtonGradient
    text="Salir"
    onPress={handleLogout}
    height={50}
    width={100}
  />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 50,
    color: "#000",
    fontWeight: "bold",
    marginTop: 10,
  },
  subTitle: {
    fontSize: 20,
    color: "gray",
    marginBottom: 10,
  },
  textInput: {
    padding: 10,
    paddingStart: 20,
    width: "80%",
    height: 50,
    marginTop: 15,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  subrayado: {
    fontSize: 20,
    color: "gray",
    marginBottom: 20,
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
});

export { styles, Logo, Navbar };
