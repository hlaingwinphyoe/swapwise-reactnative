import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../../firebaseConfig";
import { Timestamp } from "firebase/firestore";

const MeetingInput = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [reminder, setReminder] = useState("5 minutes before");
  const [users, setUsers] = useState([]); // List of users
  const [selectedAttendees, setSelectedAttendees] = useState([]); // Selected attendees

  const navigation = useNavigation();
  const route = useRoute();
  const meeting = route.params?.meeting;

  const reminderOptions = [
    "5 minutes before",
    "10 minutes before",
    "15 minutes before",
    "30 minutes before",
    "1 hour before",
    "2 hours before",
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lessons"));
        const fetchedCategories = [];
        querySnapshot.forEach((doc) => {
          fetchedCategories.push({
            category: doc.id,
            subjects: doc.data().names,
          });
        });
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const fetchedUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchCategories();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const foundCategory = categories.find(
        (cat) => cat.category === selectedCategory
      );
      setSubjects(foundCategory ? foundCategory.subjects : []);
      setSelectedSubject("");
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (meeting) {
      setSelectedCategory(meeting.category);
      setSelectedSubject(meeting.subject);
      setIsOnline(meeting.isOnline);
      setLocation(meeting.location);
      setFromDate(meeting.from.toDate());
      setToDate(meeting.to.toDate());
      setReminder(meeting.reminder);
      setSelectedAttendees(meeting.attendees || []);
    }
  }, [meeting]);

  const handleConfirmFromDate = (date) => {
    setFromDate(date);
    setShowFromPicker(false);
  };

  const handleConfirmToDate = (date) => {
    setToDate(date);
    setShowToPicker(false);
  };

  const handleSaveMeeting = async () => {
    if (!selectedCategory || !selectedSubject || (!isOnline && !location)) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (selectedAttendees.length === 0) {
      Alert.alert("Error", "Please select at least one attendee.");
      return;
    }

    const meetingData = {
      category: selectedCategory,
      subject: selectedSubject,
      isOnline,
      location: isOnline ? "Online" : location,
      from: Timestamp.fromDate(fromDate), // Convert to Firestore timestamp
      to: Timestamp.fromDate(toDate),    // Convert to Firestore timestamp
      reminder,
      attendees: selectedAttendees,
      meetLink: isOnline ? "https://meet.google.com/xyz-abcd" : "",
      updatedAt: Timestamp.now(),
    };

    try {
      if (meeting) {
        await updateDoc(doc(db, "meetings", meeting.id), meetingData);
        Alert.alert("Success", "Meeting updated successfully!");
      } else {
        await addDoc(collection(db, "meetings"), {
          ...meetingData,
          createdAt: new Date(),
        });
        Alert.alert("Success", "Meeting created successfully!");
      }
      navigation.navigate("Calendar");
    } catch (error) {
      console.error("Error saving meeting:", error);
      Alert.alert("Error", "Failed to save the meeting. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Select Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a category" value="" />
          {categories.map((cat, index) => (
            <Picker.Item key={index} label={cat.category} value={cat.category} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Add Subject</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSubject}
          onValueChange={(itemValue) => setSelectedSubject(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a subject" value="" />
          {subjects.map((subject, index) => (
            <Picker.Item key={index} label={subject} value={subject} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Required Attendees</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue=""
          onValueChange={(itemValue) => {
            if (!selectedAttendees.includes(itemValue)) {
              setSelectedAttendees([...selectedAttendees, itemValue]);
            }
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select a user" value="" />
          {users.map((user) => (
            <Picker.Item key={user.id} label={user.name} value={user.id} />
          ))}
        </Picker>
      </View>
      <View>
        {selectedAttendees.map((attendeeId) => {
          const attendee = users.find((user) => user.id === attendeeId);
          return (
            <Text key={attendeeId} style={styles.attendeeText}>
              {attendee?.name}
            </Text>
          );
        })}
      </View>

      <Text style={styles.label}>From</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowFromPicker(true)}
      >
        <Text>{fromDate.toLocaleString()}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={showFromPicker}
        mode="datetime"
        onConfirm={handleConfirmFromDate}
        onCancel={() => setShowFromPicker(false)}
      />

      <Text style={styles.label}>To</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowToPicker(true)}
      >
        <Text>{toDate.toLocaleString()}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={showToPicker}
        mode="datetime"
        onConfirm={handleConfirmToDate}
        onCancel={() => setShowToPicker(false)}
      />

      <Text style={styles.label}>Online Meeting</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: isOnline ? "#1E1E84" : "#F5F5F5" },
          ]}
          onPress={() => setIsOnline(!isOnline)}
        >
          <Text
            style={[styles.toggleText, { color: isOnline ? "#FFFFFF" : "#000000" }]}
          >
            {isOnline ? "Yes" : "No"}
          </Text>
        </TouchableOpacity>
      </View>

      {!isOnline && (
        <>
          <Text style={styles.label}>Add Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={location}
            onChangeText={(text) => setLocation(text)}
          />
        </>
      )}

      <Text style={styles.label}>Meeting Reminder</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={reminder}
          onValueChange={(itemValue) => setReminder(itemValue)}
          style={styles.picker}
        >
          {reminderOptions.map((option, index) => (
            <Picker.Item key={index} label={option} value={option} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSaveMeeting}>
        <Text style={styles.buttonText}>
          {meeting ? "Update Meeting" : "Create Meeting"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFFFFF" },
  label: { fontSize: 16, fontWeight: "bold", color: "#1E1E84", marginBottom: 8 },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: { backgroundColor: "#F5F5F5", color: "#000000" },
  attendeeText: {
    fontSize: 14,
    color: "#1E1E84",
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#1E1E84",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  toggleContainer: { marginBottom: 15 },
  toggleButton: { padding: 10, borderRadius: 8 },
});

export default MeetingInput;