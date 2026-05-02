import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
container: {
    flex: 1,
    padding: 25,
    backgroundColor: "#0F172A", // azul oscuro elegante
    justifyContent: "center",
},

title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#E2E8F0",
},

card: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
},

service: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#38BDF8", // azul brillante
},

duration: {
    color: "#94A3B8",
    marginTop: 5,
},

label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
    color: "#CBD5F5",
},

input: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#334155",
    color: "#E2E8F0",
},

buttonContainer: {
    marginTop: 25,
    alignItems: "center",
},

option: {
backgroundColor: "#1E293B",
padding: 10,
borderRadius: 10,
margin: 5,
color: "#E2E8F0",
},

optionSelected: {
backgroundColor: "#22C55E",
color: "#fff",
},
});