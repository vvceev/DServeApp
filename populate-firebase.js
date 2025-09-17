const admin = require('firebase-admin');
const serviceAccount = require('./src/database/firebase-service-account.json');

require('dotenv').config();

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = admin.firestore();

// Sample data
const usersData = [
  {
    id: '1',
    username: 'cashier',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'cashier',
    displayName: 'Cashier User',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: '2',
    username: 'owner',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'owner',
    displayName: 'Restaurant Owner',
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: '3',
    username: 'admin',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'admin',
    displayName: 'System Admin',
    createdAt: new Date('2024-01-01'),
    isActive: true
  }
];

const inventoryData = [
  {
    id: '1',
    name: 'Caramel Macchiato',
    category: 'coffee',
    serving: 50,
    expiryDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: '2',
    name: 'Mild Buldak',
    category: 'snacks',
    serving: 30,
    expiryDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    id: '3',
    name: 'Iced Americano',
    category: 'coffee',
    serving: 40,
    expiryDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: '4',
    name: 'Blueberry Soda',
    category: 'coolers',
    serving: 25,
    expiryDate: new Date('2024-06-30'),
    isActive: true
  },
  {
    id: '5',
    name: 'Red Horse',
    category: 'alcohol',
    serving: 20,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  }
];

const menuItemsData = [
  {
    id: '1',
    name: 'Caramel Macchiato',
    category: 'coffee',
    basePrice: 120,
    isAvailable: true
  },
  {
    id: '2',
    name: 'Mild Buldak',
    category: 'snacks',
    basePrice: 150,
    isAvailable: true
  },
  {
    id: '3',
    name: 'Iced Americano',
    category: 'coffee',
    basePrice: 100,
    isAvailable: true
  },
  {
    id: '4',
    name: 'Blueberry Soda',
    category: 'coolers',
    basePrice: 80,
    isAvailable: true
  },
  {
    id: '5',
    name: 'Red Horse',
    category: 'alcohol',
    basePrice: 60,
    isAvailable: true
  }
];

async function populateFirebase() {
  try {
    console.log('Populating Firebase with sample data...');

    // Populate users
    for (const user of usersData) {
      await db.collection('users').doc(user.id).set({
        username: user.username,
        password: user.password,
        role: user.role,
        displayName: user.displayName,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: new Date()
      });
    }
    console.log('Users populated');

    // Populate inventory
    for (const item of inventoryData) {
      await db.collection('inventory').doc(item.id).set({
        name: item.name,
        category: item.category,
        serving: item.serving,
        expiryDate: item.expiryDate,
        isActive: item.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log('Inventory populated');

    // Populate menu items
    for (const item of menuItemsData) {
      await db.collection('menuItems').doc(item.id).set({
        name: item.name,
        category: item.category,
        basePrice: item.basePrice,
        isAvailable: item.isAvailable,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log('Menu items populated');

    console.log('Firebase populated successfully');
  } catch (error) {
    console.error('Population error:', error);
  } finally {
    admin.app().delete();
  }
}

populateFirebase();
