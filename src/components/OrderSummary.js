import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const OrderSummary = ({ items, totalAmount, onRemoveItem, onUpdateQuantity, onSaveAndPrint }) => {
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState('dine-in');
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const discountOptions = [
    { label: '0%', value: 0 },
    { label: '5%', value: 5 },
    { label: '10%', value: 10 },
    { label: '15%', value: 15 },
    { label: '20%', value: 20 },
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
  ];

  const calculateDiscountAmount = () => {
    return (totalAmount * discountPercentage) / 100;
  };

  const calculateSubtotal = () => {
    return totalAmount;
  };

  const calculateTotalAfterDiscount = () => {
    return totalAmount - calculateDiscountAmount();
  };

  const renderOrderItem = (item) => (
    <View key={item.id} style={styles.orderItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₱{item.price.toFixed(2)} each</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Details</Text>
      
      {/* Date and Time */}
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Date: </Text>
      </View>

      {/* Order Type Selection */}
      <View style={styles.orderTypeContainer}>
        <Text style={styles.sectionLabel}>Order Type:</Text>
        <View style={styles.orderTypeButtons}>
          <TouchableOpacity
            style={[
              styles.orderTypeButton,
              orderType === 'dine-in' && styles.orderTypeButtonSelected
            ]}
            onPress={() => setOrderType('dine-in')}
          >
            <Text style={[
              styles.orderTypeButtonText,
              orderType === 'dine-in' && styles.orderTypeButtonTextSelected
            ]}>Dine In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.orderTypeButton,
              orderType === 'take-out' && styles.orderTypeButtonSelected
            ]}
            onPress={() => setOrderType('take-out')}
          >
            <Text style={[
              styles.orderTypeButtonText,
              orderType === 'take-out' && styles.orderTypeButtonTextSelected
            ]}>Take Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Name */}
      <View style={styles.customerContainer}>
        <Text style={styles.sectionLabel}>Customer Name:</Text>
        <TextInput
          style={styles.customerInput}
          placeholder="Enter customer name"
          value={customerName}
          onChangeText={setCustomerName}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Order Items */}
      <ScrollView style={styles.orderList}>
        {items.length === 0 ? (
          <Text style={styles.emptyMessage}>No items added yet</Text>
        ) : (
          items.map(renderOrderItem)
        )}
      </ScrollView>

      {/* Discount Section */}
      <View style={styles.discountContainer}>
        <Text style={styles.sectionLabel}>Discount:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={discountPercentage}
            style={styles.discountPicker}
            onValueChange={(itemValue) => setDiscountPercentage(itemValue)}
          >
            {discountOptions.map((option) => (
              <Picker.Item 
                key={option.value} 
                label={option.label} 
                value={option.value} 
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Pricing Summary */}
      <View style={styles.pricingContainer}>
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Subtotal:</Text>
          <Text style={styles.pricingValue}>₱{calculateSubtotal().toFixed(2)}</Text>
        </View>
        
        {discountPercentage > 0 && (
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Discount {discountPercentage}%:</Text>
            <Text style={styles.pricingValue}>-₱{calculateDiscountAmount().toFixed(2)}</Text>
          </View>
        )}
        
        <View style={styles.pricingRow}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalAmount}>₱{calculateTotalAfterDiscount().toFixed(2)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
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
  dateContainer: {
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderTypeContainer: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  orderTypeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  orderTypeButtonSelected: {
    backgroundColor: '#FF6B35',
  },
  orderTypeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  orderTypeButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  customerContainer: {
    marginBottom: 15,
  },
  customerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  orderList: {
    flex: 1,
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
  discountContainer: {
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  discountPicker: {
    height: 40,
  },
  pricingContainer: {
    marginBottom: 15,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#333',
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
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
});

export default OrderSummary;
