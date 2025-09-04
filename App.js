import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/contexts/UserContext';

export default function App() {
  return (
    <UserProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </UserProvider>
  );
}
