import { Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // This removes the header for all screens in the "auth" folder
      }}
    >
      {/* Define screens or leave this empty to automatically pick up screens in the "auth" folder */}
    </Stack>
  );
};

export default AuthLayout;
