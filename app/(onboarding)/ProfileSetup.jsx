import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";

import { app } from "../../firebaseConfig";

const ProfileSetup = () => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState(null); // Store the date
  const [province, setProvince] = useState("");
  const [university, setUniversity] = useState("");
  const [error, setError] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false); // Toggle DatePicker
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthday(selectedDate.toISOString().split("T")[0]); // Format YYYY-MM-DD
    }
  };

  const handleNext = async () => {
    if (!name || !gender || !birthday || !province || !university) {
      setError("All fields are required.");
      return;
    }
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not authenticated.");
        return;
      }
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name,
        gender,
        birthday,
        province,
        university,
      });

      Alert.alert("Success", "Profile updated successfully!");
      router.push("/(onboarding)/LearnScreen");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>SwapWise</Text>
      </View>
      <Text style={styles.title}>Create Your Profile</Text>

      {/* Input Fields */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Gender Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Male" && styles.genderButtonSelected,
            ]}
            onPress={() => setGender("Male")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "Male" && styles.genderTextSelected,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Female" && styles.genderButtonSelected,
            ]}
            onPress={() => setGender("Female")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "Female" && styles.genderTextSelected,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Secret" && styles.genderButtonSelected,
            ]}
            onPress={() => setGender("Secret")}
          >
            <Text
              style={[
                styles.genderText,
                gender === "Secret" && styles.genderTextSelected,
              ]}
            >
              Secret
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Birthday Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Birthday</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{birthday || "Select your birthday"}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthday ? new Date(birthday) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Province</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your province"
          value={province}
          onChangeText={setProvince}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>University</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your university"
          value={university}
          onChangeText={setUniversity}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next &gt;</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    width: "100%",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "flex-start",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b3b98",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 16,
    textAlign: "center",
    color: "#3b3b98",
  },
  inputGroup: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    width: "100%",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  genderButtonSelected: {
    backgroundColor: "#3b3b98",
    borderColor: "#3b3b98",
  },
  genderText: {
    color: "#333",
  },
  genderTextSelected: {
    color: "#fff",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginVertical: 10,
    textAlign: "center",
  },
  nextButton: {
    marginTop: 16,
    backgroundColor: "#3b3b98",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileSetup;
