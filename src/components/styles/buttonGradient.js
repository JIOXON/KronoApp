import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function ButtonGradient({ text, onPress, width = 200, height = 45 }) {
  return (
    <TouchableOpacity style={[styles.container, { width }]} onPress={onPress}>
      <LinearGradient
        colors={['#FFA94D', '#FF2DA0']}
        style={[styles.button, { height }]}
      >
        <Text style={styles.text}>{text}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
    marginLeft: 0
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});