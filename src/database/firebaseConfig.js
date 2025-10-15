// Firebase configuration for client SDK
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDKpv8qoZ7QLqidNVPPJsjkM3nEth5qBwg",
  authDomain: "dserveappdb.firebaseapp.com",
  projectId: "dserveappdb",
  storageBucket: "dserveappdb.appspot.com",
  messagingSenderId: "215856026696",
  appId: "1:215856026696:web:297e667ff6fc333dd4f47d",
  measurementId: "G-LEFFM87E2W"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
