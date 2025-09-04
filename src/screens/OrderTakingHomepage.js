import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import OrderSummary from '../components/OrderSummary';

const OrderTakingHomepage = ({ navigation }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('coffee');
  const [selectedSizes, setSelectedSizes] = useState({});
  const [pendingOrders, setPendingOrders] = useState([
    { id: 1, customer: 'Vivi', total: 300, items: [] },
    { id: 2, customer: 'Cel', total: 200, items: [] },
  ]);

  // Sample menu data with categories
  const menuCategories = [
    {
      id: 1,
      name: 'Coffee & Non Coffee',
      key: 'coffee',
      icon: 'local-cafe',
      items: [
        { id: 1, name: 'Iced Americano', price: 59, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Iced+Americano' },
        { id: 2, name: 'Cloud Americano', price: 75, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Cappuccino' },
        { id: 3, name: 'Spanish Latte', price: 85, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Latte' },
        { id: 4, name: 'Caramel Macchiato', price: 45, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Espresso' },
        { id: 5, name: 'Vanilla Latte', price: 95, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Mocha' },
        { id: 6, name: 'Iced Strawberry Milk', price: 65, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Cold+Brew' },
        { id: 7, name: 'Iced Blueberry Milk', price: 110, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Frappuccino' },
      ]
    },
    {
      id: 2,
      name: 'Coolers',
      key: 'coolers',
      icon: 'ac-unit',
      items: [
        { id: 11, name: 'Lychee Soda', price: 45, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Iced+Tea' },
        { id: 12, name: 'Strawberry Soda', price: 55, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Lemonade' },
        { id: 13, name: 'Blueberry Soda', price: 65, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Smoothie' },
        { id: 14, name: 'Green Apple Soda', price: 75, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Milk+Tea' },
        { id: 15, name: 'Passion Fruit Soda', price: 50, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Fruit+Shake' },
        { id: 16, name: 'Premium Lemonade', price: 50, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Fruit+Shake' },
        { id: 17, name: 'Premium Lemonade w/ Yakult', price: 50, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Fruit+Shake' },

      ]
    },
    {
      id: 3,
      name: 'Alcohol',
      key: 'alcohol',
      icon: 'local-bar',
      items: [
        { id: 16, name: 'Beer', price: 85, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Beer' },
        { id: 17, name: 'Wine', price: 120, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Wine' },
        { id: 18, name: 'Cocktail', price: 150, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Cocktail' },
      ]
    },
    {
      id: 4,
      name: 'Snacks',
      key: 'snacks',
      icon: 'restaurant',
      items: [
        { id: 19, name: 'Sandwich', price: 65, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Sandwich' },
        { id: 20, name: 'Croissant', price: 45, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Croissant' },
        { id: 21, name: 'Muffin', price: 35, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Muffin' },
        { id: 22, name: 'Bagel', price: 40, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Bagel' },
        { id: 23, name: 'Cake Slice', price: 55, image: 'https://via.placeholder.com/150x100/FF6B35/FFFFFF?text=Cake+Slice' },
      ]
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
    return currentCategory ? currentCategory.items : [];
  };

  const handleAddItem = (item) => {
    const existingItem = selectedItems.find(selected => selected.id === item.id);
    
    if (existingItem) {
      const updatedItems = selectedItems.map(selected =>
        selected.id === item.id
          ? { ...selected, quantity: selected.quantity + 1 }
          : selected
      );
      setSelectedItems(updatedItems);
      calculateTotal(updatedItems);
    } else {
      const newItems = [...selectedItems, { ...item, quantity: 1 }];
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
    setTotalAmount(total);
  };

  const handleSaveAndPrint = (action) => {
    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please add items to the order before saving');
      return;
    }

    if (action === 'save') {
      Alert.alert(
        'Order Saved',
        `Order saved successfully! Total: ₱${totalAmount.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedItems([]);
              setTotalAmount(0);
            }
          }
        ]
      );
    } else if (action === 'print') {
      Alert.alert(
        'Print Receipt',
        `Printing receipt... Total: ₱${totalAmount.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedItems([]);
              setTotalAmount(0);
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

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>₱{item.price}</Text>
      
      <View style={styles.actionContainer}>
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
          style={styles.addButton}
          onPress={() => handleAddItem(item)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Left Side - Menu Gallery */}
        <View style={styles.menuSection}>
          <View style={styles.header}>
            <Text style={styles.title}>Menu Items</Text>
            <TouchableOpacity>
              <Text style={styles.customizeText}>Customize Menu</Text>
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <View style={styles.categoryContainer}>
            {categoryIcons.map(renderCategoryTab)}
          </View>

          {/* Menu Grid */}
          <FlatList
            data={getFilteredItems().slice(0, 10)}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={5}
            contentContainerStyle={styles.menuGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Right Side - Order Summary */}
        <View style={styles.orderSection}>
          <OrderSummary
            items={selectedItems}
            totalAmount={totalAmount}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onSaveAndPrint={handleSaveAndPrint}
            pendingOrders={pendingOrders}
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
  itemImage: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    marginBottom: 6,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 6,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
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
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
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
});

export default OrderTakingHomepage;
