import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useRouter, Slot, useSegments } from "expo-router";
import { FontAwesome, Entypo, Ionicons } from "@expo/vector-icons";
import HomeHeader from "../../components/HomeHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();

  // Function to determine the active tab for styling
  const isActive = (route) => segments.includes(route);

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <HomeHeader />

        {/* Content */}
        <View style={styles.content}>
          <Slot />
        </View>
      </SafeAreaView>

      {/* Custom Tab Bar - Fixed at Bottom */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/(tabs)/Home")}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color={isActive("Home") ? "#1E1E84" : "#888"}
          />
          <Text style={[styles.tabText, isActive("Home") && styles.activeTab]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/(tabs)/Discover")}
        >
          <Ionicons
            name="compass-outline"
            size={24}
            color={isActive("Discover") ? "#1E1E84" : "#888"}
          />
          <Text style={[styles.tabText, isActive("Discover") && styles.activeTab]}>
            Browse
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/(tabs)/Calendar")}
        >
          <Entypo
            name="calendar"
            size={24}
            color={isActive("Calendar") ? "#1E1E84" : "#888"}
          />
          <Text style={[styles.tabText, isActive("Calendar") && styles.activeTab]}>
            Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push("/(tabs)/ContactList")}
        >
          <FontAwesome
            name="comments-o"
            size={24}
            color={isActive("ContactList") ? "#1E1E84" : "#888"}
          />
          <Text style={[styles.tabText, isActive("ContactList") && styles.activeTab]}>
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
                  style={styles.tabButton}
                  onPress={() => router.push("/(tabs)/Profile")}
                >
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color={isActive("Profile") ? "#1E1E84" : "#888"}
                  />
                  <Text
                    style={[styles.tabText, isActive("Profile") && styles.activeTab]}
                  >
                    Profile
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    // Prevents overlap with tab bar
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F5F5F5",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  tabButton: {
    alignItems: "center",
  },
  tabText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  activeTab: {
    color: "#1E1E84",
    fontWeight: "bold",
  },
});
