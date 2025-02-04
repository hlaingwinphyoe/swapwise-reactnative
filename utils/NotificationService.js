import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";

// Request permission and get Expo push token
export const registerForPushNotifications = async (userId) => {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Push notifications permission not granted.");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token)

    await setDoc(
      doc(db, "users", userId),
      { expoPushToken: token },
      { merge: true }
    );
  } else {
    console.warn("Must use a physical device for push notifications");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
};

export const useNotificationListener = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Listen for when a notification is tapped
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification tapped!", response);
        navigation.navigate("Notifications"); // Navigate to the notifications list
      }
    );

    return () => subscription.remove();
  }, []);
};
