import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { getAge } from "@/utils/common";
import recommendProfiles from "../(recommendation)/Recommendation";
import { db } from "@/firebaseConfig";
import { FontAwesome } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";

export default function Home() {
  const { user } = useAuth();
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [swipedUsers, setSwipedUsers] = useState(new Set());
  const currentUserId = user?.uid;

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchRecommendedUsers(user?.uid);
    } else {
      setLoading(false);
    }
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
          data.age = getAge(data.birthday);
        }

        return { id: doc.id, ...data };
      });

      const currentUser = usersList.find((user) => user.id === uid);
      // console.log(currentUser);
      if (!currentUser) {
        console.error("Logged-in user not found in database.");
        setLoading(false);
        return;
      }

      const otherUsers = usersList.filter((user) => user.id !== currentUser.id);

      const recommendations = await recommendProfiles(currentUser, otherUsers);

      setRecommendedUsers(recommendations);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users that haven't been swiped yet
  const fetchNextUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");

      // Get already swiped users
      const swipedQuery = query(
        collection(db, "likes"),
        where("fromUserId", "==", currentUserId)
      );

      const swipedDocs = await getDocs(swipedQuery);
      const swipedIds = new Set([...swipedUsers]);
      swipedDocs.forEach((doc) => swipedIds.add(doc.data().toUserId));

      // Query for users not in swipedIds
      const usersQuery = query(usersRef, limit(10));
      const userDocs = await getDocs(usersQuery);

      const newProfiles = [];
      userDocs.forEach((doc) => {
        const userData = doc.data();
        if (!swipedIds.has(doc.id) && doc.id !== currentUserId) {
          newProfiles.push({
            id: doc.id,
            ...userData,
          });
        }
      });

      // setRecommendedUsers((prevProfiles) => [...prevProfiles, ...newProfiles]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleNextUser = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % recommendedUsers.length); // Cycle through recommended users
  };

  const handleSwipeRight = async (cardIndex) => {
    const swipedUser = recommendedUsers[cardIndex];
    try {
      await addDoc(collection(db, "likes"), {
        fromUserId: user?.uid,
        toUserId: swipedUser.id,
        createdAt: Timestamp.fromDate(new Date()),
      });

      // setSwipedUsers((prev) => new Set([...prev, swipedProfile.id]));

      // match users
      const likesRef = collection(db, "likes");
      const q = query(
        likesRef,
        where("fromUserId", "==", swipedUser.id),
        where("toUserId", "==", user?.uid)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Create a match
        await addDoc(collection(db, "matches"), {
          user1: user?.uid,
          user2: swipedUser.id,
          createdAt: Timestamp.fromDate(new Date()),
          swipedUsername: swipedUser.username,
          swipedUserProfile: swipedUser.profilePicture,
        });

        Alert.alert(
          "It's a Match! 🎉",
          "You and this person liked each other!"
        );

        const user1Doc = await getDoc(doc(db, "users", user?.uid));
        const user2Doc = await getDoc(doc(db, "users", swipedUser.id));

        if (user1Doc.exists() && user2Doc.exists()) {
          const username1 = user1Doc.data().name;
          const username2 = user2Doc.data().name;
          const user1Token = user1Doc.data().expoPushToken;
          const user2Token = user2Doc.data().expoPushToken;

          // Send notifications to both users
          if (user1Token)
            sendNotification(user1Token, `You matched with ${username2}!`);
          if (user2Token)
            sendNotification(user2Token, `You matched with ${username1}!`);
        }
      }
    } catch (error) {
      console.error("Error handling swipe:", error);
    }
  };

  const handleSwipeLeft = () => {};

  // Send Push Notification
  const sendNotification = async (expoPushToken, message) => {
    // console.log("token:", expoPushToken);
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title: "🎉 It's a Match!",
        body: message,
      }),
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (recommendedUsers.length === 0 || !recommendedUsers[currentIndex]) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500 font-semibold">
          No recommended users found
        </Text>
      </View>
    );
  }

  const renderCard = (currentUser) => {
    return (
      <View
        className="w-full elevation rounded-3xl bg-white border border-gray-200"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1.5 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        }}
      >
        <View className="relative">
          <Image
            source={{
              uri:
                currentUser.profilePicture ||
                "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800",
            }}
            className="w-full h-[300px] rounded-tl-3xl rounded-tr-3xl"
          />
          <View className="h-20 bg-black absolute bottom-0 w-full opacity-50"></View>
          <View className="absolute bottom-3 left-3 w-full">
            <Text className="text-white text-2xl font-bold mb-1">
              {currentUser.name} ({currentUser.age || "N/A"})
            </Text>
            <View className="flex-row items-center gap-2">
              <FontAwesome name="location-arrow" size={16} color="#fff" />
              <Text className="text-white text-base">
                {currentUser.district}, {currentUser.province}
              </Text>
            </View>
          </View>
        </View>
        <View className="p-5 w-full overflow-hidden">
          <View className="flex-row items-start mb-5">
            <Text className="font-semibold mr-2">Speciality:</Text>
            <View className="flex-row flex-wrap gap-1.5">
              {currentUser.teach?.map((item, index) => (
                <Text
                  key={index}
                  className="bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-sm"
                >
                  {item}
                </Text>
              ))}
            </View>
          </View>
          <View className="flex-row items-start mb-8">
            <Text className="font-semibold mr-2">Need:</Text>
            <View className="flex-row flex-wrap gap-1.5">
              {currentUser.learn?.map((item, index) => (
                <Text
                  key={index}
                  className="bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-sm"
                >
                  {item}
                </Text>
              ))}
            </View>
          </View>
          <View className="flex-row items-start mb-8">
            <Text className="font-semibold mr-2">University:</Text>
            <View className="flex-row flex-wrap gap-1.5">
              <Text>{currentUser?.university}</Text>
            </View>
          </View>
          <View className="flex-row items-end justify-center mb-4">
            <TouchableOpacity style={[styles.actionButton, styles.normalWidth]}>
              <FontAwesome name="refresh" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.customWidth]}
              onPress={handleNextUser}
              className="ml-8 mr-4"
            >
              <FontAwesome name="close" size={30} color="#dc2626" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.customWidth]}
              className="mr-8"
              onPress={handleSwipeRight}
            >
              <FontAwesome name="heart" size={30} color="#16a34a" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.normalWidth]}>
              <FontAwesome name="bookmark" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 justify-center items-center w-full px-5">
      <Swiper
        cards={recommendedUsers}
        renderCard={renderCard}
        onSwipedRight={handleSwipeRight}
        onSwipedLeft={() => {}}
        cardIndex={0}
        backgroundColor="transparent"
        stackSize={3}
        cardVerticalMargin={1}
        cardHorizontalMargin={10}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
        overlayLabels={{
          left: {
            title: "NOPE",
            style: {
              label: {
                backgroundColor: "red",
                color: "white",
                fontSize: 20,
              },
              wrapper: {
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                marginTop: 30,
                marginLeft: -30,
              },
            },
          },
          right: {
            title: "LIKE",
            style: {
              label: {
                backgroundColor: "green",
                color: "white",
                fontSize: 20,
              },
              wrapper: {
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                marginTop: 30,
                marginLeft: 30,
              },
            },
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: "100%",
    backgroundColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  customWidth: {
    width: 60,
    height: 60,
  },
  normalWidth: {
    width: 45,
    height: 45,
  },
});
