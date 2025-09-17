const mongoose = require('mongoose');
const admin = require('firebase-admin');
const serviceAccount = require('./src/database/firebase-service-account.json');

require('dotenv').config();

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

const db = admin.firestore();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://vcelene412_db_user:2N6Qx5HbGPCUEIBt@cluster0.z1qfcth.mongodb.net/restaurant_management?retryWrites=true&w=majority');

const User = require('./src/database/models/User');
const Inventory = require('./src/database/models/Inventory');
const MenuItem = require('./src/database/models/MenuItem');
const Order = require('./src/database/models/Order');
const LoginSession = require('./src/database/models/LoginSession');
const Recipe = require('./src/database/models/Recipe');

async function migrateData() {
  try {
    // Migrate users
    const users = await User.find({});
    for (const user of users) {
      await db.collection('users').doc(user._id.toString()).set({
        username: user.username,
        password: user.password,
        role: user.role,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    }
    console.log('Users migrated');

    // Migrate inventory
    const inventory = await Inventory.find({});
    for (const item of inventory) {
      await db.collection('inventory').doc(item._id.toString()).set({
        name: item.name,
        category: item.category,
        serving: item.serving,
        unit: item.unit,
        min_stock_level: item.min_stock_level,
        expiry_date: item.expiry_date,
        is_active: item.is_active,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      });
    }
    console.log('Inventory migrated');

    // Migrate menu items
    const menuItems = await MenuItem.find({});
    for (const item of menuItems) {
      await db.collection('menuItems').doc(item._id.toString()).set({
        name: item.name,
        category: item.category,
        basePrice: item.basePrice,
        isAvailable: item.isAvailable,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      });
    }
    console.log('Menu items migrated');

    // Migrate orders
    const orders = await Order.find({});
    for (const order of orders) {
      await db.collection('orders').doc(order._id.toString()).set({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        orderType: order.orderType,
        totalAmount: order.totalAmount,
        status: order.status,
        userId: order.userId?.toString(),
        items: order.items,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      });
    }
    console.log('Orders migrated');

    // Migrate login sessions
    const sessions = await LoginSession.find({});
    for (const session of sessions) {
      await db.collection('loginSessions').doc(session._id.toString()).set({
        userId: session.userId?.toString(),
        username: session.username,
        role: session.role,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        loginTime: session.loginTime
      });
    }
    console.log('Login sessions migrated');

    // Migrate recipes
    const recipes = await Recipe.find({});
    for (const recipe of recipes) {
      await db.collection('recipes').doc(recipe._id.toString()).set({
        menu_item_id: recipe.menu_item_id.toString(),
        inventory_id: recipe.inventory_id.toString(),
        size: recipe.size,
        quantity_required: recipe.quantity_required
      });
    }
    console.log('Recipes migrated');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.connection.close();
    admin.app().delete();
  }
}

migrateData();
