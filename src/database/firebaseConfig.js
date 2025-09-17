// Firebase configuration for client SDK
import { initializeApp } from 'firebase/app';

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

export default app;
