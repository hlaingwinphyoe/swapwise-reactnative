import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getAuth } from "firebase/auth";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarPage = () => {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [highlightedDays, setHighlightedDays] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); // Add state for users
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUser = auth.currentUser; // Get the currently logged-in user

  const handleMonthChange = (direction) => {
    const newMonth = new Date(
      selectedDay.setMonth(selectedDay.getMonth() + direction)
    );
    setSelectedDay(newMonth);
    fetchMeetings(newMonth);
  };

  const fetchUsers = async () => {
    if (!currentUser) return; // Ensure there is a logged-in user
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

  const fetchMeetings = async (day) => {
    if (!currentUser) return; // Ensure there is a logged-in user
    try {
      setLoading(true);
      const meetingsRef = collection(db, "meetings");
      const startOfMonth = new Date(day.getFullYear(), day.getMonth(), 1, 0, 0, 0);
      const endOfMonth = new Date(day.getFullYear(), day.getMonth() + 1, 0, 23, 59, 59);

      // Query meetings where the current user is a participant
      const q = query(
        meetingsRef,
        where("from", ">=", startOfMonth),
        where("from", "<=", endOfMonth),
        where("attendees", "array-contains", currentUser.uid) // Filter by participant
      );
      const querySnapshot = await getDocs(q);

      const fetchedMeetings = [];
      const highlightDays = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const meetingDate = new Date(data.from.seconds * 1000);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (meetingDate >= today) {
          highlightDays.add(meetingDate.toDateString());
        }

        fetchedMeetings.push({ id: doc.id, ...data });
      });

      console.log("Query Snapshot Size:", querySnapshot.size); // Debug log
      console.log("Fetched Meetings:", fetchedMeetings); // Debug log
      setHighlightedDays(highlightDays);
      setMeetings(fetchedMeetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUpcomingMeetings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.from.seconds * 1000);
      return meetingDate > today;
    });
  };

  const filterMeetingsForSelectedDay = () => {
    const filteredMeetings = meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.from.seconds * 1000);
      return meetingDate.toDateString() === selectedDay.toDateString();
    });
    console.log("Filtered Meetings for Selected Day:", filteredMeetings); // Debug log
    return filteredMeetings;
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers(); // Fetch users when the component mounts
      fetchMeetings(selectedDay); // Fetch meetings when the component mounts
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMeetings(selectedDay); // Fetch meetings when selectedDay changes
  }, [selectedDay]);

  const renderCalendarRows = () => {
    const startOfWeek = new Date(
      selectedDay.getFullYear(),
      selectedDay.getMonth(),
      selectedDay.getDate() - selectedDay.getDay()
    );

    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    return (
      <View style={styles.calendarRow}>
        {dates.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              highlightedDays.has(day.toDateString())
                ? styles.highlightedDay
                : null,
              day.toDateString() === selectedDay.toDateString()
                ? styles.selectedDay
                : null,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayText,
                day.toDateString() === selectedDay.toDateString()
                  ? styles.selectedDayText
                  : null,
              ]}
            >
              {day.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => setPopupVisible(null)} // Close the popup menu on outside press
    >
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Calendar Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => handleMonthChange(-1)}>
              <Text style={styles.headerButton}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>
              {selectedDay.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity onPress={() => handleMonthChange(1)}>
              <Text style={styles.headerButton}>{">"}</Text>
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View style={styles.weekdays}>
            {weekdays.map((day, index) => (
              <Text key={index} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Days */}
          <View>{renderCalendarRows()}</View>

          {/* Meetings for Selected Date */}
          <View style={styles.meetingList}>
            <Text style={styles.meetingHeader}>
              Meetings on {selectedDay.toDateString()}
            </Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : filterMeetingsForSelectedDay().length === 0 ? (
              <Text style={styles.noMeetingsText}>
                No meetings scheduled for this day.
              </Text>
            ) : (
              filterMeetingsForSelectedDay().map((meeting) => (
                <View key={meeting.id} style={styles.meetingCard}>
                  <Text style={styles.meetingTitle}>{meeting.subject}</Text>
                  <Text style={styles.meetingDetails}>
                    {new Date(meeting.from.seconds * 1000).toDateString()}
                  </Text>
                  <Text style={styles.meetingDetails}>
                    {new Date(meeting.from.seconds * 1000).toLocaleTimeString()} -{" "}
                    {new Date(meeting.to.seconds * 1000).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.meetingDetails}>
                    {meeting.isOnline ? "Online" : "Offline"}
                  </Text>
                </View>
              ))
            )}
          </View>

          {/* Upcoming Meetings Section */}
          <View style={styles.meetingList}>
            <Text style={styles.meetingHeader}>Upcoming Meetings</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : filterUpcomingMeetings().length === 0 ? (
              <Text style={styles.noMeetingsText}>
                No upcoming meetings scheduled.
              </Text>
            ) : (
              filterUpcomingMeetings().map((meeting) => (
                <View key={meeting.id} style={styles.meetingCard}>
                  <Text style={styles.meetingTitle}>{meeting.subject}</Text>
                  <Text style={styles.meetingDetails}>
                    {new Date(meeting.from.seconds * 1000).toDateString()}
                  </Text>
                  <Text style={styles.meetingDetails}>
                    {new Date(meeting.from.seconds * 1000).toLocaleTimeString()} -{" "}
                    {new Date(meeting.to.seconds * 1000).toLocaleTimeString()}
                  </Text>
                  <Text style={styles.meetingDetails}>
                    {meeting.isOnline ? "Online" : "Offline"}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Add Meeting Button */}
        <TouchableOpacity
          style={styles.addMeetingButton}
          onPress={() => navigation.navigate("MeetingInput")}
        >
         <Text style={styles.addMeetingButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerButton: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E1E84",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E1E84",
  },
  weekdays: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8A8A8A",
  },
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  highlightedDay: {
    backgroundColor: "#ADD8E6",
  },
  selectedDay: {
    backgroundColor: "#1E1E84",
    borderRadius: 20,
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  dayText: {
    fontSize: 16,
    color: "#000000",
  },
  meetingList: {
    marginTop: 16,
  },
  meetingHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1E1E84",
  },
  meetingCard: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  meetingDetails: {
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 4,
  },
  addMeetingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1E1E84",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addMeetingButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
  },


});

export default CalendarPage;