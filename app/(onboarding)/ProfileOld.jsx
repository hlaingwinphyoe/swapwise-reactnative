import React, { useState, useEffect } from "react";
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
import {
  getFirestore,
  collection as firestoreCollection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { app, storage } from "../../firebaseConfig";
import { Picker } from "@react-native-picker/picker";

const ProfileSetup = () => {
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [university, setUniversity] = useState("");
  const [error, setError] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [universities, setUniversities] = useState([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const provincesCollection = firestoreCollection(db, "provinces");
        const provincesSnapshot = await getDocs(provincesCollection);
        const provincesList = provincesSnapshot.docs.map((doc) => doc.id);
        setProvinces(provincesList);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const universitiesCollection = firestoreCollection(db, "universities");
        const universitiesSnapshot = await getDocs(universitiesCollection);
        const universitiesList = universitiesSnapshot.docs.map(
          (doc) => doc.data().name
        );
        setUniversities(universitiesList);
      } catch (error) {
        console.error("Error fetching universities:", error);
      } finally {
        setLoadingUniversities(false);
      }
    };

    fetchUniversities();
  }, []);

  const fetchDistricts = async (selectedProvince) => {
    setLoadingDistricts(true);
    try {
      const provinceDoc = doc(db, "provinces", selectedProvince);
      const provinceSnapshot = await getDoc(provinceDoc);
      setDistricts(
        provinceSnapshot.exists() ? provinceSnapshot.data().districts || [] : []
      );
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleProvinceChange = (selectedProvince) => {
    setProvince(selectedProvince);
    setDistrict("");
    fetchDistricts(selectedProvince);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthday(selectedDate.toISOString().split("T")[0]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (user, imageUri) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // 2. Create a storage reference
    const storageRef = ref(storage, `/users/profilePictures`);

    const uploadTask = uploadBytesResumable(storageRef, blob);

    const downloadUrl = getDownloadURL(storageRef)
      .then((url) => console.log("Download URL:", url))
      .catch((error) => console.error("Error getting URL:", error));

    // return downloadURL;
  };

  const handleNext = async () => {
    if (
      !username ||
      !gender ||
      !birthday ||
      !province ||
      !district ||
      !university
    ) {
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

      const imageUrl = image ? await uploadImage(user, image) : null;
      console.log(imageUrl);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        username,
        gender,
        birthday,
        province,
        district,
        university,
        profilePicture: imageUrl,
      });
      router.push("/(onboarding)/LearnScreen");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Your Profile</Text>

      <View style={styles.profileImageContainer}>
        <Image
          source={
            image ? { uri: image } : require("../../assets/default-profile.png")
          }
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.cameraIconContainer}
          onPress={pickImage}
        >
          <Icon name="camera-alt" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Username */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
        />
      </View>

      {/* Gender */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderContainer}>
          {["Male", "Female", "Secret"].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.genderButton,
                gender === g && styles.genderButtonSelected,
              ]}
              onPress={() => setGender(g)}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === g && styles.genderTextSelected,
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Birthday */}
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

      {/* Province */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Province</Text>
        {loadingProvinces ? (
          <Text>Loading provinces...</Text>
        ) : (
          <Picker
            selectedValue={province}
            onValueChange={handleProvinceChange}
            style={styles.picker}
          >
            <Picker.Item label="Select your province" value="" />
            {provinces.map((prov) => (
              <Picker.Item key={prov} label={prov} value={prov} />
            ))}
          </Picker>
        )}
      </View>

      {/* District */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>District</Text>
        {loadingDistricts ? (
          <Text>Loading districts...</Text>
        ) : (
          <Picker
            selectedValue={district}
            onValueChange={(itemValue) => setDistrict(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select your district" value="" />
            {districts.map((dist) => (
              <Picker.Item key={dist} label={dist} value={dist} />
            ))}
          </Picker>
        )}
      </View>

      {/* University */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>University</Text>
        {loadingUniversities ? (
          <Text>Loading universities...</Text>
        ) : (
          <Picker
            selectedValue={university}
            onValueChange={(itemValue) => setUniversity(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select your university" value="" />
            {universities.map((uni, index) => (
              <Picker.Item key={index} label={uni} value={uni} />
            ))}
          </Picker>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#fff" },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  profileImageContainer: { alignItems: "center", marginBottom: 16 },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  cameraIconContainer: { position: "absolute", bottom: 0, right: 0 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, padding: 10, borderRadius: 8 },
  picker: { borderWidth: 1, borderRadius: 8, padding: 10 },
  genderContainer: { flexDirection: "row", justifyContent: "space-around" },
  genderButton: { padding: 10, borderWidth: 1, borderRadius: 8 },
  genderButtonSelected: { backgroundColor: "#3b3b98" },
  genderText: { textAlign: "center" },
  genderTextSelected: { color: "#fff" },
  error: { color: "red", textAlign: "center", marginBottom: 16 },
  nextButton: { backgroundColor: "#3b3b98", padding: 10, borderRadius: 8 },
  nextButtonText: { color: "#fff", textAlign: "center", fontSize: 16 },
});

export default ProfileSetup;
