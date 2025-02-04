import { useAuth } from "@/context/authContext";
import { Redirect, Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated == "undefined") return;

    const inApp = segments[0] == "(app)";
    if (isAuthenticated && !inApp) {
      router.replace("(tabs)/Home");
    } else if (isAuthenticated == false) {
      router.replace("(auth)/WelcomeScreen");
    }
  }, [isAuthenticated]);
  {
    isAuthenticated ? (
      <Redirect href="/Home" />
    ) : (
      <Redirect href="/WelcomeScreen" />
    );
  }
}
