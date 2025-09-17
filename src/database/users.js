// Firebase client SDK
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import app from './firebaseConfig';

// Initialize Firebase
const db = getFirestore(app);

// User database with pre-made accounts
const users = [
  {
    id: 1,
    username: 'cashier',
    password: 'password123', // Plain password for demo; hashed in Firebase database
    role: 'cashier',
    displayName: 'Cashier User',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 2,
    username: 'owner',
    password: 'password123', // Plain password for demo; hashed in Firebase database
    role: 'owner',
    displayName: 'Restaurant Owner',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 3,
    username: 'admin',
    password: 'password123', // Plain password for demo; hashed in Firebase database
    role: 'admin',
    displayName: 'System Admin',
    createdAt: new Date('2024-01-01'),
    isActive: true
  }
];

// Helper functions for user management
export const getUserByUsername = (username) => {
  return users.find(user => user.username === username && user.isActive);
};

export const getUserById = (id) => {
  return users.find(user => user.id === id);
};

export const getAllUsers = () => {
  return users.filter(user => user.isActive);
};

export const getUsersByRole = (role) => {
  return users.filter(user => user.role === role && user.isActive);
};

// Authentication function
export const authenticateUser = (username, password) => {
  const user = getUserByUsername(username);
  if (!user) {
    console.log('User not found:', username);
    return null;
  }

  // Since passwords are stored in plain text here, compare directly
  const validPassword = password === user.password;

  return validPassword ? user : null;
};

// Login tracking
let loginSessions = [];

export const createLoginSession = async (userId, username, role, password) => {
  const loginTime = new Date();

  // Save to Firestore userLogs collection
  try {
    await addDoc(collection(db, 'userLogs'), {
      loggedinAs: role,
      username: username,
      // Removed password field for security reasons
      loginTime: loginTime,
      date: loginTime.toDateString(),
      time: loginTime.toTimeString()
    });
    console.log('Login session saved to Firestore');
  } catch (error) {
    console.error('Error saving login session to Firestore:', error);
  }

  // Keep in-memory for backward compatibility
  const session = {
    id: Date.now(),
    userId,
    username,
    role,
    loginTime,
    ipAddress: '127.0.0.1',
    userAgent: 'React Native App'
  };

  loginSessions.push(session);
  return session;
};

export const getLoginSessions = () => {
  return [...loginSessions];
};

export const getRecentLogins = (limit = 10) => {
  return loginSessions
    .sort((a, b) => b.loginTime - a.loginTime)
    .slice(0, limit);
};

// Clear all login sessions (for logout)
export const clearLoginSessions = () => {
  loginSessions = [];
  console.log('All login sessions cleared');
};

export default {
  users,
  getUserByUsername,
  getUserById,
  getAllUsers,
  getUsersByRole,
  authenticateUser,
  createLoginSession,
  getLoginSessions,
  getRecentLogins,
  clearLoginSessions
};
