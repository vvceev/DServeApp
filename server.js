
const express = require('express');
const cors = require('cors');
const initializeFirebase = require('./src/database/firebase-connection');

const app = express();
const PORT = 3001;

let db;

// Connect to Firebase
initializeFirebase().then((firestore) => {
  db = firestore;
  console.log('Connected to Firebase Firestore');
}).catch((error) => {
  console.error('Failed to connect to Firebase Firestore:', error);
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'DServeApp Backend Server is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      inventory: '/api/inventory',
      menu: '/api/menu',
      orders: '/api/orders',
      login: '/api/login'
    },
    docs: 'Available endpoints listed in console on server start'
  });
});

// Login endpoint
app.post('/api/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const usersRef = db.collection('users');
  const userSnapshot = await usersRef.where('username', '==', username).where('isActive', '==', true).get();

  if (userSnapshot.empty) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const userDoc = userSnapshot.docs[0];
  const user = userDoc.data();

  // Password comparison logic (assuming passwords are hashed)
  const bcrypt = require('bcryptjs');
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    success: true,
    user: {
      id: userDoc.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName
    }
  });
}));

// Get all users
app.get('/api/users', asyncHandler(async (req, res) => {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('isActive', '==', true).get();

  const users = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    users.push({
      id: doc.id,
      username: data.username,
      role: data.role,
      displayName: data.displayName
    });
  });

  res.json(users);
}));

// Get user by username
app.get('/api/users/:username', asyncHandler(async (req, res) => {
  const { username } = req.params;
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('username', '==', username).where('isActive', '==', true).get();

  if (snapshot.empty) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userDoc = snapshot.docs[0];
  const user = userDoc.data();

  res.json({
    id: userDoc.id,
    username: user.username,
    role: user.role,
    displayName: user.displayName
  });
}));

// Get users by role
app.get('/api/users/role/:role', asyncHandler(async (req, res) => {
  const { role } = req.params;
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('role', '==', role).where('isActive', '==', true).get();

  const users = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    users.push({
      id: doc.id,
      username: data.username,
      role: data.role,
      displayName: data.displayName
    });
  });

  res.json(users);
}));

// Get recent logins
app.get('/api/logins/recent', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const loginSessionsRef = db.collection('loginSessions');
  const snapshot = await loginSessionsRef.orderBy('loginTime', 'desc').limit(limit).get();

  const logins = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    // Fetch user displayName
    let displayName = '';
    if (data.userId) {
      const userDoc = await db.collection('users').doc(data.userId).get();
      if (userDoc.exists) {
        displayName = userDoc.data().displayName;
      }
    }
    logins.push({
      id: doc.id,
      username: data.username,
      role: data.role,
      displayName: displayName,
      loginTime: data.loginTime,
      ipAddress: data.ipAddress
    });
  }

  res.json(logins);
}));

// Create login session
app.post('/api/logins', asyncHandler(async (req, res) => {
  const { userId, username, role } = req.body;
  const loginSessionsRef = db.collection('loginSessions');

  const loginSessionData = {
    userId,
    username,
    role,
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.get('User-Agent') || 'Unknown',
    loginTime: new Date()
  };

  const savedSessionRef = await loginSessionsRef.add(loginSessionData);

  res.json({
    success: true,
    sessionId: savedSessionRef.id
  });
}));

// Get inventory items
app.get('/api/inventory', asyncHandler(async (req, res) => {
  const inventoryRef = db.collection('inventory');
  const snapshot = await inventoryRef.where('is_active', '==', true).get();

  const inventory = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    inventory.push({
      id: doc.id,
      ...data
    });
  });

  // Sort by name in memory
  inventory.sort((a, b) => a.name.localeCompare(b.name));

  res.json(inventory);
}));

// Add inventory item
app.post('/api/inventory', asyncHandler(async (req, res) => {
  const { name, category, serving, unit, min_stock_level, expiry_date } = req.body;
  const inventoryRef = db.collection('inventory');

  const newItem = {
    name,
    category,
    serving,
    unit: unit || 'pieces',
    min_stock_level: min_stock_level || 10,
    expiry_date,
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const savedItemRef = await inventoryRef.add(newItem);

  res.json({
    success: true,
    itemId: savedItemRef.id
  });
}));

// Update inventory item
app.put('/api/inventory/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, category, serving, unit, min_stock_level, expiry_date } = req.body;
  const inventoryRef = db.collection('inventory');

  await inventoryRef.doc(id).update({
    name,
    category,
    serving,
    unit: unit || 'pieces',
    min_stock_level: min_stock_level || 10,
    expiry_date,
    updatedAt: new Date()
  });

  res.json({ success: true });
}));

// Delete inventory item
app.delete('/api/inventory/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const inventoryRef = db.collection('inventory');

  await inventoryRef.doc(id).update({ is_active: false });

  res.json({ success: true });
}));

