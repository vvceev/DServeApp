import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
  Dimensions,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import OrderSummary from '../components/OrderSummary';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../database/firebaseConfig';

const OrderTakingHomepage = ({ navigation }) => {
  const db = getFirestore(app);

  const [selectedItems, setSelectedItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('coffee');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingOrders, setPendingOrders] = useState([
    { id: 1, customer: 'Vivi', total: 300, items: [] },
    { id: 2, customer: 'Cel', total: 200, items: [] },
  ]);

  const [orderNumber, setOrderNumber] = useState(1);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    const loadOrderNumber = async () => {
      try {
        const currentDate = new Date().toISOString().split('T')[0];
        const storedDate = await AsyncStorage.getItem('lastOrderDate');
        if (storedDate !== currentDate) {
          setOrderNumber(1);
          await AsyncStorage.setItem('orderNumber', '1');
          await AsyncStorage.setItem('lastOrderDate', currentDate);
        } else {
          const stored = await AsyncStorage.getItem('orderNumber');
          if (stored) {
            setOrderNumber(parseInt(stored, 10));
          }
        }
      } catch (error) {
        console.error('Error loading order number:', error);
      }
    };
    loadOrderNumber();
  }, []);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'newMenuItems'));
        const items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, price: parseFloat(data.price), isNew: true, ...data };
        });
        setMenuItems(items);
      } catch (err) {
        setError('Failed to load menu items');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'inventory'));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInventoryItems(items);
      } catch (err) {
        console.error('Failed to load inventory items', err);
      }
    };
    fetchInventoryItems();
  }, []);

  const incrementOrderNumber = async () => {
    setOrderNumber(prev => {
      const newNum = prev + 1;
      AsyncStorage.setItem('orderNumber', newNum.toString());
      const currentDate = new Date().toISOString().split('T')[0];
      AsyncStorage.setItem('lastOrderDate', currentDate);
      return newNum;
    });
  };

  // Import getMaxOrderNumberForToday from UserContext
  const { getMaxOrderNumberForToday } = useUser();

  // Size pricing configuration - can be edited later
  // Changed to fixed price increase for Large size
  const sizePriceIncrease = {
    'M': 0,    // Medium no increase
    'L': 10    // Large is +10 pesos
  };

  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 768;

  // Default hardcoded menu items
  const defaultMenuItems = [
    { id: 1, name: 'Iced Americano', price: 49, image: require('../../assets/app_images/coffee/icedamericano.png'), category: 'coffee', stock: 0 },
    { id: 2, name: 'Cloud Americano', price: 49, image: require('../../assets/app_images/coffee/cloudamericano.png'), category: 'coffee', stock: 5 },
    { id: 3, name: 'Spanish Latte', price: 59, image: require('../../assets/app_images/coffee/spanishlatte.png'), category: 'coffee', stock: 20 },
    { id: 4, name: 'Caramel Macchiato', price: 59, image: require('../../assets/app_images/coffee/caramelmachiatto.png'), category: 'coffee' },
    { id: 5, name: 'Vanilla Latte', price: 59, image: require('../../assets/app_images/coffee/vanillalatte.png'), category: 'coffee' },
    { id: 6, name: 'Iced Strawberry Milk', price: 49, image: require('../../assets/app_images/coffee/icedstrawberrymilk.png'), category: 'coffee' },
    { id: 7, name: 'Iced Blueberry Milk', price: 49, image: require('../../assets/app_images/coffee/icedblueberrymilk.png'), category: 'coffee' },
    { id: 11, name: 'Lychee Soda', price: 49, image: require('../../assets/app_images/coolers/LycheeSoda.png'), category: 'coolers' },
    { id: 12, name: 'Strawberry Soda', price: 49, image: require('../../assets/app_images/coolers/StrawberrySoda.png'), category: 'coolers' },
    { id: 13, name: 'Blueberry Soda', price: 49, image: require('../../assets/app_images/coolers/BlueberrySoda.png'), category: 'coolers' },
    { id: 14, name: 'Green Apple Soda', price: 49, image: require('../../assets/app_images/coolers/GreenAppleSoda.png'), category: 'coolers' },
    { id: 15, name: 'Passion Fruit Soda', price: 49, image: require('../../assets/app_images/coolers/PassionFruitSoda.png'), category: 'coolers' },
    { id: 16, name: 'Premium Lemonade', price: 59, image: require('../../assets/app_images/coolers/PremiumLemonade.png'), category: 'coolers' },
    { id: 17, name: 'Premium Lemonade w/ Yakult', price: 74, image: require('../../assets/app_images/coolers/PremiumLemonadeYakult.png'), category: 'coolers' },
    { id: 18, name: 'Alfonso', price: 499, image: require('../../assets/app_images/alcohol/Alfonso.png'), category: 'alcohol' },
    { id: 19, name: 'Boracay Cappuccino', price: 259, image: require('../../assets/app_images/alcohol/BoracayCappuccino.png'), category: 'alcohol' },
    { id: 20, name: 'Boracay Coconut', price: 259, image: require('../../assets/app_images/alcohol/BoracayCoconut.png'), category: 'alcohol' },
    { id: 21, name: 'Cossack', price: 320, image: require('../../assets/app_images/alcohol/Cossack.png'), category: 'alcohol' },
    { id: 22, name: 'Embassy', price: 299, image: require('../../assets/app_images/alcohol/Embassy.png'), category: 'alcohol' },
    { id: 23, name: 'Emperador', price: 259, image: require('../../assets/app_images/alcohol/Empe.png'), category: 'alcohol' },
    { id: 24, name: 'Ginto', price: 259, image: require('../../assets/app_images/alcohol/Ginto.png'), category: 'alcohol' },
    { id: 25, name: 'Mojito', price: 259, image: require('../../assets/app_images/alcohol/Mojito.png'), category: 'alcohol' },
    { id: 26, name: 'Primera', price: 350, image: require('../../assets/app_images/alcohol/Primera.png'), category: 'alcohol' },
    { id: 27, name: 'Redhorse', price: 80, image: require('../../assets/app_images/alcohol/Redhorse.png'), category: 'alcohol' },
    { id: 28, name: 'Redhorse Bucket', price: 470, image: require('../../assets/app_images/alcohol/RedhorseBucket.png'), category: 'alcohol' },
    { id: 29, name: 'San Miguel', price: 70, image: require('../../assets/app_images/alcohol/SanMig.png'), category: 'alcohol' },
    { id: 30, name: 'San Miguel Bucket', price: 410, image: require('../../assets/app_images/alcohol/SanMigBucket.png'), category: 'alcohol' },
    { id: 31, name: 'Tanduay Dark', price: 269, image: require('../../assets/app_images/alcohol/TanduayDark.png'), category: 'alcohol' },
    { id: 32, name: 'Tanduay Mixes', price: 259, image: require('../../assets/app_images/alcohol/TanduayMixes.png'), category: 'alcohol' },
    { id: 33, name: 'Tanduay Select', price: 259, image: require('../../assets/app_images/alcohol/TanduaySelect.png'), category: 'alcohol' },
    { id: 34, name: 'Tanduay White', price: 259, image: require('../../assets/app_images/alcohol/TanduayWhite.png'), category: 'alcohol' },
    { id: 35, name: 'Tower', price: 200, image: require('../../assets/app_images/alcohol/Tower.png'), category: 'alcohol' },
    { id: 36, name: 'Mani', price: 20, image: require('../../assets/app_images/snacks/Mani.png'), category: 'snacks' },
    { id: 37, name: 'Kikiam', price: 50, image: require('../../assets/app_images/snacks/Kikiam.png'), category: 'snacks' },
    { id: 38, name: 'Fishball', price: 50, image: require('../../assets/app_images/snacks/FishBall.png'), category: 'snacks' },
    { id: 39, name: 'Shanghai', price: 50, image: require('../../assets/app_images/snacks/Shanghai.png'), category: 'snacks' },
    { id: 40, name: 'Siomai', price: 50, image: require('../../assets/app_images/snacks/Siomai.png'), category: 'snacks' },
    { id: 41, name: 'Fries', price: 50, image: require('../../assets/app_images/snacks/Fries.png'), category: 'snacks' },
    { id: 42, name: 'Sisig', price: 130, image: require('../../assets/app_images/snacks/Sisig.png'), category: 'snacks' },
    { id: 43, name: 'Ramen Mild', price: 70, image: require('../../assets/app_images/snacks/MildRamen.png'), category: 'snacks' },
    { id: 44, name: 'Ramen Spicy', price: 70, image: require('../../assets/app_images/snacks/SpicyRamen.png'), category: 'snacks' },
    { id: 45, name: 'Buldak', price: 105, image: require('../../assets/app_images/snacks/Buldak.png'), category: 'snacks' },
  ];

  // Combine default items with Firebase items (Firebase items are added on top of defaults)
  const effectiveMenuItems = [...defaultMenuItems, ...menuItems];

  // Merge menu items with inventory data for real stock levels
  const menuItemsWithInventory = effectiveMenuItems.map(menuItem => {
    // Find matching inventory item by name
    const inventoryItem = inventoryItems.find(invItem =>
      invItem.name.toLowerCase() === menuItem.name.toLowerCase()
    );

    // Use inventory stock if available, otherwise use menu item's stock
    const stock = inventoryItem ? parseFloat(inventoryItem.serving) : (menuItem.stock !== undefined ? menuItem.stock : 999);

    return {
      ...menuItem,
      stock: stock,
      inventoryId: inventoryItem ? inventoryItem.id : null
    };
  });

  // Group menu items by category
  const groupedMenuItems = menuItemsWithInventory.reduce((acc, item) => {
    const category = item.category || 'coffee'; // Default to coffee if no category
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const menuCategories = [
    {
      id: 1,
      name: 'Coffee & Non Coffee',
      key: 'coffee',
      icon: 'local-cafe',
      items: groupedMenuItems.coffee || []
    },
    {
      id: 2,
      name: 'Coolers',
      key: 'coolers',
      icon: 'ac-unit',
      items: groupedMenuItems.coolers || []
    },
    {
      id: 3,
      name: 'Alcohol',
      key: 'alcohol',
      icon: 'local-bar',
      items: groupedMenuItems.alcohol || []
    },
    {
      id: 4,
      name: 'Snacks',
      key: 'snacks',
      icon: 'restaurant',
      items: groupedMenuItems.snacks || []
    }
  ];

  const categoryIcons = [
    { name: 'Coffee', icon: 'local-cafe', key: 'coffee' },
    { name: 'Coolers', icon: 'ac-unit', key: 'coolers' },
    { name: 'Alcohol', icon: 'local-bar', key: 'alcohol' },
    { name: 'Snacks', icon: 'restaurant', key: 'snacks' },
  ];

  const getFilteredItems = () => {
    const currentCategory = menuCategories.find(cat => cat.key === selectedCategory);
    if (!currentCategory) return [];
    let items = currentCategory.items;
    if (searchQuery) {
      items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return items;
  };

  const handleAddItem = (item) => {
    const existingItem = selectedItems.find(selected => selected.id === item.id);

    // Check if item is from coffee or coolers category or is a newMenuItem and has size selected
    const isSizeApplicable = ((selectedCategory === 'coffee' || selectedCategory === 'coolers') || item.isNew) && selectedSizes[item.id];
    const adjustedPrice = isSizeApplicable ? item.price + sizePriceIncrease[selectedSizes[item.id]] : item.price;

    if (existingItem) {
      const updatedItems = selectedItems.map(selected =>
        selected.id === item.id
          ? { ...selected, quantity: selected.quantity + 1, price: adjustedPrice, size: selectedSizes[item.id] || null }
          : selected
      );
      setSelectedItems(updatedItems);
      calculateTotal(updatedItems);
    } else {
      const newItem = { ...item, quantity: 1, price: adjustedPrice, size: selectedSizes[item.id] || null };
      const newItems = [...selectedItems, newItem];
      setSelectedItems(newItems);
      calculateTotal(newItems);
    }
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    const updatedItems = selectedItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setSelectedItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setSubtotal(total);
  };

  const { saveOrder } = useUser();

  const handleSaveAndPrint = async (action, finalTotal, customerName, orderType, items, orderNumber) => {
    console.log('handleSaveAndPrint called with items:', items);
    console.log('selectedItems state:', selectedItems);

    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please add items to the order before saving');
      return;
    }

    if (action === 'save') {
      // Create order object
      const order = {
        id: Date.now().toString(),
        orderNumber: `#${orderNumber}`,
        customerName: customerName || 'Walk-in Customer',
        orderType,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size
        })),
        total: finalTotal,
        date: new Date().toISOString(),
      };

      console.log('Order object to be saved:', order);
      console.log('Order items array:', order.items);

      try {
        // Save to context
        await saveOrder(order);

        Alert.alert(
          'Order Saved',
          `Order saved successfully! Total: ₱${finalTotal.toFixed(2)}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setSelectedItems([]);
                setSubtotal(0);
                // Navigate to OrderManagementScreen
                navigation.navigate('OrderManagement');
              }
            }
          ]
        );
      } catch (error) {
        console.error('Error saving order:', error);
        Alert.alert(
          'Save Failed',
          `Failed to save order: ${error.message}`,
          [{ text: 'OK' }]
        );
      }
    } else if (action === 'print') {
      Alert.alert(
        'Print Receipt',
        `Printing receipt... Total: ₱${finalTotal.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedItems([]);
              setSubtotal(0);
            }
          }
        ]
      );
    }
  };

  const handleSizeSelect = (itemId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [itemId]: prev[itemId] === size ? null : size
    }));
  };

  const renderMenuItem = ({ item }) => {
    // Calculate display price based on selected size for coffee, coolers, or newMenuItems
    const isSizeApplicable = ((selectedCategory === 'coffee' || selectedCategory === 'coolers') || item.isNew) && selectedSizes[item.id];
    const displayPrice = isSizeApplicable ? item.price + sizePriceIncrease[selectedSizes[item.id]] : item.price;

    // Stock logic
    const stock = item.stock !== undefined ? item.stock : 999; // Assume unlimited if no stock field
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock <= 10;

    return (
      <View style={[styles.menuItemCard, isSmallScreen && styles.menuItemCardSmall]}>
        <View style={styles.imageContainer}>
          <Image
            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
            style={[
              styles.itemImage,
              (Array.from({ length: 40 }, (_, i) => i + 1).includes(item.id) || typeof item.id === 'string') && styles.itemImageZoomedOut,
              (isLowStock || isOutOfStock) && styles.itemImageLowStock
            ]}
          />
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
            </View>
          )}
        </View>
        <View style={styles.namePriceContainer}>
          <Text style={styles.itemName}>{item.name}</Text>
          {((selectedCategory !== 'alcohol' && selectedCategory !== 'snacks') || item.isNew) && <Text style={styles.itemPrice}>₱{displayPrice}</Text>}
        </View>
        <View style={styles.bottomContainer}>
          {((selectedCategory === 'coffee' || selectedCategory === 'coolers') || item.isNew) ? (
            <>
              <View style={styles.sizeButtons}>
                <TouchableOpacity
                  style={[
                    styles.sizeButton,
                    selectedSizes[item.id] === 'M' && styles.sizeButtonSelected
                  ]}
                  onPress={() => handleSizeSelect(item.id, 'M')}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    selectedSizes[item.id] === 'M' && styles.sizeButtonTextSelected
                  ]}>M</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sizeButton,
                    selectedSizes[item.id] === 'L' && styles.sizeButtonSelected
                  ]}
                  onPress={() => handleSizeSelect(item.id, 'L')}
                >
                  <Text style={[
                    styles.sizeButtonText,
                    selectedSizes[item.id] === 'L' && styles.sizeButtonTextSelected
                  ]}>L</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.addButton, isOutOfStock && styles.addButtonDisabled]}
                onPress={() => !isOutOfStock && handleAddItem(item)}
                disabled={isOutOfStock}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {((selectedCategory !== 'alcohol' && selectedCategory !== 'snacks') || item.isNew) && <Text style={styles.itemPrice}>₱{displayPrice}</Text>}
              <TouchableOpacity
                style={[styles.addButton, isOutOfStock && styles.addButtonDisabled]}
                onPress={() => !isOutOfStock && handleAddItem(item)}
                disabled={isOutOfStock}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderCategoryTab = (category) => (
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
        size={24} 
        color={selectedCategory === category.key ? '#FF6B35' : '#666'} 
      />
      <Text style={[
        styles.tabText,
        selectedCategory === category.key && styles.selectedTabText
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const { user } = useUser();

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.contentContainer, isSmallScreen && {flexDirection: 'column'}]}>
        {/* Left Side - Menu Gallery */}
        <View style={[styles.menuSection, isSmallScreen && {flex: 1, marginRight: 0, marginBottom: 16}]}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Menu Items</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search menu items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {user?.role !== 'cashier' && user?.role !== 'admin' && (
              <TouchableOpacity>
                <Text style={styles.customizeText}>Customize Menu</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category Tabs */}
          <View style={styles.categoryContainer}>
            {categoryIcons.map(renderCategoryTab)}
          </View>

          {/* Loading and Error States */}
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading menu items...</Text>
            </View>
          )}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Menu Grid */}
          {!loading && !error && (
            <FlatList
              data={getFilteredItems()}
              renderItem={renderMenuItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={isSmallScreen ? 3 : 5}
              contentContainerStyle={styles.menuGrid}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Right Side - Order Summary */}
        <View style={[styles.orderSection, isSmallScreen && styles.orderSectionSmallScreen]}>
          <OrderSummary
            items={selectedItems}
            subtotal={subtotal}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onSaveAndPrint={handleSaveAndPrint}
            pendingOrders={pendingOrders}
            orderNumber={orderNumber}
            onIncrementOrderNumber={incrementOrderNumber}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
  },
  menuSection: {
    flex: 2,
    marginRight: 16,
  },
  orderSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderSectionSmallScreen: {
    flexGrow: 1,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchInput: {
    marginLeft: 280,
    width: 250,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
  },
  customizeText: {
    fontSize: 14,
    color: '#FF6B35',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryTab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  selectedTab: {
    backgroundColor: '#FFF0E6',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  selectedTabText: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  menuGrid: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  menuItemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    margin: 4,
    width: '18%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    aspectRatio: 0.85,
  },
  menuItemCardSmall: {
    width: '30%',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemImageZoomedOut: {
    resizeMode: 'contain',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sizeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  sizeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sizeButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  sizeButtonSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  sizeButtonTextSelected: {
    color: '#fff',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  namePriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 6,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B35',
    textAlign: 'center',
  },
  itemImageLowStock: {
    opacity: 0.5,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default OrderTakingHomepage;
