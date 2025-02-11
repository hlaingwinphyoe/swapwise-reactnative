import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Home = () => {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserName(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserName = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().name);
      } else {
        console.log("User not found in Firestore.");
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E1E84" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome {userName ? `${userName},` : "to SwapWise"}
      </Text>
      <Text style={styles.subtitle}>Find your perfect study partner today!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E1E84",
    textAlign: "center",
    marginBottom: 10, // Space below title
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
  },
});

export default Home;