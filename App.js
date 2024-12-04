import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignUpPage from "./app/(auth)/sign-up/page";
import LoginPage from "./app/(auth)/log-in/page";
import LearnScreen from "./app/(onboarding)/LearnScreen";
import TeachScreen from "./app/(onboarding)/TeachScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Sign Up"
          component={SignUpPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Log In"
          component={LoginPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Learn"
          component={LearnScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Teach"
          component={TeachScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
