import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, FlatList, ActivityIndicator } from "react-native";
import { collection, getDocs } from "firebase/firestore";
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
    setLoading(true);
    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter out the current user
      setUsers(usersList.filter((user) => user.id !== currentUserId));
      setLoading(false);
    };

    fetchUsers();
  }, [currentUserId]);

  return (
    <View className="flex-1 bg-white">
      {users.length > 0 ? (
        <FlatList
          data={users}
          // contentContainerStyle={{ flex: 1, paddingVertical: 25 }}
          // showsVerticalScrollIndicator={false}
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
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}
