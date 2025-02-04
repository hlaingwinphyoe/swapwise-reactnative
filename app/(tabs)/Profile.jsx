import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "expo-router";

export default function Profile() {
  const { logoutUser, user } = useAuth();
  const router = useRouter();
  const handleLogOut = async () => {
    await logoutUser();
    return router.push("/(auth)/WelcomeScreen");
  };
  return (
    <View className="flex-col h-screen items-center justify-center">
      <Text className="mb-5">Profile for {user?.email}</Text>
      <TouchableOpacity
        onPress={handleLogOut}
        className="py-3 px-5 bg-red-500 text-white rounded-lg"
      >
        <Text className="text-white">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
