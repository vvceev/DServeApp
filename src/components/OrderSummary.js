import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const OrderSummary = ({ items, subtotal, onRemoveItem, onUpdateQuantity, onSaveAndPrint, orderNumber, onIncrementOrderNumber, customerName: propCustomerName, orderType: propOrderType, orderDate, onClose, isModal = false }) => {
  const [customerName, setCustomerName] = useState(propCustomerName || '');
  const [orderType, setOrderType] = useState(propOrderType || 'dine-in');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (orderDate) {
      const date = new Date(orderDate);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      setCurrentDate(formattedDate);
      const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      setCurrentTime(formattedTime);
    } else {
      const date = new Date();
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      setCurrentDate(formattedDate);

      // Update time every second
      const timeInterval = setInterval(() => {
        const now = new Date();
        const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setCurrentTime(formattedTime);
      }, 1000);

      return () => clearInterval(timeInterval);
    }
  }, [orderDate]);

  const calculateSubtotal = () => {
    return subtotal;
  };

  const calculateFinalTotal = () => {
    return subtotal;
  };

  const renderOrderItem = (item, index) => {
    const sizeText = item.size ? ` (${item.size === 'M' ? 'Medium' : 'Large'})` : '';
    const price = item.price ?? 0;
    const quantity = item.quantity ?? 0;
    return (
      <View key={item.id ?? index} style={styles.orderItem}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}{sizeText}</Text>
          <Text style={styles.itemPrice}>₱{price.toFixed(2)} each</Text>
        </View>
        <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.id, quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.id, quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemTotal}>
        <Text style={styles.itemTotalText}>
          ₱{(price * quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Details</Text>
      
      {/* Date and Time */}
      <View style={styles.dateContainer}>
        <View style={styles.dateTimeRow}>
          <Text style={styles.dateLabel}>Date: {currentDate}</Text>
          <Text style={styles.timeLabel}>Time: {currentTime}</Text>
        </View>
        <Text style={styles.orderNumberLabel}>No. #{typeof orderNumber === 'string' ? orderNumber.replace(/^#/, '') : (orderNumber || '')}</Text>
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
        {!items || items.length === 0 ? (
          <Text style={styles.emptyMessage}>No items added yet</Text>
        ) : (
          items.map((item, index) => renderOrderItem(item, index))
        )}
      </ScrollView>

      {/* Pricing Summary */}
      <View style={styles.pricingContainer}>
        <View style={styles.pricingRow}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalAmount}>₱{calculateFinalTotal().toFixed(2)}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[isModal ? styles.cancelButton : styles.saveButton]}
            onPress={() => {
              if (isModal && typeof onClose === 'function') {
                onClose();
              } else if (!isModal) {
                onSaveAndPrint('save', calculateFinalTotal(), customerName, orderType, items, orderNumber);
                onIncrementOrderNumber();
              } else {
                console.log('OrderSummary - Button pressed');
              }
            }}
          >
            <Text style={[isModal ? styles.cancelButtonText : styles.saveButtonText]}>{isModal ? 'Close' : 'Save Order'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.printButton, (!items || items.length === 0) && styles.saveButtonDisabled]}
            onPress={() => {
              onSaveAndPrint('print', calculateFinalTotal(), customerName, orderType, items, orderNumber);
              onIncrementOrderNumber();
            }}
            disabled={!items || items.length === 0}
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
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  orderNumberLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
  },
  orderTypeContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  orderTypeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  orderTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 3,
    fontSize: 14,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 2,
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
  // Removed discountContainer, pickerContainer, discountPicker styles
  // discountContainer: {
  //   marginBottom: 15,
  // },
  // pickerContainer: {
  //   borderWidth: 1,
  //   borderColor: '#ddd',
  //   borderRadius: 8,
  //   overflow: 'hidden',
  // },
  // discountPicker: {
  //   height: 40,
  // },
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
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderSummary;
