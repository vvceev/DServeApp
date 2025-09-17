// Firebase connection configuration
require('dotenv').config();
const admin = require('firebase-admin');

// Firebase service account key (you need to download this from Firebase Console)
const serviceAccount = require('./firebase-service-account.json'); // Path to your service account key

// Initialize Firebase Admin SDK
const initializeFirebase = async () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Add your Firebase project ID
        projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id'
      });
    }
    console.log('Firebase initialized successfully');
    return admin.firestore();
  } catch (error) {
    console.error('Firebase initialization error:', error);
    process.exit(1);
  }
};

module.exports = initializeFirebase;
