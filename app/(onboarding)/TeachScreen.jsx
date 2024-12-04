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

const TeachScreen = () => {
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
        teach: selectedLessons, // Save selected lessons under 'teach'
      });
      router.push("/(onboarding)/HobbiesScreen"); // Navigate to the next screen
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTextLeft}>SwapWise</Text>
      </View>
      <Text style={styles.title}>What can you teach?</Text>
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
  nextButton: { marginTop: 16, backgroundColor: "#3b3b98", padding: 10, borderRadius: 20 },
  nextButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  loadingText: { fontSize: 16, marginTop: 10, color: "#3b3b98" },
});

export default TeachScreen;
