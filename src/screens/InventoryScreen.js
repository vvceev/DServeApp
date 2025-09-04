import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CustomHeader from '../components/CustomHeader';

const InventoryScreen = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Item #1', quantity: 41, lowStock: false },
    { id: 2, name: 'Item #2', quantity: 12, lowStock: false },
    { id: 3, name: 'Item #3', quantity: 5, lowStock: true },
    { id: 4, name: 'Item #4', quantity: 24, lowStock: false },
    { id: 5, name: 'Item #5', quantity: 10, lowStock: true },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockAlerts, setLowStockAlerts] = useState([
    { id: 1, name: 'Item #1' },
    { id: 3, name: 'Item #3' },
  ]);

  const handleQuantityChange = (id, change) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      )
    );
  };

  const handleAddItem = () => {
    const newId = Math.max(...items.map(item => item.id)) + 1;
    const newItem = {
      id: newId,
      name: `Item #${newId}`,
      quantity: 0,
      lowStock: false,
    };
    setItems([...items, newItem]);
  };

  const handleDismissAlert = (alertId) => {
    setLowStockAlerts(prevAlerts =>
      prevAlerts.filter(alert => alert.id !== alertId)
    );
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header with INVENTORY title and controls */}
        <View style={styles.headerContainer}>
          <Text style={styles.inventoryTitle}>INVENTORY</Text>
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
            <TouchableOpacity style={styles.smallAddButton} onPress={handleAddItem}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.smallAddButtonText}>Add Items</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.itemsContainer}>
          {filteredItems.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, -1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleQuantityChange(item.id, 1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Low Stock Alerts */}
        {lowStockAlerts.length > 0 && (
          <View style={styles.alertsContainer}>
            <Text style={styles.alertsTitle}>Low Stock Alerts</Text>
            {lowStockAlerts.map(alert => (
              <View key={alert.id} style={styles.alertRow}>
                <Text style={styles.alertText}>{alert.name}</Text>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => handleDismissAlert(alert.id)}
                >
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  inventoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemsContainer: {
    backgroundColor: '#fff',
    margin: 16,
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
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  },
  alertsContainer: {
    backgroundColor: '#fff',
    margin: 16,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertText: {
    fontSize: 16,
    color: '#333',
  },
  dismissButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default InventoryScreen;
