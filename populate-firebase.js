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
  // Coffee items
  {
    id: '1',
    name: 'Iced Americano',
    category: 'coffee',
    serving: 50,
    expiryDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: '2',
    name: 'Cloud Americano',
    category: 'coffee',
    serving: 45,
    expiryDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: '3',
    name: 'Spanish Latte',
    category: 'coffee',
    serving: 40,
    expiryDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: '4',
    name: 'Caramel Macchiato',
    category: 'coffee',
    serving: 35,
    expiryDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: '5',
    name: 'Vanilla Latte',
    category: 'coffee',
    serving: 30,
    expiryDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: '6',
    name: 'Iced Strawberry Milk',
    category: 'coffee',
    serving: 25,
    expiryDate: new Date('2024-12-31'),
    isActive: true
  },
  {
    id: '7',
    name: 'Iced Blueberry Milk',
    category: 'coffee',
    serving: 20,
    expiryDate: new Date('2024-12-31'),
    isActive: true
  },
  // Coolers
  {
    id: '8',
    name: 'Lychee Soda',
    category: 'coolers',
    serving: 60,
    expiryDate: new Date('2024-06-30'),
    isActive: true
  },
  {
    id: '9',
    name: 'Strawberry Soda',
    category: 'coolers',
    serving: 55,
    expiryDate: new Date('2024-06-30'),
    isActive: true
  },
  {
    id: '10',
    name: 'Blueberry Soda',
    category: 'coolers',
    serving: 50,
    expiryDate: new Date('2024-06-30'),
    isActive: true
  },
  {
    id: '11',
    name: 'Green Apple Soda',
    category: 'coolers',
    serving: 45,
    expiryDate: new Date('2024-06-30'),
    isActive: true
  },
  {
    id: '12',
    name: 'Passion Fruit Soda',
    category: 'coolers',
    serving: 40,
    expiryDate: new Date('2024-06-30'),
    isActive: true
  },
  {
    id: '13',
    name: 'Premium Lemonade',
    category: 'coolers',
    serving: 35,
    expiryDate: new Date('2024-06-30'),
    isActive: true
  },
  {
    id: '14',
    name: 'Premium Lemonade w/ Yakult',
    category: 'coolers',
    serving: 30,
    expiryDate: new Date('2024-06-30'),
    isActive: true
  },
  // Alcohol
  {
    id: '15',
    name: 'Alfonso',
    category: 'alcohol',
    serving: 10,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '16',
    name: 'Boracay Cappuccino',
    category: 'alcohol',
    serving: 15,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '17',
    name: 'Boracay Coconut',
    category: 'alcohol',
    serving: 12,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '18',
    name: 'Cossack',
    category: 'alcohol',
    serving: 8,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '19',
    name: 'Embassy',
    category: 'alcohol',
    serving: 14,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '20',
    name: 'Emperador',
    category: 'alcohol',
    serving: 16,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '21',
    name: 'Ginto',
    category: 'alcohol',
    serving: 18,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '22',
    name: 'Mojito',
    category: 'alcohol',
    serving: 20,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '23',
    name: 'Primera',
    category: 'alcohol',
    serving: 6,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '24',
    name: 'Redhorse',
    category: 'alcohol',
    serving: 25,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '25',
    name: 'Redhorse Bucket',
    category: 'alcohol',
    serving: 5,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '26',
    name: 'San Miguel',
    category: 'alcohol',
    serving: 22,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '27',
    name: 'San Miguel Bucket',
    category: 'alcohol',
    serving: 7,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '28',
    name: 'Tanduay Dark',
    category: 'alcohol',
    serving: 19,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '29',
    name: 'Tanduay Mixes',
    category: 'alcohol',
    serving: 21,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '30',
    name: 'Tanduay Select',
    category: 'alcohol',
    serving: 17,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '31',
    name: 'Tanduay White',
    category: 'alcohol',
    serving: 23,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  {
    id: '32',
    name: 'Tower',
    category: 'alcohol',
    serving: 9,
    expiryDate: new Date('2025-01-31'),
    isActive: true
  },
  // Snacks
  {
    id: '33',
    name: 'Mani',
    category: 'snacks',
    serving: 100,
    expiryDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    id: '34',
    name: 'Kikiam',
    category: 'snacks',
    serving: 80,
    expiryDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    id: '35',
    name: 'Fishball',
    category: 'snacks',
    serving: 75,
    expiryDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    id: '36',
    name: 'Shanghai',
    category: 'snacks',
    serving: 70,
    expiryDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    id: '37',
    name: 'Siomai',
    category: 'snacks',
    serving: 65,
    expiryDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    id: '38',
    name: 'Fries',
    category: 'snacks',
    serving: 60,
    expiryDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    id: '39',
    name: 'Sisig',
    category: 'snacks',
    serving: 55,
    expiryDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    id: '40',
    name: 'Ramen Mild',
    category: 'snacks',
    serving: 50,
    expiryDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    id: '41',
    name: 'Ramen Spicy',
    category: 'snacks',
    serving: 45,
    expiryDate: new Date('2024-05-15'),
    isActive: true
  },
  {
    id: '42',
    name: 'Buldak',
    category: 'snacks',
    serving: 40,
    expiryDate: new Date('2024-05-15'),
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
