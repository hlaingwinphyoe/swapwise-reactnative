import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function Chat() {
  const [users, setUsers] = useState([]);
  const router = useRouter();
  const currentUserId = getAuth().currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter out the current user
      setUsers(usersList.filter((user) => user.id !== currentUserId));
    };

    fetchUsers();
  }, [currentUserId]);

  const handleChatStart = (user) => {
    console.log("Navigating to chatRoom with:", user); // Debugging
    // Use user.id to navigate to the dynamic chat room
    console.log("Navigating to chatRoom with:", user.email);
    console.log("Navigating to chatRoom with:", user.id, user.name);
    router.push({
      pathname: "/ChatRoom",
      params: { userId: user.id, userName: user.name }, // Pass the correct user data
    }); // Pass the selected user's ID
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Contacts</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => handleChatStart(item)}
          >
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E1E84",
    marginBottom: 20,
    textAlign: "center",
  },
  userCard: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
});