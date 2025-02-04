import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { registerForPushNotifications } from "@/utils/NotificationService";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  useEffect(() => {
    // on auth state change
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
        // updateUserData(user?.uid);
        registerForPushNotifications(user?.uid);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        // console.log("not auth", isAuthenticated);
      }
    });

    return unsub;
  }, []);

  // const updateUserData = async (userId) => {
  //   const docRef = doc(db, "users", userId);
  //   const docSnap = await getDoc(docRef);

  //   if (docSnap.exists()) {
  //     let data = docSnap.data();
  //     setUser({
  //       ...user,
  //       username: data.username,
  //       profilePicture: data.profilePicture,
  //       userId: userId,
  //     });
  //   }
  // };

  const loginUser = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (e) {
      let msg = e.message;
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if (msg.includes("(auth/invalid-credential)"))
        msg = "These credentials do not match";
      return { success: false, msg };
    }
  };

  const registerUser = async (email, password, name) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = response.user;

      await setDoc(doc(db, "users", user.uid), {
        email: email,
        name: name,
        createdAt: new Date().toISOString(),
        userId: user?.uid,
      });

      return { success: true, data: response?.user };
    } catch (e) {
      let msg = e.message;
      console.log(e.message);
      if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
      if (msg.includes("(auth/email-already-in-use)"))
        msg = "Email already in use";
      return { success: false, msg };
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);

      return { success: true };
    } catch (e) {
      return { success: false, msg: e.message, error: e };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loginUser, registerUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be wrapped inside AuthContext");
  }
  return value;
};
