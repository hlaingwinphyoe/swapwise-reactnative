import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, collection, getDocs } from "firebase/firestore";

// Firebase initialization
import { app } from "../../firebaseConfig";
const db = getFirestore(app);

const HobbiesScreen = () => {
  const router = useRouter();
  const auth = getAuth();
  const [hobbies, setHobbies] = useState([]);
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch hobbies and interests from Firestore
  useEffect(() => {
    async function fetchHobbies() {
      try {
        const hobbiesCollection = collection(db, "hobbies");
        const hobbiesSnapshot = await getDocs(hobbiesCollection);
        const hobbiesData = hobbiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHobbies(hobbiesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching hobbies:", error);
        setLoading(false);
      }
    }
    fetchHobbies();
  }, []);

  const toggleHobby = (hobbyName) => {
    setSelectedHobbies((prevSelected) =>
      prevSelected.includes(hobbyName)
        ? prevSelected.filter((h) => h !== hobbyName)
        : [...prevSelected, hobbyName]
    );
  };

  const handleNext = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No authenticated user found.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        hobbies: selectedHobbies, // Save selected hobbies under 'hobbies'
      });
      router.push("/(tabs)/Home"); // Navigate to the next screen
    } catch (error) {
      console.error("Error updating Firestore:", error);
      Alert.alert("Error", "Failed to save your hobbies. Please try again.");
    }
  };

  // Group hobbies by category
  const groupedHobbies = hobbies.reduce((groups, hobby) => {
    const category = hobby.category || "Uncategorized";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(hobby);
    return groups;
  }, {});

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b3b98" />
        <Text style={styles.loadingText}>Loading Hobbies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTextLeft}>SwapWise</Text>
      </View>
      <Text style={styles.title}>What are your hobbies and interests?</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {Object.keys(groupedHobbies).map((category) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.hobbyGroup}>
              {groupedHobbies[category].map((hobby) => (
                <TouchableOpacity
                  key={hobby.id}
                  style={[
                    styles.hobbyButton,
                    selectedHobbies.includes(hobby.name) && styles.selectedHobby,
                  ]}
                  onPress={() => toggleHobby(hobby.name)}
                >
                  <Text
                    style={[
                      styles.hobbyText,
                      selectedHobbies.includes(hobby.name) && styles.selectedHobbyText,
                    ]}
                  >
                    {hobby.name || "Unnamed Hobby"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next &gt;</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { width: "100%", padding: 16, alignItems: "flex-start" },
  headerTextLeft: { fontSize: 24, fontWeight: "bold", color: "#3b3b98" },
  title: { fontSize: 18, fontWeight: "600", marginVertical: 16, textAlign: "center" },
  scrollContainer: { paddingBottom: 20 },
  categoryContainer: {
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, color: "#3b3b98" },
  hobbyGroup: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  hobbyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f5f5f5",
    margin: 5,
    minWidth: 80,
    alignItems: "center",
  },
  selectedHobby: { backgroundColor: "#3b3b98", borderColor: "#3b3b98" },
  hobbyText: { fontSize: 14, color: "#000" },
  selectedHobbyText: { color: "#fff" },
  nextButton: { marginTop: 16, backgroundColor: "#3b3b98", padding: 10, borderRadius: 20 },
  nextButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  loadingText: { fontSize: 16, marginTop: 10, color: "#3b3b98" },
});

export default HobbiesScreen;
