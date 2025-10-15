import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

import CustomHeader from '../components/CustomHeader';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {
  Platform,
} from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import app from '../database/firebaseConfig';

const db = getFirestore(app);

const InventoryScreen = () => {
  const { user, inventory, menuItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, deleteMenuItem, updateMenuItem, isLoading } = useUser();
  const { notifications, removeNotification } = useNotification();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);

  // Default hardcoded menu items prices
  const defaultMenuPrices = {
    'Iced Americano': { M: 49, L: 59 },
    'Cloud Americano': { M: 49, L: 59 },
    'Spanish Latte': { M: 59, L: 69 },
    'Caramel Macchiato': { M: 59, L: 69 },
    'Vanilla Latte': { M: 59, L: 69 },
    'Iced Strawberry Milk': { M: 49, L: 59 },
    'Iced Blueberry Milk': { M: 49, L: 59 },
    'Lychee Soda': 49,
    'Strawberry Soda': 49,
    'Blueberry Soda': 49,
    'Green Apple Soda': 49,
    'Passion Fruit Soda': 49,
    'Premium Lemonade': 59,
    'Premium Lemonade w/ Yakult': 74,
    'Alfonso': 499,
    'Boracay Cappuccino': 259,
    'Boracay Coconut': 259,
    'Cossack': 320,
    'Embassy': 299,
    'Emperador': 259,
    'Ginto': 259,
    'Mojito': 259,
    'Primera': 350,
    'Redhorse': 80,
    'Redhorse Bucket': 470,
    'San Miguel': 70,
    'San Miguel Bucket': 410,
    'Tanduay Dark': 269,
    'Tanduay Mixes': 259,
    'Tanduay Select': 259,
    'Tanduay White': 259,
    'Tower': 200,
    'Mani': 20,
    'Kikiam': 50,
    'Fishball': 50,
    'Shanghai': 50,
    'Siomai': 50,
    'Fries': 50,
    'Sisig': 130,
    'Ramen Mild': 70,
    'Ramen Spicy': 70,
    'Buldak': 105,
  };

  // Default serving values for inventory items
  const defaultServings = {
    'Iced Americano': 25,
    'Cloud Americano': 30,
    'Spanish Latte': 20,
    'Caramel Macchiato': 22,
    'Vanilla Latte': 18,
    'Iced Strawberry Milk': 35,
    'Iced Blueberry Milk': 32,
    'Lychee Soda': 40,
    'Strawberry Soda': 38,
    'Blueberry Soda': 36,
    'Green Apple Soda': 42,
    'Passion Fruit Soda': 45,
    'Premium Lemonade': 28,
    'Premium Lemonade w/ Yakult': 26,
    'Alfonso': 5,
    'Boracay Cappuccino': 8,
    'Boracay Coconut': 6,
    'Cossack': 4,
    'Embassy': 7,
    'Emperador': 3,
    'Ginto': 9,
    'Mojito': 10,
    'Primera': 2,
    'Redhorse': 12,
    'Redhorse Bucket': 1,
    'San Miguel': 15,
    'San Miguel Bucket': 1,
    'Tanduay Dark': 11,
    'Tanduay Mixes': 13,
    'Tanduay Select': 14,
    'Tanduay White': 16,
    'Tower': 17,
    'Mani': 50,
    'Kikiam': 48,
    'Fishball': 46,
    'Shanghai': 44,
    'Siomai': 43,
    'Fries': 41,
    'Sisig': 39,
    'Ramen Mild': 37,
    'Ramen Spicy': 34,
    'Buldak': 33,
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Set items to combined inventory and menu items, with menu items sorted by newest first
  useEffect(() => {
    const sortedMenuItems = (menuItems || []).sort((a, b) => {
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return bDate - aDate;
    });
    const combined = [...(inventory || []).map(item => ({ ...item, type: 'inventory' })), ...sortedMenuItems.map(item => ({ ...item, type: 'menu' }))];
    setItems(combined);
  }, [inventory, menuItems]);

  // Set fields when editingItem changes
  useEffect(() => {
    if (editingItem) {
      if (editingItem.type === 'menu') {
        setIsEditingMenu(true);
        setEditingMenuId(editingItem.id);
        setMenuName(editingItem.name);
        setMenuCategory(editingItem.category);
        setMenuSize(editingItem.size || '');
        const defaultPrice = defaultMenuPrices[editingItem.name];
        let price = '';
        if (editingItem.price) {
          price = editingItem.price.toString();
        } else if (defaultPrice) {
          if (typeof defaultPrice === 'object' && editingItem.size) {
            price = defaultPrice[editingItem.size].toString();
          } else if (typeof defaultPrice === 'number') {
            price = defaultPrice.toString();
          }
        }
        setMenuPrice(price);
        setMenuImage(editingItem.image || null);
      } else {
        setIsEditingMenu(false);
        setEditingMenuId(null);
        setMenuName(editingItem.name);
        setMenuCategory(editingItem.category);
        setMenuSize('');
        setMenuPrice('');
        setMenuImage(null);
      }
      setEditingItem(null); // reset
    }
  }, [editingItem]);

  // Filter notifications for low stock and expiry alerts
  const lowStockAlerts = notifications.filter(notif => notif.type === 'low_stock');
  const expiryAlerts = notifications.filter(notif => notif.type === 'expiry');

  const handleDismissAlert = (alertId) => {
    removeNotification(alertId);
  };

  const handleDismissExpiryAlert = (alertId) => {
    removeNotification(alertId);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingType, setEditingType] = useState('inventory'); // 'inventory' or 'menu'
  const [itemName, setItemName] = useState('');
  const [selectedItemCategory, setSelectedItemCategory] = useState('coffee');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [serving, setServing] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [modalMenuVisible, setModalMenuVisible] = useState(false);
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [menuName, setMenuName] = useState('');
  const [menuCategory, setMenuCategory] = useState('');
  const [menuSize, setMenuSize] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuImage, setMenuImage] = useState(null);

  const [showMenuCategoryDropdown, setShowMenuCategoryDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const menuCategories = ['coffee', 'coolers', 'alcohol', 'snacks'];

  const categoryIcons = [
    { name: 'All', icon: 'inventory', key: 'all' },
    { name: 'Coffee', icon: 'local-cafe', key: 'coffee' },
    { name: 'Coolers', icon: 'ac-unit', key: 'coolers' },
    { name: 'Alcohol', icon: 'local-bar', key: 'alcohol' },
    { name: 'Snacks', icon: 'restaurant', key: 'snacks' },
  ];





  const handleAddItem = () => {
    setIsEditing(false);
    setEditingItemId(null);
    setItemName('');
    setSelectedItemCategory('coffee');
    setExpiryDate(new Date());
    setServing('');
    setModalVisible(true);
  };

  const handleItemNameChange = (text) => {
    setItemName(text);
    const key = Object.keys(defaultServings).find(k => k.toLowerCase() === text.toLowerCase());
    if (!serving && key) {
      setServing(defaultServings[key].toString());
    }
  };

  const handleEditItem = (item) => {
    setIsEditing(true);
    setEditingType(item.type);
    setEditingItemId(item.id);
    setItemName(item.name);
    setSelectedItemCategory(item.category);
    setExpiryDate(new Date(item.expiry_date || new Date()));
    let servingValue = item.serving ? item.serving.toString() : '';
    if (!servingValue || servingValue === '0') {
      const key = Object.keys(defaultServings).find(k => k.toLowerCase() === item.name.toLowerCase());
      if (key) {
        servingValue = defaultServings[key].toString();
      } else {
        servingValue = '1';
      }
    }
    setServing(servingValue);
    setModalVisible(true);
  };

  const handleDeleteItem = async (itemId) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteInventoryItem(itemId);
            Alert.alert('Success', 'Item deleted successfully!');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete item. Please try again.');
          }
        }},
      ]
    );
  };

  const handleDeleteMenuItem = async (itemId) => {
    Alert.alert(
      'Delete Menu Item',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteMenuItem(itemId);
            Alert.alert('Success', 'Menu item deleted successfully!');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete menu item. Please try again.');
          }
        }},
      ]
    );
  };

  const handleEditMenuItem = (item) => {
    setIsEditingMenu(true);
    setEditingMenuId(item.id);
    setMenuName(item.name);
    setMenuCategory(item.category);
    setMenuSize(item.size || '');
    const defaultPrice = defaultMenuPrices[item.name];
    let price = '';
    if (item.price) {
      price = item.price.toString();
    } else if (defaultPrice) {
      if (typeof defaultPrice === 'object' && item.size) {
        price = defaultPrice[item.size].toString();
      } else if (typeof defaultPrice === 'number') {
        price = defaultPrice.toString();
      }
    }
    setMenuPrice(price);
    setMenuImage(item.image || null);
    setModalMenuVisible(true);
  };

  const handleSaveItem = async () => {
    if (!editingItemId && !itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!serving || isNaN(serving) || parseInt(serving) <= 0) {
      Alert.alert('Error', 'Please enter a valid serving');
      return;
    }

    try {
      if (editingItemId) {
        // Editing existing item, update serving and expiry
        if (editingType === 'inventory') {
          await updateInventoryItem(editingItemId, {
            serving: parseFloat(serving),
            expiry_date: expiryDate.toISOString().split('T')[0],
          });
        } else if (editingType === 'menu') {
          await updateMenuItem(editingItemId, {
            serving: parseFloat(serving),
            expiry_date: expiryDate.toISOString().split('T')[0],
          });
        }
        Alert.alert('Success', 'Item updated successfully!');
      } else {
        // Adding new item, check if item with same name already exists (case insensitive)
        const existingItem = inventory.find(item => item.name.toLowerCase().trim() === itemName.trim().toLowerCase());
        if (existingItem) {
          // Update existing item with new serving and expiry
          await updateInventoryItem(existingItem.id, {
            serving: parseFloat(serving),
            expiry_date: expiryDate.toISOString().split('T')[0],
          });
          Alert.alert('Success', 'Item updated successfully!');
        } else {
          // Add new item via database
          await addInventoryItem({
            name: itemName.trim(),
            serving: parseFloat(serving),
            category: selectedItemCategory,
            expiry_date: expiryDate.toISOString().split('T')[0],
            unit: 'pieces',
            min_stock_level: 10,
          });
          Alert.alert('Success', 'Item added successfully!');
        }
      }

      // Reset form
      setItemName('');
      setSelectedItemCategory('coffee');
      setExpiryDate(new Date());
      setServing('');
      setModalVisible(false);
      setIsEditing(false);
      setEditingItemId(null);
      setEditingType('inventory');
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? All entered data will be lost.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => {
          setItemName('');
          setSelectedItemCategory('coffee');
          setExpiryDate(new Date());
          setServing('');
          setModalVisible(false);
        }},
      ]
    );
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || expiryDate;
    setShowDatePicker(false);
    setExpiryDate(currentDate);
  };

  const pickImageFromGalleryMenu = async () => {
    console.log('pickImageFromGalleryMenu called');
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Permission status:', status);
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need gallery permissions to make this work!');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      console.log('Image picker result:', result);

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const filename = extractFilename(uri);
        const extension = filename.split('.').pop().toLowerCase();

        if (!['png', 'jpg', 'jpeg'].includes(extension)) {
          Alert.alert('Invalid File Type', 'Please select a PNG, JPG, or JPEG image.');
          return;
        }

        console.log('Selected image URI:', uri);
        setMenuImage(uri);
      } else {
        console.log('Image selection was canceled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const extractFilename = (uri) => {
    if (!uri) return null;
    return uri.split('/').pop();
  };

  const formatPrice = (price) => {
    let num = parseInt(price, 10);
    if (isNaN(num)) return '0';
    return num.toString();
  };

  const handleSaveMenuItem = async () => {
    if (!menuName.trim()) {
      Alert.alert('Validation Error', 'Please enter the item name.');
      return;
    }
    if (!menuPrice || isNaN(menuPrice)) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return;
    }
    if ((menuCategory === 'coffee' || menuCategory === 'coolers') && !menuSize) {
      Alert.alert('Validation Error', 'Please select a size.');
      return;
    }

    // Check for duplicate names, including plural forms, against existing menu items and default menu items
    const normalizeName = (name) => name.toLowerCase().trim().replace(/s$/i, '');
    const normalizedNewName = normalizeName(menuName);
    const allExistingNames = [...menuItems.map(item => item.name), ...Object.keys(defaultMenuPrices)];
    const duplicate = allExistingNames.find(existingName => {
      const normalizedExisting = normalizeName(existingName);
      return normalizedNewName === normalizedExisting && (!isEditingMenu || normalizeName(menuItems.find(item => item.id === editingMenuId)?.name || '') !== normalizedExisting);
    });
    if (duplicate) {
      Alert.alert('Error', 'A menu item with this name (or its plural form) already exists.');
      return;
    }

    let imageUrl = null;
    if (menuImage) {
      try {
        console.log('Starting image save locally for:', menuImage);
        const filename = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        const localUri = FileSystem.documentDirectory + filename;
        await FileSystem.copyAsync({ from: menuImage, to: localUri });
        imageUrl = localUri;
        console.log('Image saved locally at:', imageUrl);
      } catch (error) {
        console.error('Image save error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        Alert.alert('Error', `Failed to save image: ${error.message}`);
        return;
      }
    }

    const itemData = {
      name: menuName,
      price: formatPrice(menuPrice),
      category: menuCategory,
      image: imageUrl,
      createdAt: new Date(),
    };

    if ((menuCategory === 'coffee' || menuCategory === 'coolers') && menuSize && menuSize.trim() !== '') {
      itemData.size = menuSize;
    }

    try {
      if (isEditingMenu) {
        await updateMenuItem(editingMenuId, itemData);
        Alert.alert('Success', 'Menu item updated successfully!');
      } else {
        await addInventoryItem({
          ...itemData,
          type: 'menu'
        });
        Alert.alert('Success', 'Menu item added successfully!');
      }
      setModalMenuVisible(false);
      handleResetMenuFields();
    } catch (err) {
      Alert.alert('Error', isEditingMenu ? 'Failed to update menu item.' : 'Failed to add menu item.');
    }
  };

  const handleResetMenuFields = () => {
    setMenuName('');
    setMenuCategory('');
    setMenuSize('');
    setMenuPrice('');
    setMenuImage(null);
    setShowMenuCategoryDropdown(false);
    setShowSizeDropdown(false);
  };



  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with INVENTORY title and controls */}
      <View style={styles.headerContainer}>
        <View style={styles.titleAndCategories}>
          <Text style={styles.inventoryTitle}>INVENTORY</Text>
          {/* Category Tabs */}
          <View style={styles.categoryContainer}>
            {categoryIcons.map(category => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.key && styles.selectedTab
                ]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Icon
                  name={category.icon}
                  size={20}
                  color={selectedCategory === category.key ? '#FF6B35' : '#666'}
                />
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === category.key && styles.selectedCategoryTabText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.headerControls}>
          <View style={styles.smallSearchContainer}>
            <Ionicons name="search" size={16} color="#666" style={styles.smallSearchIcon} />
            <TextInput
              style={styles.smallSearchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          {user?.role !== 'cashier' && (
            <TouchableOpacity style={styles.smallAddMenuButton} onPress={() => { setEditingItem(null); setModalMenuVisible(true); }}>
              <Ionicons name="restaurant" size={16} color="#fff" />
              <Text style={styles.smallAddButtonText}>Add Menu</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Left Panel - Inventory Items */}
        <View style={styles.leftPanel}>
          <ScrollView>
            {/* Items List */}
            <View style={styles.itemsContainer}>
              {filteredItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.serving && (
                      <Text style={styles.itemServing}>Serving: {item.serving}</Text>
                    )}
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={{ marginRight: 5 }}
                      onPress={() => handleEditItem(item)}
                    >
                      <Ionicons name="settings-outline" size={20} color="#666" />
                    </TouchableOpacity>
                    {user?.role !== 'cashier' && (
                      <>
                        <TouchableOpacity
                          style={styles.updateButton}
                          onPress={() => {
                            setIsEditingMenu(true);
                            setEditingMenuId(item.id);
                            setMenuName(item.name);
                            setMenuCategory(item.category);
                            setMenuSize(item.size || '');
                            setMenuPrice(item.price ? item.price.toString() : (defaultMenuPrices[item.name] ? defaultMenuPrices[item.name].toString() : ''));
                            setMenuImage(item.image || null);
                            setModalMenuVisible(true);
                          }}
                        >
                          <Text style={styles.updateButtonText}>Update</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => item.type === 'menu' ? handleDeleteMenuItem(item.id) : handleDeleteItem(item.id)}
                        >
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Right Panel - Alerts */}
        <View style={styles.rightPanel}>
          <ScrollView>
            {/* Low Stock Alerts */}
            <View style={styles.alertsContainer}>
              <Text style={styles.alertsTitle}>Low Stock Alerts</Text>
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((alert, index) => (
                  <View key={index} style={styles.alertRow}>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertType}>Low Stock</Text>
                      <Text style={styles.alertText}>{alert.message}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dismissButton}
                      onPress={() => handleDismissAlert(alert.id)}
                    >
                      <Text style={styles.dismissButtonText}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noAlertsText}>No low stock alerts</Text>
              )}
            </View>

            {/* Expiry Alerts */}
            <View style={styles.alertsContainer}>
              <Text style={styles.alertsTitle}>Expiry Alerts</Text>
              {expiryAlerts.length > 0 ? (
                expiryAlerts.map((alert, index) => (
                  <View key={index} style={styles.alertRow}>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertType}>Expiry</Text>
                      <Text style={styles.alertText}>{alert.message}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dismissButton}
                      onPress={() => handleDismissExpiryAlert(alert.id)}
                    >
                      <Text style={styles.dismissButtonText}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.noAlertsText}>No expiry alerts</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Add Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Update Expiry and Serving' : 'Add New Item'}</Text>

            {isEditing ? (
              <View style={styles.inputContainer}>
                <Text style={styles.itemNameDisplay}>{itemName}</Text>
              </View>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Item Name"
                value={itemName}
                onChangeText={handleItemNameChange}
              />
            )}

            {!isEditing && (
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Category</Text>
                <Picker
                  selectedValue={selectedItemCategory}
                  onValueChange={(itemValue) => setSelectedItemCategory(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Coffee" value="coffee" />
                  <Picker.Item label="Coolers" value="coolers" />
                  <Picker.Item label="Alcohol" value="alcohol" />
                  <Picker.Item label="Snacks" value="snacks" />
                </Picker>
              </View>
            )}

            <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                Expiry Date: {expiryDate.toDateString()}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Serving"
              value={serving}
              onChangeText={setServing}
              keyboardType="numeric"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={expiryDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Add Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalMenuVisible}
        onRequestClose={() => setModalMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{isEditingMenu ? 'Update Menu Item' : 'Add Menu Item'}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => {
                  setEditingItem(null);
                  setModalMenuVisible(false);
                  setIsEditingMenu(false);
                  setEditingMenuId(null);
                  handleResetMenuFields();
                }}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => setShowMenuCategoryDropdown(!showMenuCategoryDropdown)}
              >
                <Text>{menuCategory ? menuCategory.charAt(0).toUpperCase() + menuCategory.slice(1) : 'Pick a category'}</Text>
                <Text>▼</Text>
              </TouchableOpacity>
              {showMenuCategoryDropdown && (
                <View style={styles.dropdown}>
                  {menuCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setMenuCategory(cat);
                        setShowMenuCategoryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {(menuCategory === 'coffee' || menuCategory === 'coolers') && (
                <>
                  <Text style={styles.inputLabel}>Size</Text>
                  <TouchableOpacity
                    style={[styles.input, { justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }]}
                    onPress={() => setShowSizeDropdown(!showSizeDropdown)}
                  >
                    <Text>{menuSize || 'Pick a size'}</Text>
                    <Text>▼</Text>
                  </TouchableOpacity>
                  {showSizeDropdown && (
                    <View style={styles.dropdown}>
                      {['M', 'L'].map((size) => (
                        <TouchableOpacity
                          key={size}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setMenuSize(size);
                            setShowSizeDropdown(false);
                            // Update price to default for selected size
                            const defaultPrice = defaultMenuPrices[menuName];
                            if (defaultPrice && typeof defaultPrice === 'object') {
                              setMenuPrice(defaultPrice[size].toString());
                            }
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{size}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}

              <Text style={styles.inputLabel}>Item Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Item Name"
                value={menuName}
                onChangeText={setMenuName}
              />

              <Text style={styles.inputLabel}>Price (PHP)</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.pesoSign}>₱</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  placeholder="0"
                  keyboardType="numeric"
                  value={menuPrice}
                  onChangeText={setMenuPrice}
                />
              </View>

              <TouchableOpacity style={styles.imagePicker} onPress={pickImageFromGalleryMenu}>
                <Text style={styles.imagePickerText}>
                  {menuImage ? extractFilename(menuImage) : 'Upload an Image'}
                </Text>
              </TouchableOpacity>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.addMenuButton} onPress={handleSaveMenuItem}>
                  <Text style={styles.addMenuButtonText}>{isEditingMenu ? 'Update Menu' : 'Add Menu'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleAndCategories: {
    flex: 1,
  },
  inventoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedTab: {
    backgroundColor: '#FFF0E6',
  },
  categoryTabText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  selectedCategoryTabText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 32,
    width: 120,
  },
  smallSearchIcon: {
    marginRight: 4,
  },
  smallSearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    paddingVertical: 0,
  },
  smallAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    height: 32,
  },
  smallAddButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  smallAddMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    height: 32,
  },

  itemsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemInfo: {
    flex: 1,
  },
  itemServing: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  updateButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 60,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 4,
    backgroundColor: '#f8f9fa',
  },
  rightPanel: {
    flex: 2,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  alertsContainer: {
    margin: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff5f5',
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  alertContent: {
    flex: 1,
  },
  alertType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff6b35',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  dismissButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  noAlertsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: 600,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  itemNameDisplay: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  pesoSign: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  imagePicker: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  addMenuButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  addMenuButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default InventoryScreen;
