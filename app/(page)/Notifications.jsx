import { View, Text, ActivityIndicator, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import NotiHeader from "@/components/NotiHeader";
import NotiCard from "@/components/NotiCard";
import "../../global.css";
import { useAuth } from "@/context/authContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function Notifications() {
  const navigation = useNavigation();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const noNoti = useState("No new Messages.");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getMatches(user?.uid);
      console.log("matches", matches);
    }
  }, []);

  // Function to fetch matches for a user
  const getMatches = async (userId) => {
    try {
      setLoading(true);
      const q = query(collection(db, "matches"), where("user1", "==", userId));

      const q2 = query(collection(db, "matches"), where("user2", "==", userId));

      const querySnapshot1 = await getDocs(q);
      const querySnapshot2 = await getDocs(q2);

      const data = [...querySnapshot1.docs, ...querySnapshot2.docs].map((doc) =>
        doc.data()
      );
      setMatches(data);
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      console.error("Error fetching matches:", error);
      return [];
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
      {/* <StatusBar style="dark" /> */}
      <NotiHeader navigation={navigation} />
      <View className="flex-1 m-2">
        {matches.length > 0 ? (
          <FlatList
            data={matches}
            contentContainerStyle={{ flex: 1, paddingVertical: 5 }}
            keyExtractor={(item) => Math.random()}
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
