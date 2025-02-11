import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { blurhash, formatDate, getRoomId } from "@/utils/common";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default function ContactItem({ item, router, currentUser }) {
  const [lastMsg, setLastMsg] = useState(undefined);

  useEffect(() => {
    let chatId = getRoomId(currentUser?.uid, item?.id);

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "desc")
    );

    let unsub = onSnapshot(q, (snapshot) => {
      let allMessages = snapshot.docs.map((doc) => {
        return doc.data();
      });
      setLastMsg(allMessages[0] ? allMessages[0] : null);
    });

    return unsub;
  }, []);

  const renderTime = () => {
    if (lastMsg) {
      let date = lastMsg?.createdAt;
      return formatDate(new Date(date?.seconds * 1000));
    }
  };

  const renderLasMessage = () => {
    if (lastMsg == "undefined") return "Loading...";
    if (lastMsg) {
      if (currentUser?.userId == lastMsg?.userId)
        return "You: " + lastMsg?.text;

      return lastMsg?.text;
    } else {
      return "Say Hi 👋";
    }
  };

  const handleChatStart = (user) => {
    router.push({
      pathname: "/ChatRoom",
      params: { userId: user.id, userName: user.name },
    });
  };
  return (
    <TouchableOpacity
      onPress={() => handleChatStart(item)}
      className={`flex-row justify-between mx-4 items-center mb-4 pb-2 border-b border-b-neutral-200`}
    >
      <Image
        style={{ height: 65, width: 65, borderRadius: 100 }}
        source={{
          uri:
            item?.profileUrl ||
            "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800",
        }}
        placeholder={blurhash}
        transition={500}
      />
      {/* name & message */}
      <View className="flex-1 gap-1.5">
        <View className="flex-row justify-between">
          <Text
            style={{ fontSize: 16 }}
            className="font-semibold text-neutral-800"
          >
            {item?.username}
          </Text>
          <Text
            style={{ fontSize: 14 }}
            className="font-medium text-neutral-500"
          >
            {renderTime()}
            {/* Time */}
          </Text>
        </View>
        <Text style={{ fontSize: 14 }} className="font-medium text-neutral-500">
          {renderLasMessage()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
