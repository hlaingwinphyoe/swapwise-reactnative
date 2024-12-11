import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        header: () => {
          return (
            <View style={styles.header}>
              <Text style={styles.title}>SwapWise</Text>
            </View>
          );
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/LogIn" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/SignUp" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", // Align the title to the left
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1E1E84",
  },
});
