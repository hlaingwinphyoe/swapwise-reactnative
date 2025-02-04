import React from "react";
import { Stack } from "expo-router";
import "../global.css";
import { AuthContextProvider } from "../context/authContext";
import HomeHeader from "@/components/HomeHeader";
import { MenuProvider } from "react-native-popup-menu";
import { useNotificationListener } from "@/utils/NotificationService";

const MainLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

const RootLayout = () => {
  useNotificationListener(); // listen for tap
  return (
    <MenuProvider>
      <AuthContextProvider>
        <MainLayout />
      </AuthContextProvider>
    </MenuProvider>
  );
};

export default RootLayout;
