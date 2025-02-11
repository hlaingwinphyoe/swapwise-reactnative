import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/authContext";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getAge } from "@/utils/common";
import recommendProfiles from "../(recommendation)/Recommendation";
import { db } from "@/firebaseConfig";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import Swiper from "react-native-deck-swiper";
import { useRouter } from "expo-router";

export default function Discover() {
  const { user } = useAuth();
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [swipedUserIds, setSwipedUserIds] = useState(new Set());
  const router = useRouter();

  const { height } = Dimensions.get("window");
  const CARD_HEIGHT = height * 0.7;

  useEffect(() => {
    if (user) {
      initialFetch();
    }
  }, [user]);

  const initialFetch = async () => {
    try {
      setLoading(true);

      // First, get all previously swiped users
      const swipedQuery = query(
        collection(db, "likes"),
        where("fromUserId", "==", user?.uid)
      );
      const swipedDocs = await getDocs(swipedQuery);
      const swipedIds = new Set(
        swipedDocs.docs.map((doc) => doc.data().toUserId)
      );
      setSwipedUserIds(swipedIds);

      // Fetch a larger batch of users initially
      const usersCollection = collection(db, "users");
      const querySnapshot = await getDocs(query(usersCollection, limit(50)));

      const usersList = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          teach: doc.data().teach || [],
          learn: doc.data().learn || [],
          hobbies: doc.data().hobbies || [],
          location: doc.data().location || [0, 0],
          age: doc.data().birthday ? getAge(doc.data().birthday) : null,
        }))
        .filter(
          (potentialUser) =>
            !swipedIds.has(potentialUser.id) && potentialUser.id !== user?.uid
        );

      // Find current user for recommendations
      const currentUser = querySnapshot.docs
        .find((doc) => doc.id === user?.uid)
        ?.data();

      if (!currentUser) {
        console.error("Current user not found in database");
        return;
      }

      const recommendations = await recommendProfiles(currentUser, usersList);
      setRecommendedUsers(recommendations);
    } catch (error) {
      console.error("Error in initial fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = useCallback(
    async (cardIndex) => {
      const swipedUser = recommendedUsers[cardIndex];
      if (!swipedUser) return;

      try {
        // Add to swiped set immediately to prevent re-showing
        setSwipedUserIds((prev) => new Set([...prev, swipedUser.id]));

        // Save like to Firestore
        await addDoc(collection(db, "likes"), {
          fromUserId: user?.uid,
          toUserId: swipedUser.id,
          createdAt: Timestamp.fromDate(new Date()),
        });

        // Check for mutual match
        const mutualQuery = query(
          collection(db, "likes"),
          where("fromUserId", "==", swipedUser.id),
          where("toUserId", "==", user?.uid)
        );
        const mutualDocs = await getDocs(mutualQuery);

        if (!mutualDocs.empty) {
          // It's a match! Store match info inside users collection
          const userRef = doc(db, "users", user?.uid);
          const swipedUserRef = doc(db, "users", swipedUser.id);

          await Promise.all([
            updateDoc(userRef, {
              matches: arrayUnion({
                userId: swipedUser.id,
                matchedAt: Timestamp.fromDate(new Date()),
              }),
            }),
            updateDoc(swipedUserRef, {
              matches: arrayUnion({
                userId: user?.uid,
                matchedAt: Timestamp.fromDate(new Date()),
              }),
            }),
          ]);

          Alert.alert(
            "It's a Match! 🎉",
            "You and this person liked each other!"
          );

          // Handle match notifications
          const [user1Doc, user2Doc] = await Promise.all([
            getDoc(userRef),
            getDoc(swipedUserRef),
          ]);

          if (user1Doc.exists() && user2Doc.exists()) {
            const [username1, username2] = [
              user1Doc.data().name,
              user2Doc.data().name,
            ];
            const [token1, token2] = [
              user1Doc.data().expoPushToken,
              user2Doc.data().expoPushToken,
            ];

            if (token1)
              sendNotification(token1, `You matched with ${username2}!`);
            if (token2)
              sendNotification(token2, `You matched with ${username1}!`);
          }
        }
      } catch (error) {
        console.error("Error handling right swipe:", error);
      }
    },
    [recommendedUsers, user]
  );

  const handleSwipeLeft = useCallback(
    (cardIndex) => {
      const swipedUser = recommendedUsers[cardIndex];
      if (swipedUser) {
        setSwipedUserIds((prev) => new Set([...prev, swipedUser.id]));
      }
    },
    [recommendedUsers]
  );

  const handleAllSwiped = useCallback(() => {
    // Only fetch more if we're running very low on recommendations
    if (recommendedUsers.length < 5) {
      initialFetch();
    }
  }, [recommendedUsers.length]);

  const handleGoChat = () => {
    router.push("/(tabs)/ContactList");
  };

  // Render card component
  const renderCard = useCallback((user) => {
    if (!user) return null;

    return (
      <View
        className="w-full bg-white border border-gray-200"
        style={[styles.card, { height: CARD_HEIGHT }]}
      >
        <View className="relative flex-1">
          <Image
            source={{
              uri:
                user.profilePicture ||
                "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800",
            }}
            className="w-full h-[300px] rounded-tl-3xl rounded-tr-3xl"
            style={{ height: CARD_HEIGHT * 0.45 }}
          />
          <View className="h-20 bg-black absolute bottom-3 w-full opacity-50" />
          <View className="absolute bottom-5 left-3 w-full">
            <Text className="text-white text-2xl font-bold mb-1">
              {user.name} ({user.age || "N/A"})
            </Text>
            <View className="flex-row items-center gap-2">
              <FontAwesome name="location-arrow" size={16} color="#fff" />
              <Text className="text-white text-base">
                {user.district}, {user.province}
              </Text>
            </View>
          </View>
        </View>
        <View className="relative p-5 flex-1 overflow-hidden">
          <View className="flex-row items-start mb-5">
            <Text className="font-semibold mr-2">Speciality:</Text>
            <View className="flex-row flex-wrap gap-1.5">
              {user.teach?.map((item, index) => (
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
              {user.learn?.map((item, index) => (
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
            <Text>{user?.university}</Text>
          </View>
          <View className="absolute bottom-10 left-12 flex-row items-end justify-center">
            <TouchableOpacity style={[styles.actionButton, styles.normalWidth]}>
              <FontAwesome name="refresh" size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.customWidth]}
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
            <TouchableOpacity
              onPress={handleGoChat}
              style={[styles.actionButton, styles.normalWidth]}
            >
              <AntDesign name="message1" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (recommendedUsers.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500 font-semibold">
          No recommended users found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center w-full px-5 mt-8">
      <Swiper
        cards={recommendedUsers}
        renderCard={renderCard}
        onSwipedRight={handleSwipeRight}
        onSwipedLeft={handleSwipeLeft}
        onSwipedAll={handleAllSwiped}
        cardIndex={0}
        backgroundColor="transparent"
        stackSize={3}
        stackScale={5}
        stackSeparation={14}
        disableBottomSwipe
        disableTopSwipe
        cardVerticalMargin={5}
        cardHorizontalMargin={10}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
        // containerStyle={styles.swiperContainer}
        overlayLabels={{
          left: {
            title: "NOPE",
            style: {
              label: {
                backgroundColor: "red",
                color: "white",
                fontSize: 17,
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
                fontSize: 17,
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
  card: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
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
