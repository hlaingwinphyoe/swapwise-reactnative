import { View, Text, Platform, TouchableOpacity } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/authContext";
import { useRouter } from "expo-router";

const ios = Platform.OS == "ios";
export default function HomeHeader() {
  const { top } = useSafeAreaInsets();
  const { user, logoutUser } = useAuth();
  const router = useRouter();
  const openNoti = () => {
    router.push({ pathname: "/Notifications" });
  };

  return (
    <View
      style={{
        // paddingTop: ios ? top : top + 10,
        justifyContent: "space-between",
        // shadowOpacity: 0.2,
        // shadowOffset: { width: 0, height: 0 },
      }}
      className="flex-row mb-1 items-center bg-white px-5 rounded-b-3xl border-b border-gray-200"
    >
      <View style={{ paddingVertical: 8 }}>
        <Text style={{ fontSize: 30, color: "#1E1E84" }} className="font-bold">
          SwapWise
        </Text>
      </View>
      <View>
        <TouchableOpacity onPress={openNoti}>
          <MaterialCommunityIcons name="bell-ring-outline" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Divider = () => {
  return <View className="p-px w-full bg-neutral-400" />;
};
