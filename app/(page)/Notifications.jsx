import { View, Text, ActivityIndicator, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import NotiHeader from "@/components/NotiHeader";
import NotiCard from "@/components/NotiCard";
import "../../global.css";
import { useAuth } from "@/context/authContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Notifications() {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const noNoti = "No new Messages.";
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getMatches(user?.uid);
    }
  }, [user]);

  // Function to fetch matches from user's document
  const getMatches = async (userId) => {
    try {
      setLoading(true);
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userMatches = userData.matches || []; // Assuming matches is an array of match objects
        setMatches(userMatches);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching matches:", error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <NotiHeader navigation={navigation} />
      <View className="flex-1 m-2">
        {matches.length > 0 ? (
          <FlatList
            data={matches}
            contentContainerStyle={{ flex: 1, paddingVertical: 5 }}
            keyExtractor={(item) => item.id || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <NotiCard match={item} index={index} title="Congratulations" />
            )}
          />
        ) : (
          <View className="flex-row justify-center items-center h-[75vh] gap-4">
            <FontAwesome name="bell-slash" size={25} />
            <Text className="text-xl">{noNoti}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
