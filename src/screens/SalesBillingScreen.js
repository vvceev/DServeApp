import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
} from 'react-native';

const SalesBillingScreen = () => {
  const [currentOrder, setCurrentOrder] = useState({
    items: [
      { id: '1', name: 'Margherita Pizza', price: 12.99, quantity: 1 },
      { id: '2', name: 'Caesar Salad', price: 8.99, quantity: 2 },
    ],
    subtotal: 30.97,
    tax: 2.48,
    total: 33.45,
  });

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);

  const menuItems = [
    { id: '1', name: 'Margherita Pizza', price: 12.99, category: 'Pizza' },
    { id: '2', name: 'Caesar Salad', price: 8.99, category: 'Salads' },
    { id: '3', name: 'Grilled Salmon', price: 18.99, category: 'Main Course' },
    { id: '4', name: 'Pasta Carbonara', price: 13.99, category: 'Pasta' },
    { id: '5', name: 'Tiramisu', price: 6.99, category: 'Desserts' },
    { id: '6', name: 'House Wine', price: 7.99, category: 'Beverages' },
  ];

  const addItemToOrder = (item) => {
    const existingItem = currentOrder.items.find(orderItem => orderItem.id === item.id);
    if (existingItem) {
      setCurrentOrder(prev => ({
        ...prev,
        items: prev.items.map(orderItem =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        ),
      }));
    } else {
      setCurrentOrder(prev => ({
        ...prev,
        items: [...prev.items, { ...item, quantity: 1 }],
      }));
    }
  };

  const removeItemFromOrder = (itemId) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeItemFromOrder(itemId);
    } else {
      setCurrentOrder(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ),
      }));
    }
  };

  const calculateTotal = () => {
    const subtotal = currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = (subtotal * discount) / 100;
    const tax = (subtotal - discountAmount) * 0.08;
    const total = subtotal - discountAmount + tax;
    
    return { subtotal, tax, total: Math.round(total * 100) / 100 };
  };

  const totals = calculateTotal();

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => addItemToOrder(item)}
    >
      <View style={styles.menuItemInfo}>
        <Text style={styles.menuItemName}>{item.name}</Text>
        <Text style={styles.menuItemCategory}>{item.category}</Text>
      </View>
      <Text style={styles.menuItemPrice}>${item.price}</Text>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderItemInfo}>
        <Text style={styles.orderItemName}>{item.name}</Text>
        <Text style={styles.orderItemPrice}>${item.price}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.orderItemTotal}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Sales & Billing</Text>
          <Text style={styles.subtitle}>Process payments and manage sales</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Menu Items</Text>
            <FlatList
              data={menuItems}
              renderItem={renderMenuItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.menuList}
            />
          </View>

          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Current Order</Text>
            
            {currentOrder.items.length === 0 ? (
              <Text style={styles.emptyOrderText}>No items in order</Text>
            ) : (
              <>
                <FlatList
                  data={currentOrder.items}
                  renderItem={renderOrderItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.orderList}
                />
                
                <View style={styles.orderSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>${totals.subtotal.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Discount:</Text>
                    <View style={styles.discountContainer}>
                      <TextInput
                        style={styles.discountInput}
                        value={discount.toString()}
                        onChangeText={(text) => setDiscount(Number(text) || 0)}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <Text style={styles.discountText}>%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax (8%):</Text>
                    <Text style={styles.summaryValue}>${totals.tax.toFixed(2)}</Text>
                  </View>
                  
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>${totals.total.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.paymentSection}>
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                  <View style={styles.paymentOptions}>
                    {['cash', 'card', 'digital'].map((method) => (
                      <TouchableOpacity
                        key={method}
                        style={[
                          styles.paymentOption,
                          paymentMethod === method && styles.selectedPayment
                        ]}
                        onPress={() => setPaymentMethod(method)}
                      >
                        <Text style={[
                          styles.paymentOptionText,
                          paymentMethod === method && styles.selectedPaymentText
                        ]}>
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={styles.checkoutButton}>
                  <Text style={styles.checkoutButtonText}>Process Payment</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  contentContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  menuSection: {
    flex: 1,
  },
  orderSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItemCategory: {
    fontSize: 12,
    color: '#666',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  orderList: {
    gap: 10,
  },
  orderItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderItemPrice: {
    fontSize: 12,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 10,
  },
  orderItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    width: 60,
    textAlign: 'right',
  },
  emptyOrderText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginVertical: 50,
  },
  orderSummary: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountInput: {
    width: 40,
    height: 30,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    textAlign: 'center',
    marginRight: 5,
  },
  discountText: {
    fontSize: 14,
    color: '#666',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  paymentSection: {
    marginTop: 20,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedPayment: {
    backgroundColor: '#FF6B35',
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedPaymentText: {
    color: 'white',
  },
  checkoutButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SalesBillingScreen;
