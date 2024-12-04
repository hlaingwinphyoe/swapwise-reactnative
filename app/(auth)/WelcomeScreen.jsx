import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/logo.png")} // Adjusted relative path for assets
          style={styles.logo}
        />
        <Text style={styles.title}>SwapWise</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>
          Discover Endless Possibilities with SwapWise
        </Text>
        <Text style={styles.description}>
          Where Creativity Meets Innovation: Embark on a Journey of Limitless Exploration.
        </Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.emailButton}
        onPress={() => router.push("/(auth)/SignUp")}
      >
        <Text style={styles.emailButtonText}>Continue with Email</Text>
      </TouchableOpacity>

      {/* Social Icons */}
      <View style={styles.socialIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="google" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="apple" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // Light background
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E1E84",
  },
  contentContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E1E84",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#8A8A8A",
    textAlign: "center",
    marginTop: 10,
  },
  emailButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E1E84",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
  },
  iconButton: {
    width: 50,
    height: 50,
    backgroundColor: "#CDCDE0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
