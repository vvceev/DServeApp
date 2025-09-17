import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/contexts/UserContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

export default function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </NotificationProvider>
    </UserProvider>
  );
}
