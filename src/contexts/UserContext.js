import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, getDocs, query, orderBy, addDoc, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import app from '../database/firebaseConfig';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Firebase app and Firestore
  const db = getFirestore(app);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Load menu items first to have names available
        await loadMenuItems();

        // Load data from Firebase Firestore directly
        await loadOrders();
        await loadInventory();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
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

  // Load inventory from Firestore
  const loadInventory = async () => {
    try {
      const inventoryCol = collection(db, 'inventory');
      const querySnapshot = await getDocs(inventoryCol);
      const inventoryData = [];
      querySnapshot.forEach(doc => {
        inventoryData.push({ id: doc.id, ...doc.data() });
      });
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error loading inventory from Firestore:', error);
    }
  };

  // Load menu items from Firestore
  const loadMenuItems = async () => {
    try {
      const menuCol = collection(db, 'menuItems');
      const querySnapshot = await getDocs(menuCol);
      const menuData = [];
      querySnapshot.forEach(doc => {
        menuData.push({ id: doc.id, ...doc.data() });
      });
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error loading menu items from Firestore:', error);
    }
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
      await loadInventory(); // Refresh inventory after deductions
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
          const docRef = await addDoc(inventoryCol, {
            name: item.name,
            serving: item.serving,
            category: item.category,
            expiry_date: item.expiry_date,
            unit: item.unit || 'pieces',
            min_stock_level: item.min_stock_level || 10,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          await loadInventory();
          return { success: true, id: docRef.id };
        } catch (error) {
          console.error('Error adding inventory item:', error);
          return { success: false, error };
        }
      },
      updateInventoryItem: async (id, updates) => {
        try {
          const docRef = doc(db, 'inventory', id);
          await updateDoc(docRef, {
            ...updates,
            updatedAt: new Date()
          });
          await loadInventory();
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
          await loadInventory();
          return { success: true };
        } catch (error) {
          console.error('Error deleting inventory item:', error);
          return { success: false, error };
        }
      }
    }}>
      {children}
    </UserContext.Provider>
  );
};
