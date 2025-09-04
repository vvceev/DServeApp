import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const OrderSummaryNew = ({ 
  items, 
  totalAmount, 
  onRemoveItem, 
  onUpdateQuantity, 
  onSaveAndPrint,
  pendingOrders = []
}) => {
  const renderOrderItem = (item) => (
    <View key={item.id} style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₱{item.price} each</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          ₱{(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const renderPendingOrder = (order) => (
    <View key={order.id} style={styles.pendingOrderItem}>
      <Text style={styles.orderNumber}>{order.id}</Text>
      <Text style={styles.orderCustomer}>{order.customer}</Text>
      <Text style={styles.orderTotal}>₱{order.total}</Text>
      <TouchableOpacity style={styles.checkButton}>
        <Text style={styles.checkButtonText}>✓</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>
      
      <ScrollView style={styles.orderList}>
        {items.length === 0 ? (
          <Text style={styles.emptyMessage}>No items added yet</Text>
        ) : (
          items.map(renderOrderItem)
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₱{totalAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, items.length === 0 && styles.saveButtonDisabled]}
            onPress={() => onSaveAndPrint('save')}
            disabled={items.length === 0}
          >
            <Text style={styles.saveButtonText}>Save Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.printButton, items.length === 0 && styles.saveButtonDisabled]}
            onPress={() => onSaveAndPrint('print')}
            disabled={items.length === 0}
          >
            <Text style={styles.printButtonText}>Print Order</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending Orders Section */}
      <View style={styles.pendingOrdersSection}>
        <Text style={styles.pendingOrdersTitle}>Pending Orders:</Text>
        <View style={styles.pendingOrdersHeader}>
          <Text style={styles.headerText}>No.</Text>
          <Text style={styles.headerText}>Customer</Text>
          <Text style={styles.headerText}>Total</Text>
          <Text style={styles.headerText}>Action</Text>
        </View>
        <ScrollView style={styles.pendingOrdersList}>
          {pendingOrders.map(renderPendingOrder)}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  orderList: {
    flex: 1,
    maxHeight: 200,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemPrice: {
    fontSize: 12,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  quantityButton: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 10,
  },
  itemTotal: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  printButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  printButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingOrdersSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  pendingOrdersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom:
