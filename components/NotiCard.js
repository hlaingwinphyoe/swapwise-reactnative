import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Image } from "expo-image";
import { blurhash } from "@/utils/common";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default function NotiCard({ title, match }) {
  const router = useRouter();
  const [matchUser, setMatchUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchUser = async () => {
      if (match?.userId) {
        try {
          const matchUserRef = doc(db, "users", match.userId);
          const matchUserDoc = await getDoc(matchUserRef);
          if (matchUserDoc.exists()) {
            setMatchUser(matchUserDoc.data());
          }
        } catch (error) {
          console.error("Error fetching match user:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchMatchUser();
  }, [match?.userId]);

  const goChatRoom = () => {
    router.push({
      pathname: "/ChatRoom",
      params: { userId: match?.userId, userName: matchUser?.name },
    });
  };

  if (loading) {
    return <ActivityIndicator size="small" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.textContainer}>
          <Text style={{ fontWeight: "bold", marginHorizontal: 5 }}>You</Text>
          <Text style={{ color: "#4b5563", fontWeight: "500" }}>and</Text>
          <Text style={{ fontWeight: "bold", marginHorizontal: 5 }}>
            {matchUser?.username || "Someone"}
          </Text>
          <Text style={{ color: "#4b5563", fontWeight: "500" }}>
            matched. Start Chat!
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={goChatRoom}>
          <Text style={{ color: "#ffffff" }}>Message</Text>
        </TouchableOpacity>
      </View>
      <Image
        source={{
          uri:
            matchUser?.profileImage ||
            "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800",
        }}
        placeholder={blurhash}
        transition={500}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    padding: 15,
  },
  leftContainer: {},
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  title: {
    fontSize: 20,
    marginBottom: 5,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#1E1E84",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 100,
    marginHorizontal: "auto",
    marginTop: 10,
  },
  image: {
    width: 65,
    height: 65,
    borderRadius: 100,
  },
});
