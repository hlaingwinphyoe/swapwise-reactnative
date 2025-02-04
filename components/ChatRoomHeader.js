import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Entypo } from "@expo/vector-icons";

export default function ChatRoomHeader({ userName, navigation }) {
  return (
    <Stack.Screen
      options={{
        title: "",
        headerShadowVisible: true,
        headerLeft: () => (
          <View className="flex-row items-center gap-1">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Entypo name="chevron-left" size={24} color="#525252" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-lg font-medium text-gray-400 mx-2">Chat with</Text>
              <Text className="font-bold text-primary-500 text-xl">
                {userName || "Loading..."}
              </Text>
            </View>
          </View>
        ),
      }}
    />
  );
}
