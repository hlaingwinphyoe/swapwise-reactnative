import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { app, storage, auth } from "../../firebaseConfig";
import * as FileSystem from "expo-file-system";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const ProfileSetup = () => {
  const [image, setImage] = useState(null); // Store the selected image
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState(""); // New field: Username
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

   const defaultImage = require("../../assets/default-profile.png"); // Add a sample image to your project

   const pickImage = async () => {
     // Request permissions to access the media library
     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

     if (!permissionResult.granted) {
       Alert.alert("Permission Required", "You need to grant permission to access the photo library.");
       return;
     }

     // Launch the image picker
     const result = await ImagePicker.launchImageLibraryAsync({
       mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correct option
       allowsEditing: true,
       aspect: [1, 1],
       quality: 1,
     });

     // Check if an image was selected
     if (!result.canceled) {
       setImage(result.assets[0].uri);
     } else {
       setImage(defaultImage); // Fallback to the default image
     }
   };


const uploadImage = async (user, imageUri) => {
  try {
    if (!user) throw new Error("User not authenticated.");
    if (!imageUri) throw new Error("No image URI provided.");

    console.log("Uploading image...");
    console.log("Image URI:", imageUri);

    // Check the file size before proceeding
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    console.log("File size:", fileInfo.size);

    // Validate if the file size exceeds 10MB
    if (fileInfo.size > 10 * 1024 * 1024) {
      throw new Error("File size exceeds the 10MB limit.");
    }

    // Fetch the image file and convert it to a Blob
    const response = await fetch(imageUri);
    if (!response.ok) throw new Error("Failed to fetch image URI.");
    const blob = await response.blob();

    // Reference to Firebase Storage
    const storageRef = ref(storage, `users/${user.uid}/profileImage`);
    console.log(`Uploading to path: users/${user.uid}/profileImage`);

    // Upload the Blob to Firebase Storage
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Image uploaded successfully. URL:", downloadURL);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};


const handleNext = async () => {
  if (!username || !gender || !birthday || !province || !university) {
    setError("All fields are required.");
    return;
  }
  setError(""); // Clear any previous errors

  try {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    let imageUrl = "";
    if (image) {
      console.log("Starting image upload...");
      imageUrl = await uploadImage(user, image);
    } else {
      console.log("No image provided, skipping upload.");
    }

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      username,
      gender,
      birthday,
      province,
      university,
      profilePicture: imageUrl || null,
    });

    Alert.alert("Success", "Profile updated successfully!");
    router.push("/(onboarding)/LearnScreen");
  } catch (error) {
    console.error("Error in handleNext:", error);
    Alert.alert("Error", error.message || "Failed to update the profile.");
  }
};



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Profile</Text>

      {/* Profile Picture */}
      <View style={styles.profileImageContainer}>
        <Image
          source={
            image
              ? { uri: image }
              : require("../../assets/default-profile.png") // Default profile picture
          }
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.cameraIconContainer} onPress={pickImage}>
          <Icon name="camera-alt" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Username Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
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
      <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={uploading}>
        <Text style={styles.nextButtonText}>{uploading ? "Uploading..." : "Next >"}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 16,
    textAlign: "center",
    color: "#3b3b98",
  },
  profileImageContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cameraIcon: {
    width: 24,
    height: 24,
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
