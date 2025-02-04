import { blurhash } from "@/utils/common";
import { FontAwesome } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Card() {
  return (
    <View
      className="w-full elevation rounded-3xl bg-white border border-gray-200"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      }}
    >
      <View className="relative">
        <Image
          source={{
            uri:
              currentUser.profilePicture || "https://via.placeholder.com/300",
          }}
          className="w-full h-[300px] rounded-tl-3xl rounded-tr-3xl"
          placeholder={blurhash}
          transition={500}
        />
        <View className="h-20 bg-black absolute bottom-0 w-full opacity-50"></View>
        <View className="absolute bottom-3 left-3 w-full">
          <Text className="text-white text-2xl font-bold mb-1">
            {currentUser.name} ({currentUser.age || "N/A"})
          </Text>
          <View className="flex-row items-center gap-2">
            <FontAwesome name="location-arrow" size={16} color="#fff" />
            <Text className="text-white text-base">
              {currentUser.district}, {currentUser.province}
            </Text>
          </View>
        </View>
      </View>
      <View className="p-5 w-full overflow-hidden">
        <View className="flex-row items-start mb-5">
          <Text className="font-semibold mr-2">Speciality:</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {currentUser.teach?.map((item, index) => (
              <Text
                key={index}
                className="bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-sm"
              >
                {item}
              </Text>
            ))}
          </View>
        </View>
        <View className="flex-row items-start mb-8">
          <Text className="font-semibold mr-2">Need:</Text>
          <View className="flex-row flex-wrap gap-1.5">
            {currentUser.learn?.map((item, index) => (
              <Text
                key={index}
                className="bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-sm"
              >
                {item}
              </Text>
            ))}
          </View>
        </View>
        <View className="flex-row items-end justify-center mb-4">
          <TouchableOpacity style={[styles.actionButton, styles.normalWidth]}>
            <FontAwesome name="refresh" size={16} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.customWidth]}
            onPress={handleNextUser}
            className="ml-8 mr-4"
          >
            <FontAwesome name="close" size={30} color="#dc2626" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.customWidth]}
            className="mr-8"
            onPress={handleSwipeRight}
          >
            <FontAwesome name="heart" size={30} color="#16a34a" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.normalWidth]}>
            <FontAwesome name="bookmark" size={16} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
