import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WelcomePage({ route }) {
  const { name } = route.params; // Get the user's name from the navigation parameters

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, {name || 'User'}!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
});
