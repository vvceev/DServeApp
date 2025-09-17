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

import CustomHeader from '../components/CustomHeader';
import { useUser } from '../contexts/UserContext';
import { useNotification } from '../contexts/NotificationContext';

const InventoryScreen = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, isLoading } = useUser();
  const { notifications, removeNotification } = useNotification();
  const [items, setItems] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sync with inventory from context
  useEffect(() => {
    if (inventory && inventory.length > 0) {
      setItems(inventory);
    }
  }, [inventory]);

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
  const [itemName, setItemName] = useState('');
  const [selectedItemCategory, setSelectedItemCategory] = useState('coffee');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [serving, setServing] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleEditItem = (item) => {
    setIsEditing(true);
    setEditingItemId(item.id);
    setItemName(item.name);
    setSelectedItemCategory(item.category);
    setExpiryDate(new Date(item.expiry_date || new Date()));
    setServing(item.serving.toString());
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

  const handleSaveItem = async () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!serving || isNaN(serving) || parseInt(serving) <= 0) {
      Alert.alert('Error', 'Please enter a valid serving');
      return;
    }

    try {
      if (isEditing) {
        // Update existing item via database
        await updateInventoryItem(editingItemId, {
          name: itemName.trim(),
          serving: parseFloat(serving),
          category: selectedItemCategory,
          expiry_date: expiryDate.toISOString().split('T')[0],
          unit: 'pieces', // Default unit
          min_stock_level: 10, // Default min stock level
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

      // Reset form
      setItemName('');
      setSelectedItemCategory('coffee');
      setExpiryDate(new Date());
      setServing('');
      setModalVisible(false);
      setIsEditing(false);
      setEditingItemId(null);
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
          <TouchableOpacity style={styles.smallAddButton} onPress={handleAddItem}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.smallAddButtonText}>Add Items</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        {/* Left Panel - Inventory Items */}
        <View style={styles.leftPanel}>
          <ScrollView>
            {/* Items List */}
            <View style={styles.itemsContainer}>
              {filteredItems.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.updateButton}
                      onPress={() => handleEditItem(item)}
                    >
                      <Text style={styles.updateButtonText}>Update ({item.serving})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteItem(item.id)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
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
                lowStockAlerts.map(alert => (
                  <View key={alert.id} style={styles.alertRow}>
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
                expiryAlerts.map(alert => (
                  <View key={alert.id} style={styles.alertRow}>
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
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Item' : 'Add New Item'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={itemName}
              onChangeText={setItemName}
            />

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

  updateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
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
    flex: 2,
    backgroundColor: '#f8f9fa',
  },
  rightPanel: {
    flex: 1,
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
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
});

export default InventoryScreen;
