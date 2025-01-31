import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { db, auth } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { recommendProfiles } from "../(recommendation)/Recommendation"; // Import recommendation logic

const Home = () => {
  const [recommendedUsers, setRecommendedUsers] = useState([]); // Store recommended profiles
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current user index
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchRecommendedUsers(user.uid); // Fetch recommended profiles for the logged-in user
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchRecommendedUsers = async (uid) => {
    try {
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(usersCollection);

      const usersList = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        data.teach = data.teach || [];
        data.learn = data.learn || [];
        data.hobbies = data.hobbies || [];
        data.location = data.location || [0, 0];

        if (data.birthday) {
          const birthDate = new Date(data.birthday);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          if (
            today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() &&
              today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          data.age = age;
        }

        return { id: doc.id, ...data };
      });

      const currentUser = usersList.find((user) => user.id === uid);
      if (!currentUser) {
        console.error("Logged-in user not found in database.");
        setLoading(false);
        return;
      }

      const otherUsers = usersList.filter((user) => user.id !== uid);

      // **Fix: Await the recommendation function**
      const recommendations = await recommendProfiles(currentUser, otherUsers);

      console.log("Recommended Users:", recommendations); // Debugging Log

      setRecommendedUsers(recommendations); // Update state properly
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextUser = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % recommendedUsers.length); // Cycle through recommended users
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (recommendedUsers.length === 0 || !recommendedUsers[currentIndex]) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>No recommended users found</Text>
      </View>
    );
  }

  const currentUser = recommendedUsers[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{
            uri:
              currentUser.profilePicture || "https://via.placeholder.com/300",
          }}
          style={styles.image}
        />
        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.bold}>Speciality:</Text>
            <View style={[styles.tagsContainer, styles.wrap]}>
              {currentUser.teach?.map((item, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.bold}>Need:</Text>
            <View style={[styles.tagsContainer, styles.wrap]}>
              {currentUser.learn?.map((item, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.infoText}>
            {currentUser.name} ({currentUser.age || "N/A"})
          </Text>
          <Text style={styles.infoText}>{currentUser.province}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, styles.refresh]}>
            <Text style={styles.actionIcon}>⟳</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.reject]}
            onPress={handleNextUser}
          >
            <Text style={styles.actionIcon}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.love]}>
            <Text style={styles.actionIcon}>❤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.other]}>
            <Text style={styles.actionIcon}>📋</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  card: {
    borderRadius: 20,
    width: "90%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  details: {
    margin: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 5,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // Allow tags to wrap to the next line
    alignItems: "flex-start", // Align tags to the start
    maxWidth: "100%", // Prevent overflow
  },
  tag: {
    backgroundColor: "#e0e0e0",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5, // Ensure spacing between rows of tags
  },
  tagText: {
    fontSize: 14,
    color: "#000",
  },
  info: {
    marginHorizontal: 15,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 20,
  },
  refresh: {
    backgroundColor: "#d9edf7",
  },
  reject: {
    backgroundColor: "#f8d7da",
  },
  love: {
    backgroundColor: "#d4edda",
  },
  other: {
    backgroundColor: "#d6d8db",
  },
});

export default Home;
