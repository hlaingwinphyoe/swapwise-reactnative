import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "expo-router";

export default function Home() {
  const auth = getAuth(); // Ensure this is connected to your Firebase config
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Log out the user
      console.log("Logged out successfully!"); // Debugging
      router.push("/(auth)/LogIn"); // Navigate to sign-in page
    } catch (error) {
      console.error("Sign out error:", error.message); // Debugging
      Alert.alert("Error", error.message); // Display error to the user
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SwapWise!</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E1E84",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#FF9001",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});