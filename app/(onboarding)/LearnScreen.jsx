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

const LearnScreen = () => {
  const router = useRouter();
  const auth = getAuth();
  const [lessons, setLessons] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch lessons from Firestore
  useEffect(() => {
    async function fetchLessons() {
      try {
        const lessonsCollection = collection(db, "lessons");
        const lessonsSnapshot = await getDocs(lessonsCollection);
        const lessonsData = lessonsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLessons(lessonsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setLoading(false);
      }
    }
    fetchLessons();
  }, []);

  const toggleLesson = (lessonName) => {
    setSelectedLessons((prevSelected) =>
      prevSelected.includes(lessonName)
        ? prevSelected.filter((l) => l !== lessonName)
        : [...prevSelected, lessonName]
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
        learn: selectedLessons, // Save selected lessons under 'learn'
      });
      router.push("/(onboarding)/TeachScreen"); // Navigate to TeachScreen
    } catch (error) {
      console.error("Error updating Firestore:", error);
      Alert.alert("Error", "Failed to save your lessons. Please try again.");
    }
  };

  // Group lessons by category
  const groupedLessons = lessons.reduce((groups, lesson) => {
    const category = lesson.category || "Uncategorized";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(lesson);
    return groups;
  }, {});

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b3b98" />
        <Text style={styles.loadingText}>Loading Lessons...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>What do you want to learn?</Text>

      {/* Lesson Categories */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {Object.keys(groupedLessons).map((category) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.lessonGroup}>
              {groupedLessons[category].map((lesson) => (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonButton,
                    selectedLessons.includes(lesson.name) && styles.selectedLesson,
                  ]}
                  onPress={() => toggleLesson(lesson.name)}
                >
                  <Text
                    style={[
                      styles.lessonText,
                      selectedLessons.includes(lesson.name) && styles.selectedLessonText,
                    ]}
                  >
                    {lesson.name || "Unnamed Lesson"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
          {/* Next Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.sharedButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={styles.sharedButtonText}>Next &gt;</Text>
            </TouchableOpacity>
          </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { width: "100%", padding: 16, alignItems: "flex-start" },

  // Button container
  buttonContainer: {
    marginTop: 16,
    alignItems: "flex-end", // Align Next Button to the right
  },

  // Shared button styling
  sharedButton: {
    backgroundColor: "#3b3b98",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30, // Rounded corners
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3, // Add shadow effect for better UI
  },

  sharedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
  },

  // Specific styling for Next button
  nextButton: {
    alignSelf: "flex-end", // Align to the right (relative to container)
  },

  // Title styling
  title: {
    fontSize: 25, // Adjust font size if necessary
    fontWeight: "600",
    marginBottom: 16,
    color: "#000", // Black color for title
    textAlign: "center", // Align to the center
    width: "100%", // Full width
  },

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
  lessonGroup: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  lessonButton: {
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
  selectedLesson: { backgroundColor: "#3b3b98", borderColor: "#3b3b98" },
  lessonText: { fontSize: 14, color: "#000" },
  selectedLessonText: { color: "#fff" },

  loadingText: { fontSize: 16, marginTop: 10, color: "#3b3b98" },
});

export default LearnScreen;
