// User database with pre-made accounts
const users = [
  {
    id: 1,
    username: 'cashier1',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt hash for 'password123'
    role: 'cashier',
    displayName: 'Cashier User',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 2,
    username: 'owner1',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt hash for 'password123'
    role: 'owner',
    displayName: 'Restaurant Owner',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 3,
    username: 'admin1',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt hash for 'password123'
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
  if (!user) return null;
  
  // In a real app, you'd use bcrypt.compare() here
  // For demo purposes, we'll just check if password matches the hash
  // Note: This is simplified for demonstration - use proper bcrypt in production
  
  // The hash below is for 'password123'
  const validPassword = password === 'password123'; // Simplified for demo
  
  return validPassword ? user : null;
};

// Login tracking
let loginSessions = [];

export const createLoginSession = (userId, username, role) => {
  const session = {
    id: Date.now(),
    userId,
    username,
    role,
    loginTime: new Date(),
    ipAddress: '127.0.0.1', // In real app, get from request
    userAgent: 'React Native App' // In real app, get from device
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
