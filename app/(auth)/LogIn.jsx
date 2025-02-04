import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/authContext";
import CustomKeyboardView from "@/components/CustomKeyboardView";

export default function LogInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { loginUser, user } = useAuth();

  // const handleSignIn = async () => {
  //   if (!email || !password) {
  //     Alert.alert("Error", "Please fill in all fields.");
  //     return;
  //   }
  //   try {
  //     await signInWithEmailAndPassword(auth, email, password);
  //     Alert.alert("Success", "Logged in successfully!");
  //     router.push("/(tabs)/Home"); // Navigate to LearnScreen
  //   } catch (error) {
  //     Alert.alert("Error", error.message);
  //   }
  // };
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Login", "Please fill all the fields.");
      return;
    }

    setLoading(true);
    const response = await loginUser(email, password);
    setLoading(false);
    if (!response.success) {
      Alert.alert("Login Failed", response.msg);
    } else {
      router.push("/(onboarding)/ProfileSetup");
    }
  };

  return (
    <CustomKeyboardView className="flex-1">
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>SwapWise</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8A8A8A"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8A8A8A"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignIn}
            disabled={loading ? true : false}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => router.push("/(auth)/SignUp")}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </CustomKeyboardView>
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E1E84",
  },
  form: {
    width: "100%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    color: "#000000",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E1E84",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  footerText: {
    color: "#8A8A8A",
    marginTop: 20,
    fontSize: 14,
  },
  footerLink: {
    color: "#1E1E84",
    fontWeight: "bold",
  },
});
