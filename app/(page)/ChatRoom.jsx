import React, { useState, useEffect, useRef } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getRoomId } from "@/utils/common";
import { useAuth } from "@/context/authContext";
import CustomKeyboardView from "@/components/CustomKeyboardView";
import MessageList from "@/components/MessageList";
import ChatRoomHeader from "@/components/ChatRoomHeader";

export default function ChatRoom() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId: routeUserId, userName: routeUserName } = route.params || {};
  const [userId, setUserId] = useState(routeUserId);
  const [userName, setUserName] = useState(routeUserName);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const currentUserId = user?.uid;
  const scrollViewRef = useRef();

  // Generate chat ID
  const chatId = getRoomId(currentUserId, userId);

  useEffect(() => {
    if (!routeUserId || !routeUserName) {
      console.log("route.params is undefined or missing parameters");
    } else {
      setUserId(routeUserId);
      setUserName(routeUserName);
    }
  }, [routeUserId, routeUserName]);

  useEffect(() => {
    if (!userId || !userName) {
      Alert.alert("Error", "Invalid user selected.");
      navigation.goBack(); // Navigate back if invalid
    }
  }, [userId, userName]);

  // Fetch messages
  useEffect(() => {
    if (!userId || !currentUserId) return; // Prevent fetching if userId is missing
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const chatQuery = query(
          collection(db, "messages"),
          where("chatId", "==", chatId),
          orderBy("createdAt", "asc")
        );

        const chatSnapshot = await getDocs(chatQuery);
        const fetchedMessages = chatSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(fetchedMessages);
        setLoading(false);
        console.log("Fetched messages:", fetchedMessages); // Debugging
      } catch (error) {
        setLoading(false);
        console.error("Error fetching messages:", error.message);
      }
    };

    fetchMessages();
  }, [userId, currentUserId, chatId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        chatId: chatId,
        participants: [currentUserId, userId],
        sender: currentUserId,
        receiver: userId,
        text: newMessage,
        createdAt: Timestamp.fromDate(new Date()),
      });
      setNewMessage(""); // Clear the input

      // Refetch messages after sending a new one
      const fetchMessages = async () => {
        try {
          const chatQuery = query(
            collection(db, "messages"),
            where("chatId", "==", chatId),
            orderBy("createdAt", "asc")
          );

          const chatSnapshot = await getDocs(chatQuery);
          const fetchedMessages = chatSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setMessages(fetchedMessages);
          console.log("Fetched messages after sending:", fetchedMessages); // Debugging
        } catch (error) {
          console.error("Error fetching messages:", error.message);
        }
      };

      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  useEffect(() => {
    updateScrollView();
  }, [messages]);

  useEffect(() => {
    const KeyboardDidShowListner = Keyboard.addListener(
      "keyboardDidShow",
      updateScrollView
    );

    return KeyboardDidShowListner.remove();
  }, []);

  const updateScrollView = () => {
    setTimeout(() => {
      scrollViewRef?.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <CustomKeyboardView inChat={true}>
      <View className="flex-1 bg-white">
        <ChatRoomHeader userName={userName} navigation={navigation} />

        <View className="flex-1 justify-between bg-white px-5 overflow-visible">
          <View className="">
            {loading ? (
              <ActivityIndicator color="#0000ff" size="large" className="top-10" />
            ) : (
              <MessageList
                scrollViewRef={scrollViewRef}
                messages={messages}
                currentUserId={currentUserId}
              />
            )}
          </View>
          <View className="pt-2 mb-5">
            <View className="flex-row justify-between bg-white border p-1.5 border-neutral-300 rounded-full pl-5">
              <TextInput
                value={newMessage}
                onChangeText={(text) => setNewMessage(text)}
                placeholder="Type Message"
                placeholderTextColor="#737373"
                className="flex-1 mr-2"
                style={{ fontSize: 16 }}
              />
              <TouchableOpacity
                onPress={() => {
                  handleSend();
                  Keyboard.dismiss();
                }}
                disabled={loading ? true : false}
                className="flex-row items-center gap-1 bg-primary-500 py-2.5 px-4 mr-px rounded-full"
              >
                <Text className="text-white">Send</Text>
                <Feather name="send" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </CustomKeyboardView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1E1E84",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#1E1E84",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
