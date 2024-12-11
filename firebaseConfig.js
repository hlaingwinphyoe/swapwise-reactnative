//import { initializeApp } from "firebase/app";
//import { initializeAuth, getReactNativePersistence } from "firebase/auth";
//import { getStorage } from "firebase/storage";
//import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
//
//// Firebase Configuration
//const firebaseConfig = {
//  apiKey: "AIzaSyBqVDPpxePN0lNO762p0GS0mO39kW3OIk4",
//  authDomain: "swapwise-def94.firebaseapp.com",
//  projectId: "swapwise-def94",
//  storageBucket: "swapwise-def94.appspot.com", // Ensure this matches Firebase Console exactly
//  messagingSenderId: "804359109023",
//  appId: "1:804359109023:android:00fb5e0937742be7ab65aa",
//};
//
//// Initialize Firebase App
//const app = initializeApp(firebaseConfig);
//
//// Initialize Firebase Auth with React Native persistence
//export const auth = initializeAuth(app, {
//  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
//});
//
//// Initialize Firebase Storage
//export const storage = getStorage(app); // This provides access to Firebase Storage
//
//export { app };

// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqVDPpxePN0lNO762p0GS0mO39kW3OIk4",
  authDomain: "swapwise-def94.firebaseapp.com",
  projectId: "swapwise-def94",
  storageBucket: "swapwise-def94.appspot.com", // Ensure this matches Firebase Console exactly
  messagingSenderId: "804359109023",
  appId: "1:804359109023:android:00fb5e0937742be7ab65aa",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
