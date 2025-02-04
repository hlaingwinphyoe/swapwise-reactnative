import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function MessageItem({ message, currentUserId }) {
  return (
    <View
      style={[
        styles.messageContainer,
        message.sender === currentUserId
          ? styles.myMessage
          : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    borderRadius: 100,
    marginVertical: 5,
    maxWidth: "75%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#D2D2F8",
    borderWidth: 1,
    borderColor: "#D2D2F8",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  messageText: {
    color: "#000",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  otherMessageText: { color: "#000000" },
});