// Check inventory availability for menu items
app.post('/api/inventory/check-availability', asyncHandler(async (req, res) => {
  const { items } = req.body; // Array of { menu_item_id, quantity, size }

  const unavailableItems = [];

  for (const item of items) {
    const { menu_item_id, quantity, size = 'medium' } = item;

    // Get recipe for this menu item
    const recipesRef = db.collection('recipes');
    const recipesSnapshot = await recipesRef.where('menu_item_id', '==', menu_item_id).where('size', '==', size).get();

    for (const recipeDoc of recipesSnapshot.docs) {
      const recipe = recipeDoc.data();
      const inventoryDoc = await db.collection('inventory').doc(recipe.inventory_id).get();

      if (!inventoryDoc.exists) continue; // Skip if inventory item is not active

      const inventory = inventoryDoc.data();

      if (!inventory.is_active) continue;

      const required = recipe.quantity_required * quantity;
      const available = inventory.serving;

      if (available < required) {
        unavailableItems.push({
          name: inventory.name,
          required: required,
          available: available,
          unit: inventory.unit
        });
      }
    }
  }

  if (unavailableItems.length > 0) {
    return res.json({
      available: false,
      unavailableItems: unavailableItems
    });
  }

  res.json({ available: true });
}));

// Get menu items
app.get('/api/menu', asyncHandler(async (req, res) => {
  const menuRef = db.collection('menuItems');
  const snapshot = await menuRef.where('isAvailable', '==', true).get();

  const menuItems = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    menuItems.push({
      id: doc.id,
      ...data
    });
  });

  // Sort by category then name in memory
  menuItems.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  res.json(menuItems);
}));

// Get orders
app.get('/api/orders', asyncHandler(async (req, res) => {
  const ordersRef = db.collection('orders');
  const snapshot = await ordersRef.orderBy('createdAt', 'desc').get();

  const orders = [];
  for (const doc of snapshot.docs) {
    const order = doc.data();

    // Fetch user displayName
    let userName = '';
    if (order.userId) {
      const userDoc = await db.collection('users').doc(order.userId).get();
      if (userDoc.exists) {
        userName = userDoc.data().displayName;
      }
    }

    // Fetch item names from menuItems
    const itemsWithNames = [];
    for (const item of order.items) {
      let itemName = '';
      if (item.menuItemId) {
        const menuDoc = await db.collection('menuItems').doc(item.menuItemId.toString()).get();
        if (menuDoc.exists) {
          itemName = menuDoc.data().name;
        }
      }
      itemsWithNames.push({
        name: itemName,
        quantity: item.quantity,
        price: item.unitPrice,
        size: item.size
      });
    }

    orders.push({
      id: doc.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      orderType: order.orderType,
      items: itemsWithNames,
      total: order.totalAmount,
      date: order.createdAt.toDate().toISOString(),
      status: order.status,
      user_id: order.userId || null,
      user_name: userName,
      created_at: order.createdAt,
      updated_at: order.updatedAt
    });
  }

  res.json(orders);
}));

// Create order
app.post('/api/orders', asyncHandler(async (req, res) => {
  const { order_number, customer_name, order_type, items, user_id } = req.body;

  // Calculate total
  let total = 0;
  const orderItems = [];

  for (const item of items) {
    total += item.total_price;
    orderItems.push({
      menuItemId: item.menu_item_id,
      quantity: item.quantity,
      size: item.size || 'medium',
      unitPrice: item.unit_price,
      totalPrice: item.total_price
    });
  }

  const ordersRef = db.collection('orders');
  const inventoryRef = db.collection('inventory');
  const recipesRef = db.collection('recipes');

  try {
    // Create order document
    const newOrder = {
      orderNumber: order_number,
      customerName: customer_name,
      orderType: order_type,
      totalAmount: total,
      userId: user_id,
      items: orderItems,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orderDocRef = await ordersRef.add(newOrder);

    // Update inventory based on recipes
    for (const item of items) {
      const recipesSnapshot = await recipesRef.where('menu_item_id', '==', item.menu_item_id).where('size', '==', (item.size || 'medium')).get();

      for (const recipeDoc of recipesSnapshot.docs) {
        const recipe = recipeDoc.data();
        const inventoryDocRef = inventoryRef.doc(recipe.inventory_id);
        const inventoryDoc = await inventoryDocRef.get();

        if (!inventoryDoc.exists) continue;

        const deductQuantity = recipe.quantity_required * item.quantity;

        await inventoryDocRef.update({
          serving: inventoryDoc.data().serving - deductQuantity
        });
      }
    }

    res.json({
      success: true,
      orderId: orderDocRef.id
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST /api/login');
  console.log('  GET  /api/users');
  console.log('  GET  /api/inventory');
  console.log('  POST /api/inventory');
  console.log('  PUT  /api/inventory/:id');
  console.log('  POST /api/inventory/check-availability');
  console.log('  GET  /api/menu');
  console.log('  GET  /api/orders');
  console.log('  POST /api/orders');
  console.log('  GET  /api/health');
});
