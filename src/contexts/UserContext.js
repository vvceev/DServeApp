import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs, query, orderBy, addDoc, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import app from '../database/firebaseConfig';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const defaultMenuItems = [
  { id: 1, name: 'Iced Americano', price: 49, category: 'coffee' },
  { id: 2, name: 'Cloud Americano', price: 49, category: 'coffee' },
  { id: 3, name: 'Spanish Latte', price: 59, category: 'coffee' },
  { id: 4, name: 'Caramel Macchiato', price: 59, category: 'coffee' },
  { id: 5, name: 'Vanilla Latte', price: 59, category: 'coffee' },
  { id: 6, name: 'Iced Strawberry Milk', price: 49, category: 'coffee' },
  { id: 7, name: 'Iced Blueberry Milk', price: 49, category: 'coffee' },
  { id: 11, name: 'Lychee Soda', price: 49, category: 'coolers' },
  { id: 12, name: 'Strawberry Soda', price: 49, category: 'coolers' },
  { id: 13, name: 'Blueberry Soda', price: 49, category: 'coolers' },
  { id: 14, name: 'Green Apple Soda', price: 49, category: 'coolers' },
  { id: 15, name: 'Passion Fruit Soda', price: 49, category: 'coolers' },
  { id: 16, name: 'Premium Lemonade', price: 59, category: 'coolers' },
  { id: 17, name: 'Premium Lemonade w/ Yakult', price: 74, category: 'coolers' },
  { id: 18, name: 'Alfonso', price: 499, category: 'alcohol' },
  { id: 19, name: 'Boracay Cappuccino', price: 259, category: 'alcohol' },
  { id: 20, name: 'Boracay Coconut', price: 259, category: 'alcohol' },
  { id: 21, name: 'Cossack', price: 320, category: 'alcohol' },
  { id: 22, name: 'Embassy', price: 299, category: 'alcohol' },
  { id: 23, name: 'Emperador', price: 259, category: 'alcohol' },
  { id: 24, name: 'Ginto', price: 259, category: 'alcohol' },
  { id: 25, name: 'Mojito', price: 259, category: 'alcohol' },
  { id: 26, name: 'Primera', price: 350, category: 'alcohol' },
  { id: 27, name: 'Redhorse', price: 80, category: 'alcohol' },
  { id: 28, name: 'Redhorse Bucket', price: 470, category: 'alcohol' },
  { id: 29, name: 'San Miguel', price: 70, category: 'alcohol' },
  { id: 30, name: 'San Miguel Bucket', price: 410, category: 'alcohol' },
  { id: 31, name: 'Tanduay Dark', price: 269, category: 'alcohol' },
  { id: 32, name: 'Tanduay Mixes', price: 259, category: 'alcohol' },
  { id: 33, name: 'Tanduay Select', price: 259, category: 'alcohol' },
  { id: 34, name: 'Tanduay White', price: 259, category: 'alcohol' },
  { id: 35, name: 'Tower', price: 200, category: 'alcohol' },
  { id: 36, name: 'Mani', price: 20, category: 'snacks' },
  { id: 37, name: 'Kikiam', price: 50, category: 'snacks' },
  { id: 38, name: 'Fishball', price: 50, category: 'snacks' },
  { id: 39, name: 'Shanghai', price: 50, category: 'snacks' },
  { id: 40, name: 'Siomai', price: 50, category: 'snacks' },
  { id: 41, name: 'Fries', price: 50, category: 'snacks' },
  { id: 42, name: 'Sisig', price: 130, category: 'snacks' },
  { id: 43, name: 'Ramen Mild', price: 70, category: 'snacks' },
  { id: 44, name: 'Ramen Spicy', price: 70, category: 'snacks' },
  { id: 45, name: 'Buldak', price: 105, category: 'snacks' },
];

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Firebase app and Firestore
  const db = getFirestore(app);

  useEffect(() => {
    let menuUnsubscribe;
    let inventoryUnsubscribe;

    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Set up real-time listeners
        menuUnsubscribe = loadMenuItems();
        inventoryUnsubscribe = loadInventory();

        // Load orders
        await loadOrders();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // Cleanup function to unsubscribe from listeners
    return () => {
      if (menuUnsubscribe) {
        menuUnsubscribe();
      }
      if (inventoryUnsubscribe) {
        inventoryUnsubscribe();
      }
    };
  }, []);

  const login = async (userData) => {
    setUser(userData);
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing user from storage:', error);
    }
  };

  // Load orders directly from Firestore
  const loadOrders = async () => {
    try {
      const ordersCol = collection(db, 'orders');
      const q = query(ordersCol, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const ordersData = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();

        // Populate item names by matching menuItemId with menuItems
        const itemsWithNames = (data.items || []).map(item => {
          const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
          return {
            ...item,
            name: menuItem ? menuItem.name : item.menuItemName || 'Unknown Item'
          };
        });

        ordersData.push({
          id: doc.id,
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          orderType: data.orderType,
          items: itemsWithNames,
          total: data.totalAmount,
          date: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        });
      });

      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders from Firestore:', error);
    }
  };

  // Load inventory from Firestore with real-time listener
  const loadInventory = () => {
    const inventoryCol = collection(db, 'inventory');
    const unsubscribe = onSnapshot(inventoryCol, (querySnapshot) => {
      const inventoryData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventory(inventoryData);
    }, (error) => {
      console.error('Error listening to inventory from Firestore:', error);
    });
    return unsubscribe;
  };

  // Load menu items from Firestore with real-time listener
  const loadMenuItems = () => {
    const inventoryCol = collection(db, 'inventory');
    const unsubscribe = onSnapshot(inventoryCol, (querySnapshot) => {
      const allItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const menuData = allItems.filter(item => item.type === 'menu');
      setMenuItems(menuData); // Only menu items from inventory collection
    }, (error) => {
      console.error('Error listening to menu items from Firestore:', error);
    });
    return unsubscribe;
  };

  // Get max order number for the current day
  const getMaxOrderNumberForToday = async () => {
    try {
      const today = new Date();
      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const day = today.getUTCDate();
      const startOfDay = new Date(Date.UTC(year, month, day));
      const endOfDay = new Date(Date.UTC(year, month, day + 1));

      const ordersCol = collection(db, 'orders');
      const q = query(ordersCol, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      let maxOrderNumber = 0;
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        if (createdAt >= startOfDay && createdAt < endOfDay) {
          const orderNumStr = data.orderNumber;
          if (orderNumStr && orderNumStr.startsWith('#')) {
            const num = parseInt(orderNumStr.slice(1), 10);
            if (!isNaN(num) && num > maxOrderNumber) {
              maxOrderNumber = num;
            }
          }
        }
      });

      return maxOrderNumber;
    } catch (error) {
      console.error('Error getting max order number for today:', error);
      return 0;
    }
  };

  // Save order directly to Firestore
  const saveOrder = async (order) => {
    try {
      console.log('saveOrder called with order:', order);
      const ordersCol = collection(db, 'orders');

      const orderData = {
        orderNumber: order.orderNumber || `ORD-${Date.now()}`,
        customerName: order.customerName || '',
        orderType: order.orderType || 'dine-in',
        items: order.items.map(item => ({
          menuItemId: item.id,
          menuItemName: item.name,  // Added menuItemName here
          quantity: item.quantity,
          size: item.size || 'medium',
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        totalAmount: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user?.id || null
      };

      const docRef = await addDoc(ordersCol, orderData);

      console.log('Order saved with ID:', docRef.id);

      // Deduct inventory for each ordered item
      const inventoryCol = collection(db, 'inventory');
      const inventorySnapshot = await getDocs(inventoryCol);
      const currentInventory = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('Current inventory items:', currentInventory.map(inv => ({ name: inv.name, serving: inv.serving })));
      console.log('Order items to deduct:', order.items.map(item => ({ name: item.name, quantity: item.quantity })));

      for (const item of order.items) {
        const inventoryItem = currentInventory.find(inv =>
          inv.name.toLowerCase().trim() === item.name.toLowerCase().trim()
        );

        if (inventoryItem) {
          const newServing = inventoryItem.serving - item.quantity;
          console.log(`Updating inventory for ${item.name}: ${inventoryItem.serving} -> ${newServing}`);

          try {
            await updateDoc(doc(db, 'inventory', inventoryItem.id), {
              serving: newServing,
              updatedAt: new Date()
            });
            console.log(`Inventory updated for ${item.name}`);
          } catch (updateError) {
            console.error(`Failed to update inventory for ${item.name}:`, updateError);
          }
        } else {
          console.warn(`Inventory item not found for ${item.name}. Available inventory names:`, currentInventory.map(inv => inv.name));
        }
      }

      await loadOrders(); // Refresh orders after save
      // Inventory updates automatically via real-time listener
      return { success: true, orderId: docRef.id };
    } catch (error) {
      console.error('Error saving order to Firestore:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      login,
      logout,
      orders,
      inventory,
      menuItems,
      saveOrder,
      loadOrders,
      loadInventory,
      loadMenuItems,
      getMaxOrderNumberForToday,
      isLoading,
      addInventoryItem: async (item) => {
        try {
          const inventoryCol = collection(db, 'inventory');
          let docData;
          if (item.type === 'menu') {
            docData = {
              name: item.name,
              price: item.price,
              category: item.category,
              image: item.image,
              type: 'menu',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            if (item.size && item.size.trim() !== '') {
              docData.size = item.size;
            }
          } else {
            docData = {
              name: item.name,
              serving: item.serving,
              category: item.category,
              expiry_date: new Date(item.expiry_date),
              unit: item.unit || 'pieces',
              min_stock_level: item.min_stock_level || 10,
              type: item.type || 'inventory',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };
          }
          const docRef = await addDoc(inventoryCol, docData);
          // No need to refresh, real-time listener will update
          return { success: true, id: docRef.id };
        } catch (error) {
          console.error('Error adding inventory item:', error);
          return { success: false, error };
        }
      },
      updateInventoryItem: async (id, updates) => {
        try {
          const docRef = doc(db, 'inventory', id);
          const processedUpdates = { ...updates };
          if (processedUpdates.expiry_date) {
            processedUpdates.expiry_date = new Date(processedUpdates.expiry_date);
          }
          await updateDoc(docRef, {
            ...processedUpdates,
            updatedAt: new Date()
          });
          // No need to refresh, real-time listener will update
          return { success: true };
        } catch (error) {
          console.error('Error updating inventory item:', error);
          return { success: false, error };
        }
      },
      deleteInventoryItem: async (id) => {
        try {
          const docRef = doc(db, 'inventory', id);
          await deleteDoc(docRef);
          // No need to refresh, real-time listener will update
          return { success: true };
        } catch (error) {
          console.error('Error deleting inventory item:', error);
          return { success: false, error };
        }
      },
      deleteMenuItem: async (id) => {
        try {
          const docRef = doc(db, 'inventory', id);
          await deleteDoc(docRef);
          // No need to refresh, real-time listener will update
          return { success: true };
        } catch (error) {
          console.error('Error deleting menu item:', error);
          return { success: false, error };
        }
      },
      updateMenuItem: async (id, updates) => {
        try {
          const docRef = doc(db, 'inventory', id);
          await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date()
          });
          // No need to refresh, real-time listener will update
          return { success: true };
        } catch (error) {
          console.error('Error updating menu item:', error);
          return { success: false, error };
        }
      }
    }}>
      {children}
    </UserContext.Provider>
  );
};
