import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, FlatList, ActivityIndicator } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
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
        // Query Firestore for matches where the current user is either user1 or user2
        const matchesQuery = query(
          collection(db, "matches"),
          where("user1", "==", currentUserId)
        );
        const matchesQuery2 = query(
          collection(db, "matches"),
          where("user2", "==", currentUserId)
        );

        // Fetch both sets of matches
        const [matchesSnapshot1, matchesSnapshot2] = await Promise.all([
          getDocs(matchesQuery),
          getDocs(matchesQuery2),
        ]);

        // Extract matched user IDs
        const matchedUserIds = [
          ...matchesSnapshot1.docs.map((doc) => doc.data().user2),
          ...matchesSnapshot2.docs.map((doc) => doc.data().user1),
        ];

        if (matchedUserIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Fetch user details for matched users
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => matchedUserIds.includes(user.id));

        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }

      setLoading(false);
    };

    fetchMatches();
  }, [currentUserId]);

  return (
    <View className="flex-1 bg-white mx-px">
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
        <View className="flex items-center mt-72">
          No Match Users.
        </View>
      )}
    </View>
  );
}
