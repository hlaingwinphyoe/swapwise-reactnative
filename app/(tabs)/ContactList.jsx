import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, FlatList, ActivityIndicator, Text } from "react-native";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  where,
  query,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import ContactItem from "@/components/ContactItem";
import { useAuth } from "@/context/authContext";

export default function Chat() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const currentUserId = user?.uid;

  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);

    const fetchMatches = async () => {
      try {
        const userRef = doc(db, "users", currentUserId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("User document not found!");
          setUsers([]);
          setLoading(false);
          return;
        }

        const matches = userSnap.data().matches || [];

        if (!Array.isArray(matches) || matches.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Extract the user IDs from the matches array
        const matchedUserIds = matches.map((match) => match.userId);

        if (matchedUserIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Efficiently fetch matched users using a query with "where" clause
        const usersCollection = collection(db, "users");
        const q = query(
          usersCollection,
          where("__name__", "in", matchedUserIds)
        ); // Use __name__ for document IDs
        const usersSnapshot = await getDocs(q);

        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Add matchedAt information to the user objects.
        const usersWithMatchInfo = usersList.map((user) => {
          const matchData = matches.find((match) => match.userId === user.id);
          return { ...user, matchedAt: matchData?.matchedAt }; // Add matchedAt if found
        });

        setUsers(usersWithMatchInfo);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUserId]);

  return (
    <View className="flex-1 bg-white m-3">
      {loading ? (
        <View className="flex items-center mt-72">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ContactItem
              router={router}
              item={item}
              index={index}
              currentUser={user}
            />
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500 font-semibold">No Match Users.</Text>
        </View>
      )}
    </View>
  );
}
