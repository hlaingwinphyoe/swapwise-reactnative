import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        header: ({ navigation }) => {
          const showBackButton = navigation.canGoBack(); // Show back button if possible

          return (
            <View style={styles.header}>
              {showBackButton && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={navigation.goBack}
                >
                  <Text style={styles.backArrow}>{"<"}</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.title}>SwapWise</Text>
            </View>
          );
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/LogIn" options={{ headerShown: true }} />
      <Stack.Screen name="(auth)/SignUp" options={{ headerShown: true }} />
    </Stack>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Change from center to flex-start to align to the left
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  backButton: {
    position: "absolute",
    left: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E1E84",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1E1E84",
    marginLeft: 10, // Adds some space to the left of the title
  },
});
