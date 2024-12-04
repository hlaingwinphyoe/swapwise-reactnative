import { TailwindProvider } from 'tailwindcss-react-native';
import { ExpoRouter } from 'expo-router';

export default function App() {
  return (
    <TailwindProvider>
      <ExpoRouter />
    </TailwindProvider>
  );
}
